/**
 * Method to retireve the data from the 'spotfire_functions_subfunctions' table using the ID from the data source
 * @param {*} rowData Variable that represent the information of the actual Data Source
 */
async function fetchData(rowData) {
    try {
        const response = await fetch(`/library/api/getFunction_Subfunction/${rowData[0]}`);
        if (!response.ok) {
            throw new Error('Error fetching data');
        }
        const data = await response.json();

        fillFunctionCheckbox(data);
        markSubfunctionCheckboxes(data)
    } catch (error) {
        console.error('Error:', error);
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

    //Add the HTML for the location/URL
    tempElement.innerHTML = rowData[5];

    //Store the information of the URL
    var urlText = tempElement.textContent;

    console.log("URL TEXT: ", urlText);

    //Add the information of the video tutorial
    tempElement.innerHTML = rowData[9];

    //Store the information of the video tutorial
    var videoTutorialText = tempElement.textContent;

    //Add the information of the contact
    tempElement.innerHTML = rowData[8];

    //Store the information of the contact
    var contactText = tempElement.textContent;

    /** Display all the data of the data source into the inputs */
    document.getElementById('title').value = rowData[1];
    document.getElementById('factory').value = rowData[2];

    document.getElementById('location').value = urlText;
    document.getElementById('description').value = rowData[7];
    document.getElementById('videoTutorial').value = videoTutorialText;
    document.getElementById('contact').value = contactText;
    document.getElementById('id').value = rowData[0];
    document.getElementById('dataSource').value = rowData[10];
    document.getElementById('comments').value = rowData[15];

    /** Obtein the dropdown of the type report and platform and also the switch */
    const dropDown_typeReport = document.getElementById('typeReport');
    const dropDown_platform = document.getElementById('platform');
    const switch_sentElemental = document.getElementById('sentElementals');
    const switch_renault = document.getElementById('renault');

    //Iterate throw the dropdown type report options
    for (let i = 0; i < dropDown_typeReport.options.length; i++) {
        //Verify if the value of the option match with the wish value
        if (dropDown_typeReport.options[i].value === rowData[3]) {
            //Put the option select
            dropDown_typeReport.options[i].selected = true;
            //Exit the loop
            break;
        }
    }

    //Iterate throw the dropdown platforms options
    for (let i = 0; i < dropDown_platform.options.length; i++) {
        //Verify if the value of the option match with the wish value
        if (dropDown_platform.options[i].value === rowData[4]) {
            //Put the option select
            dropDown_platform.options[i].selected = true;
            //Exit the loop
            break;
        }
    }

    //Check if the value of sent elementals is "on"
    if (rowData[11] === 'on') {
        //Put on the switch
        switch_sentElemental.checked = true;
    }

    //Check if thr value of renault is "on"
    if (rowData[12] === 'on') {
        switch_renault.checked = true;
    }

    //Call the method to mark all the checkbox of the functions and subfunctions
    fillFunctionCheckbox(rowData);
}

/**
 * Function to check all the function from an specific data analyse source
 * @param {*} data Contains all the funcions/subfunction for the data analyse ID
 */
function fillFunctionCheckbox(data) {
    //Iteare throw the values
    data.forEach(row => {
        //Find the checbox
        const checkboxId = `function${row.function_id}`;
        const checkbox = document.getElementById(checkboxId);
        
        //Put the checkbox on
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

/**
 * Functions to check all the corresponding subfunctions
 * @param {*} data Contains all data
 */
function markSubfunctionCheckboxes(data) {
    //Iterate throw the query results
    data.forEach(row => {
        const subfunctions = getSubfunctionsByFunctionId(row.function_id, data);
        
        //Iterate throw the subfunctions and mark the checkbox
        subfunctions.forEach(subfunctionId => {
            const checkboxId = `function-${row.function_id}-subfunction-${subfunctionId}`;
            const checkbox = document.getElementById(checkboxId);
            
            //Put the checkbox on if exist
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    });
}

/**
 * Method to obtein the subfunctions using the function
 * @param {int} functionId Represent the function ID
 * @param {*} data variable that contain all the data
 * @returns All the subfunctions by the function
 */
function getSubfunctionsByFunctionId(functionId, data) {
    const subfunctions = [];
    data.forEach(row => {
        if (row.function_id === functionId) {
            subfunctions.push(row.subfunction_id);
        }
    });
    return subfunctions;
}

/**
 * EventListener to configure the method from the page
 */
document.addEventListener('DOMContentLoaded', function () {
    fillData();
})