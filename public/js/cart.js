function displayCart() {
    const cartContainer = document.querySelector('.cart_items_container');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('grand-total');
    const clearBtn = document.getElementById('clearCartBtn');
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        if(clearBtn) clearBtn.style.display = 'none';
        cartContainer.innerHTML = `
            <div class="text-center py-5 shadow-sm rounded-4 bg-white">
                <i class="fas fa-shopping-basket fa-3x mb-3 text-muted"></i>
                <p class="fs-4 text-muted">Your cart is empty.</p>
                <a href="shop.html" class="product_btn px-4 py-2 text-decoration-none">Go Shopping</a>
            </div>`;
        if(subtotalElement) subtotalElement.innerText = "AED 0.00";
        if(totalElement) totalElement.innerText = "AED 0.00";
        return;
    }

    if(clearBtn) clearBtn.style.display = 'block';

    let total = 0;
    cartContainer.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
          <div class="cart_card d-flex align-items-center p-3 mb-3 border-0 shadow-sm bg-white rounded-3">
            <a href="javascript:void(0)" class="delete_btn me-3 text-danger" onclick="removeItem(${index})">
                <i class="fas fa-times-circle fs-5"></i>
            </a>
            <img src="images/${item.image}" alt="${item.title}" class="cart_img" style="width: 60px; height: 80px; object-fit: cover; border-radius: 5px;">
            <div class="cart_info ms-3 flex-grow-1">
              <h6 class="mb-0 fw-bold">${item.title}</h6>
              <small class="text-muted">AED ${Number(item.price).toFixed(2)} x ${item.quantity}</small>
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

function clearCart() {
    if(confirm("Are you sure you want to clear your entire cart?")) {
        localStorage.removeItem('cart');
        displayCart();
    }
}

document.addEventListener('DOMContentLoaded', displayCart);