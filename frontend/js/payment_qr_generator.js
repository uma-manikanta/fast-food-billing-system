// app.js
// Function to generate a dynamic UPI QR code
function generateUpiQrCode(order) {
    // Construct the UPI Deep Link URL with the transaction details
    const upiId = '9581164547@ybl'; // Replace with your UPI ID
    const payeeName = encodeURIComponent('Campus Bites'); // Replace with your name
    const transactionId = order.orderId;
    const transactionNote = encodeURIComponent(`Payment for Order #${order.orderId}`);
    const amount = order.amount.toFixed(2); // Format the amount to 2 decimal places

    const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tr=${transactionId}&tn=${transactionNote}`;

    // Clear any existing QR code before generating a new one
    document.getElementById("qrcode").innerHTML = "";

    // Generate the new QR code
    new QRCode(document.getElementById("qrcode"), {
        text: upiUrl,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H // High error correction level
    });
}
