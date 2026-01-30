/**
 * Validates and exports environment variables.
 * Throws an error if required variables are missing in production.
 */
function validateEnv() {
  const requiredInProduction = [
    "VITE_APP_ID",
    "JWT_SECRET",
    "DATABASE_URL",
    "OAUTH_SERVER_URL",
  ] as const;

  const isProduction = process.env.NODE_ENV === "production";
  const missing: string[] = [];

  for (const key of requiredInProduction) {
    if (!process.env[key]) {
      if (isProduction) {
        missing.push(key);
      } else {
        console.warn(`[ENV] Warning: ${key} is not set (optional in development)`);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(", ")}`
    );
  }
}

// Validate on module load
validateEnv();

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  port: parseInt(process.env.PORT || "3000", 10),
} as const;
