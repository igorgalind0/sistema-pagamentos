const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { all } = require('../config/db');

// GET /history/:userId
router.get('/:userId', auth, async (req, res) => {
  const { userId } = req.params;

  try {
    const transfers = await all(
      `
      SELECT 
        t.id, 
        t.sender_id, 
        t.receiver_id, 
        t.amount_cents, 
        t.timestamp, 
        sender.name AS sender_name, 
        receiver.name AS receiver_name
      FROM transfers t
      JOIN users sender ON t.sender_id = sender.id
      JOIN users receiver ON t.receiver_id = receiver.id
      WHERE t.sender_id = ? OR t.receiver_id = ?
      ORDER BY t.timestamp DESC
      `,
      [userId, userId]
    );

    if (transfers.length === 0) {
      return res
        .status(404)
        .json({
          message: 'Nenhuma transferência encontrada para este usuário',
        });
    }

    res.status(200).json(transfers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar histórico de transações' });
  }
});

module.exports = router;
