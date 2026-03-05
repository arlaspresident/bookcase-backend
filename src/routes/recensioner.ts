import { Router } from 'express';
import type { Request, Response } from 'express';
import db from '../database';
import { autentisera } from '../middleware/auth';
import type { Recensionsrad } from '../types';

const router = Router();

//hämta inloggad användares recensioner
router.get('/mina', autentisera, (req: Request, res: Response) => {
  const användareId = req.användare!.id;

  const recensioner = db.prepare(`
    SELECT r.id, r.bokId, r.användareId, u.namn as användarnamn, r.text, r.betyg, r.skapadDatum
    FROM recensioner r
    JOIN användare u ON r.användareId = u.id
    WHERE r.användareId = ?
    ORDER BY r.skapadDatum DESC
  `).all(användareId) as Recensionsrad[];

  res.json(recensioner);
});

//hämta recensioner för en specifik bok
router.get('/:bokId', (req: Request, res: Response) => {
  const { bokId } = req.params;

  const recensioner = db.prepare(`
    SELECT r.id, r.bokId, r.användareId, u.namn as användarnamn, r.text, r.betyg, r.skapadDatum
    FROM recensioner r
    JOIN användare u ON r.användareId = u.id
    WHERE r.bokId = ?
    ORDER BY r.skapadDatum DESC
  `).all(bokId) as Recensionsrad[];

  res.json(recensioner);
});

//skapa recension
router.post('/', autentisera, (req: Request, res: Response) => {
  const { bokId, text, betyg } = req.body as { bokId: string; text: string; betyg: number };
  const användareId = req.användare!.id;

  if (!bokId || !text || betyg === undefined) {
    res.status(400).json({ fel: 'bokId, text och betyg krävs' });
    return;
  }

  if (betyg < 1 || betyg > 5) {
    res.status(400).json({ fel: 'betyg måste vara mellan 1 och 5' });
    return;
  }

  const befintlig = db.prepare('SELECT id FROM recensioner WHERE bokId = ? AND användareId = ?').get(bokId, användareId);
  if (befintlig) {
    res.status(409).json({ fel: 'du har redan recenserat denna bok' });
    return;
  }

  const result = db.prepare('INSERT INTO recensioner (bokId, användareId, text, betyg) VALUES (?, ?, ?, ?)').run(bokId, användareId, text, betyg);

  const recension = db.prepare(`
    SELECT r.id, r.bokId, r.användareId, u.namn as användarnamn, r.text, r.betyg, r.skapadDatum
    FROM recensioner r
    JOIN användare u ON r.användareId = u.id
    WHERE r.id = ?
  `).get(result.lastInsertRowid) as Recensionsrad;

  res.status(201).json(recension);
});

//uppdatera egen recension
router.put('/:id', autentisera, (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  const { text, betyg } = req.body as { text?: string; betyg?: number };
  const användareId = req.användare!.id;

  if (!text && betyg === undefined) {
    res.status(400).json({ fel: 'text eller betyg krävs' });
    return;
  }

  if (betyg !== undefined && (betyg < 1 || betyg > 5)) {
    res.status(400).json({ fel: 'betyg måste vara mellan 1 och 5' });
    return;
  }

  const recension = db.prepare('SELECT * FROM recensioner WHERE id = ?').get(id) as Recensionsrad | undefined;

  if (!recension) {
    res.status(404).json({ fel: 'recensionen hittades inte' });
    return;
  }

  if (recension.användareId !== användareId) {
    res.status(403).json({ fel: 'du kan bara redigera dina egna recensioner' });
    return;
  }

  db.prepare('UPDATE recensioner SET text = ?, betyg = ? WHERE id = ?').run(
    text ?? recension.text,
    betyg ?? recension.betyg,
    id
  );

  const uppdaterad = db.prepare(`
    SELECT r.id, r.bokId, r.användareId, u.namn as användarnamn, r.text, r.betyg, r.skapadDatum
    FROM recensioner r
    JOIN användare u ON r.användareId = u.id
    WHERE r.id = ?
  `).get(id) as Recensionsrad;

  res.json(uppdaterad);
});

//ta bort egen recension
router.delete('/:id', autentisera, (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  const användareId = req.användare!.id;

  const recension = db.prepare('SELECT * FROM recensioner WHERE id = ?').get(id) as Recensionsrad | undefined;

  if (!recension) {
    res.status(404).json({ fel: 'recensionen hittades inte' });
    return;
  }

  if (recension.användareId !== användareId) {
    res.status(403).json({ fel: 'du kan bara ta bort dina egna recensioner' });
    return;
  }

  db.prepare('DELETE FROM recensioner WHERE id = ?').run(id);

  res.json({ meddelande: 'recensionen har tagits bort' });
});

export default router;
