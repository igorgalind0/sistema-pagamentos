const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { db, get, run } = require('../config/db');
const send = require('send');

router.post('/', auth, async (req, res) => {
  const senderId = req.user.id;
  const { receiverId, receiverEmail, amount } = req.body;

  //Validando
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valor inválido para transferência' });
  }

  if (!receiverId && !receiverEmail) {
    return res.status(400).json({ error: 'Informe todos os dados' });
  }

  try {
    const receiver = receiverId
      ? await get('SELECT * FROM users WHERE id = ?', [receiverId])
      : await get('SELECT * FROM users WHERE email = ?', [receiverEmail]);

    if (!receiver) {
      return res.status(404).json({ error: 'Destinatário não encontrado' });
    }

    if (receiver.id === senderId) {
      return res
        .status(400)
        .json({ error: 'Não é possível transferir para si mesmo' });
    }

    //Inicia transação
    await run('BEGIN TRANSACTION');

    //Pega saldo do remetente
    const sender = await get('SELECT * FROM users WHERE id = ?', [senderId]);

    if (sender.balance_cents < amount) {
      await run('ROLLBACK');
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    //Atualizando saldo
    await run(
      'UPDATE users SET balance_cents = balance_cents - ? WHERE id = ?',
      [amount, senderId]
    );

    await run(
      'UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?',
      [amount, receiver.id]
    );

    //Registrando transferência
    await run(
      'INSERT INTO transfers (sender_id, receiver_id, amount_cents) VALUES (?, ?, ?)',
      [senderId, receiver.id, amount]
    );

    await run('COMMIT');

    res.status(201).json({ message: 'Transferência realizada com sucesso.' });
  } catch (err) {
    await run('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar transferência' });
  }
});

module.exports = router;
