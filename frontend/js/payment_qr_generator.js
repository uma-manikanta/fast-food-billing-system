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
    qrCodeElement = document.getElementById("qrcode");
    qrCodeElement.innerHTML = "";

    // Generate the new QR code
    const qr = new QRCodeStyling({
            width: 300,
            height: 300,
            type: "svg", // Use 'svg' for a scalable, high-quality image
            data: upiUrl,
            image: "images/logo.jpg", // Replace with your logo URL
            dotsOptions: {
                color: "#fe5722",
                type: "rounded"
            },
            backgroundOptions: {
                color: "#ffffff",
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 5
            }
    });

    qr.append(qrCodeElement);

}

