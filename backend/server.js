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

// Use this instead to verify the connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to Aiven MySQL successfully!');
        connection.release(); // Always release the connection back to the pool!
    }
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
    const {
        order_id,
        order_datetime, // Example: '2026-01-03T14:26:23.279Z'
        mode_of_payment,
        subtotal,
        tax_amount,
        total_amount,
        food_items_ordered
    } = req.body;

    // 1. Basic Validation
    if (!order_id || !total_amount || !food_items_ordered) {
        return res.status(400).json({ error: 'Missing required transaction data' });
    }

    // 2. FIX: Convert ISO date string to a JavaScript Date Object
    // The mysql2 library will automatically format this correctly for the DB
    const formattedDate = new Date(order_datetime);

    // 3. Convert the items array into a JSON string for the database
    const itemsJson = JSON.stringify(food_items_ordered);

    const query = `
        INSERT INTO transactions 
        (order_id, order_datetime, mode_of_payment, subtotal, tax_amount, total_amount, food_items_ordered) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        order_id,
        formattedDate, // Passed as an object
        mode_of_payment,
        subtotal,
        tax_amount,
        total_amount,
        itemsJson
    ];

    // 4. Execute the query using the pool
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving transaction:', err);
            return res.status(500).json({ error: 'Failed to save transaction', details: err.message });
        }

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