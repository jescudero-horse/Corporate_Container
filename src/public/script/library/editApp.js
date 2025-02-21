/**
 * Function to complete the input data for the apps
 */
function fillData() {
    //Obtein de data of the row using the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const rowDataJson = urlParams.get('data');

    //Store the data from the URL params
    const rowData = JSON.parse(decodeURIComponent(rowDataJson));

    //Select all the input elements in the row and mb-3 class
    const inputElements = document.querySelectorAll('.row.mb-3 input');

    //Map and store into an array all the IDs
    const inputIDs = Array.from(inputElements).map(input => input.id);

    //Iterate throw the IDs array to display the infomation
    for (let i = 0; i < inputIDs.length; i ++) {
        document.getElementById(inputIDs[i]).value = rowData[i];
    }
}

/**
 * EventListener to configure the method from the page
 */
document.addEventListener('DOMContentLoaded', function () {
    fillData();
});