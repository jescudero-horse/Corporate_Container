/**
 * Method to obteing the values from the best practise
 */
async function fetchData(id) {
    /**INFORMATION */
    try {
        //Preparamos la petición GET
        const response = await fetch(`/library/api/obtenerInformacionDetallada-bestPractica/${id}`);
        
        //Controlamos la respuesta
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos los datos
        const data = await response.json();

        //Llamamos a la función para disponer la información de la buena práctica dentro del formulario
        disponerInformacion(data);

    } catch (error) {
        console.error("Error: ", error);
    }

    /**FILES */
    try {
        const response = await fetch(`/library/api/getFiles-bestPractise/${id}`);
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Store the information into a variable
        const data = await response.json();

        //Call the method to display the before images
        splideBeforeImage(data, 'splideBeforeImages');

        //Call the method to display the after images
        splideAfterImage(data, 'splideAfterImages');

        //Call the method to display the main image
        displayMainImage(data);

        //Call the method to display the other files
        otherFiles(data);

    } catch (error) {
        console.error('Error:', error);
    }

    /**COMMENTS */
    try {
        const response = await fetch(`/library/api/getCommentsBestPractise/${id}`);
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Store the information into a variable
        const data = await response.json();

        //Call the method to fill the comments
        fillComments(data);

    } catch (error) {
        console.error('Error:', error);
    }

    /**TAGS */
    try {
        const response = await fetch(`/library/api/getTags/${id}`);
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Store the information into a variable
        const data = await response.json();

        //Call the method to fill the keyword
        fillKeyword(data);
    } catch (error) {
        console.error('Error: ', error);
    }
}

/**
 * Function to fill the comments and display it
 * @param {*} data Variable that contains the information about the comments
 */
