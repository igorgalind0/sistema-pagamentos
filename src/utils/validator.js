function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

function validateAmount(amount) {
  return typeof amount === 'number' && amount > 0;
}

module.exports = { validateEmail, validatePassword, validateAmount };
