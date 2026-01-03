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
    loadAdminProducts();
    displayRecentUsers();
});

// 2. Fetch and display recent users
async function displayRecentUsers() {
    const userList = document.getElementById('recentUsersList');
    
    try {
        const response = await fetch('/api/admin/recent-users');
        const users = await response.json();

        if (!users || users.length === 0) {
            userList.innerHTML = '<p class="text-muted text-center py-3">No recent users found.</p>';
            return;
        }

        userList.innerHTML = users.map(user => `
            <div class="d-flex align-items-center mb-3 p-3 bg-light rounded-3 border-start border-4 border-dark">
                <div class="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center me-3" style="width: 45px; height: 45px;">
                    <i class="fas fa-user-circle" style="color: #d4af37;"></i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold">${user.name}</h6>
                    <small class="text-muted">${user.email}</small>
                </div>
                <span class="badge rounded-pill bg-dark text-warning px-3">${user.role.toUpperCase()}</span>
            </div>
        `).join('');
    } catch (error) {
        userList.innerHTML = '<p class="text-danger text-center">Error connecting to Atlas.</p>';
    }
}

// 3. Fetch and display inventory
async function loadAdminProducts() {
    const list = document.getElementById('adminProductList');
    if(!list) return;

    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        list.innerHTML = products.map(book => {
            // Logic to handle local vs web images
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

// 4. Add new product to MongoDB
const addBookForm = document.getElementById('addBookForm');
if (addBookForm) {
    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = addBookForm.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.innerText = "Adding...";

        const newBook = {
            title: document.getElementById('title').value,
            price: parseFloat(document.getElementById('price').value),
            image: document.getElementById('image').value
        };

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBook)
            });

            if (response.ok) {
                alert("Inventory Updated Successfully!");
                addBookForm.reset();
                loadAdminProducts(); 
            } else {
                alert("Database Error: Could not save book.");
            }
        } catch (error) {
            alert("Network Error: Check server connection.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Add Product";
        }
    });
}

// 5. Delete product from MongoDB
async function deleteProduct(id) {
    if (confirm("Are you sure? This will permanently remove the item from the shop.")) {
        try {
            const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (response.ok) {
                loadAdminProducts(); 
            }
        } catch (error) {
            alert("Delete request failed.");
        }
    }
}