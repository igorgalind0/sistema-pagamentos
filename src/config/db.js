const sqlite = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

// Usa DATABASE_URL do .env ou, se não existir, cria um arquivo local de banco de dados
const dbFile =
  process.env.DATABASE_URL || path.join(__dirname, '..', '..', 'database.db');

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
    process.exit(1);
  }
  console.log('Conectando ao SQLite:', err.message);
});

// Ativa as chaves estrangeiras (garante integridade referencial)
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON;');

  //Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
      balance_cents INTEGER NOT NULL DEFAULT 10000,
      create_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  //Tabela de transferências
  db.run(`
    CREATE TABLE IF NOT EXISTS transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    amount_cents INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id), REFERENCES users(id) ON DELETE CASCADE
    );
  `);
});

//Trabalhando com Promises e usar async/wait
const run = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      //Retorna o ID do último registro inserido ou número de alterações
      resolve({ lasteID: this.lastID, changes: this.changes });
    });
  });
};

//Método para buscar um ou vários registros com async/await
const get = promisify.apply(db.get.bind(db));
const all = promisify.apply(db.all.bind(db));

modules.exports = {
  db,
  run,
  get,
  all,
};
