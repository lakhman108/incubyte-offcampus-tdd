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

const validateSweet = (name, category, price, quantity) => {
  if (!name) return 'Name is required';
  if (!category) return 'Category is required';
  if (!price) return 'Price is required';
  if (!quantity) return 'Quantity is required';
  if (price < 0) return 'Price cannot be negative';
  if (quantity < 0) return 'Quantity cannot be negative';
  if (!Number.isInteger(quantity)) return 'Quantity must be an integer';

  return null;
};

const validateSweetUpdate = (price, quantity) => {
  // Check if price is provided and is negative
  if (price !== undefined && price < 0) {
    return 'Price cannot be negative';
  }

  // Check if quantity is provided and is negative
  if (quantity !== undefined && quantity < 0) {
    return 'Quantity cannot be negative';
  }

  // Check if quantity is provided and is not an integer
  if (quantity !== undefined && !Number.isInteger(quantity)) {
    return 'Quantity must be an integer';
  }

  return null;
};
module.exports = { validateRegistration, validateSweet, validateSweetUpdate };
