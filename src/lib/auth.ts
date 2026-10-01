import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import prisma from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'borrowme-secure-secret-key-student-rent-platform-2026'
);

export const COOKIE_NAME = 'borrowme_session';

export interface AuthPayload {
  sub: string;
  email: string;
  role: string;
  fullName: string;
  isVerified: boolean;
  university?: string | null;
  [key: string]: any;
}

// 1. Password Hashing & Verification
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 2. JWT Token Management
export async function createAuthToken(payload: AuthPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthPayload;
  } catch (error) {
    return null;
  }
}

// 3. Extract Session User from Request or Cookies
export async function getSessionUser(req?: NextRequest | Request): Promise<AuthPayload | null> {
  let token: string | undefined;

  // Try extracting from Request header / cookie if provided
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (!token && 'cookies' in req && typeof req.cookies?.get === 'function') {
      const cookieObj = req.cookies.get(COOKIE_NAME);
      token = cookieObj?.value;
    }
  }

  // Fallback to Next.js cookies() helper
  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Cookies not accessible in current context
    }
  }

  if (!token) return null;
  return verifyAuthToken(token);
}

// 4. Fetch full user from database using session
export async function getCurrentUserFromDb(req?: NextRequest | Request) {
  const session = await getSessionUser(req);
  if (!session || !session.sub) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      studentEmail: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      isVerified: true,
      verifiedAt: true,
      studentCardNumber: true,
      studentCardImage: true,
      verificationStatus: true,
      verificationNote: true,
      idCardNumber: true,
      university: true,
      createdAt: true,
    },
  });

  return user;
}

// Re-export university helpers from constants
export {
  UNIVERSITY_DOMAINS,
  POPULAR_UNIVERSITIES,
  isEduEmail,
  extractUniversityFromEmail,
} from './constants';