function fillComments(data) {
    const container = document.querySelector('#commentsContainer');
    container.innerHTML = '';

    //If the best practise does not have comments...
    if (data.length === 0) {
        document.getElementById('comment').setAttribute('hidden', 'true');
    }

    //Iterate through the data
    data.forEach(item => {
        //Div for the rows
        const commentRow = document.createElement('div');
        commentRow.className = 'comment-row d-flex align-items-start';

        //Div for the user ID
        const userSpan = document.createElement('span');
        userSpan.className = 'comment-user';
        userSpan.textContent = item.userEmail;

        //Div for the comment
        const commentText = document.createElement('p');
        commentText.className = 'comment-text mb-0';
        commentText.textContent = item.comment;

        //Div for the action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'comment-actions';

        //Create and configure the delete comment button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.innerHTML = `<i class="bi bi-trash-fill"></i>`;

        //Create and configure the update comment button
        const updateButton = document.createElement('button');
        updateButton.className = 'btn btn-secondary btn-sm';
        updateButton.innerHTML = `<i class="bi bi-pencil-square"></i>`;

        //Create and configure the response button
        const responseButton = document.createElement('button');
        responseButton.className = 'btn btn-success btn-sm';
        responseButton.innerHTML = `<i class="bi bi-chat-dots"></i>`;

        //If the authenticated user is the creator of the comment...
        if (document.getElementById('ipn').value === item.userID) {
            //Add the action buttons
            actionsDiv.appendChild(deleteButton);
            actionsDiv.appendChild(updateButton);
            actionsDiv.appendChild(responseButton);
        }

        //Apply the functionality to the delete button
        deleteButton.onclick = () => {
            //Call the method to display the modal
            displayDeleteCommentModal(item.comment, item.id);
        }

        //Apply the functionality to the update button
        updateButton.onclick = () => {
            //Call the method to display the modal
            displayUpdateCommentModal(item.comment, item.id);
        }

        //Apply the funcionality to the response button
        responseButton.onclick = () => {
            //Store the email of the comment creator
            const email = item.userEmail;

            //Store the comment
            const comment = "Digital Library (Best Practise comment) --> " + item.comment;

            //Store the mailTo URL
            const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(comment)}`;

            //Open the link
            window.location.href = mailtoLink;
        }

        //Add the elements to the comment container
        commentRow.appendChild(userSpan);
        commentRow.appendChild(commentText);
        commentRow.appendChild(actionsDiv);

        //Add the comment row to the container
        container.appendChild(commentRow);
    });
}

/**
 * Function to fill the tags of the best practise
 * @param {*} data Argument that contain the information of the keyword
 */
function fillKeyword(data) {
    //Iterate throw the data
    data.forEach(item => {
        //Store the tags splited by ";"
        const tag = item.keyword.split(';');

        //Add the values to the tagify input
        document.getElementById('tags-input').setAttribute('value', tag);
    });

    //Store the input
    var input = document.querySelector('input[name=tags]');

    //Initialize the input using Tagify
    new Tagify(input);
}

/**
 * Method to fill the data on each input
 */
function obtenerInformacion() {
    //Obtein de data of the row using the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const idJson = urlParams.get('data');

    //Store the data from the URL params
    const id = JSON.parse(decodeURIComponent(idJson));

    //Call the method to obtein the paths of the files and the comments
    fetchData(id);
}

/**
 * Función para disponer la información de la buena práctica en el formulario
 * @param {Array} data Argumento que contiene la información detallada de la buena práctica
 */
function disponerInformacion(data) {
    /**Disponemos la información dentro de los inputs */
    document.getElementById('id').value = data[0].id;
    document.getElementById('title').value = data[0].title;
    document.getElementById('owner').value = data[0].owner;
    document.getElementById('factory').value = data[0].factory;
    document.getElementById('metier').value = data[0].metier;
    document.getElementById('line').value = data[0].line;
    document.getElementById('technology').value = data[0].technology;
    document.getElementById('categorization').value = data[0].categorization;

    //Llamamos a la función para disponer las categorias
    fillCategory(data[0].category);
}

/**
 * Function to mark the categories checkbox
 * @param {string} categories Argument that contain the categories
 */
function fillCategory(categories) {
    //Store the categories splited by ";"
    const selectedCategories = categories.split(';').map(item => item.trim());

    //Iterate throw the differents categories
    selectedCategories.forEach(category => {
        //Store the checkbox using the value
        const checkbox = document.querySelector(`input[type="checkbox"][value="${category}"]`);

        //If the checkbox is selected
        if (checkbox) {
            //Mark the checkbox
            checkbox.checked = true;
        }
    });
}

/**
 * Function to configure and display the before images carousel
 * @param {*} data Variable that contains the information
 * @param {string} Variable that contains the ID of the before image splide
 */
function splideBeforeImage(data, carouselID) {
    //Create a instance and a variable of the before images carousel
    const splideList = document.querySelector('#' + carouselID + ' .splide__list');

    //If the best practise doesnt have before files...
    if (data.length === 0) {
        //Hide the before splide
        splideList.setAttribute('hidden', 'true');

        //Hide the tittle
        document.getElementById('beforeImage').setAttribute('hidden', 'true');

        //In other case...
    } else {
        //Iterate throw the data information
        data.forEach(item => {
            //Check the before images
            if (item.before_file === 1) {
                //Create an store an li element
                const li = document.createElement('li');

                //Create and store an img element
                const img = document.createElement('img');

                //Add the path to the img element
                img.src = item.path;

                //Add the class to the li element
                li.classList.add('splide__slide');

                //Add the img element into the li elemento
                li.appendChild(img);

                //Add the li element into the before carousel image (Splide)
                splideList.appendChild(li);
            }
        });

        //Instance and configure the Splide of the before images
        new Splide('.splide', {
            type: 'fade',
            rewind: true,
            pagination: true,
            arrows: true
        }).mount();
    }
}

/**
 * Function to complete the table that contain the other files
 * @param {string} data Argument that contains the information to display the other files
 */
function otherFiles(data) {
    //Create an instance and a variable of the other files
    const fileList = document.getElementById('fileList');

    //If the best practise doesnt have other files...
    if (data.length == 0) {
        //Hide the div that contains the list of the other files
        document.getElementById('listFileDiv').hidden;

        //In other case...
    } else {
        //Iterate throw the data
        data.forEach(item => {
            //If the before_file is null...
            if (item.before_file == null) {
                //Create a tr element
                const tr = document.createElement('tr');

                const fileName = item.path;
                const finalFileName = fileName.split('/').pop();

                //Add the HTML for the file
                tr.innerHTML = `
                    <td>${finalFileName}</td>

                    <td>
                        <button class="btn btn-outline-primary btn-sm me-2" onclick="downloadFile('${item.path}')">
                            <i class="bi bi-browser-edge"></i> Web Preview
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="viewFile('${item.path}')">
                            <i class="bi bi-eye"></i> Built-in Preview
                        </button>
                    </td>
                `;

                //Append the tr elemento into the list files
                fileList.appendChild(tr);
            }
        });
    }
}

/**
 * Method to open the file in a new tab
 * @param {string} url Argument that contain the URL whit the file path
 */
function downloadFile(url) {
    //Call the method to open a new tab with the file
    window.open(url, '_blank');
}

/**
 * Function to preview the file in the modal
 * @param {string} path Variable that contains the path of the file
 */
function viewFile(path) {
    //Configure the title of the modal
    $('#modalInformation .modal-title').text(path.split('/').pop());

    //Check if the extension is video
    if (path.slice(-4) === '.mp4' || path.slice(-4) === '.mp3' || path.slice(-4) === '.MP4' || path.slice(-4) === '.MP3') {
        //Configure the body of the modal to load the video/audio with the file path
        $('#modalInformation .modal-body').html(`
            <video id="mediaElementPlayer" width="100%" height="400px" controls>
                <source src="${path}" type="video/mp4">
            </video>
        `);

        //In other case...
    } else {
        //Configure the body of the modal to load the Viewer with the file path
        $('#modalInformation .modal-body').html(`
            <iframe src="/ViewerJS/#${path}" width="100%" height="600px" allowfullscreen webkitallowfullscreen></iframe>
        `);
    }

    //Configure the footer of the modal
    $('#modalInformation .modal-footer').html(``);

    //Show the modal
    $('#modalInformation').modal('show');
}

/**
 * Function to configure and display the after images carousel
 * @param {*} data Variable that represents the information
 * @param {string} carouselID Variable that contins the ID of the after image splide
 */
function splideAfterImage(data, carouselID) {
    //Create and intance and a varable of the after images carousel
    const splideList = document.querySelector('#' + carouselID + ' .splide__list');

    //If the best practise doesnt have after files...
    if (data.length == 0) {
        //Hide the after splide
        splideList.setAttribute('hidden', 'true');

        //Hide the title
        document.getElementById('afterImage').setAttribute('hidden', 'true');

        //In other case...
    } else {
        //Iterate throw the data information
        data.forEach(item => {
            //Check the after images
            if (item.before_file === 0) {
                //Create an store an li element
                const li = document.createElement('li');

                //Create and store an img element
                const img = document.createElement('img');

                //Add the path to the img element
                img.src = item.path;

                //Add the class to the li element
                li.classList.add('splide__slide');

                //Add tbe img element into the li element
                li.appendChild(img);

                //Add the li element into the after carousel image (Splide)
                splideList.appendChild(li);
            }
        });

        //Instance and configure the Splide of the after images
        new Splide("#" + carouselID, {
            type: 'fade',
            rewind: true,
            pagination: true,
            arrows: true
        }).mount();
    }
}

/**
 * Function to display the main image
 * @param {*} data Argumento que contiene los path de la imagen
 */
function displayMainImage(data) {
    //Iterate throw the data information
    data.forEach(item => {
        //If the path is from the main image
        if (item.before_file === 3) {
            //Configure the main image
            document.getElementById('mainImage').src = item.path;
        }
    });
}

/**
 * Function to configure the modal to add the new comment to the best practise source
 */
function displayCommentModal() {
    //Store the IPN value
    const ipn = document.getElementById('ipn').value;

    //Configure the title of the modal
    $('#modalInformation .modal-title').text('Add a new comment');

    //Configure the body of the modal
    $('#modalInformation .modal-body').html(
        `
            <textarea class="form-control" aria-label="${ipn}" id="comment" name="comment"></textarea>
        `
    );

    //Configure the footer of the modal
    $('#modalInformation .modal-footer').html(
        `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="addComment" onclick="addComment()">Accept</button>
        `
    );

    //Show the modal
    $('#modalInformation').modal('show');
}

/**
 * Function to add the new comment
 */
function addComment() {
    //Store the comment value
    const comment = document.getElementById('comment').value;

    //If the comments is empty
    if (comment === '') {
        //Configure the alert
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "The comment cannot be empty"
        });

    } else {
        //Store the ID of the best practise
        const idBestPractise = document.getElementById('id').value;

        //Call the end point to insert the comment
        fetch(`/library/api/insert-data-commentBestPractise/${idBestPractise}/${comment}`, {
            method: 'POST'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('No se ha podido añadir el nuevo comentario');
                }
                return response.json();
            })
            .then(data => {
                //Create a variable to set the timer
                let timerInterval;

                //Configure the alert
                Swal.fire({
                    title: "Comment added",
                    html: "Showing the comments, please wait <b></b> milliseconds...",
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
            })
            .catch((error) => {
                console.error('Error: ', error);
            })
    }
}

/**
 * Function to display the delete comment modal
 * @param {string} comment Argument that contains the comment
 * @param {int} id Argument that contains the ID of comment
 */
function displayDeleteCommentModal(comment, id) {
    console.log("ID: ", id)
    //Configure the title of the modal
    $('#modal .modal-title').text('Are you sure you want to delete this comment?');

    //Configure the body of the modal
    $('#modal .modal-body').text(comment);

    //Configure the foother of the modal
    $('#modal .modal-footer').html(`
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-outline-danger" id="deleteComment">Delete</button>
    `);

    //Configure the funcionality of the delete button of the comment
    $('#deleteComment').on('click', function () {
        //Call the end point to delete the data source using the ID and the name of the table
        fetch(`/library/api/deleteComment/${id}`, {
            method: "DELETE"
        })
            //Control the response
            .then(response => {
                if (!response.ok) {
                    console.error("Error a la hora de eliminar el comentario");
                }

                deleteElement("Comment deleted");
            });
    });

    //Show the modal
    $('#modal').modal('show');
}

/**
 * Function to upload the comment
 * @param {string} comment Argument that contain the comment
 * @param {int} id Argument that contain the ID of the comment
 */
function displayUpdateCommentModal(comment, id) {
    //Configure the title of the modal
    $('#modal .modal-title').text('Update your comment');

    //Configure the body of the modal
    $('#modal .modal-body').html(`
        <textarea class="form-control" aria-label="Comment" id="comment" name="comment">${comment}</textarea>
    `);

    //Configure the footer of the modal
    $('#modal .modal-footer').html(`
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-outline-primary" id="updateComment">Update</button>
    `);

    //Configure the funcionality of the update button of the modal
    $('#updateComment').on('click', function () {
        //Call the end point to delete the data source using the ID and the name of the table
        fetch(`/library/api/updateComment/${id}/${document.getElementById('comment').value}`, {
            method: "POST"
        })
            //Control the response
            .then(response => {
                if (!response.ok) {
                    console.error("Error a la hora de actualizar el comentario de la buena práctica");
                }

                //Call the method to display the alert message
                deleteElement("Updated Comment");
            });
    });

    //Show the modal
    $('#modal').modal('show');
}

/**
 * EventListener to configure the method from the page
 */
document.addEventListener('DOMContentLoaded', function () {
    obtenerInformacion();
});