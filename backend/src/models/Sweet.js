const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sweet name is required'],
    trim: true,
    minlength: [2, 'Sweet name must be at least 2 characters long'],
    maxlength: [100, 'Sweet name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    lowercase: true,
    trim: true,
    minlength: [2, 'Category must be at least 2 characters long'],
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be greater than 0'],
    validate: {
      validator: function(price) {
        return Number.isFinite(price) && price > 0;
      },
      message: 'Price must be a positive number'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    validate: {
      validator: function(quantity) {
        return Number.isInteger(quantity) && quantity >= 0;
      },
      message: 'Quantity must be a non-negative integer'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for better search performance
sweetSchema.index({ name: 1 });
sweetSchema.index({ category: 1 });
sweetSchema.index({ price: 1 });

module.exports = mongoose.model('Sweet', sweetSchema);
