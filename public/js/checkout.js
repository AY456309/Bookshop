document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const summary = document.getElementById('checkoutSummary');
    const totalEl = document.getElementById('orderTotal');
    
    // Auto-fill user name from localStorage
    const userNameEl = document.getElementById('orderName');
    if (userNameEl) {
        userNameEl.value = localStorage.getItem('userName') || "";
    }

    // Redirect if cart is empty
    if (cart.length === 0) {
        alert("Your cart is empty! Redirecting to shop...");
        window.location.href = 'shop.html';
        return;
    }

    // Render Summary and Calculate Total
    let total = 0;
    summary.innerHTML = cart.map(item => {
        const itemSubtotal = Number(item.price) * Number(item.quantity);
        total += itemSubtotal;
        return `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.title} (x${item.quantity})</span>
                <span class="fw-bold">AED ${itemSubtotal.toFixed(2)}</span>
            </div>`;
    }).join('');

    totalEl.innerText = `AED ${total.toFixed(2)}`;
});

const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Feedback: Disable button
        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = "Processing Order...";

        const orderData = {
            userEmail: localStorage.getItem('userEmail'),
            userName: localStorage.getItem('userName'),
            items: JSON.parse(localStorage.getItem('cart')),
            totalPrice: parseFloat(document.getElementById('orderTotal').innerText.replace('AED ', '')),
            address: document.getElementById('orderAddress').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            orderDate: new Date().toISOString(),
            status: 'Pending'
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                alert("Thank you! Your order has been placed successfully.");
                localStorage.removeItem('cart'); // Clear the cart
                window.location.href = 'orders.html'; 
            } else {
                const errorData = await response.json();
                alert("Order failed: " + (errorData.message || "Please try again."));
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Connection error. Ensure your server is running.");
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    });
}