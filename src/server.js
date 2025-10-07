//Dependências
const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const loginRoute = require('./routes/login');
const transfersRoute = require('./routes/transfer');

//Iniciando o Express no app
const app = express();
app.use(express.json()); //Recebe JSON no corpo da requisição

//Conectando ao banco SQLite
const db = new sqlite3.Database('./database.sqlite');

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
app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;

  //Validando campos
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Nome, e-mail e senha são obrigatórios' });
  }

  //Verificando email existente
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar usuário' });
    }

    if (user) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      //Criando usuário e dando saldo inicial de R$ 100,00 (10000 centavos)
      db.run(
        'INSERT TO users (name, email, password, balance_cents) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 10000],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'erro ao criar usuário. ' });
          }

          //Retorna sucesso, sem enviar a senha
          return res.status(201).json({
            id: this.lastID,
            name,
            email,
            balance_cents: 10000,
          });
        }
      );
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao processar senha' });
    }
  });
});

app.use('/login', loginRoute);

app.use('/transfers', transfersRoute);

//Iniciando servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na portaa ${PORT}`));
