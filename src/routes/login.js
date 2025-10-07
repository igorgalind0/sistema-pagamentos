const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db, get } = require('../config/db');

//POST /login
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  //Validando
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  try {
    //Fazendo uma busca pelo e-mail
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    //Validando a senha
    const senhaValida = await bcrypt.compare(password, user.password);

    console.log('Usuário encontrado:', user);
    console.log('Senha recebida:', password);
    console.log('Hash armazenado:', user.password);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    //Gerando token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'chave_secreta_temporaria',
      { expiresIn: '1h' }
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      balance_cents: user.balance_cents,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Erro ao processar login' });
  }
});

module.exports = router;
