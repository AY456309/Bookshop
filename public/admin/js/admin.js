// 1. SECURITY & INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('userRole');
    
    if (role !== 'admin') {
        alert("Access Denied! Admins only.");
        window.location.href = '../index.html';
        return; // Stop execution
    }

    // If they are admin, load the data
    loadAdminProducts();
    displayRecentUsers();
});

// 2. Fetch and display recent users (Last 3)
async function displayRecentUsers() {
    const userList = document.getElementById('recentUsersList');
    
    try {
        const response = await fetch('/api/admin/recent-users');
        const users = await response.json();

        if (users.length === 0) {
            userList.innerHTML = '<p class="text-muted text-center py-3">No users found.</p>';
            return;
        }

        userList.innerHTML = users.map(user => `
            <div class="d-flex align-items-center mb-3 p-2 border-bottom">
                <div class="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px;">
                    <i class="fas fa-user-shield" style="color: #d4af37;"></i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold">${user.name}</h6>
                    <small class="text-muted">${user.email}</small>
                </div>
                <span class="badge bg-secondary">${user.role}</span>
            </div>
        `).join('');
    } catch (error) {
        userList.innerHTML = '<p class="text-danger">Error loading users.</p>';
    }
}

// 3. Fetch and display products
async function loadAdminProducts() {
    const list = document.getElementById('adminProductList');
    if(!list) return;

    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        list.innerHTML = products.map(book => `
            <tr class="align-middle">
                <td><img src="../images/${book.image}" width="50" class="rounded shadow-sm" alt="cover"></td>
                <td class="fw-bold">${book.title}</td>
                <td>AED ${Number(book.price).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${book._id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Load Products Error:", error);
    }
}

// 4. Add new product
const addBookForm = document.getElementById('addBookForm');
if (addBookForm) {
    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newBook = {
            title: document.getElementById('title').value,
            price: parseFloat(document.getElementById('price').value),
            image: document.getElementById('image').value
        };

        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBook)
        });

        if (response.ok) {
            alert("Book added successfully!");
            addBookForm.reset(); // Clear form
            loadAdminProducts(); // Refresh list without page reload
        } else {
            alert("Error adding book.");
        }
    });
}

// 5. Delete product
async function deleteProduct(id) {
    if (confirm("Permanently delete this book from inventory?")) {
        try {
            const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadAdminProducts(); // Refresh list
            }
        } catch (error) {
            alert("Delete failed.");
        }
    }
}