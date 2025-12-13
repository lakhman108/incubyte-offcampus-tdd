const validateRegistration = (username, email, password) => {
  if (!username) return 'Username is required';
  if (!email) return 'Email is required';
  if (!password) return 'Password is required';
  if (password.length < 6 || password.length > 20)
    return 'Password length less than 6 and more than 20';

  // Email format validation
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

  if (!emailRegex.test(email)) {
    return 'Invalid email';
  }

  return null;
};

module.exports = validateRegistration;
