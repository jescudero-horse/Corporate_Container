/**
 * Method to obtein the information from the "powerAutomate" table and rendering into the dataTable
 */
async function fetchData() {
    try {
        //Call the method to obtein all the information
        const response = await fetch('/library/api/getPowerAutomate');
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
        //Declare a variable to store the button wihth the URL
        var url;

        //If the url value is empty
        if (item.url == '' || item.url == null) {
            //Store empty HTML
            url = null;

            //In other case...
        } else {
            //Store the button of the URL to the flow
            url = `
                <button type="button" class="btn btn-primary url-to-project" onclick="openLink('${item.url}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
                    </svg>
                    URL to flow
                </button>
            `;
        }

        //Crete a variable with the sourcem
        const rowData = [
            item.id,
            item.flowName,
            item.flowID,
            `<a href="mailto:${item.owner}">${item.owner}</a>`,
            item.state,
            item.description,
            url,
            item.userID,
            item.factory
        ];
        console.log(rowData)
        table.row.add(rowData);
    });

    table.draw();
}

/**
 * Function to open the link in another tab of the browser
 * @param {String} url Variable that store the link of the source
 */
function openLink(url) {
    window.open(url, '_blank');
}

/**
 * Method to load all the method when the dataTable is rendering
 */
window.addEventListener('DOMContentLoaded', function () {
    fetchData();

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