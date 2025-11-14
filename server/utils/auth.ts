import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
const BCRYPT_ROUNDS = 10;

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Create JWT token
export function createToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

// Middleware for verifying JWT
export function authenticateToken(
  req: any,
  res: any,
  next: any
): void {
  // Development bypass: allow all requests and inject a fake user if enabled
  const devBypass = process.env.DEV_BYPASS_AUTH === "1" || process.env.DEV_BYPASS_AUTH === "true";
  if (devBypass) {
    req.user = req.user || {
      id: "dev-user-1",
      email: "dev@example.com",
      name: "Developer",
      role: "admin",
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = decoded;
  next();
}

export type JWTPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
};
