import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDbClient } from './lib/db.js';
import { getEthersContext } from './lib/eth.js';
import batchRouter from './routes/batch.js';
import sensorsRouter from './routes/sensors.js';
import authRouter from './routes/auth.js';
import batchesRouter from './routes/batches.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const server = http.createServer(app);
import { setupSocket } from './socket.js';
const io = setupSocket(server);
app.locals.io = io;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Attach context middleware
app.use(async (req, _res, next) => {
  try {
    req.context = {
      dbClient: await getDbClient(),
      ethersCtx: await getEthersContext(),
      io,
    };
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/batch', batchRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/auth', authRouter);
app.use('/api/batches', batchesRouter);

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

server.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});


