import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('O segredo JWT (JWT_SECRET) não está definido nas variáveis de ambiente.');
}

export interface AdminJWTPayload extends JwtPayload {
  adminId: string;
  email: string;
}

export function signJWT(payload: { adminId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyJWT(token: string): AdminJWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminJWTPayload;
    return decoded;
  } catch (error) {
    console.error('Falha na verificação do JWT:', error);
    return null;
  }
}

export function getAdminFromRequest(req: NextRequest): AdminJWTPayload | null {
    const token = req.cookies.get('admin-token')?.value;

    if (token) {
        return verifyJWT(token);
    }

    return null;
}
