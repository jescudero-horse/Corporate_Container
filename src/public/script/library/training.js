/**
 * Method to obtein the information from the "training" table and rendering into the dataTable
 */
async function fetchData() {
    try {
        //Call the method to obtein all the information
        const response = await fetch('/getTraining');
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Store the information
        const data = await response.json();

        //Call the method to display the information to the dataTable
        renderTable(data);
    } catch (error) {
        console.error('Error, no se han podido obtener los datos --> ', error);

        //Call the method to display the modal
        displayInformationModal();

        //Store the instance of the add button
        const button = document.getElementById('button');

        //Hide the add button
        button.setAttribute('hidden', true);
    }
}

/**
 * Function to open the link in another tab of the browser
 * @param {String} url Variable that store the link of the source
 */
function openLink(url) {
    window.open(url, '_blank');
}

/**
 * Function to display the information into the dataTable
 * @param {*} data Variable that contain the information
 */
function renderTable(data) {
    const table = $('#dataTable').DataTable();
    table.clear();

    data.forEach(item => {
        const rowData = [
            item.id,
            item.title,
            item.description,
            item.category,
            `<button type="button" class="btn btn-primary" onclick="openLink('${item.url}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
                </svg>
                URL
            </button>
            `,
            item.userID
        ];

        table.row.add(rowData);
    });

    table.draw();
}

/**
 * Function to open the link in another tab of the browser
 * @param {String} url Variable that store the link of the source
 */
function openLink(url) {
    console.log("Dentro del metodo... URL --> ", url);
    window.open(url, '_blank');
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
});