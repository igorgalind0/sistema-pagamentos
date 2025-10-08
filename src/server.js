//Dependências
const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const userSchema = require('./schemas/userSchema');

const { validateEmail, validatePassword } = require('./utils/validator');
const errorHandler = require('./middlewares/errorHandler');

const userRegister = require('./routes/register');
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
app.use('/register', userRegister);
app.use('/login', loginRoute);
app.use('/transfers', transfersRoute);
app.use('/history', historyRoute);
app.use(errorHandler);

//Iniciando servidor
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

module.exports = app;
