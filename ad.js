const API_URL = "https://697580a2265838bbea977685.mockapi.io/books";

// Chọn các phần tử DOM
const fishForm = document.getElementById('fishForm');
const btnAdd = document.getElementById('btnAdd');
const btnUpdate = document.getElementById('btnUpdate');
const fishIdInput = document.getElementById('fishId');

document.addEventListener("DOMContentLoaded", () => {
    loadStats();      // Chỉ tải số liệu thống kê
    setupForm();      // Xử lý thêm/sửa
    checkEditMode();  // Kiểm tra nếu đang bấm sửa từ trang danh sách
});

// Hàm lấy dữ liệu và hiển thị thống kê
async function loadStats() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const totalFish = data.length;
        const totalValue = data.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const avgPrice = totalFish > 0 ? totalValue / totalFish : 0;

        // Hiển thị ra màn hình
        if (document.getElementById('totalFish')) 
            document.getElementById('totalFish').innerText = totalFish;
        if (document.getElementById('totalValue')) 
            document.getElementById('totalValue').innerText = totalValue.toLocaleString() + 'đ';
        if (document.getElementById('avgPrice')) 
            document.getElementById('avgPrice').innerText = Math.round(avgPrice).toLocaleString() + 'đ';
    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
    }
}

// Hàm xử lý Thêm và Cập nhật
function setupForm() {
    if (!fishForm) return;

    // Xử lý Cập nhật (Sửa lỗi null dòng 134)
    if (btnUpdate) {
        btnUpdate.onclick = async () => {
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
                    alert("Cập nhật thành công!");
                    window.location.href = 'ad.html';
                }
            } catch (err) {
                alert("Lỗi khi cập nhật!");
            }
        };
    }

    // Xử lý Thêm mới
    fishForm.onsubmit = async (e) => {
        if (btnUpdate && btnUpdate.style.display === 'inline-block') return;
        e.preventDefault();

        const newFish = {
            name: document.getElementById('fishName').value,
            image: document.getElementById('fishImg').value,
            price: document.getElementById('fishPrice').value,
            size: document.getElementById('fishSize').value,
            fish_status: document.getElementById('fishStatus').value
        };

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFish)
        });

        if (res.ok) {
            alert("Thêm mới thành công!");
            fishForm.reset();
            loadStats();
        }
    };
}

// Kiểm tra URL xem có đang sửa cá không
async function checkEditMode() {
    const editId = new URLSearchParams(window.location.search).get('editId');
    if (editId && fishForm) {
        const res = await fetch(`${API_URL}/${editId}`);
        const fish = await res.json();

        document.getElementById('fishName').value = fish.name;
        document.getElementById('fishImg').value = fish.image || fish.avatar;
        document.getElementById('fishPrice').value = fish.price;
        document.getElementById('fishStatus').value = fish.fish_status;
        document.getElementById('fishSize').value = fish.size;
        fishIdInput.value = fish.id;

        if (btnAdd) btnAdd.style.display = 'none';
        if (btnUpdate) btnUpdate.style.display = 'inline-block';
        document.getElementById('formTitle').innerText = "💾 Sửa thông tin cá";
    }
}