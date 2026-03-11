import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      användare?: JWTPayload;
    }
  }
}

export const autentisera = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ meddelande: 'ingen token angiven' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] as string) as JWTPayload;
    req.användare = decoded;
    next();
  } catch {
    res.status(401).json({ meddelande: 'ogiltig eller utgången token' });
  }
};
