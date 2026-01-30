import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { InsertUser, users, contactSubmissions } from "../drizzle/schema";
import { ENV } from './_core/env';
import { logger } from "./_core/logger";

const { Pool } = pg;

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: pg.Pool | null = null;

/**
 * Gets the database instance.
 * Uses connection pooling for better performance.
 * Lazily creates the drizzle instance so local tooling can run without a DB.
 */
export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _pool = new Pool({
        connectionString: ENV.databaseUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      // Test the connection
      await _pool.query('SELECT 1');

      _db = drizzle(_pool);
      logger.info("Database instance initialized with connection pooling");
    } catch (error) {
      logger.error("Failed to initialize database", error);
      _db = null;
      if (_pool) {
        await _pool.end();
        _pool = null;
      }
    }
  }
  return _db;
}

/**
 * Gracefully closes the database connection.
 * Should be called on application shutdown.
 */
export async function closeDb(): Promise<void> {
  if (_pool) {
    try {
      await _pool.end();
      _pool = null;
      _db = null;
      logger.info("Database connection closed");
    } catch (error) {
      logger.error("Error closing database connection", error);
    }
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    logger.warn("Cannot upsert user: database not available");
    return;
  }

  try {
    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);

    if (existing.length > 0) {
      // Update existing user
      const updateData: Partial<InsertUser> = {};

      if (user.name !== undefined) updateData.name = user.name;
      if (user.email !== undefined) updateData.email = user.email;
      if (user.password !== undefined) updateData.password = user.password;
      if (user.loginMethod !== undefined) updateData.loginMethod = user.loginMethod;
      if (user.role !== undefined) updateData.role = user.role;
      if (user.lastSignedIn !== undefined) updateData.lastSignedIn = user.lastSignedIn;

      updateData.updatedAt = new Date();

      await db.update(users).set(updateData).where(eq(users.openId, user.openId));
      logger.debug("User updated successfully", { openId: user.openId });
    } else {
      // Insert new user
      const insertData: InsertUser = {
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        password: user.password ?? null,
        loginMethod: user.loginMethod ?? "local",
        role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
        lastSignedIn: user.lastSignedIn ?? new Date(),
      };

      await db.insert(users).values(insertData);
      logger.debug("User inserted successfully", { openId: user.openId });
    }
  } catch (error) {
    logger.error("Failed to upsert user", error, { openId: user.openId });
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    logger.warn("Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    logger.error("Failed to get user by openId", error, { openId });
    throw error;
  }
}

// Fonctions pour gérer les soumissions de formulaire de contact
export async function createContactSubmission(data: {
  fullName: string;
  email: string;
  phone: string;
  formation?: string;
}) {
  const db = await getDb();
  if (!db) {
    logger.warn("Cannot create contact submission: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(contactSubmissions).values({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      formation: data.formation,
    }).returning();
    logger.info("Contact submission created", { email: data.email });
    return result[0];
  } catch (error) {
    logger.error("Failed to create contact submission", error, { email: data.email });
    throw error;
  }
}

export async function getAllContactSubmissions(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    logger.warn("Cannot get contact submissions: database not available");
    return [];
  }

  try {
    // Ensure limit and offset are valid numbers (defensive programming)
    const validLimit = typeof limit === "number" && !isNaN(limit) ? Math.max(1, Math.min(100, limit)) : 50;
    const validOffset = typeof offset === "number" && !isNaN(offset) ? Math.max(0, offset) : 0;

    const result = await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt))
      .limit(validLimit)
      .offset(validOffset);
    logger.debug("Contact submissions retrieved", { count: result.length, limit: validLimit, offset: validOffset });
    return result;
  } catch (error) {
    logger.error("Failed to get contact submissions", error);
    throw error;
  }
}
