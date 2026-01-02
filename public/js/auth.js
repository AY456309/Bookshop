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

                // FORCE UI UPDATE before redirecting
                updateNav(); 

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

// 2. REGISTER LOGIC
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPass').value
        };

        try {
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
                alert("Registration failed: " + (errorData.error || "Unknown error"));
            }
        } catch (error) {
            alert("Could not connect to server.");
        }
    });
}

// 3. THE GATEKEEPER
function checkAuthAndProceed() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'checkout.html';
    } else {
        alert("Please login to proceed to checkout!");
        window.location.href = 'login.html';
    }
}

// 4. UI UPDATE (The fix for the disappearing button)
function updateNav() {
    const userBtn = document.getElementById('user_btn');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    const navLinks = document.querySelector('.navbar_links');

    if (isLoggedIn === 'true' && userBtn) {
        const email = localStorage.getItem('userEmail');
        const shortName = email ? email.split('@')[0] : "User";

        // This replaces the "Sign In" link with a "Logout" button
        userBtn.innerHTML = `
            <i class="fas fa-sign-out-alt" style="color: #d4af37;"></i>
            <span class="ms-1" style="font-size: 0.9rem;">Logout (${shortName})</span>
        `;
        
        // Prevent the button from going to login.html
        userBtn.setAttribute('href', '#'); 
        userBtn.onclick = (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        };

        // ADMIN LINK logic
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

// Ensure the nav updates as soon as the script loads
document.addEventListener('DOMContentLoaded', updateNav);