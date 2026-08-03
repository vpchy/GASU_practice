import '../config/env.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { readJson, writeJson } from '../utils/jsonStorage.js';
import { isValidEmail, isStrongPassword, isValidPhone } from '../validators.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET не задан');
}

router.post('/login', async (req, res) => {
  const users = readJson('users.json');

  if (!req.body.login || !req.body.password) {
    return res.json({
      success: false,
      message: 'Введите логин и пароль'
    });
  }

  const user = users.find(user => user.login === req.body.login);

  if (!user) {
    return res.json({
      success: false,
      message: 'Неправильный логин или пароль.'
    });
  }

  const ok = await bcrypt.compare(req.body.password, user.password);

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
  const users = readJson('users.json');
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

  const exists = users.find(u => u.login === login);

  if (exists) {
    return res.json({
      success: false,
      message: 'Пользователь уже существует'
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    login,
    password: hashedPassword,
    name: '',
    username: '',
    bio: '',
    location: '',
    avatar: null
  };

  users.push(newUser);
  writeJson('users.json', users);

  res.json({
    success: true,
    message: 'Регистрация успешна'
  });
});

export default router;
