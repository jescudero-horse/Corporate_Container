/**
 * Function to retrieve the data from the "app" table
 */
async function fetchData() {
    try {
        //Call the method to obteiin all the information
        const response = await fetch('/library/api/getApps');
        if (!response.ok) {
            throw new Error('Error al obtener los datos');
        }

        //Store the information 
        const data = await response.json();

        console.log(data);

        //Call the method to display the information into the dataTable
        renderTable(data);
        
    } catch (error) {
        console.error('Error:', error);

        //Call the method to display the modal
        displayInformationModal();

        //Store the instance of the add button
        const button = document.getElementById('button');

        //Hide the add button
        button.setAttribute('hidden', true);
    }
}

/**
 * Function to render the app table
 * @param {*} data Represent all the values from the "app" table
 */
function renderTable(data) {
    //Initializa the dataTable
    const table = $('#dataTable').DataTable();
    table.clear();

    //Iterate throw the data to display the information
    data.forEach(item => {
        const rowData = [
            item.id,
            item.ciNumber,
            item.shortName,
            item.KMLongname,
            item.KMShortName,
            item.longName,
            item.type,
            item.sia,
            item.installStatus,
            item.criticality,
            item.supportGroups,
            item.bussinesLine,
            item.groupLevelUsage,
            item.ownedBy,
            item.managedByOrgType,
            item.ledBy,
            item.developedBy,
            item.hostingProvider,
            item.executionPlatform,
            item.domainIRN,
            item.subDomain,
            item.cmdbDescription,
            item.created,
            item.createdBy,
            item.updated,
            item.updatedBy,
            item.userID
        ];
        //Add the row to the dataTable
        table.row.add(rowData);
    });

    //Draw the table
    table.draw();
}

/**
 * Method to load all the method when the dataTable is rendering
 */
window.addEventListener('DOMContentLoaded', function () {
    fetchData();
});