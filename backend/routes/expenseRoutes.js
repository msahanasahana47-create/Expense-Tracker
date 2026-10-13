const express = require('express');
const {
  createExpense,
  getExpenses,
  getSummary,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

const router = express.Router();

router.route('/').post(createExpense).get(getExpenses);

// NOTE: must be declared before '/:id' or "summary" would be treated as an ID
router.get('/summary', getSummary);

router.route('/:id').get(getExpenseById).put(updateExpense).delete(deleteExpense);

module.exports = router;
