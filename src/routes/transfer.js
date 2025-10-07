const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/transfers', auth, async (req, res) => {
  res.json({ message: 'Rota de transferência acessada!', userId: req.user.id });
});

module.exports = router;
