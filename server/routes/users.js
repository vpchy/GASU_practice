import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { readJson, writeJson } from '../utils/jsonStorage.js';

const router = express.Router();

router.get('/me', authMiddleware, (req, res) => {
  const users = readJson('users.json');
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const { password, ...safeUser } = user;

  res.json({
    success: true,
    data: safeUser
  });
});

router.put('/me', authMiddleware, (req, res) => {
  const users = readJson('users.json');
  const userIndex = users.findIndex(u => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const allowedFields = ['name', 'username', 'bio', 'location', 'avatar'];
  const user = users[userIndex];

  for (const field of allowedFields) {
    if (field in req.body) {
      user[field] = req.body[field];
    }
  }

  writeJson('users.json', users);
  const { password, ...safeUser } = users[userIndex];

  res.json({
    success: true,
    data: safeUser
  });
});

router.get('/users/:id', (req, res) => {
  const users = readJson('users.json');
  const user = users.find(u => u.id === Number(req.params.id));

  if (!user) {
    return res.json({
      success: false,
      message: 'Пользователь не найден'
    });
  }

  res.json(user);
});

export default router;
