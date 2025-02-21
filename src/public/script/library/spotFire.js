/**
 * Method to obtein the information from the "spotfire" table and rendering into the dataTable
 */
async function fetchData() {
    try {
        //Call the method to obtein all the information
        const response = await fetch('/library/api/getSpotfire');
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
 * Method to display all the information into the dataTable
 * @param {*} data Variable that contain the data source information
 */
function renderTable(data) {
    //Initialize the dataTable
    const table = $('#dataTable').DataTable();
    table.clear();

    //Iterate throw the data and display it into the dataTable
    data.forEach(item => {
        const rowData = [
            item.id,
            item.title,
            item.factory,
            item.type_report,
            item.platform,
            `<button type="button" class="btn btn-primary" onclick="openLink('${item.location}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
                </svg>
                View information
            </button>
            `,
            `<a href="${item.location}" target="_blank">${item.location}</a>`,
            item.description,
            `<a href="mailto:${item.contact}">${item.contact}</a>`,
            `<a href="${item.video_tutorial}" target="_blank">${item.video_tutorial}</a>`,
            item.data_source,
            item.sent_elementals,
            item.renault,
            item.function_name,
            item.subfunction_name,
            item.comments,
            item.userID
        ];

        table.row.add(rowData);
    });

    //Draw the dataTable with the data
    table.draw();

    //Filters by type report
    $('#typeReportFilters input[type="checkbox"]').on('change', function () {
        const selected = $('#typeReportFilters input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(3).search(selected.join('|'), true, false).draw();
    });

    //Filters by platform
    $('#platformFilters input[type="checkbox"]').on('change', function () {
        const selected = $('#platformFilters input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(4).search(selected.join('|'), true, false).draw();
    });

    //Filters by factories
    $('#factoryFilters input[type="checkbox"]').on('change', function () {
        const selected = $('#factoryFilters input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(2).search(selected.join('|'), true, false).draw();
    });

    //Filters by HLT function
    $('#function_HLT input[type="checkbox"]').on('change', function () {
        const selected = $('#function_HLT input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(13).search(selected.join('|'), true, false).draw();
    });

    //Filters by HLT subfunction
    $('#subfunction_HLT input[type="checkbox"]').on('change', function () {
        const selected = $('#subfunction_HLT input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(14).search(selected.join('|'), true, false).draw();
    });

    //Filters by Motores function
    $('#function_Motores input[type="checkbox"]').on('change', function () {
        const selected = $('#function_Motores input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(13).search(selected.join('|'), true, false).draw();
    });

    //Filters by Motores subfunction
    $('#subfunction_Motores input[type="checkbox"]').on('change', function () {
        const selected = $('#subfunction_Motores input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(14).search(selected.join('|'), true, false).draw();
    });

    //Filters by Sevilla function
    $('#function_Sevilla input[type="checkbox"]').on('change', function () {
        const selected = $('#function_Sevilla input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(13).search(selected.join('|'), true, false).draw();
    });

    //Filters by Sevilla subfunction
    $('#subfunction_Sevilla input[type="checkbox"]').on('change', function () {
        const selected = $('#subfunction_Sevilla input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(14).search(selected.join('|'), true, false).draw();
    });

    //Filters by Aveiro function
    $('#function_Aveiro input[type="checkbox"]').on('change', function () {
        const selected = $('#function_Aveiro input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(13).search(selected.join('|'), true, false).draw();
    });

    //Filter by Aveiro subfunction
    $('#subfunction_Aveiro input[type="checkbox"]').on('change', function () {
        const selected = $('#subfunction_Aveiro input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(14).search(selected.join('|'), true, false).draw();
    });

    //Filters by Oyak, Rumania, Curitiba, Los Andes and Argetina
    $('#function input[type="checkbox"]').on('change', function () {
        const selected = $('#function input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();
        table.column(13).search(selected.join('|'), true, false).draw();
    });
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