// 1. LOGIN LOGIC
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const loginData = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPass').value
        };

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', result.user.email);
                localStorage.setItem('userName', result.user.name);
                localStorage.setItem('userRole', result.user.role);

                alert(`Welcome back, ${result.user.name}!`);
                window.location.href = 'index.html';
            } else {
                alert("Login Failed: " + result.message);
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Connection to server failed.");
        }
    });
}

// 2. REGISTER LOGIC (With Alphanumeric Check)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPass').value;

        const alphanumericPattern = /^[a-zA-Z0-9]+$/;
        
        if (!alphanumericPattern.test(password)) {
            alert("Error: Please use only letters and numbers in your password (no special characters).");
            return; 
        }

        const userData = { name, email, password };
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.innerText = "Registering...";

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                alert("Registration Successful! Now please login.");
                window.location.href = 'login.html';
            } else {
                const errorData = await response.json();
                alert("Registration failed: " + (errorData.error || "Email might already be taken"));
                submitBtn.disabled = false;
                submitBtn.innerText = "Register Now";
            }
        } catch (error) {
            alert("Could not connect to server. Check your MongoDB Atlas connection.");
            submitBtn.disabled = false;
            submitBtn.innerText = "Register Now";
        }
    });
}

// 3. UI UPDATE (Logout and Admin Link)
function updateNav() {
    const userBtn = document.getElementById('user_btn');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    const navLinks = document.querySelector('.navbar_links');

    if (isLoggedIn === 'true' && userBtn) {
        const email = localStorage.getItem('userEmail');
        const shortName = email ? email.split('@')[0] : "User";

        userBtn.innerHTML = `
            <i class="fas fa-sign-out-alt" style="color: #d4af37;"></i>
            <span class="ms-1" style="font-size: 0.9rem;">Logout (${shortName})</span>
        `;
        
        userBtn.setAttribute('href', '#'); 
        userBtn.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        };

        if (userRole === 'admin' && navLinks) {
            if (!document.getElementById('admin_link')) {
                const adminLink = document.createElement('a');
                adminLink.id = 'admin_link';
                adminLink.href = 'admin/dashboard.html';
                adminLink.innerHTML = 'Admin Panel';
                adminLink.style.color = '#d4af37';
                adminLink.style.fontWeight = 'bold';
                navLinks.appendChild(adminLink);
            }
        }
    }
}

// 4. SHOP DISPLAY LOGIC
async function displayBooks() {
    const container = document.querySelector('.pro_box_cont');
    if (!container) return;

    try {
        const response = await fetch('/api/products');
        const books = await response.json();

        container.innerHTML = books.map(book => {
            // Check if image is a link or local file
            const imgSrc = book.image.startsWith('http') ? book.image : `images/${book.image}`;
            
            return `
            <div class="pro_box shadow-sm p-3 rounded">
                <p class="badge bg-dark text-warning">AED ${Number(book.price).toFixed(2)}</p>
                <img src="${imgSrc}" alt="${book.title}" class="img-fluid mb-3 rounded" style="height: 250px; object-fit: cover;">
                <h3 class="fs-5">${book.title}</h3>
                <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
                    <label class="small">Qty:</label>
                    <input type="number" id="qty-${book._id}" min="1" value="1" class="form-control form-control-sm w-25 text-center">
                </div>
                <button class="product_btn w-100" onclick="addToCart('${book._id}', '${book.title}', ${book.price}, '${book.image}')">
                    <i class="fas fa-cart-plus me-2"></i>Add to Cart
                </button>
            </div>
        `}).join('');

    } catch (error) {
        container.innerHTML = '<p class="text-danger">Failed to load books. Please check server connection.</p>';
    }
}

// 5. ADD TO CART LOGIC
function addToCart(id, title, price, image) {
    const qtyInput = document.getElementById(`qty-${id}`);
    const quantity = parseInt(qtyInput.value) || 1;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.title === title);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ title, price, image, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${quantity} copies of "${title}" added to cart!`);
}

// INITIALIZE EVERYTHING
document.addEventListener('DOMContentLoaded', () => {
    updateNav();
    displayBooks();
});