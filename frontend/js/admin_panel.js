// --- SECURITY CHECK ---
// If not logged in, redirect to login page
// if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
//     window.location.replace('./login.html');
// }

// --- APP LOGIC ---
document.addEventListener('DOMContentLoaded', function () {

    // --- 1. MOCK DATA ---
    const menuItems = [
        { id: 1, name: "Veg Burger", price: 80, category: "Burgers" },
        { id: 2, name: "Chicken Burger", price: 120, category: "Burgers" },
        { id: 3, name: "Cheese Burger", price: 100, category: "Burgers" },
        { id: 4, name: "French Fries", price: 60, category: "Sides" },
        { id: 5, name: "Veg Roll", price: 70, category: "Sides" },
        { id: 6, name: "Cola", price: 30, category: "Drinks" },
        { id: 7, name: "Iced Tea", price: 50, category: "Drinks" },
        { id: 8, name: "Water Bottle", price: 20, category: "Drinks" },
        { id: 9, name: "Veg Pizza", price: 150, category: "Burgers" },
        { id: 10, name: "Chicken Pizza", price: 200, category: "Burgers" },
        { id: 11, name: "Coffee", price: 40, category: "Drinks" },
        { id: 12, name: "Veg Sandwich", price: 50, category: "Sides" },
    ];

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

    // --- 3. RENDER FUNCTIONS ---

    // Function to render menu items
    function renderMenu() {
        menuGrid.innerHTML = ""; // Clear existing items
        menuItems.forEach(item => {
            // *** UPDATED to use new CSS classes ***
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

    // Function to render the current order
    function renderOrder() {
        orderList.innerHTML = ""; // Clear existing list

        if (currentOrder.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            payNowBtn.disabled = true;
        } else {
            emptyCartMessage.classList.add('hidden');
            payNowBtn.disabled = false;

            currentOrder.forEach(item => {
                // *** UPDATED to use new CSS classes ***
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

    // Function to calculate and update totals
    function updateTotals() {
        const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05; // 5% tax
        const total = subtotal + tax;

        subtotalPriceEl.textContent = `₹${subtotal.toFixed(2)}`;
        taxPriceEl.textContent = `₹${tax.toFixed(2)}`;
        totalPriceEl.textContent = `₹${total.toFixed(2)}`;
        modalTotalDue.textContent = `₹${total.toFixed(2)}`;
    }

    // --- 4. EVENT HANDLERS ---

    // Add item to order
    menuGrid.addEventListener('click', function (e) {
        const card = e.target.closest('.menu-item'); // *** UPDATED class ***
        if (!card) return;

        const itemId = parseInt(card.dataset.id);
        const menuItem = menuItems.find(item => item.id === itemId);

        // Check if item is already in order
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
        if (!e.target.classList.contains('quantity-btn')) return; // *** UPDATED class ***

        const itemElement = e.target.closest('.order-item'); // *** UPDATED class ***
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

    // Open modal
    payNowBtn.addEventListener('click', function () {
        paymentModal.classList.remove('hidden');
        // Reset modal form
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
                orderid:1,
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
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.05;
        const received = parseFloat(this.value);

        if (received > 0 && received >= total) {
            const change = received - total;
            changeDueAmount.textContent = `₹${change.toFixed(2)}`;
            changeDueGroup.classList.remove('hidden');
        } else {
            changeDueGroup.classList.add('hidden');
        }
    });

    // Finalize payment
    finalizePaymentBtn.addEventListener('click', function () {
        // In a real app, you'd save the order to a database here.

        // Hide payment modal, show success modal
        paymentModal.classList.add('hidden');
        successModal.classList.remove('hidden');
    });

    // Start new order after success
    newOrderBtn.addEventListener('click', function () {
        currentOrder = [];
        renderOrder();
        successModal.classList.add('hidden');
    });


    // --- INITIALIZE APP ---
    renderMenu();
    renderOrder(); // To show empty cart message and disable button
});
