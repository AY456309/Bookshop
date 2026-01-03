console.log("Admin JS loaded!"); 

// 1. SECURITY & INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('userRole');
    
    // Redirect non-admins immediately
    if (role !== 'admin') {
        alert("Access Denied! Admins only.");
        window.location.href = '../index.html';
        return; 
    }

    // Load Dashboard Data
    loadAdminProducts();    // Points to /api/products (public list)
    displayRecentUsers();   // Points to /api/admin/recent-users
    loadAdminOrders();      // Points to /api/admin/orders
});

// 2. FETCH AND DISPLAY INVENTORY
async function loadAdminProducts() {
    const list = document.getElementById('adminProductList');
    if(!list) return;

    try {
        // This is the public route to get all products
        const response = await fetch('/api/products');
        const products = await response.json();

        if (products.length === 0) {
            list.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Inventory is empty.</td></tr>';
            return;
        }

        list.innerHTML = products.map(book => {
            const imgSrc = book.image.startsWith('http') ? book.image : `../images/${book.image}`;
            
            return `
            <tr class="align-middle">
                <td>
                    <img src="${imgSrc}" width="50" height="70" class="rounded shadow-sm" 
                         style="object-fit: cover;" onerror="this.src='../images/placeholder.jpg'">
                </td>
                <td class="fw-bold">${book.title}</td>
                <td class="text-success fw-bold">AED ${Number(book.price).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${book._id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
    } catch (error) {
        console.error("Load Products Error:", error);
        list.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load inventory.</td></tr>';
    }
}

// 3. ADD NEW PRODUCT
const addBookForm = document.getElementById('addBookForm');
if (addBookForm) {
    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = addBookForm.querySelector('button');
        const originalText = submitBtn.innerText;
        
        submitBtn.disabled = true;
        submitBtn.innerText = "Adding...";

        const newBook = {
            title: document.getElementById('title').value,
            price: parseFloat(document.getElementById('price').value),
            image: document.getElementById('image').value 
        };

        try {
            // UPDATED URL: Now pointing to the admin-specific route
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBook)
            });

            if (response.ok) {
                alert("Inventory Updated Successfully!");
                addBookForm.reset();
                loadAdminProducts(); 
            } else {
                const errorData = await response.json();
                alert("Database Error: " + (errorData.error || "Could not save book."));
            }
        } catch (error) {
            console.error("Add Product Error:", error);
            alert("Network Error: Check server connection.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    });
}

// 4. DELETE PRODUCT
async function deleteProduct(id) {
    if (confirm("Are you sure? This will permanently remove the item from the shop.")) {
        try {
            // UPDATED URL: Now pointing to the admin-specific route
            const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadAdminProducts(); 
            } else {
                alert("Failed to delete product.");
            }
        } catch (error) {
            alert("Delete request failed.");
        }
    }
}

// 5. FETCH AND DISPLAY RECENT USERS
async function displayRecentUsers() {
    const userList = document.getElementById('recentUsersList');
    if(!userList) return;
    
    try {
        const response = await fetch('/api/admin/recent-users');
        const users = await response.json();

        if (!users || users.length === 0) {
            userList.innerHTML = '<p class="text-muted text-center py-3">No recent users found.</p>';
            return;
        }

        userList.innerHTML = users.map(user => `
            <div class="d-flex align-items-center mb-3 p-3 bg-white rounded-3 border shadow-sm">
                <div class="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                    <i class="fas fa-user text-warning"></i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold">${user.name}</h6>
                    <small class="text-muted">${user.email}</small>
                </div>
                <span class="badge bg-light text-dark border">${user.role || 'user'}</span>
            </div>
        `).join('');
    } catch (error) {
        userList.innerHTML = '<p class="text-danger text-center">Error connecting to users database.</p>';
    }
}

// 6. FETCH AND DISPLAY ALL ORDERS
async function loadAdminOrders() {
    const orderList = document.getElementById('adminOrdersList');
    if (!orderList) return;

    try {
        const response = await fetch('/api/admin/orders'); 
        const orders = await response.json();

        if (!orders || orders.length === 0) {
            orderList.innerHTML = '<p class="text-muted text-center py-4">No orders placed yet.</p>';
            return;
        }

        orderList.innerHTML = orders.map(order => `
            <div class="mb-3 p-3 bg-white rounded border shadow-sm">
                <div class="d-flex justify-content-between">
                    <h6 class="fw-bold mb-1">${order.email}</h6>
                    <span class="badge bg-warning text-dark">${order.status}</span>
                </div>
                <small class="text-muted">Total: AED ${Number(order.totalPrice).toFixed(2)}</small><br>
                <small class="text-muted">Items: ${order.items.length}</small>
            </div>
        `).join('');
    } catch (error) {
        orderList.innerHTML = '<p class="text-danger text-center">Failed to load orders.</p>';
    }
}