const API_URL = 'https://697580a2265838bbea977685.mockapi.io/books';

const tableBody = document.getElementById('tableBody');
const fishForm = document.getElementById('fishForm');
const btnAdd = document.getElementById('btnAdd');
const btnUpdate = document.getElementById('btnUpdate');

// Các ô nhập liệu
const fishIdInput = document.getElementById('fishId');
const fishNameInput = document.getElementById('fishName');
const fishImgInput = document.getElementById('fishImg');
const fishStatusInput = document.getElementById('fishStatus');
const fishSizeInput = document.getElementById('fishSize');
const fishEatInput = document.getElementById('fishEat');
const fishDayInput = document.getElementById('fishDay');
const fishPriceInput = document.getElementById('fishprice');

let allFishes = []; // Biến lưu trữ danh sách cá gốc

// 1. READ - Lấy danh sách cá
function fetchFishes() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            allFishes = data;
            renderTable(allFishes);
            updateStats(allFishes); // Cập nhật các con số thống kê
        })
        .catch(err => console.error("Lỗi lấy dữ liệu:", err));
}

// Hàm hiển thị bảng dữ liệu
function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // Cập nhật dòng text "Tìm thấy..." nếu có phần tử countFish
    const countFishElem = document.getElementById('countFish');
    if (countFishElem) {
        countFishElem.innerText = `Tìm thấy: ${data.length} con`;
    }

    data.forEach(f => {
        const tr = document.createElement('tr');
        const displayPrice = f.price ? Number(f.price).toLocaleString('vi-VN') + 'đ' : '0đ';

        tr.innerHTML = `
            <td><img src="${f.image}" class="table-img" alt="${f.name}" onerror="this.src='https://via.placeholder.com/50'"></td>
            <td><b>${f.name}</b></td>
            <td><span style="color: #0077b6; font-weight: bold;">${displayPrice}</span></td>
            <td>${f.size}cm</td>
            <td><span class="status-badge">${f.fish_status}</span></td>
            <td>
                <button class="btn-edit" onclick="editFish('${f.id}')">Sửa</button>
                <button class="btn-delete" onclick="deleteFish('${f.id}')">Xoá</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Hàm cập nhật thống kê (Sửa lỗi 'null' của bạn ở đây)
function updateStats(data) {
    const totalFishElem = document.getElementById('totalFish');
    const totalValueElem = document.getElementById('totalValue');

    if (totalFishElem) {
        totalFishElem.innerText = data.length;
    }

    if (totalValueElem) {
        const total = data.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        totalValueElem.innerText = total.toLocaleString('vi-VN') + 'đ';
    }
}

// 2. CREATE - Thêm mới cá
fishForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const newFish = {
        name: fishNameInput.value,
        image: fishImgInput.value,
        fish_status: fishStatusInput.value,
        size: fishSizeInput.value,
        thucan: fishEatInput.value,
        start_date: fishDayInput.value,
        price: Number(fishPriceInput.value)
    };

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFish)
    })
    .then(() => {
        alert("Đã thêm cá mới thành công!");
        fishForm.reset();
        fetchFishes();
    });
});

// 3. DELETE - Xóa cá
function deleteFish(id) {
    if (confirm("Bạn có chắc muốn xóa con cá này khỏi kho?")) {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(() => {
            alert("Đã xoá!");
            fetchFishes();
        });
    }
}

// 4. UPDATE - Sửa thông tin
function editFish(id) {
    fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(data => {
            fishIdInput.value = data.id;
            fishNameInput.value = data.name;
            fishImgInput.value = data.image;
            fishStatusInput.value = data.fish_status;
            fishSizeInput.value = data.size;
            fishEatInput.value = data.thucan;
            fishDayInput.value = data.start_date;
            fishPriceInput.value = data.price || 0;

            btnAdd.style.display = 'none';
            btnUpdate.style.display = 'inline-block';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
}

btnUpdate.addEventListener('click', function () {
    const id = fishIdInput.value;
    const updatedFish = {
        name: fishNameInput.value,
        image: fishImgInput.value,
        fish_status: fishStatusInput.value,
        size: fishSizeInput.value,
        thucan: fishEatInput.value,
        start_date: fishDayInput.value,
        price: Number(fishPriceInput.value)
    };

    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFish)
    })
    .then(() => {
        alert("Cập nhật thành công!");
        fishForm.reset();
        btnAdd.style.display = 'inline-block';
        btnUpdate.style.display = 'none';
        fetchFishes();
    });
});

// 5. LỌC THEO GIÁ
function filterByPrice() {
    const filterValue = document.getElementById('priceFilter').value;
    let filteredList = [];

    if (filterValue === 'all') {
        filteredList = allFishes;
    } else if (filterValue === '100000') {
        filteredList = allFishes.filter(f => Number(f.price) < 100000);
    } else if (filterValue === '500000') {
        filteredList = allFishes.filter(f => Number(f.price) >= 100000 && Number(f.price) <= 500000);
    } else if (filterValue === 'vip') {
        filteredList = allFishes.filter(f => Number(f.price) > 1000000);
    }

    renderTable(filteredList);
}

// Khởi chạy
fetchFishes();