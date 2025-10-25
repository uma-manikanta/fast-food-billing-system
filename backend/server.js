// --- 1. Import Dependencies ---
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// --- 2. Initialize Express App ---
const app = express();
const port = process.env.PORT || 3000;

// --- 3. Middleware ---
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Allow server to read JSON payloads

// --- 4. MySQL Database Connection (UPDATED) ---
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT, // <-- ADD THIS LINE
    ssl: {
        rejectUnauthorized: false // <-- AND ADD THIS SSL OBJECT
    }
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Successfully connected to MySQL database.');
});

// --- 5. API Endpoints (Routes) ---
// (The rest of your file is unchanged and correct)

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
    // 1. Get data from the frontend request body
    const {
        order_id,
        order_datetime,
        mode_of_payment,
        subtotal,
        tax_amount,
        total_amount,
        food_items_ordered
    } = req.body;

    // 2. Validate essential data
    if (!order_id || !total_amount || !food_items_ordered) {
        return res.status(400).json({ error: 'Missing required transaction data' });
    }
    
    // 3. Convert the items array into a JSON string for the DB
    const itemsJson = JSON.stringify(food_items_ordered);

    // 4. Create the SQL query
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

    // 5. Execute the query
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error saving transaction:', err);
            return res.status(500).json({ error: 'Failed to save transaction' });
        }
        
        // 6. Send success response
        res.status(201).json({ 
            success: true, 
            message: 'Transaction saved successfully', 
            order_id: order_id 
        });
    });
});

// --- 6. Start the Server ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

