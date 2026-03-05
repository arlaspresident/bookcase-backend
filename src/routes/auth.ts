import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../database';
import type { Användarerad, JWTPayload } from '../types';

const router = Router();

//registrera ny användare
router.post('/registrera', async (req: Request, res: Response) => {
  const { namn, epost, losenord } = req.body as { namn: string; epost: string; losenord: string };

  if (!namn || !epost || !losenord) {
    res.status(400).json({ fel: 'namn, epost och lösenord krävs' });
    return;
  }

  if (losenord.length < 6) {
    res.status(400).json({ fel: 'lösenordet måste vara minst 6 tecken' });
    return;
  }

  const befintlig = db.prepare('SELECT id FROM användare WHERE epost = ?').get(epost);
  if (befintlig) {
    res.status(409).json({ fel: 'e-postadressen används redan' });
    return;
  }

  const hashatLosenord = await bcrypt.hash(losenord, 10);
  const result = db.prepare('INSERT INTO användare (namn, epost, losenord) VALUES (?, ?, ?)').run(namn, epost, hashatLosenord);

  const användare = { id: result.lastInsertRowid as number, namn, epost };
  const payload: JWTPayload = { id: användare.id, epost };
  const token = jwt.sign(payload, process.env['JWT_SECRET'] as string, { expiresIn: '7d' });

  res.status(201).json({ token, användare });
});

//logga in
router.post('/logga-in', async (req: Request, res: Response) => {
  const { epost, losenord } = req.body as { epost: string; losenord: string };

  if (!epost || !losenord) {
    res.status(400).json({ fel: 'epost och lösenord krävs' });
    return;
  }

  const rad = db.prepare('SELECT * FROM användare WHERE epost = ?').get(epost) as Användarerad | undefined;

  if (!rad) {
    res.status(401).json({ fel: 'felaktig e-post eller lösenord' });
    return;
  }

  const stämmer = await bcrypt.compare(losenord, rad.losenord);
  if (!stämmer) {
    res.status(401).json({ fel: 'felaktig e-post eller lösenord' });
    return;
  }

  const användare = { id: rad.id, namn: rad.namn, epost: rad.epost };
  const payload: JWTPayload = { id: rad.id, epost: rad.epost };
  const token = jwt.sign(payload, process.env['JWT_SECRET'] as string, { expiresIn: '7d' });

  res.json({ token, användare });
});

export default router;
