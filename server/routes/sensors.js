import express from 'express';
import { getDb } from '../lib/db.js';

const router = express.Router();

// POST /api/sensors -> { batchId, temperature, humidity, gas, ts? }
router.post('/', async (req, res, next) => {
  try {
    const { batchId, temperature, humidity, gas, ts } = req.body || {};
    if (!batchId) return res.status(400).json({ error: 'batchId required' });

    const { dbClient } = req.context;
    const db = getDb(dbClient);

    const doc = {
      batchId,
      temperature,
      humidity,
      gas,
      createdAt: ts ? new Date(ts) : new Date(),
    };
    await db.collection('sensor_snapshots').insertOne(doc);
    // emit realtime update
    try { req.context.io.emit('sensor:update', doc); } catch {}
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;


