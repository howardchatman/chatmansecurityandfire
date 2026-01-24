import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

// JWT secret - in production, use env variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "security-platform-jwt-secret-key-2024"
);

// Admin emails that get admin role
const ADMIN_EMAILS = ["howard@chatmaninc.com", "howardchatman@icloud.com"];

export type UserRole = "admin" | "manager" | "customer" | "technician" | "inspector";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export interface JWTPayload {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  exp?: number;
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Cookie name for auth token
export const AUTH_COOKIE_NAME = "security_auth_token";

/**
 * Verify authentication from a Next.js API request.
 * Extracts the JWT token from cookies or Authorization header and verifies it.
 */
export async function verifyAuth(request: NextRequest): Promise<JWTPayload | null> {
  // Try to get token from cookie first
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Or from Authorization header
  const authHeader = request.headers.get("Authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
