//Dependências
const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const { validateEmail, validatePassword } = require('./utils/validator');
const errorHandler = require('./middlewares/errorHandler');

const loginRoute = require('./routes/login');
const transfersRoute = require('./routes/transfer');
const historyRoute = require('./routes/history');

//Iniciando o Express no app
const app = express();
app.use(express.json()); //Recebe JSON no corpo da requisição

//Conectando ao banco SQLite
const { db } = require('./config/db');

// Cria a tabela "users" se ainda não existir
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance_cents INTEGER DEFAULT 10000
  )
`);

//Rotas
app.post('/users', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    //Validação de campos obrigatórios
    if (!name || !email || !password) {
      const err = new Error('Nome, e-mail e senha são obrigatórios');
      err.statusCode = 400;
      err.code = 'BAD_INPUT';
      throw err;
    }

    //Validação de formato do e-mail
    if (!validateEmail(email)) {
      const err = new Error('E-mail inválido');
      err.statusCode = 400;
      err.code = 'BAD_EMAIL';
      throw err;
    }

    //Validação da senha
    if (!validatePassword(password)) {
      const err = new Error('A senha deve ter no mínimo 6 caracteres');
      err.statusCode = 400;
      err.code = 'BAD_PASSWORD';
      throw err;
    }

    //Verifica se o e-mail já existe
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

app.use('/login', loginRoute);
app.use('/transfers', transfersRoute);
app.use('/history', historyRoute);
app.use(errorHandler);

//Iniciando servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
