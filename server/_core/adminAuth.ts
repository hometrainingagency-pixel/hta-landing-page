import { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
const { sign, verify } = jwt;
import { createHash } from "crypto";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

// Configuration admin par défaut
const ADMIN_EMAIL = "nathankalala100@gmail.com";
const ADMIN_PASSWORD = "ivette";

// Hash du mot de passe
function hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
}

// Vérifier le mot de passe
function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash;
}

// Initialiser l'utilisateur admin s'il n'existe pas
export async function initAdminUser(): Promise<void> {
    const db = await getDb();
    if (!db) {
        logger.warn("Cannot init admin user: database not available");
        return;
    }

    try {
        // Vérifier si l'admin existe déjà
        const existingAdmin = await db
            .select()
            .from(users)
            .where(eq(users.email, ADMIN_EMAIL))
            .limit(1);

        if (existingAdmin.length === 0) {
            // Créer l'utilisateur admin
            await db.insert(users).values({
                openId: `local_${ADMIN_EMAIL}`,
                name: "Administrateur HTA",
                email: ADMIN_EMAIL,
                password: hashPassword(ADMIN_PASSWORD),
                loginMethod: "local",
                role: "admin",
            });
            logger.info("Admin user created successfully", { email: ADMIN_EMAIL });
        } else {
            // Force verify/update admin credentials and role
            await db
                .update(users)
                .set({
                    password: hashPassword(ADMIN_PASSWORD),
                    role: "admin",
                    loginMethod: "local",
                })
                .where(eq(users.email, ADMIN_EMAIL));
            logger.info("Admin user verified/updated", { email: ADMIN_EMAIL });
        }
    } catch (error) {
        logger.error("Failed to init admin user", error);
    }
}

// Endpoint de connexion admin
export function registerAdminAuthRoutes(app: Express): void {
    app.post("/api/admin/login", async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email et mot de passe requis",
                });
            }

            const db = await getDb();
            if (!db) {
                return res.status(500).json({
                    success: false,
                    message: "Base de données non disponible",
                });
            }

            // Chercher l'utilisateur
            const result = await db
                .select()
                .from(users)
                .where(eq(users.email, email.toLowerCase()))
                .limit(1);

            if (result.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Identifiants incorrects",
                });
            }

            const user = result[0];

            // Vérifier le mot de passe
            if (!user.password || !verifyPassword(password, user.password)) {
                return res.status(401).json({
                    success: false,
                    message: "Identifiants incorrects",
                });
            }

            // Vérifier le rôle admin
            if (user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Vous n'avez pas les droits administrateur",
                });
            }

            // Mettre à jour la dernière connexion
            await db
                .update(users)
                .set({ lastSignedIn: new Date() })
                .where(eq(users.id, user.id));

            // Créer le token JWT
            const token = sign(
                {
                    openId: user.openId,
                    email: user.email,
                    role: user.role,
                },
                ENV.cookieSecret || "dev-secret-key",
                { expiresIn: "7d" }
            );

            // Définir le cookie de session
            const cookieOptions = getSessionCookieOptions(req);
            res.cookie(COOKIE_NAME, token, cookieOptions);

            logger.info("Admin login successful", { email: user.email });

            return res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        } catch (error) {
            logger.error("Admin login error", error);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur",
            });
        }
    });

    // Endpoint pour vérifier la session admin
    app.get("/api/admin/me", async (req: Request, res: Response) => {
        try {
            const token = req.cookies?.[COOKIE_NAME];

            if (!token) {
                return res.status(401).json({ authenticated: false });
            }

            const decoded = verify(token, ENV.cookieSecret || "dev-secret-key") as {
                openId: string;
                email: string;
                role: string;
            };

            if (decoded.role !== "admin") {
                return res.status(403).json({ authenticated: false });
            }

            return res.json({
                authenticated: true,
                user: decoded,
            });
        } catch {
            return res.status(401).json({ authenticated: false });
        }
    });
}
