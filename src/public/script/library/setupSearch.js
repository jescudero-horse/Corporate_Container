/**
 * Function to add the implementation to the search input
 */
function setupSearch() {
    document.getElementById('search').addEventListener('keyup', function () {
        var value = this.value.toLowerCase();
        var rows = document.querySelectorAll('#dataTable tr');

        rows.forEach(function (row) {
            var cells = row.querySelectorAll('td'); 
            var found = false;

            cells.forEach(function (cell) {
                var text = cell.textContent.toLowerCase();
                if (text.includes(value)) {
                    found = true;
                }
            });

            if (found) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}