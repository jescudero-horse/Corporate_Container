/**
 * Method to obtein the information from the "powerApps" table and rendering into the dataTable
 */
async function fetchData() {
    try {
        //Call the method to obtein all the information
        const response = await fetch('/library/api/getPowerApps');
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Store the information
        const data = await response.json();

        //Call the method to display the information to the dataTable
        renderTable(data);
    } catch (error) {
        console.error('Error, no se han podido obtener los datos');

        //Call the method to display the modal
        displayInformationModal();

        //Obtenemos la instancia deñ boton de añadir
        const button = document.getElementById('button');

        //Ocultamos el boton de añadir
        button.setAttribute('hidden', true);
    }
}

/**
 * Method to display all the information into the dataTable
 * @param {*} data Variable that contain the data source information
 */
function renderTable(data) {
    //Initialize the dataTable
    const table = $('#dataTable').DataTable();
    table.clear();

    //Iterate throw the data and display it into the dataTable
    data.forEach(item => {
        const rowData = [
            item.id,
            item.title,
            item.owner,
            item.type,
            item.description,
            item.created,
            `<button type="button" class="btn btn-primary url-to-project" onclick="openLink('${item.urlToProject}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
                </svg>
                URL to project
            </button>
            `,
            `<button type="button" class="btn btn-primary url-sharepoint" onclick="openLink('${item.sharePoint}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
                </svg>
                URL SharePoint
            </button>
            `,
            item.powerAutomate,
            item.powerAutomateName,
            item.userID,
            item.factories
        ];
        table.row.add(rowData);
    });

    table.draw();

    //Filters by type
    $('#typeFilters input[type="checkbox"]').on('change', function () {
        console.log("Dentro del filtrado de los TIPO")
        const selected = $('#typeFilters input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        console.log("Tipo seleccionado: ", selected)
        table.column(3).search(selected.join('|'), true, false).draw();
    });

    //Filters by factories
    $('#factoryFilters input[type="checkbox"]').on('change', function () {
        console.log("Dentro del filtrado de las FACTORIAS");
        const selected = $('#factoryFilters input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();

        console.log("Seleccionado: ", selected)
        table.column(11).search(selected.join('|'), true, false).draw();
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

    //Filters by creation date
    $('#minimumDate, #maximumDate').on('change', function () {
        table.draw();
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
 * Function to open the link in another tab of the browser
 * @param {String} url Variable that store the link of the source
 */
function openLink(url) {
    window.open(url, '_blank');
}

/**
 * Function to configure and display the toast
 */
function showToast() {
    //Identify the toast
    const toast = document.getElementById('liveToast');

    //Set the message using JQuery
    $('#liveToast .toast-body').text('If you want to view the associated sites or the factories of the Power App, you must click on the row to display the window that contains the full information');

    //Configure the toast
    const toastBootstrap = new bootstrap.Toast(toast, {
        autohide: false
    });

    //Show the toast
    toastBootstrap.show();
}

/**
 * Function to clear the filters
 */
function clearFilters() {
    window.location.reload();
}

/**
 * Method to load all the method when the dataTable is rendering
 */
window.addEventListener('DOMContentLoaded', function () {
    fetchData();
    showToast();

    //Apply the funcionality for the lottie container
    document.getElementById('lottie-container').addEventListener('click', function () {
        //Set the speed for the animator
        animation.setSpeed(2);

        //Play the animation
        animation.play();

        //Wait for the animation and call the method
        animation.addEventListener('complete', function () {
            onAnimationComplete(tourSteps);
        });
    });
});