const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Usa DATABASE_URL do .env ou, se não existir, cria um arquivo local de banco de dados
const dbFile =
  process.env.DATABASE_URL || path.join(__dirname, '..', '..', 'database.db');

// Conecta ao banco SQLite
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
    process.exit(1);
  }
  console.log('Conectado ao SQLite:', dbFile);
});

// Ativa as chaves estrangeiras (garante integridade referencial)
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON;');

  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      balance_cents INTEGER NOT NULL DEFAULT 10000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabela de transferências
  db.run(`
    CREATE TABLE IF NOT EXISTS transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      amount_cents INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
});

// Funções para trabalhar com Promises
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

// Exporta os helpers
module.exports = {
  db,
  run,
  get,
  all,
};
