import express from 'express';
import { getDb } from '../lib/db.js';

const router = express.Router();

// GET /api/batch/:id -> merges on-chain and Mongo data
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dbClient, ethersCtx } = req.context;
    const db = getDb(dbClient);

    // Fetch off-chain snapshots
    const batchDoc = await db.collection('batches').findOne({ batchId: id });
    const sensors = await db
      .collection('sensor_snapshots')
      .find({ batchId: id })
      .sort({ createdAt: -1 })
      .limit(24)
      .toArray();

    // Try on-chain read (functions are placeholders; adjust to your ABI)
    let onchain = null;
    try {
      const { contract } = ethersCtx;
      // Example: getBatch returns [exists, owner, status, price]
      if (contract.getBatch) {
        const data = await contract.getBatch(id);
        onchain = {
          exists: Boolean(data?.exists ?? true),
          owner: data?.owner || null,
          status: data?.status || null,
          pricePerKg: data?.pricePerKg ? Number(data.pricePerKg) : null,
        };
      }
    } catch (e) {
      // continue with off-chain if chain read fails
      onchain = null;
    }

    res.json({
      batchId: id,
      onchain,
      offchain: batchDoc || null,
      sensors,
    });
  } catch (err) {
    next(err);
  }
});

// Public: latest batches
router.get('/', async (req, res, next) => {
  try {
    const { dbClient } = req.context;
    const db = getDb(dbClient);
    const items = await db.collection('batches').find({}).sort({ createdAt: -1 }).limit(20).toArray();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;


