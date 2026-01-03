// --- 1. Import Dependencies ---
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');


const corsOptions = {
    origin: 'https://fast-food-billing-system.vercel.app'
};
const app = express();
const port = process.env.PORT || 3000;

// Middleware 
app.use(cors(corsOptions)); // Allow frontend to connect
app.use(express.json()); // Allow server to read JSON payloads

//MySql database connection

const db = mysql.createPool({ // Use createPool instead of createConnection for better performance
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 26123, // Use the port from your Aiven screenshot
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Successfully connected to MySQL database.');
});


//End ponits
/**
 * @route   GET /api/menu
 * @desc    Get all available food items from the menu
 */
app.get('/api/menu', (req, res) => {
    const query = 'SELECT * FROM menu WHERE is_available = TRUE';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching menu:', err);
            return res.status(500).json({ error: 'Failed to fetch menu' });
        }
        res.json(results);
    });
});

/**
 * @route   POST /api/transactions
 * @desc    Save a new transaction to the database
 */
app.post('/api/transactions', (req, res) => {
    // to get data from the frontend
    const {
        order_id,
        order_datetime,
        mode_of_payment,
        subtotal,
        tax_amount,
        total_amount,
        food_items_ordered
    } = req.body;

    // validate data
    if (!order_id || !total_amount || !food_items_ordered) {
        return res.status(400).json({ error: 'Missing required transaction data' });
    }

    // convert the items array into a JSON string for the databse
    const itemsJson = JSON.stringify(food_items_ordered);

    // to create the SQL query
    const query = `
        INSERT INTO transactions 
        (order_id, order_datetime, mode_of_payment, subtotal, tax_amount, total_amount, food_items_ordered) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        order_id,
        order_datetime,
        mode_of_payment,
        subtotal,
        tax_amount,
        total_amount,
        itemsJson
    ];

    // query execution
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving transaction:', err);
            return res.status(500).json({ error: 'Failed to save transaction' });
        }

        // send success response
        res.status(201).json({
            success: true,
            message: 'Transaction saved successfully',
            order_id: order_id
        });
    });
});

// starting server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});