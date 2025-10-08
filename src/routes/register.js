const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { db } = require('../config/db');
const userSchema = require('../schemas/userSchema');

// POST /register
router.post('/', async (req, res, next) => {
  // Validação usando schema Zod
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { name, email, password } = parsed.data;

  try {
    // Verifica se o e-mail já existe
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) return next(err);

        if (user) {
          const conflictErr = new Error('E-mail já cadastrado');
          conflictErr.statusCode = 409;
          conflictErr.code = 'EMAIL_EXISTS';
          return next(conflictErr);
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          db.run(
            'INSERT INTO users (name, email, password, balance_cents) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 10000],
            function (err) {
              if (err) return next(err);

              return res.status(201).json({
                id: this.lastID,
                name,
                email,
                balance_cents: 10000,
              });
            }
          );
        } catch (hashErr) {
          return next(hashErr);
        }
      }
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
