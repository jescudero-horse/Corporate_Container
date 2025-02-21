/**
 * Method to retrieve the data from the URL and display it into the inputs
 */
function fillData() {
    //Obtein de data of the row using the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const rowDataJson = urlParams.get('data');

    //Store the data from the URL params
    const rowData = JSON.parse(decodeURIComponent(rowDataJson));

    console.log("Row data: ", rowData);

    //Create a temporally div
    var tempElement = document.createElement('div');

    //Assign the owner email into the temporally element
    tempElement.innerHTML = rowData[3];

    //Store in a variable the value to obtein the owner
    var ownerValue = tempElement.textContent;

    /**Display all the elements into the inputs */
    document.getElementById('id').value = rowData[0];
    document.getElementById('flowName').value = rowData[1];
    document.getElementById('owner').value = ownerValue;
    document.getElementById('state').value = rowData[4];
    document.getElementById('description').value = rowData[5];
    document.getElementById('url').value = rowData[6];
    document.getElementById('factory').value = rowData[8];
}

/**
 * EventListener to configure the method from the page
 */
document.addEventListener('DOMContentLoaded', function () {
    fillData();
});