const mongoose = require('mongoose');

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Others'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer'];

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      },
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      validate: {
        validator: (value) => Number.isFinite(value) && value > 0,
        message: 'Amount must be greater than 0',
      },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: PAYMENT_METHODS,
        message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`,
      },
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    // Auto-generates createdAt (and updatedAt)
    timestamps: true,
  }
);

// Speeds up date-range and category filtering
expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ category: 1, expenseDate: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
module.exports.CATEGORIES = CATEGORIES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
