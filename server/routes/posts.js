import express from 'express';
import { authMiddleware, getUserDisplayName } from '../middleware/auth.js';
import { readJson, writeJson } from '../utils/jsonStorage.js';
import pool from '../db/db.js';

const router = express.Router();

router.get('/posts', async (req, res) => {
    const result = await pool.query(`
        SELECT
            p.id,
            p.title,
            p.text,
            p.created_at AS time,
            COALESCE(NULLIF(u.name, ''), u.username) AS author,
            COALESCE(l.likes, 0) AS likes,
            COALESCE(c.comments_count, 0) AS comments_count
        FROM posts p
        LEFT JOIN users u
        ON u.id = p.author_id
        LEFT JOIN (
            SELECT post_id, COUNT(*) AS likes
            FROM likes
            GROUP BY post_id
        ) l ON l.post_id = p.id
        LEFT JOIN (
            SELECT post_id, COUNT(*) AS comments_count
            FROM comments
            GROUP BY post_id
        ) c ON c.post_id = p.id
        ORDER BY p.created_at DESC`);


    /*  const result = posts.map(post => {
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
    });*/
    res.json(result.rows);
});

router.post('/posts', authMiddleware, async (req, res) => {
    if (!req.body.title || !req.body.text) {
        return res.json({
        success: false,
        message: 'Введите заголовок и текст'
        });
    }
    const result = await pool.query(`
        INSERT INTO posts(author_id, title, text)
        VALUES($1, $2, $3)
        RETURNING *`,
        [req.user.id, req.body.title, req.body.text]
    );

    res.json({
        success: true,
        message: 'Пост отправлен',
        post: result.rows[0]
    });
});

router.get('/my-posts', authMiddleware, async (req, res) => {

    const result = await pool.query(`
        SELECT
            p.id,
            p.title,
            p.text,
            p.created_at AS time,
            COALESCE(NULLIF(u.name, ''), u.username) AS author,
            COALESCE(l.likes, 0) AS likes,
            COALESCE(c.comments_count, 0) AS comments_count
        FROM posts p
        LEFT JOIN users u
            ON u.id = p.author_id
        LEFT JOIN (
            SELECT post_id, COUNT(*) AS likes
            FROM likes
            GROUP BY post_id
        ) l ON l.post_id = p.id
        LEFT JOIN (
            SELECT post_id, COUNT(*) AS comments_count
            FROM comments
            GROUP BY post_id
        ) c ON c.post_id = p.id
        WHERE p.author_id = $1
        ORDER BY p.created_at DESC;`,
            [req.user.id]
        );

    res.json(result.rows);
});

router.put('/posts/:id', authMiddleware, async (req, res) => {
    const result = await pool.query(
        `
        SELECT *
        FROM posts
        WHERE id = $1
        `,
        [req.params.id]
    );
    if (result.rows.length === 0) {
        return res.json({
        success: false,
        message: 'Такого поста не существует'
        });
    }

    if (!req.body.title || !req.body.text) {
        return res.json({
        success: false,
        message: 'Введите заголовок и текст'
        });
    }

    const post = result.rows[0];

    if (post.author_id !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Вы не можете редактировать чужой пост'
        });
    }

    await pool.query(
        `
        UPDATE posts
        SET
            title = $1,
            text = $2
        WHERE id = $3
        `,
        [req.body.title, req.body.text, req.params.id]
    )
/*
    if ('attachment' in req.body) {
        post.attachment = req.body.attachment || null;
    }
    if ('attachmentName' in req.body) {
        post.attachmentName = req.body.attachmentName || null;
    }
*/


    res.json({
        success: true,
        message: 'Пост обновлен'
    });
});

router.delete('/posts/:id/del', authMiddleware, async (req, res) => {
    const result = await pool.query(
        `
        SELECT *
        FROM posts
        WHERE id = $1
        `,
        [req.params.id]
    );
    const postId = Number(req.params.id);

    if (result.rows.length === 0) {
        return res.json({
        success: false,
        message: 'Такого поста не существует'
        });
    }
    const post = result.rows[0];

    if (post.author_id !== req.user.id) {
        return res.status(403).json({
        success: false,
        message: 'Вы не можете удалять чужой пост'
        });
    }

    await pool.query(`DELETE FROM posts WHERE id = $1`, [req.params.id])

    res.json({
        success: true,
        message: 'Пост удалён'
    });
});

router.post('/posts/:id/like', authMiddleware, async (req, res) => {

    const result = await pool.query(`SELECT * FROM posts WHERE id = $1`, [req.params.id]);

    if (result.rows.length === 0) {
        return res.json({
        success: false,
        message: 'Такого поста не существует'
        });
    }

    const resultLikes = await pool.query(`
        SELECT * 
        FROM likes
        WHERE post_id = $1 AND user_id = $2`,
        [req.params.id, req.user.id]
    );

    if (resultLikes.rows.length > 0) {
        await pool.query(
        `DELETE FROM likes
        WHERE post_id = $1 AND user_id = $2`, [req.params.id, req.user.id]
        );
        const countLikes = await pool.query(`
        SELECT COUNT(*)
        FROM likes
        WHERE post_id = $1`, [req.params.id]
        );
        return res.json({
        success: true,
        message: "Вы удалили отметку 'Нравится' с этого поста",
        likes: Number(countLikes.rows[0].count)
        });
    }

    await pool.query(`
        INSERT INTO likes(post_id, user_id)
        VALUES($1, $2)`,
        [req.params.id, req.user.id]
    );
    const countLikes = await pool.query(`
        SELECT COUNT(*)
        FROM likes
        WHERE post_id = $1`, [req.params.id]
        )

    res.json({
        success: true,
        message: "Вы поставили отметку 'Нравится' на этот пост",
        likes: Number(countLikes.rows[0].count)
    });
});

router.get('/posts/:id/comments', async (req, res) => {

    const result = await pool.query(
        `
        SELECT
            c.id,
            c.text,
            c.created_at AS time,
            COALESCE(NULLIF(u.name, ''), u.username) AS author
        FROM comments c
        LEFT JOIN users u
            ON u.id = c.author_id
        WHERE c.post_id = $1
        ORDER BY c.created_at
        `,
        [req.params.id]
    );

    res.json(result.rows);
});


router.post('/posts/:id/comments', authMiddleware, async (req, res) => {
    const result = await pool.query(
    `
        SELECT id
        FROM posts
        WHERE id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
        return res.json({
        success: false,
        message: 'Пост не найден'
        });
    }

    if (!req.body.text?.trim()) {
        return res.json({
        success: false,
        message: 'Комментарий пустой'
        });
    }

    await pool.query(
    `
    INSERT INTO comments(post_id, author_id, text)
    VALUES ($1, $2, $3)
    `,
    [req.params.id, req.user.id, req.body.text.trim()]
    );

/*
    if ('attachment' in req.body) {
        newComment.attachment = req.body.attachment || null;
    }
    if ('attachmentName' in req.body) {
        newComment.attachmentName = req.body.attachmentName || null;
    }
*/
    res.json({
        success: true,
        message: 'Комментарий добавлен'
    });
});

export default router;
