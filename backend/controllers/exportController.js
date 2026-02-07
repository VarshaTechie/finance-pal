const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Export user's financial data as CSV
 * GET /api/export/:userId
 * Query params: startDate, endDate, type (expenses|income|all)
 */
const exportToCSV = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, type = 'all' } = req.query;

        const toISODate = (d) => new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD
        const csvEscape = (value) => {
            if (value === null || value === undefined) return '';
            const s = String(value);
            // Escape per RFC 4180: wrap in quotes if contains quote/comma/newline
            if (/[",\r\n]/.test(s)) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        };

        // Build date filters
        const expenseDateFilter = {};
        if (startDate || endDate) {
            expenseDateFilter.date = {};
            if (startDate) expenseDateFilter.date.$gte = new Date(startDate);
            if (endDate) expenseDateFilter.date.$lte = new Date(endDate);
        }

        const incomeMonthFilter = {};
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            incomeMonthFilter.month = {};
            if (start) incomeMonthFilter.month.$gte = new Date(start.getFullYear(), start.getMonth(), 1);
            if (end) incomeMonthFilter.month.$lte = new Date(end.getFullYear(), end.getMonth(), 1);
        }

        // Build a single-table CSV so Excel imports cleanly
        // Columns: Type,Date,Category/Source,Amount,Description
        const rows = [['Type', 'Date', 'Category/Source', 'Amount', 'Description']];
        const records = [];

        if (type === 'all' || type === 'expenses') {
            const expenses = await Expense.find({ userId, ...expenseDateFilter }).sort({ date: -1 });
            expenses.forEach((e) => {
                records.push({
                    sortDate: new Date(e.date),
                    row: ['Expense', toISODate(e.date), e.category || '', Number(e.amount).toFixed(2), e.description || '']
                });
            });
        }

        if (type === 'all' || type === 'income') {
            const incomes = await Income.find({ userId, ...incomeMonthFilter }).sort({ month: -1 });
            incomes.forEach((i) => {
                // Since incomes are stored as a single aggregated record per month,
                // we label the source as a total rather than a specific income type
                // to avoid implying everything is from one source.
                const sourceLabel = 'All Sources (Monthly Total)';
                records.push({
                    sortDate: new Date(i.month),
                    row: ['Income', toISODate(i.month), sourceLabel, Number(i.amount).toFixed(2), '']
                });
            });
        }

        records.sort((a, b) => b.sortDate - a.sortDate);
        records.forEach((r) => rows.push(r.row));

        const csvContent =
            '\uFEFF' + // UTF-8 BOM for Excel
            rows.map((r) => r.map(csvEscape).join(',')).join('\r\n') + // CRLF for Windows Excel
            '\r\n';

        const filename = `finance-export-${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        res.status(HTTP_STATUS.OK).send(csvContent);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    exportToCSV
};

