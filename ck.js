// 1. Cấu hình API và chọn các phần tử
const API_URL = "https://697580a2265838bbea977685.mockapi.io/books";

// Chọn các phần tử (Dùng để kiểm tra tránh lỗi null)
const fishForm = document.getElementById('fishForm');
const btnAdd = document.getElementById('btnAdd');
const btnUpdate = document.getElementById('btnUpdate');
const fishIdInput = document.getElementById('fishId');

// 2. Tự động chạy khi trang web tải xong
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
    setupFormHandler();
    checkEditMode(); // Kiểm tra xem có đang sửa cá không
});

// 3. Hàm lấy dữ liệu và đổ vào Dashboard (Biểu đồ + Thống kê)
async function loadDashboardData() {
    const totalFishEl = document.getElementById('totalFish');
    const totalValueEl = document.getElementById('totalValue');
    const chartCanvas = document.getElementById('fishChart');

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        // Cập nhật thống kê nếu tồn tại phần tử trên trang
        if (totalFishEl) totalFishEl.innerText = data.length;
        if (totalValueEl) {
            const totalValue = data.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
            totalValueEl.innerText = totalValue.toLocaleString() + 'đ';
        }

        // Vẽ biểu đồ nếu có canvas
        if (chartCanvas) {
            const topFish = [...data].sort((a, b) => b.price - a.price).slice(0, 6);
            renderChart(topFish, chartCanvas);
        }
    } catch (error) {
        console.error("Lỗi Dashboard:", error);
    }
}

// 4. Hàm vẽ biểu đồ
function renderChart(fishData, canvas) {
    const ctx = canvas.getContext('2d');
    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: fishData.map(f => f.name),
            datasets: [{
                label: 'Giá trị (VNĐ)',
                data: fishData.map(f => f.price),
                backgroundColor: 'rgba(0, 119, 182, 0.7)',
                borderRadius: 8
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 5. Hàm xử lý logic Thêm/Sửa
function setupFormHandler() {
    if (!fishForm) return; // Nếu trang không có form thì thoát luôn, không chạy tiếp để tránh lỗi null

    // SỬA LỖI DÒNG 134: Kiểm tra btnUpdate trước khi addEventListener
    if (btnUpdate) {
        btnUpdate.addEventListener('click', async function() {
            const id = fishIdInput.value;
            const updatedFish = {
                name: document.getElementById('fishName').value,
                image: document.getElementById('fishImg').value,
                price: document.getElementById('fishPrice').value,
                fish_status: document.getElementById('fishStatus').value,
                size: document.getElementById('fishSize').value
            };

            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedFish)
                });
                if (res.ok) {
                    alert("✅ Cập nhật thành công!");
                    window.location.href = 'ad.html';
                }
            } catch (err) { alert("❌ Lỗi cập nhật!"); }
        });
    }

    // Logic cho nút Thêm mới
    fishForm.addEventListener('submit', async (e) => {
        if (btnUpdate && btnUpdate.style.display === 'inline-block') return; // Đang ở chế độ sửa thì ko chạy thêm mới
        e.preventDefault();
        // ... Code fetch POST thêm mới của vro giữ nguyên ...
    });
}

// 6. Kiểm tra chế độ Sửa từ URL (?editId=...)
async function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('editId');

    if (editId && fishForm) {
        const res = await fetch(`${API_URL}/${editId}`);
        const fish = await res.json();

        // Điền dữ liệu vào form
        document.getElementById('fishName').value = fish.name;
        document.getElementById('fishImg').value = fish.image || fish.avatar;
        document.getElementById('fishPrice').value = fish.price;
        document.getElementById('fishStatus').value = fish.fish_status;
        document.getElementById('fishSize').value = fish.size;
        if (fishIdInput) fishIdInput.value = fish.id;

        // Hiện nút Lưu, ẩn nút Thêm
        if (btnAdd) btnAdd.style.display = 'none';
        if (btnUpdate) btnUpdate.style.display = 'inline-block';
    }
}