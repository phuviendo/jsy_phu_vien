const API_URL = 'https://697580a2265838bbea977685.mockapi.io/books';
const productGrid = document.getElementById('product-grid');
const loadingElement = document.getElementById('loading');

let allFishes = [];
let isShowAll = false; // Mặc định chỉ hiện 2 hàng (8 con)

// 1. Fetch dữ liệu
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

// 2. Render sản phẩm (Gọn gàng hơn)
function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = '';

    // Logic lọc: lấy 8 con hoặc tất cả
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
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/300x200?text=No+Image'">
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
                    <button class="btn-buy" onclick="xemChiTiet('${item.id}')">Xem chi tiết</button>
                </div>
            </div>
        `;
        productGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// 3. Logic Lọc (Search & Price)
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

    // Khi lọc thì nên hiện hết kết quả phù hợp, không nên giới hạn 8 con
    renderFiltered(filtered);
}

function renderFiltered(data) {
    // Tạm thời gán data lọc vào và vẽ lại toàn bộ
    // (Đây là hàm phụ để tránh ảnh hưởng biến isShowAll của trang chủ)
    const originalAll = allFishes;
    allFishes = data;
    isShowAll = true; 
    renderProducts();
    allFishes = originalAll; // Trả lại dữ liệu gốc
}

function xemChiTiet(id) {
    window.location.href = `detail.html?id=${id}`;
}



// Khởi chạy
fetchFishData();