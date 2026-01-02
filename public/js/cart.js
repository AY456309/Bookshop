function displayCart() {
    const cartContainer = document.querySelector('.cart_items_container');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('grand-total');
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-basket fa-3x mb-3 text-muted" style="color: var(--gold) !important;"></i>
                <p class="fs-4">Your cart is empty.</p>
                <a href="shop.html" class="product_btn px-4 py-2 text-decoration-none">Go Shopping</a>
            </div>`;
        if(subtotalElement) subtotalElement.innerText = "AED 0.00";
        if(totalElement) totalElement.innerText = "AED 0.00";
        return;
    }

    let total = 0;
    cartContainer.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
          <div class="cart_card d-flex align-items-center p-3 mb-3 border rounded shadow-sm bg-white">
            <a href="javascript:void(0)" class="delete_btn me-3 text-danger" onclick="removeItem(${index})">
                <i class="fas fa-times"></i>
            </a>
            <img src="images/${item.image}" alt="${item.title}" class="cart_img" style="width: 70px; height: 90px; object-fit: cover; border-radius: 5px;">
            <div class="cart_info ms-3 flex-grow-1">
              <h5 class="mb-1 fw-bold">${item.title} <span class="badge bg-secondary ms-2">x${item.quantity}</span></h5>
              <p class="text-muted mb-0">Price: AED ${Number(item.price).toFixed(2)}</p>
            </div>
            <div class="cart_subtotal text-end">
              <span class="fw-bold text-dark">AED ${itemTotal.toFixed(2)}</span>
            </div>
          </div>
        `;
    }).join('');

    if(subtotalElement) subtotalElement.innerText = `AED ${total.toFixed(2)}`;
    if(totalElement) totalElement.innerText = `AED ${total.toFixed(2)}`;
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

displayCart();