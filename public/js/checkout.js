document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const summary = document.getElementById('checkoutSummary');
    const totalEl = document.getElementById('orderTotal');
    
    // Fill in the user's name automatically
    document.getElementById('orderName').value = localStorage.getItem('userName');

    if (cart.length === 0) {
        window.location.href = 'shop.html';
        return;
    }

    let total = 0;
    summary.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `<p class="d-flex justify-content-between">
            <span>${item.title} (x${item.quantity})</span>
            <span>AED ${(item.price * item.quantity).toFixed(2)}</span>
        </p>`;
    }).join('');

    totalEl.innerText = `AED ${total.toFixed(2)}`;
});

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const orderData = {
        userEmail: localStorage.getItem('userEmail'),
        items: JSON.parse(localStorage.getItem('cart')),
        totalPrice: parseFloat(document.getElementById('orderTotal').innerText.replace('AED ', '')),
        address: document.getElementById('orderAddress').value,
        paymentMethod: document.getElementById('paymentMethod').value
    };

    const response = await fetch('/api/orders', {
        method: 'POST',
                headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });

    if (response.ok) {
        alert("Thank you! Your order has been placed.");
        localStorage.removeItem('cart'); // Clear the cart after success
        window.location.href = 'orders.html'; // Go to history page
    } else {
        alert("Something went wrong. Please try again.");
    }
});