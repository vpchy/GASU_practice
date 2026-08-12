import express from 'express';
import { authMiddleware, getUserDisplayName } from '../middleware/auth.js';

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
            COALESCE(c.comments_count, 0) AS comments_count,
            COALESCE(json_agg(
                json_build_object(
                    'id', pm.id,
                    'mimeType', pm.media_type,
                    'fileName', pm.file_name,
                    'url', pm.file_url
                ) ORDER BY pm.created_at
            ) FILTER (WHERE pm.id IS NOT NULL), '[]'::json) AS attachments
        FROM posts p
        LEFT JOIN users u
            ON u.id = p.author_id
        LEFT JOIN post_media pm
            ON pm.post_id = p.id
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
        GROUP BY p.id, u.id, l.likes, c.comments_count
        ORDER BY p.created_at DESC`);

    res.json(result.rows);
});

router.post('/posts', authMiddleware, async (req, res) => {
    if (!req.body.title || !req.body.text) {
        return res.json({
            success: false,
            message: 'Введите заголовок и текст'
        });
    }

    const result = await pool.query(
        `
        INSERT INTO posts(author_id, title, text)
        VALUES ($1, $2, $3)
        RETURNING id, title, text, created_at
        `,
        [
            req.user.id,
            req.body.title,
            req.body.text
        ]
    );

    const post = result.rows[0];
    let attachments = null;

    if (req.body.attachment) {
        const mediaResult = await pool.query(
            `
            INSERT INTO post_media(
                post_id,
                media_type,
                file_name,
                file_url
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id, media_type, file_name, file_url
            `,
            [
                post.id,
                req.body.mimeType || 'application/octet-stream',
                req.body.attachmentName || null,
                req.body.attachment
            ]
        );
        attachments = mediaResult.rows.map(m => ({
            id: m.id,
            mimeType: m.media_type,
            fileName: m.file_name,
            url: m.file_url
        }));
    }

    res.json({
        success: true,
        message: 'Пост отправлен',
        post: {
            id: post.id,
            title: post.title,
            text: post.text,
            time: post.created_at,
            author: req.user.username,
            likes: 0,
            comments_count: 0,
            attachments: attachments || []
        }
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
            COALESCE(c.comments_count, 0) AS comments_count,
            COALESCE(json_agg(
                json_build_object(
                    'id', pm.id,
                    'mimeType', pm.media_type,
                    'fileName', pm.file_name,
                    'url', pm.file_url
                ) ORDER BY pm.created_at
            ) FILTER (WHERE pm.id IS NOT NULL), '[]'::json) AS attachments
        FROM posts p
        LEFT JOIN users u
            ON u.id = p.author_id
        LEFT JOIN post_media pm
            ON pm.post_id = p.id
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
        GROUP BY p.id, u.id, l.likes, c.comments_count
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
            COALESCE(NULLIF(u.name, ''), u.username) AS author,
            COALESCE(json_agg(
                json_build_object(
                    'id', cm.id,
                    'mimeType', cm.media_type,
                    'fileName', cm.file_name,
                    'url', cm.file_url
                ) ORDER BY cm.created_at
            ) FILTER (WHERE cm.id IS NOT NULL), '[]'::json) AS attachments
        FROM comments c
        LEFT JOIN users u
            ON u.id = c.author_id
        LEFT JOIN comment_media cm
            ON cm.comment_id = c.id
        WHERE c.post_id = $1
        GROUP BY c.id, u.id
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

    const commentInsert = await pool.query(
        `
        INSERT INTO comments(post_id, author_id, text)
        VALUES ($1, $2, $3)
        RETURNING id, text, created_at, author_id
        `,
        [
            req.params.id,
            req.user.id,
            req.body.text.trim()
        ]
        );
    const comment = commentInsert.rows[0];
    let attachments = null;

    if (req.body.attachment) {
        const mediaResult = await pool.query(
            `
            INSERT INTO comment_media(
                comment_id,
                media_type,
                file_name,
                file_url
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id, media_type, file_name, file_url
            `,
            [
                comment.id,
                req.body.mimeType || 'application/octet-stream',
                req.body.attachmentName || null,
                req.body.attachment
            ]
            );
        attachments = mediaResult.rows.map(m => ({
            id: m.id,
            mimeType: m.media_type,
            fileName: m.file_name,
            url: m.file_url
        }));
    }

    res.json({
        success: true,
        message: 'Комментарий добавлен',
        comment: {
            id: comment.id,
            text: comment.text,
            time: comment.created_at,
            author: req.user.username,
            attachments: attachments || []
        }
    });
});

export default router;
