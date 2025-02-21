/**
 * Function to display the information into the edit bluprint form
 */
function fillData() {
    //Obteing the data of the row using the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const rowDataJson = urlParams.get('data');

    //Store the data from the URL params
    const rowData = JSON.parse(decodeURIComponent(rowDataJson));

    //Create a temporally div
    var tempDiv = document.createElement('div');

    //Add the image data in the div
    tempDiv.innerHTML = rowData[3];

    //Store the image element
    const imageElement = tempDiv.querySelector('img');

    //Store the image path
    const imagePath = imageElement ? imageElement.getAttribute('src') : null;

    /**Display all the data into the values */
    document.getElementById('idBlueprint').value = rowData[0];
    document.getElementById('title').value = rowData[1];
    document.getElementById('description').value = rowData[2];
    document.getElementById('blueprintFilePath').value = rowData[4]
    document.getElementById('blueprintImagePath').value = imagePath;

    //Apply the image
    document.getElementById('imageBlueprint').setAttribute('src', imagePath);
}

/**
 * Function to configure the replace file modal
 * @param {int} option Argument to control if the user wants to replace the image or de model file
 */
function replaceFileModal(option) {
    //Initialize the document
    $(document).ready(function () {
        //Delete the buttons of the footer
        $('#modal .modal-footer').html(``);

        //Create a switch with the option argument
        switch (option) {
            //If the user wants to replace the image...
            case 1:
                //Configure the title of the modal
                $('#modal .modal-title').text('Replace the image');

                //Configure the body of the modal for the image files
                $('#modal .modal-body').html(`
                    <form id="replaceFile" action="/library/api/update-file-model/${document.getElementById('idBlueprint').value}/${option}/${encodeURIComponent(document.getElementById('blueprintImagePath').value.split('/').pop())}" method="POST"
                        enctype="multipart/form-data">
            
                        <div class="mb-3">
                            <input class="form-control" type="file" id="files" name="files" accept=".png, .jpg, .jpeg" required>
                        </div>
            
                        <button id="continueButton" type="submit" class="btn btn-primary">Continue</button>
                    </form>
                `);
                break;

            //If the user wants to replace the model file
            case 0:
                //Configure the title of the mdal
                $('#modal .modal-title').text('Replace the model file');

                //Configure the body of the modal for the STL file
                $('#modal .modal-body').html(`
                    <form id="replaceFile" action="/library/api/update-file-model/${document.getElementById('idBlueprint').value}/${option}/${encodeURIComponent(document.getElementById('blueprintFilePath').value)}" method="POST"
                        enctype="multipart/form-data">
            
                        <div class="mb-3">
                            <input class="form-control" type="file" id="files" name="files" accept=".stl" required>
                        </div>
            
                        <button id="continueButton" type="submit" class="btn btn-primary">Continue</button>
                    </form>
                `);
                break;
        }

        //Display the modal
        $('#modal').modal('show');
    });
}

/**
 * Function to display the files into a tables
 */
function displayFiles() {
    //Store the variables (image and file name and also the lists)
    const filePath = document.getElementById('blueprintFilePath').value.split('/').pop(), imagePath = document.getElementById('blueprintImagePath').value.split('/').pop(),
        imageList = document.getElementById('imageList'), modelList = document.getElementById('modelList');

    //Create a row to store the information of the model file
    const modelRow = document.createElement('tr');
        //Inner the name of the file
        modelRow.innerHTML = `<td>${filePath}</td>`;

        //Add the row the model list
        modelList.appendChild(modelRow);

    //Create a row¡ to store the information of the image
    const imageRow = document.createElement('tr');
        //Inner the name of the image
        imageRow.innerHTML = `<td>${imagePath}</td>`;
        
        //Add the row into the image list
        imageList.appendChild(imageRow);
}

/**
 * EventListener to configure the method from the page
 */
document.addEventListener('DOMContentLoaded', function () {
    fillData();
    displayFiles();
});