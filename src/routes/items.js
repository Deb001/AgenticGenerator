// src/routes/items.js
const express = require('express');
const db = require('../db.js');

const router = express.Router();

/**
 * Validate that a value is a positive integer.
 * @param {any} value
 * @returns {boolean}
 */
function isPositiveInteger(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

/**
 * Validate that a string field is non‑empty after trimming.
 * @param {any} value
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * GET / - fetch all items ordered by created_at DESC
 */
router.get('/', async (req, res, next) => {
  try {
    const items = await db.all(
      'SELECT id, title, body, created_at FROM items ORDER BY created_at DESC'
    );
    res.json(items);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /:id - fetch a single item by id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: 'Invalid id parameter' });
    }

    const item = await db.get(
      'SELECT id, title, body, created_at FROM items WHERE id = ?',
      [id]
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * POST / - create a new item
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, body } = req.body;

    if (!isNonEmptyString(title) || !isNonEmptyString(body)) {
      return res
        .status(400)
        .json({ error: 'Both title and body are required and must be non‑empty strings' });
    }

    const result = await db.run(
      `INSERT INTO items (title, body, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [title.trim(), body.trim()]
    );

    const newItem = await db.get(
      'SELECT id, title, body, created_at FROM items WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /:id - update an existing item
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;

    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: 'Invalid id parameter' });
    }
    if (!isNonEmptyString(title) || !isNonEmptyString(body)) {
      return res
        .status(400)
        .json({ error: 'Both title and body are required and must be non‑empty strings' });
    }

    const result = await db.run(
      'UPDATE items SET title = ?, body = ? WHERE id = ?',
      [title.trim(), body.trim(), id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedItem = await db.get(
      'SELECT id, title, body, created_at FROM items WHERE id = ?',
      [id]
    );

    res.json(updatedItem);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /:id - delete an item
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isPositiveInteger(id)) {
      return res.status(400).json({ error: 'Invalid id parameter' });
    }

    const result = await db.run('DELETE FROM items WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

module.exports = router;