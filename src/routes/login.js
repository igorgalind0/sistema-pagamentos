const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { get } = require('../config/db');

// POST /login
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'chave_secreta_temporaria',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        balance_cents: user.balance_cents,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar login' });
  }
});

module.exports = router;
