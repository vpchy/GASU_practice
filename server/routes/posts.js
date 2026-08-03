import express from 'express';
import { authMiddleware, getUserDisplayName } from '../middleware/auth.js';
import { readJson, writeJson } from '../utils/jsonStorage.js';

const router = express.Router();

function sortByDateDesc(items) {
  return items.sort((a, b) => new Date(b.time) - new Date(a.time));
}

router.get('/posts', (req, res) => {
  const posts = readJson('posts.json');
  const users = readJson('users.json');
  const comments = readJson('comments.json');

  const result = posts.map(post => {
    const author = users.find(user => user.id === post.authorId);
    const postComments = comments
      .filter(comment => comment.postId === post.id)
      .map(comment => {
        const commentAuthor = users.find(user => user.id === comment.authorId);
        return {
          id: comment.id,
          author: getUserDisplayName(commentAuthor),
          text: comment.text,
          time: comment.time,
          attachment: comment.attachment || null,
          attachmentName: comment.attachmentName || null
        };
      });

    return {
      id: post.id,
      author: getUserDisplayName(author),
      title: post.title,
      text: post.text,
      time: post.time,
      likes: post.likes,
      attachment: post.attachment || null,
      attachmentName: post.attachmentName || null,
      comments: postComments
    };
  });

  res.json(sortByDateDesc(result));
});

router.post('/posts', authMiddleware, (req, res) => {
  const posts = readJson('posts.json');

  if (!req.body.title || !req.body.text) {
    return res.json({
      success: false,
      message: 'Введите заголовок и текст'
    });
  }

  const newPost = {
    id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
    authorId: req.user.id,
    title: req.body.title,
    text: req.body.text,
    attachment: req.body.attachment || null,
    attachmentName: req.body.attachmentName || null,
    time: new Date().toISOString(),
    likes: 0,
    likedBy: []
  };

  posts.push(newPost);
  writeJson('posts.json', posts);

  res.json({
    success: true,
    message: 'Пост отправлен',
    post: newPost
  });
});

router.get('/my-posts', authMiddleware, (req, res) => {
  const posts = readJson('posts.json');
  const users = readJson('users.json');
  const comments = readJson('comments.json');

  const result = posts
    .filter(post => post.authorId === req.user.id)
    .map(post => {
      const author = users.find(user => user.id === post.authorId);
      const postComments = comments
        .filter(comment => comment.postId === post.id)
        .map(comment => {
          const commentAuthor = users.find(user => user.id === comment.authorId);
          return {
            id: comment.id,
            author: getUserDisplayName(commentAuthor),
            text: comment.text,
            time: comment.time,
            attachment: comment.attachment || null,
            attachmentName: comment.attachmentName || null
          };
        });

      return {
        id: post.id,
        author: getUserDisplayName(author),
        title: post.title,
        text: post.text,
        time: post.time,
        likes: post.likes,
        attachment: post.attachment || null,
        attachmentName: post.attachmentName || null,
        comments: postComments
      };
    });

  res.json(sortByDateDesc(result));
});

router.put('/posts/:id', authMiddleware, (req, res) => {
  const posts = readJson('posts.json');

  if (!req.body.title || !req.body.text) {
    return res.json({
      success: false,
      message: 'Введите заголовок и текст'
    });
  }

  const post = posts.find(p => p.id === Number(req.params.id));

  if (!post) {
    return res.json({
      success: false,
      message: 'Пост не найден'
    });
  }

  if (post.authorId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Вы не можете редактировать чужой пост'
    });
  }

  post.title = req.body.title;
  post.text = req.body.text;

  if ('attachment' in req.body) {
    post.attachment = req.body.attachment || null;
  }
  if ('attachmentName' in req.body) {
    post.attachmentName = req.body.attachmentName || null;
  }

  writeJson('posts.json', posts);

  res.json({
    success: true,
    message: 'Пост обновлен'
  });
});

router.delete('/posts/:id/del', authMiddleware, (req, res) => {
  const posts = readJson('posts.json');
  const comments = readJson('comments.json');
  const postId = Number(req.params.id);

  const post = posts.find(p => p.id === postId);

  if (!post) {
    return res.json({
      success: false,
      message: 'Такого поста не существует'
    });
  }

  if (post.authorId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Вы не можете удалять чужой пост'
    });
  }

  writeJson('posts.json', posts.filter(p => p.id !== postId));
  writeJson('comments.json', comments.filter(comment => comment.postId !== postId));

  res.json({
    success: true,
    message: 'Пост удалён'
  });
});

router.post('/posts/:id/like', authMiddleware, (req, res) => {
  const posts = readJson('posts.json');
  const post = posts.find(p => p.id === Number(req.params.id));

  if (!post) {
    return res.json({
      success: false,
      message: 'Такого поста не существует'
    });
  }

  if (!post.likedBy) {
    post.likedBy = [];
  }

  if (post.likedBy.includes(req.user.id)) {
    post.likes--;
    post.likedBy = post.likedBy.filter(id => id !== req.user.id);
    writeJson('posts.json', posts);

    return res.json({
      success: true,
      message: "Вы удалили отметку 'Нравится' с этого поста",
      likes: post.likes
    });
  }

  post.likes++;
  post.likedBy.push(req.user.id);
  writeJson('posts.json', posts);

  res.json({
    success: true,
    message: "Вы поставили отметку 'Нравится' на этот пост",
    likes: post.likes
  });
});

router.get('/posts/:id/comments', (req, res) => {
  const comments = readJson('comments.json');
  const users = readJson('users.json');
  const postId = Number(req.params.id);

  const postComments = comments
    .filter(comment => comment.postId === postId)
    .map(comment => {
      const author = users.find(user => user.id === comment.authorId);
      return {
        id: comment.id,
        author: getUserDisplayName(author),
        text: comment.text,
        time: comment.time,
        attachment: comment.attachment || null,
        attachmentName: comment.attachmentName || null
      };
    });

  res.json(postComments);
});

router.post('/posts/:id/comments', authMiddleware, (req, res) => {
  const posts = readJson('posts.json');
  const comments = readJson('comments.json');

  const post = posts.find(p => p.id === Number(req.params.id));

  if (!post) {
    return res.json({
      success: false,
      message: 'Пост не найден'
    });
  }

  if (!req.body.text) {
    return res.json({
      success: false,
      message: 'Комментарий пустой'
    });
  }

  const newComment = {
    id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
    postId: Number(req.params.id),
    authorId: req.user.id,
    text: req.body.text,
    time: new Date().toISOString()
  };

  if ('attachment' in req.body) {
    newComment.attachment = req.body.attachment || null;
  }
  if ('attachmentName' in req.body) {
    newComment.attachmentName = req.body.attachmentName || null;
  }

  comments.push(newComment);
  writeJson('comments.json', comments);

  res.json({
    success: true,
    message: 'Комментарий добавлен'
  });
});

export default router;
