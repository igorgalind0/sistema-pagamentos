const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { get, run } = require('../config/db');

router.post('/', auth, async (req, res) => {
  const senderId = req.user?.id; // garante que req.user existe
  const { receiverId, receiverEmail, amount } = req.body;

  // Validações básicas
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valor inválido para transferência' });
  }

  if (!receiverId && !receiverEmail) {
    return res.status(400).json({ error: 'Informe todos os dados' });
  }

  try {
    // Busca destinatário
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

    // Busca remetente
    const sender = await get('SELECT * FROM users WHERE id = ?', [senderId]);

    if (!sender) {
      return res.status(404).json({ error: 'Remetente não encontrado' });
    }

    if (sender.balance_cents < amount) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Inicia transação
    await run('BEGIN TRANSACTION');

    try {
      // Atualiza saldos
      await run(
        'UPDATE users SET balance_cents = balance_cents - ? WHERE id = ?',
        [amount, senderId]
      );
      await run(
        'UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?',
        [amount, receiver.id]
      );

      // Registra transferência
      await run(
        'INSERT INTO transfers (sender_id, receiver_id, amount_cents) VALUES (?, ?, ?)',
        [senderId, receiver.id, amount]
      );

      await run('COMMIT');

      res.status(201).json({ message: 'Transferência realizada com sucesso.' });
    } catch (errTrans) {
      await run('ROLLBACK');
      console.error('Erro na transação:', errTrans);
      res.status(500).json({ error: 'Erro ao processar transferência' });
    }
  } catch (err) {
    console.error('Erro geral:', err);
    res.status(500).json({ error: 'Erro ao processar transferência' });
  }
});

module.exports = router;
