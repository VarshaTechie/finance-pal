const mongoose = require('mongoose');
const Income = require('./models/Income');
const User = require('./models/User');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');
        const userId = '697df75d40b344604c69ec9f';

        const incomes = await Income.find({ userId }).sort({ month: 1 });
        console.log('Specific Incomes Count:', incomes.length);
        incomes.forEach(inc => {
            console.log(`- Month: ${inc.month.toISOString().split('T')[0]}, Amount: ${inc.amount}`);
        });

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
