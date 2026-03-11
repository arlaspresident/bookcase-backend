import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../database';
import type { Användarerad, JWTPayload } from '../types';

const router = Router();

//registrera ny användare
router.post('/registrera', async (req: Request, res: Response) => {
  const { namn, epost, lösenord: losenord } = req.body as { namn: string; epost: string; lösenord: string };

  if (!namn || !epost || !losenord) {
    res.status(400).json({ meddelande: 'namn, epost och lösenord krävs' });
    return;
  }

  if (losenord.length < 6) {
    res.status(400).json({ meddelande: 'lösenordet måste vara minst 6 tecken' });
    return;
  }

  const befintlig = db.prepare('SELECT id FROM användare WHERE epost = ?').get(epost);
  if (befintlig) {
    res.status(409).json({ meddelande: 'e-postadressen används redan' });
    return;
  }

  const hashatLosenord = await bcrypt.hash(losenord, 10);
  const result = db.prepare('INSERT INTO användare (namn, epost, losenord) VALUES (?, ?, ?)').run(namn, epost, hashatLosenord);

  const userId = result.lastInsertRowid as number;
  const payload: JWTPayload = { id: userId, epost };
  const token = jwt.sign(payload, process.env['JWT_SECRET'] as string, { expiresIn: '7d' });

  res.status(201).json({ token, användare: { id: userId, namn, epost } });
});

//logga in
router.post('/logga-in', async (req: Request, res: Response) => {
  const { epost, lösenord: losenord } = req.body as { epost: string; lösenord: string };

  if (!epost || !losenord) {
    res.status(400).json({ meddelande: 'epost och lösenord krävs' });
    return;
  }

  const rad = db.prepare('SELECT * FROM användare WHERE epost = ?').get(epost) as Användarerad | undefined;

  if (!rad) {
    res.status(401).json({ meddelande: 'felaktig e-post eller lösenord' });
    return;
  }

  const stämmer = await bcrypt.compare(losenord, rad.losenord);
  if (!stämmer) {
    res.status(401).json({ meddelande: 'felaktig e-post eller lösenord' });
    return;
  }

  const payload: JWTPayload = { id: rad.id, epost: rad.epost };
  const token = jwt.sign(payload, process.env['JWT_SECRET'] as string, { expiresIn: '7d' });

  res.json({ token, användare: { id: rad.id, namn: rad.namn, epost: rad.epost } });
});

export default router;
