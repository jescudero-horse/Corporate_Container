/**
 * Asyn function to call the endpoint to retrieve the information
 */
async function fetchData() {
    try {
        //Store the response of the end point
        const response = await fetch('/library/api/getFilm');

        //Control the response
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Store the information into a variable
        const data = await response.json();

        //Call the method to display the dataTable with the information
        renderTable(data);

    } catch (error) {
        console.error('Error no se han podido obtener los datos para el film', error);
    }
}

/**
 * Method to fill out the dataTable with the information
 * @param {*} data Argument that contain the information
 */
function renderTable(data) {
    //Store and instance the dataTable
    const table = $('#dataTable').DataTable();
    table.clear();

    //Iterate throw the data
    data.forEach(item => {
        //Create an array to store the information
        const rowData = [
            item.linea,
            item.numero_of,
            item.fecha_of_acabado,
            item.referencia,
            item.reference_composant,
            item.coefficient_montage_BE,
            item.nb_pieces_par_um
        ];

        //Add the array with the information into the dataTable rows
        table.row.add(rowData);
    });

    //Draw the dataTable with the information
    table.draw();
} 8

/**
 * Function to close the components modal, the main modal and display the steps modals
 */
function shortTimeModalClose() {
    //Close the componets modal
    $('#componetsModal').modal('hide');

    //Close the main modal
    $('#modal').modal('hide');

    //Call the method to display the steps modal
    selectorEtapas();
}

/**
 * Function to configure the steps modals
 */
function updateOperaciones() {
    //Create variable to instance the dropdowns
    const categoriaSelect = document.getElementById('categoria'), operacionSelect = document.getElementById('operacion');

    //Store the selected category
    const selectedCategoria = categoriaSelect.value;

    //Add the operatiosn into the category
    if (operaciones[selectedCategoria]) {
        operaciones[selectedCategoria].forEach(operacion => {
            const option = document.createElement('option');
            option.value = operacion.value;
            option.textContent = operacion.text;
            operacionSelect.appendChild(option);
        });
    }
}

/**
 * Function to open the blueprint in a new tab
 */
function viewBlueprint() {
    //Open the blueprint in a new tab
    window.open('/library/pruebaPlano', '_blank');
}

/**
 * Function to go back
 */
function volver() {
    //Hide the phase modal
    $('#modalInformation').modal('hide');

    //Display the main modal
    $('#modal').modal('show');
}

/**
 * Event listener to call the method to obtein the information and display it into the dataTable when the page is loaded
 */
window.addEventListener('DOMContentLoaded', function () {
    fetchData();
});