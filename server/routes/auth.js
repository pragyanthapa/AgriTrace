import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../lib/db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function signToken(user) {
  return jwt.sign({ _id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
    const { dbClient } = req.context;
    const db = getDb(dbClient);
    const users = db.collection('users');
    const existing = await users.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const doc = { name, email, passwordHash: hash, role, createdAt: new Date() };
    const result = await users.insertOne(doc);
    const user = { _id: result.insertedId, name, email, role };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const { dbClient } = req.context;
    const db = getDb(dbClient);
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ user: payload });
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

export default router;


