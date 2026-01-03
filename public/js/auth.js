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

// 2. REGISTER LOGIC (With Alphanumeric Check)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPass').value;

        // /^[a-zA-Z0-9]+$/ means "Only allow a-z, A-Z, and 0-9"
        const alphanumericPattern = /^[a-zA-Z0-9]+$/;
        
        if (!alphanumericPattern.test(password)) {
            alert("Error: Please use only letters and numbers in your password (no special characters like $, @, #).");
            return; // Stops the function here so it doesn't send data to the server
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
                alert("Registration failed: " + (errorData.error || "Unknown error"));
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

document.addEventListener('DOMContentLoaded', updateNav);