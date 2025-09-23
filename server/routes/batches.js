import express from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../lib/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function auth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// List batches for farmer
router.get('/', auth, async (req, res, next) => {
  try {
    const { dbClient } = req.context;
    const db = getDb(dbClient);
    const items = await db.collection('batches').find({ ownerId: String(req.user._id) }).sort({ createdAt: -1 }).toArray();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// Create batch
router.post('/', auth, async (req, res, next) => {
  try {
    const { cropType, harvestDate, quantity, price, location } = req.body || {};
    if (!cropType || !harvestDate || !quantity || !price || !location) return res.status(400).json({ error: 'Missing fields' });
    const { dbClient } = req.context;
    const db = getDb(dbClient);
    const count = await db.collection('batches').countDocuments();
    const id = `${cropType.substring(0, 3).toUpperCase()}-2025-${String(count + 1).padStart(3, '0')}`;
  const doc = { batchId: id, product: cropType, farmer: req.user.name, ownerId: String(req.user._id), harvestDate, quantity, price, location, status: 'Created', createdAt: new Date() };
  await db.collection('batches').insertOne(doc);
  try { req.context.io.emit('batch:new', doc); } catch {}
    res.status(201).json({ item: doc });
  } catch (err) {
    next(err);
  }
});

// Update status (e.g., transfer)
router.post('/:id/status', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'Missing status' });
    const { dbClient } = req.context;
    const db = getDb(dbClient);
    const result = await db.collection('batches').findOneAndUpdate(
      { batchId: id, ownerId: String(req.user._id) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    res.json({ item: result.value });
  } catch (err) {
    next(err);
  }
});

export default router;


