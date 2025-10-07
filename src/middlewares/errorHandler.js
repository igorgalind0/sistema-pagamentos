function errorHandler(err, req, res, next) {
  console.error('Erro capturado', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno no servidor';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    error: message,
    code: code,
  });
}

module.exports = errorHandler;
