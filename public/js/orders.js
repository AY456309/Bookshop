async function loadMyOrders() {
    const container = document.getElementById('orders-container');
    const userEmail = localStorage.getItem('userEmail'); // Matches auth.js
    const isLoggedIn = localStorage.getItem('isLoggedIn'); // Matches auth.js

    // 1. Security Check: Redirect or show message if not logged in
    if (isLoggedIn !== 'true' || !userEmail) {
        container.innerHTML = `
            <div class="alert alert-warning text-center shadow-sm">
                <i class="fas fa-lock me-2"></i> Please login to view your order history.
            </div>`;
        return;
    }

    try {
        // 2. Fetch data using the email stored during login
        const response = await fetch(`/api/orders/${userEmail}`);
        
        if (!response.ok) throw new Error('Could not fetch orders');

        const orders = await response.json();

        // 3. Handle empty results
        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 border rounded bg-light">
                    <i class="fas fa-shopping-bag fa-3x mb-3 text-muted"></i>
                    <p class="fs-5">You haven't placed any orders yet.</p>
                    <a href="shop.html" class="btn btn-warning px-4 py-2 mt-2 fw-bold">Shop Now</a>
                </div>`;
            return;
        }

        // 4. Render Orders into HTML
        container.innerHTML = orders.map(order => `
            <div class="order_card p-4 mb-4 shadow-sm bg-white rounded-4 border-start border-4 border-warning">
                <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                    <div>
                        <span class="text-muted small d-block">ORDER NUMBER</span>
                        <span class="fw-bold text-uppercase">#${order._id.slice(-6)}</span>
                    </div>
                    <span class="badge rounded-pill ${order.status === 'Completed' ? 'bg-success' : 'bg-primary'} p-2 px-3">
                        ${order.status || 'Processed'}
                    </span>
                </div>
                
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <p class="mb-1"><i class="far fa-calendar-alt me-2 text-warning"></i> <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                        <p class="mb-1 text-muted small">${order.items ? order.items.length : 0} items in this order</p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <p class="mb-0 text-muted small">Total Paid</p>
                        <h4 class="fw-bold mb-0" style="color: #2c3e50;">AED ${Number(order.totalPrice).toFixed(2)}</h4>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Order Load Error:", error);
        container.innerHTML = `
            <div class="alert alert-danger text-center shadow-sm">
                <i class="fas fa-exclamation-triangle me-2"></i> 
                <strong>Connection Error:</strong> We couldn't reach the database. Please check your internet or try again later.
            </div>`;
    }
}

// Start the process when the page loads
document.addEventListener('DOMContentLoaded', loadMyOrders);