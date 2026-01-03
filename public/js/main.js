async function displayBooks() {
    const container = document.querySelector('.pro_box_cont');
    if (!container) return;

    try {
        const response = await fetch('/api/products');
        const books = await response.json();

        container.innerHTML = books.map(book => `
            <div class="pro_box">
                <p class="badge">AED ${book.price}</p>
                <img src="images/${book.image}" alt="${book.title}">
                <h3>${book.title}</h3>
                <input type="number" id="qty-${book._id}" min="1" value="1" class="cart_qty_input">
                <button class="product_btn" onclick="addToCart('${book._id}', '${book.title}', ${book.price}, '${book.image}')">
                    Add to Cart
                </button>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error loading books:", error);
    }
}

function addToCart(id, title, price, image) {
    // 1. Get the specific quantity from the input field
    const qtyInput = document.getElementById(`qty-${id}`);
    const quantity = parseInt(qtyInput.value) || 1;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // 2. Check if the book is already in the cart
    const existingItem = cart.find(item => item.title === title);

    if (existingItem) {
        // Update quantity if it exists
        existingItem.quantity += quantity;
    } else {
        // Add new item if it doesn't
        const product = { 
            title: title, 
            price: price, 
            image: image, 
            quantity: quantity 
        };
        cart.push(product);
    }
    
    // 3. Save to LocalStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    alert(`${quantity} copy/copies of "${title}" added to cart!`);
}

// Function to handle Google Login
function loginWithGoogle() {
    // This sends the user to your backend auth route on Vercel
    window.location.href = '/api/auth/google';
}

displayBooks();