// جستجوی بیمارستان‌ها
// جایگزین کردن اسکریپت جستجو با این کد
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const rows = document.querySelectorAll('.hospital-table tbody tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            const hospitalName = row.querySelector('.hospital-name').textContent.toLowerCase();
            if (hospitalName.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        // به‌روزرسانی اطلاعات صفحه‌بندی
        document.getElementById('visible-counter').textContent = visibleCount;
        document.getElementById('total-counter').textContent = rows.length;
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    // اجرای اولیه برای نمایش تعداد
    setTimeout(performSearch, 100);
});