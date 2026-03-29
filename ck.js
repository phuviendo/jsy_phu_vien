const API_URL = 'https://697580a2265838bbea977685.mockapi.io/books';
const productGrid = document.getElementById('product-grid');
const loadingElement = document.getElementById('loading');

let allFishes = [];
let isShowAll = false; 
let cart = JSON.parse(localStorage.getItem('vro_cart')) || [];

// 1. Khởi tạo khi trang tải xong
document.addEventListener("DOMContentLoaded", () => {
    fetchFishData();
    updateCartIcon(); 
    
    const cartBtn = document.getElementById('cart-btn');
    if(cartBtn) cartBtn.onclick = toggleCart;
});

// 2. Fetch dữ liệu từ API
async function fetchFishData() {
    try {
        const response = await fetch(API_URL);
        allFishes = await response.json();
        if (loadingElement) loadingElement.style.display = 'none';
        renderProducts(); 
    } catch (error) {
        if (loadingElement) loadingElement.innerHTML = "Lỗi tải dữ liệu!";
    }
}

// 3. Hiển thị sản phẩm
function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = '';

    const dataToRender = isShowAll ? allFishes : allFishes.slice(0, 8);

    if (dataToRender.length === 0) {
        productGrid.innerHTML = '<p>Không tìm thấy cá phù hợp.</p>';
        return;
    }

    dataToRender.forEach(item => {
        const price = Number(item.price) || 0;
        const displayPrice = price.toLocaleString('vi-VN') + 'đ';
        const discountPrice = (price * 0.8).toLocaleString('vi-VN') + 'đ';

        const cardHTML = `
            <div class="card">
                <div class="card-img-container">
                    <div class="sale-banner">GIẢM 20%</div>
                    ${price > 1000000 ? '<div class="vip-tag">HÀNG VIP</div>' : ''}
                    <img src="${item.image || item.avatar}" alt="${item.name}" onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                </div>
                <div class="card-body">
                    <div>
                        <h3>${item.name}</h3>
                        <p style="font-size: 13px; color: #666;">Size: ${item.size || 'N/A'} | ${item.fish_status || 'Khỏe'}</p>
                        <p>
                            <span class="price-old">${displayPrice}</span><br>
                            <span class="price-new">${discountPrice}</span>
                        </p>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-buy" onclick="xemChiTiet('${item.id}')" style="flex:1">Chi tiết</button>
                        <button class="btn-buy" onclick="addToCart('${item.id}')" style="flex:1; background:#27ae60">Thêm 🛒</button>
                    </div>
                </div>
            </div>
        `;
        productGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// 4. Logic Lọc (Search & Price)
function filterProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || "";
    const priceRange = document.getElementById('priceFilter')?.value || "all";

    const filtered = allFishes.filter(f => {
        const matchesName = f.name.toLowerCase().includes(searchTerm);
        let matchesPrice = true;
        const p = Number(f.price);

        if (priceRange === '100000') matchesPrice = p < 100000;
        else if (priceRange === '500000') matchesPrice = p >= 100000 && p <= 500000;
        else if (priceRange === 'vip') matchesPrice = p > 500000;

        return matchesName && matchesPrice;
    });

    renderFiltered(filtered);
}

function renderFiltered(data) {
    const originalAll = allFishes;
    allFishes = data;
    const originalShowAll = isShowAll;
    isShowAll = true; 
    renderProducts();
    allFishes = originalAll; 
    isShowAll = originalShowAll;
}

// 5. Điều hướng & Giỏ hàng
function xemChiTiet(id) {
    window.location.href = `detail.html?id=${id}`;
}

function addToCart(id) {
    const fish = allFishes.find(f => f.id === id);
    if (!fish) return;
    executeAdd(fish);
}

function addToCartFromDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const fishId = urlParams.get('id'); 
    if (!fishId) return;

    fetch(`${API_URL}/${fishId}`)
        .then(res => res.json())
        .then(fish => executeAdd(fish))
        .catch(() => alert("Lỗi kết nối!"));
}

function executeAdd(fish) {
    const existingItem = cart.find(item => item.id === fish.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: fish.id,
            name: fish.name,
            price: Number(fish.price) * 0.8, // Lưu giá đã giảm 20%
            image: fish.image || fish.avatar,
            quantity: 1
        });
    }
    saveCart();
    showToast(`Đã thêm ${fish.name} vào giỏ!`);
}

function saveCart() {
    localStorage.setItem('vro_cart', JSON.stringify(cart));
    updateCartIcon();
    if (document.getElementById('cart-modal')?.style.display === 'flex') {
        renderCartItems();
    }
}

function updateCartIcon() {
    const cartBtn = document.getElementById('cart-btn');
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBtn) cartBtn.innerText = `Giỏ hàng (${totalQty})`;
}

// 6. Giao diện Giỏ hàng (Modal)
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    modal.style.display = (modal.style.display === 'none' || modal.style.display === '') ? 'flex' : 'none';
    renderCartItems();
}

function renderCartItems() {
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total-price');
    if (!list) return;

    if (cart.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding:20px;'>Giỏ hàng trống!</p>";
        totalEl.innerText = "0đ";
        return;
    }

    let total = 0;
    list.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div style="display:flex; align-items:center; border-bottom:1px solid #eee; padding:10px 0;">
                <img src="${item.image}" style="width:50px; height:50px; border-radius:5px; object-fit:cover;">
                <div style="flex:1; padding-left:10px;">
                    <h4 style="margin:0; font-size:14px;">${item.name}</h4>
                    <p style="margin:0; color:#e67e22; font-size:13px;">${item.price.toLocaleString()}đ</p>
                </div>
                <div style="display:flex; align-items:center;">
                    <button onclick="changeQty(${index}, -1)" style="width:25px">-</button>
                    <span style="margin:0 10px;">${item.quantity}</span>
                    <button onclick="changeQty(${index}, 1)" style="width:25px">+</button>
                </div>
            </div>
        `;
    }).join('');
    totalEl.innerText = total.toLocaleString() + "đ";
}

function changeQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    saveCart();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.cssText = `position:fixed; bottom:20px; right:20px; background:#27ae60; color:white; padding:12px 20px; border-radius:8px; z-index:10002; box-shadow: 0 4px 12px rgba(0,0,0,0.1);`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}