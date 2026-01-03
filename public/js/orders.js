async function loadMyOrders() {
    const container = document.getElementById('orders-container');
    const userEmail = localStorage.getItem('userEmail');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // 1. Safety Check: If not logged in, don't even try to fetch
    if (isLoggedIn !== 'true' || !userEmail) {
        container.innerHTML = `
            <div class="alert alert-warning text-center">
                <i class="fas fa-lock me-2"></i>
                Please login to view your order history.
            </div>`;
        return;
    }

    try {
        // 2. Fetch from your API (Ensure this matches your backend route)
        // Using /api/orders/${userEmail} assumes your backend is set up for URL params
        const response = await fetch(`/api/orders/${userEmail}`);
        
        if (!response.ok) {
            throw new Error('Could not retrieve orders from server');
        }

        const orders = await response.json();

        // 3. Handle empty Atlas collection
        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                    <p class="fs-5 text-muted">No orders found in your history.</p>
                    <a href="shop.html" class="product_btn mt-2 text-decoration-none">Explore Books</a>
                </div>`;
            return;
        }

        // 4. Sort by date (Newest first)
        orders.sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate));

        // 5. Render to HTML
        container.innerHTML = orders.map(order => `
            <div class="order_card p-4 mb-4 shadow-sm bg-white rounded-4 border-start border-4 border-warning">
                <div class="order_header d-flex justify-content-between border-bottom pb-3 mb-3">
                    <span class="fw-bold text-dark">ORDER ID: <span class="text-muted">#${order._id.slice(-6).toUpperCase()}</span></span>
                    <span class="badge rounded-pill ${order.status === 'Completed' ? 'bg-success' : 'bg-primary'}">
                        ${order.status || 'Pending'}
                    </span>
                </div>
                
                <div class="order_content row">
                    <div class="col-md-6">
                        <p class="mb-1"><strong>Placed On:</strong> ${new Date(order.createdAt || order.orderDate).toLocaleDateString()}</p>
                        <p class="mb-1"><strong>Payment:</strong> ${order.paymentMethod}</p>
                        <p class="mb-1 text-truncate"><strong>Address:</strong> ${order.address}</p>
                    </div>
                    <div class="col-md-6 border-start ps-4">
                        <p class="fw-bold mb-1">Items Summary:</p>
                        <div class="small">
                            ${order.items.map(item => `
                                <div class="d-flex justify-content-between">
                                    <span>${item.title} (x${item.quantity})</span>
                                    <span>AED ${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="order_footer border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
                    <span class="text-muted small">Final Amount (Incl. VAT)</span>
                    <span class="fs-4 fw-bold text-dark">AED ${Number(order.totalPrice).toFixed(2)}</span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Atlas Connection Error:", error);
        container.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-circle me-2"></i> 
                Server Error: Could not connect to the orders database.
            </div>`;
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', loadMyOrders);