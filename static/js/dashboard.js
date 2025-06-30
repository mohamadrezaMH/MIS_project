// جستجوی بیمارستان‌ها
        document.getElementById('searchInput').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.hospital-table tbody tr');
            
            rows.forEach(row => {
                const hospitalName = row.querySelector('.hospital-name').textContent.toLowerCase();
                if (hospitalName.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });