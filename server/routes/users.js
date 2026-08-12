import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pool from '../db/db.js';

const router = express.Router();

function mapUser(user) {
  const { password, avatar_url, ...safeUser } = user;
  return {
    ...safeUser,
    avatar: avatar_url || null,
  };
}

router.get('/me', authMiddleware, async (req, res) => {

  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.user.id]);


  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  };

  const user = mapUser(result.rows[0]);

  res.json({
    success: true,
    data: user
  });
});

router.put('/me', authMiddleware, async (req, res) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    const updates = [];
    const values = [];
    const fieldMap = {
        avatar: 'avatar_url',
        avatar_url: 'avatar_url'
    };
    const allowedFields = ['name', 'username', 'bio', 'location', 'avatar', 'avatar_url'];

    for (const field of allowedFields) {
        if (!(field in req.body)) continue;

        const dbField = fieldMap[field] || field;
        if (updates.some((update) => update.startsWith(`${dbField} =`))) continue;

        updates.push(`${dbField} = $${values.length + 1}`);
        values.push(req.body[field]);
    }

    if (updates.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Нет данных для обновления'
        });
    }

    values.push(req.user.id);

    const updateResult = await pool.query(
        `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING *`,
        values
    );

    const user = mapUser(updateResult.rows[0]);

    res.json({
        success: true,
        data: user
    });
});

router.get('/users/:id', async (req, res) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.params.id]);

  if (result.rows.length === 0) {
    return res.status(404).json({
        success: false,
        message: "Пользователь не найден"
    });
  }

  const user = mapUser(result.rows[0]);

  res.json({
      success: true,
      data: user
  });
});

export default router;
