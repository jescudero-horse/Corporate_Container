/**
 * Function to retrieve the data from the "blueprints" table
 */
async function fetchData() {
    try {
        //Call the end point to obtein the blueprints information from the data base
        const response = await fetch('/getBlueprints');
        if (!response.ok) {
            throw new Error('Error al obtener los datos');
        }

        //Store the information into a variable
        const data = await response.json();

        //Call the method to display the information on the dataTable
        renderTable(data)
    } catch (error) {
        console.error('Error: ', error);
    }
}

/**
 * Function to display the information on the dataTable
 * @param {*} data Variable that contains the information of the blueprints
 */
function renderTable(data) {
    //Store and initialize the dataTable
    const table = $('#dataTable').DataTable();

    //Clear the dataTable
    table.clear();

    //Iterate throw the data to store the information into an array
    data.forEach(item => {
        const rowData = [
            item.id,
            item.title,
            item.description,
            `
                <img src="${item.image}">
            `,
            item.pathSTL,
            item.userID
        ];
        //Add the row into the dataTable
        table.row.add(rowData);
    });

    //Draw the dataTable
    table.draw();
}

/**
 * Function to open the model in a new window
 * @param {string} pathSTL Variable that contains the path of the model
 */
function previewModel(pathSTL) {
    //Convert the path into a JSON
    const rowDataJson = encodeURIComponent(JSON.stringify(pathSTL));

    //Redirect to a new page sending the model path file
    url = `/library/previewModel?data=${rowDataJson}`;

    //Open the preview model in a new tab
    window.open(url, '_blank');
}

/**
 * Method to load all the method when the dataTable is rendering
 */
window.addEventListener('DOMContentLoaded', function () {
    fetchData();
});