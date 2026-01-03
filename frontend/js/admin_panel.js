// --- SECURITY CHECK ---
// If not logged in, redirect to login page
if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
    window.location.replace('./login.html');
}

// --- APP LOGIC ---
// Make the main function async to use await for fetching data
document.addEventListener('DOMContentLoaded', async function () { // <-- MODIFIED

    // --- 1. MOCK DATA ---
    // const menuItems = [ ... ]; // <-- DELETED
    let menuItems = []; // <-- ADDED: This will be filled from the database
    let currentOrder = []; // Array to hold order items

    // --- 2. GET HTML ELEMENTS ---
    const menuGrid = document.getElementById('menu-grid');
    const orderList = document.getElementById('order-items-list');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const subtotalPriceEl = document.getElementById('subtotal-price');
    const taxPriceEl = document.getElementById('tax-price');
    const totalPriceEl = document.getElementById('total-price');
    const payNowBtn = document.getElementById('pay-now-btn');
    const clearOrderBtn = document.getElementById('clear-order-btn');
    const qrCode = document.getElementById('qrcode');

    // Modal Elements
    const paymentModal = document.getElementById('payment-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalTotalDue = document.getElementById('modal-total-due');
    const paymentMethodSelect = document.getElementById('payment-method');
    const cashPaymentGroup = document.getElementById('cash-payment-group');
    const cashReceivedInput = document.getElementById('cash-received');
    const changeDueGroup = document.getElementById('change-due-group');
    const changeDueAmount = document.getElementById('change-due-amount');
    const finalizePaymentBtn = document.getElementById('finalize-payment-btn');

    // Success Modal Elements
    const successModal = document.getElementById('success-modal');
    const newOrderBtn = document.getElementById('new-order-btn');

    // Logout Buttons
    const logoutDesktop = document.getElementById('logout-button-desktop');
    const logoutMobile = document.getElementById('logout-button-mobile');


    // --- NEW: FETCH MENU DATA FROM BACKEND ---
    try {
        // <-- MODIFIED: URL changed back to localhost
        const response = await fetch('https://fast-food-billing-system-1.onrender.com/api/menu'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        menuItems = await response.json(); // Load menu from database
    } catch (error) {
        console.error("Failed to fetch menu:", error);
        alert("CRITICAL ERROR: Could not load menu items. Please check if the backend server is running.");
        // Stop execution if menu can't be loaded
        return; 
    }
    // --- END OF NEW FETCH ---


    // --- 3. RENDER FUNCTIONS ---
    // (renderMenu function is unchanged, it will now use the fetched menuItems)
    function renderMenu() {
        menuGrid.innerHTML = ""; // Clear existing items
        menuItems.forEach(item => {
            const menuItemHTML = `
                        <div class="menu-item" data-id="${item.id}">
                            <div class="menu-item-content">
                                <h3 class="menu-item-name">${item.name}</h3>
                                <p class="menu-item-price">₹${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                    `;
            menuGrid.innerHTML += menuItemHTML;
        });
    }

    // (filterFoodItems function is unchanged)
    function filterFoodItems(itemName) { }

    // (renderOrder function is unchanged)
    function renderOrder() {
        orderList.innerHTML = ""; // Clear existing list

        if (currentOrder.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            payNowBtn.disabled = true;
        } else {
            emptyCartMessage.classList.add('hidden');
            payNowBtn.disabled = false;

            currentOrder.forEach(item => {
                const orderItemHTML = `
                            <div class="order-item" data-id="${item.id}">
                                <div class="order-item-details">
                                    <p class="order-item-name">${item.name}</p>
                                    <p class="order-item-price-per">₹${item.price.toFixed(2)}</p>
                                </div>
                                <div class="order-item-quantity">
                                    <button class="quantity-btn" data-action="decrease">-</button>
                                    <span class="quantity-text">${item.quantity}</span>
                                    <button class="quantity-btn" data-action="increase">+</button>
                                </div>
                                <p class="order-item-price-total">₹${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        `;
                orderList.innerHTML += orderItemHTML;
            });
        }
        updateTotals();
    }

    // (updateTotals function is unchanged)
    function updateTotals() {
        const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = Math.ceil(subtotal * 0.05); // 5% tax
        const total = subtotal + tax;

        subtotalPriceEl.textContent = `₹${subtotal.toFixed(2)}`;
        taxPriceEl.textContent = `₹${tax.toFixed(2)}`;
        totalPriceEl.textContent = `₹${total.toFixed(2)}`;
        modalTotalDue.textContent = `₹${total.toFixed(2)}`;
    }

    // --- 4. EVENT HANDLERS ---
    // (All handlers in this section are unchanged)
    // Add item to order
    menuGrid.addEventListener('click', function (e) {
        const card = e.target.closest('.menu-item'); 
        if (!card) return;
        const itemId = parseInt(card.dataset.id);
        const menuItem = menuItems.find(item => item.id === itemId);
        const existingItem = currentOrder.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            currentOrder.push({ ...menuItem, quantity: 1 });
        }
        renderOrder();
    });

    // Change quantity or remove item
    orderList.addEventListener('click', function (e) {
        if (!e.target.classList.contains('quantity-btn')) return;
        const itemElement = e.target.closest('.order-item');
        const itemId = parseInt(itemElement.dataset.id);
        const action = e.target.dataset.action;
        const orderItem = currentOrder.find(item => item.id === itemId);
        if (action === 'increase') {
            orderItem.quantity++;
        } else if (action === 'decrease') {
            orderItem.quantity--;
            if (orderItem.quantity === 0) {
                currentOrder = currentOrder.filter(item => item.id !== itemId);
            }
        }
        renderOrder();
    });

    // Clear order
    clearOrderBtn.addEventListener('click', function () {
        currentOrder = [];
        renderOrder();
    });

    // --- Logout Handler ---
    function logout() {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.replace('./index.html'); // (Go to welcome page)
    }
    logoutDesktop.addEventListener('click', logout);
    logoutMobile.addEventListener('click', logout);


    // --- 5. MODAL LOGIC ---
    // (payNowBtn, closeModalBtn, paymentMethodSelect, cashReceivedInput handlers are unchanged)
    // Open modal
    payNowBtn.addEventListener('click', function () {
        paymentModal.classList.remove('hidden');
        paymentMethodSelect.value = 'cash';
        cashPaymentGroup.classList.remove('hidden');
        cashReceivedInput.value = '';
        qrCode.classList.add('hidden')
        changeDueGroup.classList.add('hidden');
    });

    // Close modal
    closeModalBtn.addEventListener('click', function () {
        paymentModal.classList.add('hidden');
    });

    // Toggle cash input
    paymentMethodSelect.addEventListener('change', function () {
        if (this.value === 'cash') {
            cashPaymentGroup.classList.remove('hidden');
            qrCode.classList.add('hidden')
        }
        else if (this.value == 'upi') {
            cashPaymentGroup.classList.add('hidden');
            changeDueGroup.classList.add('hidden');
            const totalAmount = Number(totalPriceEl.textContent.slice(1));
            console.log(totalAmount);
            generateUpiQrCode({
                orderid: 1,
                amount: totalAmount
            });
            qrCode.classList.remove('hidden')
        }
        else {
            qrCode.classList.add('hidden')
            cashPaymentGroup.classList.add('hidden');
            changeDueGroup.classList.add('hidden');
        }
    });

    // Calculate change
    cashReceivedInput.addEventListener('input', function () {
        const total = Math.ceil(currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.05);
        const received = Math.ceil(parseFloat(this.value));

        if (received > 0 && received >= total) {
            const change = received - total;
            changeDueAmount.textContent = `₹${change.toFixed(2)}`;
            changeDueGroup.classList.remove('hidden');
        } else {
            changeDueGroup.classList.add('hidden');
        }
    });

    // Finalize payment --- MODIFIED TO SEND DATA TO BACKEND
    // Make this function async to await the fetch call
    finalizePaymentBtn.addEventListener('click', async function () { 
        
        // 1. Get all the data for the transaction
        const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = Math.ceil(subtotal * 0.05);
        const total = subtotal + tax;
        const paymentMode = paymentMethodSelect.value; // 'cash', 'upi', 'card'

        // 2. Create a unique Order ID (simple version)
        const orderId = `TXN-${Date.now()}`;

        // 3. Create the data payload to send to the server
        const transactionData = {
            order_id: orderId,
            order_datetime: new Date().toISOString(), // Get current time in standard format
            mode_of_payment: paymentMode,
            subtotal: subtotal.toFixed(2),
            tax_amount: tax.toFixed(2),
            total_amount: total.toFixed(2),
            food_items_ordered: currentOrder // Send the whole array of items
        };

        // 4. Send data to the backend
        try {
            // <-- MODIFIED: URL changed back to localhost
            const response = await fetch('https://fast-food-billing-system-1.onrender.com/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });

            if (!response.ok) {
                // If server sends an error (e.g., 500), throw an error
                throw new Error(`Server error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Transaction saved successfully:", result.order_id);

            // 5. SUCCESS: Only show success modal after data is saved
            paymentModal.classList.add('hidden');
            successModal.classList.remove('hidden');

        } catch (error) {
            console.error("Error saving transaction:", error);
            // Show an error to the user!
            alert("Error: Could not save the order. Please try again. Check backend server.");
            // DO NOT show success modal if it failed
        }
    });

    // Start new order after success
    newOrderBtn.addEventListener('click', function () {
        currentOrder = [];
        renderOrder();
        successModal.classList.add('hidden');
    });


    // --- INITIALIZE APP ---
    renderMenu(); // Now renders data fetched from the DB
    renderOrder(); // To show empty cart message and disable button
});
