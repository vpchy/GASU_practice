import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pool from '../db/db.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {

  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.user.id]);


  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  };

  const user = result.rows[0];

  const { password, ...safeUser } = user;

  res.json({
    success: true,
    data: safeUser
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

    const allowedFields = ['name', 'username', 'bio', 'location', 'avatar_url'];

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
        if (field in req.body) {
            updates.push(`${field} = $${values.length + 1}`);
            values.push(req.body[field]);
        }
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

    const { password, ...safeUser } = updateResult.rows[0];

    res.json({
        success: true,
        data: safeUser
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

  const user = result.rows[0];

  const { password, ...safeUser } = user;

  res.json({
      success: true,
      data: safeUser
  });
});

export default router;
