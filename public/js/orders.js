async function loadMyOrders() {
    const container = document.getElementById('orders-container');
    const userEmail = localStorage.getItem('userEmail');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn !== 'true') {
        container.innerHTML = `<p class="alert alert-warning">Please login to view your orders.</p>`;
        return;
    }

    try {
        // Fetch orders for the logged-in user
        const response = await fetch(`/api/orders/${userEmail}`);
        const orders = await response.json();

        if (orders.length === 0) {
            container.innerHTML = `<p class="text-center fs-5">You haven't placed any orders yet.</p>`;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order_card p-4 mb-4 shadow-sm bg-white rounded">
                <div class="order_header d-flex justify-content-between border-bottom pb-3 mb-3">
                    <span class="fw-bold text-uppercase">Order ID: #${order._id.slice(-5)}</span>
                    <span class="badge rounded-pill bg-success text-white">${order.status || 'Pending'}</span>
                </div>
                
                <div class="order_details">
                    <p><strong>Placed on :</strong> <span>${new Date(order.createdAt).toLocaleDateString()}</span></p>
                    <p><strong>Address :</strong> <span>${order.address}</span></p>
                    <p><strong>Payment :</strong> <span>${order.paymentMethod}</span></p>
                    <p class="order_items mt-3">
                        <strong>Your Items :</strong> <br> 
                        <span>${order.items.map(item => `${item.title} (${item.quantity})`).join(', ')}</span>
                    </p>
                </div>

                <div class="order_footer border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
                    <span class="text-muted">Total Price</span>
                    <span class="fs-5 fw-bold text-dark">AED ${order.totalPrice.toFixed(2)}</span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error loading orders:", error);
        container.innerHTML = `<p class="text-danger">Failed to load orders.</p>`;
    }
}

loadMyOrders();