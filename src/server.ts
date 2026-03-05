import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import recensionerRouter from './routes/recensioner';

const app = express();
const PORT = process.env['PORT'] ?? 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/recensioner', recensionerRouter);

//hälsokontroll
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`servern kör på port ${PORT}`);
});
