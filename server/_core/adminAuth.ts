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

// Configuration des admins
const ADMINS = [
    {
        email: "nathankalala100@gmail.com",
        password: "ivette",
        name: "Administrateur HTA"
    },
    {
        email: "hometrainingagency@gmail.com",
        password: "trainingtogether",
        name: "Home Training Agency"
    }
];

// Hash du mot de passe
function hashPassword(password: string): string {
    return createHash("sha256").update(password).digest("hex");
}

// Vérifier le mot de passe
function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash;
}

// Initialiser les utilisateurs admin
export async function initAdminUser(): Promise<void> {
    const db = await getDb();
    if (!db) {
        logger.warn("Cannot init admin user: database not available");
        return;
    }

    try {
        for (const admin of ADMINS) {
            // Vérifier si l'admin existe déjà
            const existingAdmin = await db
                .select()
                .from(users)
                .where(eq(users.email, admin.email))
                .limit(1);

            if (existingAdmin.length === 0) {
                // Créer l'utilisateur admin
                await db.insert(users).values({
                    openId: `local_${admin.email}`,
                    name: admin.name,
                    email: admin.email,
                    password: hashPassword(admin.password),
                    loginMethod: "local",
                    role: "admin",
                });
                logger.info("Admin user created successfully", { email: admin.email });
            } else {
                // Force verify/update admin credentials and role
                await db
                    .update(users)
                    .set({
                        password: hashPassword(admin.password),
                        role: "admin",
                        loginMethod: "local",
                    })
                    .where(eq(users.email, admin.email));
                logger.info("Admin user verified/updated", { email: admin.email });
            }
        }
    } catch (error) {
        logger.error("Failed to init admin users", error);
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
                    appId: ENV.appId,
                    name: user.name,
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
