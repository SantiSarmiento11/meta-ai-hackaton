import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthRequest, AuthenticatedUser } from '../types';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Acceso no autorizado: Token no proporcionado',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido o expirado. Por favor inicia sesión nuevamente.',
    });
  }
};
