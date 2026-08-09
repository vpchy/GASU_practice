import '../config/env.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/db.js';
import { isValidEmail, isStrongPassword, isValidPhone } from '../validators.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET не задан');
}

router.post('/login', async (req, res) => {
    const { login, password } = req.body;


    if (!login || !password) {
        return res.json({
        success: false,
        message: 'Введите логин и пароль'
        });
    }
    const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
    if (result.rows.length === 0) {
    return res.json({
        success: false,
        message: "Неправильный логин или пароль."
    });
    }
    const user = result.rows[0];

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
        return res.json({
        success: false,
        message: 'Неправильный логин или пароль.'
        });
    }

    const token = jwt.sign(
        {
        id: user.id,
        login: user.login
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return res.json({
        success: true,
        message: 'Вход выполнен',
        token
    });
    });

router.post('/register', async (req, res) => {

    const { login, password } = req.body;

    if (!login || !password) {
        return res.json({
        success: false,
        message: 'Пожалуйста, введите логин и пароль.'
        });
    }

    if (login.includes('@')) {
        if (!isValidEmail(login)) {
        return res.json({
            success: false,
            message: 'Некорректный формат email. Проверьте, что указали домен (например, @mail.ru).'
        });
        }
    } else if (/^\+?[\d\s\-()]+$/.test(login)) {
        if (!isValidPhone(login)) {
        return res.json({
            success: false,
            message: 'Неверный формат телефона. Номер должен содержать от 10 до 15 цифр (например, +79991234567).'
        });
        }
    } else {
        return res.json({
        success: false,
        message: 'Введенный логин не похож на телефон или email.\nДля email добавьте "@", а для телефона используйте только цифры.'
        });
    }

    if (!isStrongPassword(password)) {
        return res.json({
        success: false,
        message: 'Недостаточно надежный пароль!\nЧтобы продолжить, пожалуйста, убедитесь, что ваш пароль:\n* Состоит минимум из 6 символов\n* Содержит хотя бы 1 букву\n* Содержит хотя бы 1 цифру'
        });
    }
    const result = await pool.query('SELECT * FROM users WHERE login =$1', [login]);

    if (result.rows.length > 0) {
        return res.json({
        success: false,
        message: 'Пользователь уже существует'
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const insertResult = await pool.query(`INSERT INTO users (
        login,
        password,
        name,
        username,
        bio,
        location,
        avatar_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`, [login, hashedPassword, "", "temp", "", "", null]);
    
    const userId = insertResult.rows[0].id;
    await pool.query(
    `
    UPDATE users
    SET username = $1
    WHERE id = $2
    `,
    [
        `user${userId}`,
        userId
    ]);

    res.json({
        success: true,
        message: 'Регистрация успешна'
    });
    });

export default router;
