const mongoose = require('mongoose');
const Expense = require('../models/Expense');

// Fields a client is allowed to set (prevents mass-assignment of _id, createdAt, etc.)
const ALLOWED_FIELDS = ['title', 'category', 'amount', 'paymentMethod', 'expenseDate', 'notes'];

const pick = (source, fields) =>
  fields.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseDate = (value, endOfDay = false) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // A bare date like 2026-10-13 should include the whole day when used as an end bound
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    date.setUTCHours(23, 59, 59, 999);
  }
  return date;
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

/**
 * Builds a date-range filter. Returns { error } on invalid input.
 */
const buildDateFilter = (startDate, endDate) => {
  const range = {};
  if (startDate) {
    const start = parseDate(startDate);
    if (!start) return { error: 'startDate is not a valid date' };
    range.$gte = start;
  }
  if (endDate) {
    const end = parseDate(endDate, true);
    if (!end) return { error: 'endDate is not a valid date' };
    range.$lte = end;
  }
  if (range.$gte && range.$lte && range.$gte > range.$lte) {
    return { error: 'startDate cannot be after endDate' };
  }
  return { range: Object.keys(range).length ? range : null };
};

// @desc    Create a new expense
// @route   POST /expenses
const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create(pick(req.body, ALLOWED_FIELDS));
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all expenses (with optional filters)
// @route   GET /expenses?category=&startDate=&endDate=&search=
const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, search } = req.query;
    const filter = {};

    if (category) {
      if (!Expense.CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${Expense.CATEGORIES.join(', ')}`,
        });
      }
      filter.category = category;
    }

    const { range, error } = buildDateFilter(startDate, endDate);
    if (error) return res.status(400).json({ success: false, message: error });
    if (range) filter.expenseDate = range;

    if (search && String(search).trim()) {
      filter.title = { $regex: escapeRegex(String(search).trim()), $options: 'i' };
    }

    const expenses = await Expense.find(filter).sort({ expenseDate: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    next(err);
  }
};

// @desc    Get total + category-wise spending summary
// @route   GET /expenses/summary?startDate=&endDate=
const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};

    const { range, error } = buildDateFilter(startDate, endDate);
    if (error) return res.status(400).json({ success: false, message: error });
    if (range) match.expenseDate = range;

    const [result] = await Expense.aggregate([
      { $match: match },
      {
        $facet: {
          overall: [
            { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
          byCategory: [
            {
              $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { totalAmount: -1 } },
            { $project: { _id: 0, category: '$_id', totalAmount: 1, count: 1 } },
          ],
        },
      },
    ]);

    const overall = result.overall[0] || { totalAmount: 0, count: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalAmount: overall.totalAmount,
        totalExpenses: overall.count,
        categoryWise: result.byCategory,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single expense
// @route   GET /expenses/:id
const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an expense
// @route   PUT /expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }

    const updates = pick(req.body, ALLOWED_FIELDS);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
    }

    const expense = await Expense.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an expense
// @route   DELETE /expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }

    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.status(200).json({ success: true, message: 'Expense deleted successfully', data: expense });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getSummary,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
