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

// On-chain events for a batch
router.get('/:id/events', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ethersCtx } = req.context;
    const { contract, provider } = ethersCtx;
    if (!contract) return res.json({ events: [] });

    const fromBlock = 0; // for demo/local chain
    const toBlock = 'latest';

    const events = [];
    const pushWithTs = async (log, type) => {
      const block = await provider.getBlock(log.blockNumber);
      events.push({
        type,
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp: block?.timestamp ? Number(block.timestamp) * 1000 : Date.now(),
        args: log.args
      });
    };

    const created = await contract.queryFilter(contract.filters.BatchCreated(id), fromBlock, toBlock);
    for (const log of created) await pushWithTs(log, 'BatchCreated');

    const transfers = await contract.queryFilter(contract.filters.OwnershipTransferred(id, null, null), fromBlock, toBlock);
    for (const log of transfers) await pushWithTs(log, 'OwnershipTransferred');

    const status = await contract.queryFilter(contract.filters.StatusUpdated(id, null), fromBlock, toBlock);
    for (const log of status) await pushWithTs(log, 'StatusUpdated');

    const prices = await contract.queryFilter(contract.filters.PriceUpdated(id, null), fromBlock, toBlock);
    for (const log of prices) await pushWithTs(log, 'PriceUpdated');

    events.sort((a, b) => a.blockNumber - b.blockNumber);
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

export default router;


