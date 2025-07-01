// جایگزینی کامل اسکریپت جستجو با این کد
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    let currentSearchTerm = '';
    let currentPage = 1;
    let totalPages = 1;
    
    // تابع برای بارگیری داده‌ها
    async function loadData(page = 1, searchTerm = '') {
        try {
            // نمایش loader
            document.querySelector('.table-container').innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">در حال بارگیری...</span>
                    </div>
                    <p class="mt-3">در حال دریافت داده‌ها</p>
                </div>
            `;
            
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&page=${page}`);
            const data = await response.json();
            
            if (data.success) {
                // به‌روزرسانی متغیرهای حالت
                currentPage = data.current_page;
                totalPages = data.total_pages;
                currentSearchTerm = searchTerm;
                
                // رندر جدول جدید
                renderTable(data.hospitals);
            updatePagination(data.total_count, data.current_page, data.total_pages, data.hospitals); 
            } else {
                showError('خطا در دریافت داده‌ها');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            showError('خطا در ارتباط با سرور');
        }
    }
    
    // تابع برای رندر جدول
    function renderTable(hospitals) {
        let tableHTML = `
            <table class="hospital-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>نام بیمارستان</th>
                        <th>موقعیت</th>
                        <th>نوع</th>
                        <th>امتیاز کلی</th>
                        <th>مرگ‌ومیر</th>
                        <th>ایمنی</th>
                        <th>بازگشت بیمار</th>
                        <th>عملیات</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        hospitals.forEach(hospital => {
            tableHTML += `
                <tr>
                    <td>${hospital.global_index}</td>
                    <td>
                        <div class="hospital-name">${hospital.Facility_Name}</div>
                        <div class="hospital-city">
                            <i class="fas fa-map-marker-alt"></i>
                            ${hospital.Facility_City}, ${hospital.Facility_State}
                        </div>
                    </td>
                    <td>
                        <span class="hospital-type">${hospital.Facility_Type}</span>
                    </td>
                    <td>
                        <div class="rating-cell">
                            <span class="rating-badge rating-${getRatingClass(hospital.Rating_Overall)}">
                                ${hospital.Rating_Overall}
                            </span>
                            <i class="fas fa-star text-warning"></i>
                        </div>
                    </td>
                    <td>
                        <div class="rating-cell">
                            <span class="rating-badge rating-${getRatingClass(hospital.Rating_Mortality)}">
                                ${hospital.Rating_Mortality}
                            </span>
                        </div>
                    </td>
                    <td>
                        <div class="rating-cell">
                            <span class="rating-badge rating-${getRatingClass(hospital.Rating_Safety)}">
                                ${hospital.Rating_Safety}
                            </span>
                        </div>
                    </td>
                    <td>
                        <div class="rating-cell">
                            <span class="rating-badge rating-${getRatingClass(hospital.Rating_Readmission)}">
                                ${hospital.Rating_Readmission}
                            </span>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-outline-primary action-btn">
                            <i class="fas fa-chart-bar me-1"></i>جزئیات
                        </button>
                        <button class="btn btn-outline-success action-btn">
                            <i class="fas fa-file-medical me-1"></i>گزارش
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        document.querySelector('.table-container').innerHTML = tableHTML;
    }
    
    // تابع کمکی برای کلاس رتبه‌بندی
    function getRatingClass(rating) {
        const num = parseFloat(rating);
        if (isNaN(num)) return 'average';
        
        if (num >= 4) return 'excellent';
        if (num >= 3) return 'good';
        if (num >= 2) return 'average';
        return 'poor';
    }
    
    // تابع برای به‌روزرسانی صفحه‌بندی
function updatePagination(totalCount, currentPage, totalPages, hospitals) { // hospitals به پارامترهای تابع اضافه شد
        let paginationHTML = `
        <nav>
            <ul class="pagination justify-content-center">
    `;
        
        // دکمه قبلی
        if (currentPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${currentPage - 1}">
                        <i class="fas fa-arrow-right"></i> قبلی
                    </a>
                </li>
            `;
        } else {
            paginationHTML += `
                <li class="page-item disabled">
                    <a class="page-link" href="#" tabindex="-1" aria-disabled="true">
                        <i class="fas fa-arrow-right"></i> قبلی
                    </a>
                </li>
            `;
        }
        
        // صفحات
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="1">1</a>
                </li>
            `;
            if (startPage > 2) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                paginationHTML += `
                    <li class="page-item active" aria-current="page">
                        <a class="page-link" href="#">${i}</a>
                    </li>
                `;
            } else {
                paginationHTML += `
                    <li class="page-item">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            }
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
                </li>
            `;
        }
        
        // دکمه بعدی
        if (currentPage < totalPages) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${currentPage + 1}">
                        بعدی <i class="fas fa-arrow-left"></i>
                    </a>
                </li>
            `;
        } else {
            paginationHTML += `
                <li class="page-item disabled">
                    <a class="page-link" href="#" tabindex="-1" aria-disabled="true">
                        بعدی <i class="fas fa-arrow-left"></i>
                    </a>
                </li>
            `;
        }
        
        paginationHTML += `
            </ul>
        </nav>
    `;

    const startIndex = hospitals.length > 0 ? hospitals[0].global_index : 0;
    const endIndex = hospitals.length > 0 ? hospitals[hospitals.length - 1].global_index : 0;
    
    paginationHTML += `
        <div class="text-center mt-2 text-muted">
            نمایش ${startIndex} تا ${endIndex} از ${totalCount} بیمارستان
            - صفحه ${currentPage} از ${totalPages}
        </div>
    `;
        
    document.querySelector('.pagination-container').innerHTML = paginationHTML;
        
        // افزودن event listener به لینک‌های صفحه‌بندی
        document.querySelectorAll('.page-link[data-page]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                loadData(page, currentSearchTerm);
            });
        });
    }
    
    // تابع showError
    function showError(message) {
        document.querySelector('.table-container').innerHTML = `
            <div class="alert alert-danger text-center py-4">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h4>${message}</h4>
                <button class="btn btn-outline-primary mt-2" onclick="window.location.reload()">
                    تلاش مجدد
                </button>
            </div>
        `;
    }
    
    // مدیریت جستجو
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        currentPage = 1; // بازگشت به صفحه اول هنگام جستجوی جدید
        loadData(currentPage, searchTerm);
    }
    
    // event listeners
    if (searchInput && searchButton) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        searchButton.addEventListener('click', performSearch);
    }
    
    // بارگیری اولیه داده‌ها
    loadData(currentPage);
});