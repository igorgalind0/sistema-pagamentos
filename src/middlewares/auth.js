const jwt = require('jsonwebtoken');

//Middleware autenticação
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] != 'Bearer') {
    return res.status(401).json({ error: 'Formato do token inválido' });
  }

  const token = parts[1];

  try {
    //Decodifica o token usando a chave secreta
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'chave_secreta_temporaria'
    );

    req.user = { id: decoded.id };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = auth;
