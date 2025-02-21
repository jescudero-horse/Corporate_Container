/**
 * Method to obtein the information from the "best_practise" table and rendering into the dataTable
 */
async function fetchData() {
    //Store the value of the hidden input (IPN)
    const ipn = document.getElementById('ipn').value;

    if (ipn === '' || typeof ipn == undefined) {
        
    }

    try {
        //Call the method to obtein the information
        const response = await fetch('/library/api/getAppliedBestPractise');
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Store the information
        const data = await response.json();

        //Call the method to send and render the information
        renderTable(data);
    } catch (error) {
        console.error('Error no se han podido obtener/gestionar los datos de las buenas prácticas', error);
    }
}

/**
 * Method to display all the information into the dataTable
 * @param {*} data Variable that contain the best practise information
 */
function renderTable(data) {
    //Initialize the dataTable
    const table = $('#dataTable').DataTable();
    table.clear();

    console.log("data: ", data);

    //Iterate throw the data and display it into the dataTable
    data.forEach(item => {
        console.log("ITEM --> ", item)
        //Create a row to store the data
        const rowData = [
            item.id_bestPractiseApplied,
            item.idBestPractise,
            item.title,
            item.factory_applied,
            item.status,
            item.reason,
            item.budgetForYear,
            item.estimatedDate,
            item.userID
        ];

        //Add the row data
        table.row.add(rowData);
    });

    //Draw the dataTable
    table.draw();

    //Filters by factories
    $('#factoryFilters input[type="checkbox"]').on('change', function () {
        const selected = $('#factoryFilters input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();

        table.column(3).search(selected.join('|'), true, false).draw();
    });

    //Configure the date range filter
    $.fn.dataTable.ext.search.push(
        //Create a function to configure the data range
        function (settings, data, dataIndex) {
            //Store the min date from the filter input
            var minDate = $('#minimumDate').val();

            //Store the max date from the filter input
            var maxDate = $('#maximumDate').val();

            //Store the actual date from the columns of the dataTable
            var date = data[5];

            //Control de min date
            if (minDate && new Date(date) < new Date(minDate)) {
                return false;
            }

            //Control the max date
            if (maxDate && new Date(date) > new Date(maxDate)) {
                return false;
            }

            return true;
        }
    )

    //Filter by date range
    $('#minimumDate, #maximumDate').on('change', function() {
        table.draw();
    });

    //Filter by status
    $('#statusFilter input[type="checkbox"]').on('change', function () {
        const selected = $('#statusFilter input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        
        table.column(4).search(selected.join('|'), true, false).draw();
    });

    //Filters by budget of the year
    $('#budgetFilter input[type="checkbox"]').on('change', function () {
        const selected = $('#budgetFilter input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        
        table.column(6).search(selected.join('|'), true, false).draw();
    });
}

/**
 * Function to clean the date range filter
 */
function deleteDateRange() {
    /** Clear the date inputs of the filters */
    document.getElementById('minimumDate').value = '';
    document.getElementById('maximumDate').value = '';

    //Clean de dataTable filter
    $('#dataTable').DataTable().column(5).search('').draw();
}

/**
 * Function to configure the methods when the dataTable is render
 */
window.addEventListener('DOMContentLoaded', function () {
    fetchData();
})