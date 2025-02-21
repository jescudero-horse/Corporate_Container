//When the DOM Content was loaded
document.addEventListener('DOMContentLoaded', function () {
    //Make the fetch to obtenin the user ID (IPN)
    fetch('/library/api/user-id')
        .then(response => response.json())
        .then(data => {
            if (data.userId) {
                //Store the IPN into the hidden input
                document.getElementById('ipn').value = data.userId;
            } else {
                console.error('User not authenticated');
            }
        })
        .catch(error => console.error('Error fetching user ID:', error));
});

/**
 * Function to take off the filter by the IPN
 * @param {int} idColumn Variable that represents the ID of the userID column
 */
function returnNormalList(idColumn) {
    //Re-search the dataTable to view all the information
    $('#dataTable').DataTable().column(idColumn).search('').draw();

    //Hide the live toast
    $('#liveToast').toast('hide');
}

/**
 * Function to display a message alert if there is a empty flied
 */
function voidInput() {
    //Configure the alert
    Swal.fire({
        title: "Error",
        text: "There can be no empty fields"
    });
}

/**
 * Función para disponer una alerta 
 * @param {String} title Argumento que contiene el titulo de la alerta
 * @param {String} message Argumento que contiene el mensaje de la alerta
 * @param {String} icon Argumento que contiene el tipo del icono de la alerta
 */
function mostrarAlerta(title, message, icon) {
    Swal.fire({
        title: title,
        message: message,
        icon: icon
    });
}

/**
 * Function to display the delete alert message
 */
function deleteElement(message) {
    //Create a variable to set the timer
    let timerInterval;

    //Configure the alert
    Swal.fire({
        title: message,
        html: "Reloading page, please wait <b></b> milliseconds...",
        timer: 1000,
        allowOutsideClick: false,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            window.location.reload();
        }
    });
}

/**
 * Function to display the update alert message
 * @param {string} finalLocation Argument that contains the destionation of the source
 */
function updateElement(finalLocation) {
    //Build a bootStrap style button
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
    });

    //Configure the alert
    swalWithBootstrapButtons.fire({
        title: "Element update",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "View the source list",
        cancelButtonText: "Return to main menu ",
        reverseButtons: false,
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = finalLocation;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = "/library/selectCategories";
        }
    });
}

function addElement(titleMessage, dennyMessage, sourceListDestination) {
    //Build a bootStrap style button
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger",
            denyButton: "btn btn-secondary"
        },
        buttonsStyling: false
    });

    //Configure the alert
    swalWithBootstrapButtons.fire({
        title: titleMessage,
        text: "Do you want to add another?",
        icon: "success",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "Exit to main menu",
        denyButtonText: dennyMessage,
        reverseButtons: false,
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            // window.location.href = addSourceDistination
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = "/library/selectCategories";
        } else if (result.isDenied) {
            window.location.href = sourceListDestination
        }
    });
}

/**
 * Function to delete a source using the ID of the source and the name of the table
 * @param {string} table Argument that contains the name of the table
 */
function deleteSource(id, table) {
    //Call the end point to delete the data source using the ID and the name of the table
    fetch(`/library/api/delete-row/${id}/${table}`, {
        method: 'DELETE'
    })
        //Control the response
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting the record');
            }

            //Hide the delete modal
            $('#modalConfirmDelete').modal('hide');

            //Call the method to display the alert
            deleteElement("Item successfully deleted. Reloading page");
        })

        //Control the error
        .catch(error => {
            console.error('Error:', error);
        });
}