import './config/env.js';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import userRouter from './routes/users.js';
import postsRouter from './routes/posts.js';
import uploadRouter from './routes/upload.js';
import { UPLOAD_DIR } from './middleware/upload.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/', (req, res) => {
  res.json({ message: 'Архитектурный блог API' });
});

app.use(authRouter);
app.use(userRouter);
app.use(postsRouter);
app.use(uploadRouter);

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Ошибка сервера при загрузке файла'
    });
  }

  next();
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
