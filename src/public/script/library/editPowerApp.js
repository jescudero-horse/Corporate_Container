/**
 * Method to retrieve the data from the associated sites table and the factories using the ID of the actual PowerApp
 * @param {*} rowData Variable that represent the information of the actual PowerApp
 */
async function fetchData(rowData) {
    /**ASOCCIATED SITES */
    try {
        const response = await fetch(`/library/api/getAssociatedSites/${rowData[0]}`);
        if (!response.ok) {
            throw new Error('Error fetching data');
        }
        const data = await response.json();

        //Call the methd to display the associated sites
        fillUrlSites(data);
    } catch (error) {
        console.error('Error:', error);
    }

    /**FACTORIES */
    try {
        const response = await fetch(`/library/api/getFactories/${rowData[0]}`);
        if (!response.ok) {
            throw new Error('Error feching data');
        }
        const data = await response.json();

        //Call the method to mark the checkbox
        fillFactories(data);
    } catch (error) {
        console.error('Error: ', error);
    }

    /**POWER AUTOMATE */
    try {
        const response = await fetch(`/library/api/getPowerAutomate_PowerApp/${rowData[0]}`);
        if (!response.ok) {
            throw new Error('Error fetching data');
        }
        const data = await response.json();

        //Call the method to assign the information into the powerAutomateArray
        fillPowerAutomateArray(data)
    } catch (error) {
        console.error('Error: ', error);
    }
}

/**
 * Method to complete the edit data analyse form
 */
function fillData() {
    //Obtein de data of the row using the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const rowDataJson = urlParams.get('data');

    //Store the data from the URL params
    const rowData = JSON.parse(decodeURIComponent(rowDataJson));

    //Call the method to obtein the functions/subfunctions using the ID of the dataSource
    fetchData(rowData);

    //Create a temporally div to extract the information
    var tempElement = document.createElement('div');

    //Add the HTML to the URL to the project
    tempElement.innerHTML = rowData[6];

    //Store the information of the URL
    var urlText = tempElement.textContent;

    //Add the HTML to the URL of the SharePoint
    tempElement.innerHTML = rowData[7];

    //Store the information of the SharePoint
    var sharePoint = tempElement.textContent;

    /** Display all the data into the inputs */
    document.getElementById('title').value = rowData[1];
    document.getElementById('owner').value = rowData[2];
    document.getElementById('type').value = rowData[3];
    document.getElementById('description').value = rowData[4];
    document.getElementById('created').value = rowData[5];
    document.getElementById('url').value = urlText;
    document.getElementById('sharepoint').value = sharePoint;
    document.getElementById('id').value = rowData[0];

    //Call the method to display the information in the PowerAutomate section
    //powerAutomate(rowData);
}

/**
 * Function to display the information into the PowerAutomate section
 * @param {*} rowData Variable that contains the information 
 */
function powerAutomate(rowData) {
    /**Identify all th neccesary elements */
    var powerAutomate = document.getElementById('powerAutomate');
    var powerAutomateTitle = document.getElementById('powerAutomateNameTitle');
    var powerAutomateName = document.getElementById('powerAutomateName');

    //If the value is on
    if (rowData[8] === 'on') {
        //Active the switch
        powerAutomate.checked = true;

        /**Display the tite and the input of the PowerAutomate */
        powerAutomateTitle.removeAttribute('hidden');
        powerAutomateName.removeAttribute('hidden');

        //Fill the data whit the name of the PowerAutomate
        powerAutomateName.value = rowData[9];
    }
}

/**
 * Method to fill the URLs of the associdated sites
 * @param {*} data Variable that represent the URL of the associated sites
 */
function fillUrlSites(data) {
    //Variable to stores the URL list
    const ul = document.querySelector('#urlList');

    //Iterate throw the asocciated URLs
    data.forEach(item => {
        //Create a variable to create a LI element
        var li = document.createElement('li');

        //Configure the class of the LI element
        li.className = 'list-group-item';

        //Add the URL to the LI element
        li.textContent = item.urlSite;

        //Add the LI element to the URL list
        ul.appendChild(li);
    });
}

function fillFactories(data) {
    //Store the checkbox values from the list
    const checkboxes = document.querySelectorAll('.list-group-item .form-check-input');

    //Iteare throw the data
    data.forEach(row => {
        //Iterate throw the checkbox
        checkboxes.forEach(checkbox => {
            //Compare if the values are the same
            if (row.factory === checkbox.value) {
                //Mark the checkbox
                checkbox.checked = true;
            }
        });
    });
}

/**
 * Function to add the funcionability to delete a link of the URL of associated sites
 */
function deleteAssociatedSite() {
    //Store in a variable the URL list
    var urlList = document.querySelector('#urlList');

    //Add a event when is clicked
    urlList.addEventListener('click', function () {
        //Check if the element clic is a LI element
        if (event.target.tagName = 'LI') {
            //Remove this element
            event.target.remove();
        }
    });
}

/**
 * Function to fill the Power Automate
 * @param {*} data Argument that contain the Power Automate asoccisated
 */
function fillPowerAutomateArray(data) {
    //Identify the swtch of Power Automate
    var switchPower = document.getElementById('powerAutomate');

    //Identify the Power Automate form
    var powerAutomateForm = document.getElementById('powerAutomateForm');

    //Apply the funcionality for the Power Automate switch
    switchPower.addEventListener('change', function () {
        if (switchPower.checked) {
            powerAutomateForm.hidden = false;
        } else {
            powerAutomateForm.hidden = true;
        }
    });

    //If theres is Power Automate...
    if (data.length !== 0) {
        //Check the switch
        switchPower.checked = true;

        //Display the Power Automate form
        powerAutomateForm.hidden = false;

        //Iterate throw the data
        data.forEach(item => {
            //Create a Power Automate object with the information
            const powerAutomate = [
                item.flowName,
                null,
                item.owner,
                item.state,
                item.description,
                item.url
            ];

            //Add the object to the array
            powerAutomateArray.push(powerAutomate);
        });

    //If there isnt Power Automate...
    } else if (data.length === 0) {
        //Descheck the siwtch
        switchPower.checked = false;

        //Hide the Power Automate form
        powerAutomateForm.hidden = true;
    }
}

/**
 * EventListener to configure the method from the page
 */
document.addEventListener('DOMContentLoaded', function () {
    fillData();
    deleteAssociatedSite();
});