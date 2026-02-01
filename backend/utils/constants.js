// Expense categories
const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Food', // Frontend compat
  'Transportation',
  'Travel', // Frontend compat
  'Housing',
  'Rent', // Frontend compat
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Personal Care',
  'Insurance',
  'Savings & Investments',
  'Other',
  'Others' // Frontend compat
];

// Recommended budget percentages (based on 50/30/20 rule and financial best practices)
const BUDGET_RECOMMENDATIONS = {
  'Housing': 30,
  'Rent': 30,
  'Food & Dining': 15,
  'Food': 15,
  'Transportation': 15,
  'Travel': 15,
  'Utilities': 10,
  'Healthcare': 5,
  'Insurance': 5,
  'Savings & Investments': 20,
  'Entertainment': 5,
  'Shopping': 5,
  'Education': 5,
  'Personal Care': 3,
  'Other': 2,
  'Others': 2
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

module.exports = {
  EXPENSE_CATEGORIES,
  BUDGET_RECOMMENDATIONS,
  HTTP_STATUS
};
