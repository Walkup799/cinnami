import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_SECRET || 'default_secret'; // usa el .env o valor por defecto

// Genera un access token válido por 15 minutos
export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};
