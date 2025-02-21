//Creamos la variable global para saber si hay una imagen principal
let mainImage;

/**
 * Method to obteing the values from the best practise
 */
async function obtenerInformacion(id) {
    /**INFORMATION */
    try {
        const response = await fetch(`/library/api//obtenerInformacionDetallada-bestPractica/${id}`);
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        const data = await response.json();
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
        displayFiles(data);

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

    /**MAIN IMAGE */
    try {
        const response = await fetch(`/library/api/controlMainImage/${id}`);
        if (!response.ok) {
            throw new Error('Error catching data');
        }

        //Almacenamos los datos obtenidos
        const data = await response.json();

    } catch (error) {
        console.error("Error: ", error);
    }
}

/**
 * Function to fill the data into the form
 */
function fillData() {
    //Obtein de data of the row using the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const idJson = urlParams.get('data');

    //Store the data from the URL params
    const id = JSON.parse(decodeURIComponent(idJson));

    //Call the method to obtein the tags
    obtenerInformacion(id);
}

/**
 * Función para disponer la información de la buena práctica en el formulario
 * @param {Array} data Argumento que contiene la información detallada de la buena práctica
 */
function disponerInformacion(data) {
    console.log("Datos de la  buena práctica: ", data);

    /**Disponemos la información dentro de los inputs */
    document.getElementById('idBestPractise').value = data[0].id;
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
 * Function to fill the categories checkbox
 * @param {string} categories Argument that contains the categories
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
    new Tagify(input, {
        maxTags: 5
    });
}

/**
 * Function to complete the table that contain the files
 * @param {string} data Argument that contains the information to display the images and the other file
 */
function displayFiles(data) {
    //Create an instance of the list images and the list other files
    const beforeList = document.getElementById('beforeList');;
    const afterList = document.getElementById('afterList');
    const otherFileList = document.getElementById('otherFilesList');
    const mainIMageList = document.getElementById('mainImageList');

    //If the best practise doesnt have before images
    if (data.length == 0) {
        //Hide the div that contains the list of the other files
        document.getElementById('beforeImagesDiv').hidden;

        //In other case...
    } else {
        //Iterate throw the data
        data.forEach(item => {
            //Create a tr element
            const tr = document.createElement('tr');

            //Store the file pathj
            const fileName = item.path;

            //Store file name
            const finalFileName = fileName.split('/').pop();

            //Controlamos que el fichero no corresponda a la imagen principal
            if (item.before_file !== 3) {
                //Add the HTML for the file
                tr.innerHTML = `
                    <td>${finalFileName}</td>

                    <td>
                        <button class="btn btn-danger" onclick="deleteFile('${item.id}', '${item.path}', '${item.before_file}')">Delete file<br><i class="bi bi-trash3-fill"></i></button>
                    </td>
                `;

                //En caso de que sea una imagen principal...
            } else if (item.before_file === 3) {
                //Solo añadimos el nombre del fichero
                tr.innerHTML = `
                    <td>${finalFileName}</td>
                `;
            }

            //If the before_file is 1... (before image)
            if (item.before_file == 1) {
                //Append the tr element into the before images list
                beforeList.appendChild(tr);

                //If the before_file is 0... (after image)
            } else if (item.before_file == 0) {
                afterList.appendChild(tr);

                //In other case... (other file)
            } else if (item.before_file !== 3) {
                otherFileList.appendChild(tr);

                //En caso de que sea 3 (imagen pricipal)
            } else if (item.before_file === 3) {
                mainIMageList.appendChild(tr);
            }
        });
    }
}

/**
 * Function to control if the image can be deleted or not
 * @param {int} id Argument that containt the ID of the file of the best practise
 * @param {string} path Argument that contain the path of the file
 * @param {int} beforeFile Argument that contain the information if the file is before/after/other file
 */
function controlRequiredFile(id, path, beforeFile) {
    //Use fetch() to retrieve the number of before/after file
    fetch(`/get-number-images/${document.getElementById('idBestPractise').value}/${beforeFile}`, {
        method: "GET"
    })
        //Control the reponse
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            return response.json();
        })

        //Control the data
        .then(data => {
            console.log("Datos obtenidos: ", data, "\nNumero solo: ", data.count);

            //If there are more of one required image...
            if (data.count >= 2) {
                //Call the method to delete the file from the server
                deleteFileFromServer(id, path);

                //In other case...
            } else if (data.count <= 1) {
                //Create an alert with SweetAlert2
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "You can't delete the image. There must be at least one."
                });
            }
        })
}

/**
 * Function to delete the file from the server and also from the data base
 * @param {int} id Argument that contain the ID of the file of the best practise
 * @param {string} path Argument that contain the path of the file
 */
function deleteFileFromServer(id, path) {
    fetch(`/library/api/delete-file/${id}/${encodeURIComponent(path)}`, {
        method: 'DELETE'
    })

        //Control the response5
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting the record');
            }

            //Call the method to display the delete alert
            deleteElement("Item successfully deleted. Reloading page");
        });
}

/**
 * Function to call the end point to delete the row and the file from the server
 * @param {int} id Argument that contain the ID of the row
 * @param {string} path Argument that contains the path of the file
 * @param {int} beforeFile Argument that contain if the files is an before/after/another file
 */
function deleteFile(id, path, beforeFile) {
    switch (beforeFile) {
        case "1":
            console.log("Dentro del primer caso");
            //Call the method to delete the file from the server and also from the data base
            deleteFileFromServer(id, path);
            break;

        case "0":
            console.log("Dentro del segundo caso");
            //Call the method to delete the file from the server and also from the data base
            deleteFileFromServer(id, path);
            break;

        case "null":
            console.log("Dentro del tercer caso");
            //Call the method to delete the file from the server and also from the data base
            deleteFileFromServer(id, path);
            break;
    }
}

/**
 * Function to display a modal to add files to the best practise
 * @param {int} option Argument that contain the option (before image, after image or other file)
 */
function addFileModal(option) {
    //Initialize the document
    $(document).ready(function () {
        //Add the body of the modal
        $('#modal .modal-body').html(`
            <form id="addFiles" action="/library/api/update-file/${option}/${document.getElementById('idBestPractise').value}" method="POST"
                enctype="multipart/form-data">
    
                <div class="mb-3">
                    <input class="form-control" type="file" id="files" name="files" accept=".png, .jpg, .jpeg"
                        multiple required>
                </div>
    
                <button id="continueButton" type="submit" class="btn btn-primary">Continue</button>
            </form>
        `);

        //Delete the default buttons of the modal
        $('#modal .modal-footer').text('');

        //If the option is before_image
        if (option == 1) {
            //Configure the title of the modal
            $('#modal .modal-title').text('Add a before image');

            //If the option is after_image
        } else if (option == 0) {
            //Configure the title of the modal
            $('#modal .modal-title').text('Add an after image');

            //If option is main image
        } else if (option === 3) {
            //Configure the title of the modal
            $('#modal .modal-title').text('Replace the main image');

            //Configuramos el cuerpo del modal
            $('#modal .modal-body').html(`
                <form id="addFiles" action="/library/api/anyadir-MainImage/${document.getElementById('idBestPractise').value}" method="POST"
                    enctype="multipart/form-data">
        
                    <div class="mb-3">
                        <input class="form-control" type="file" id="files" name="files" accept=".png, .jpg, .jpeg" required>
                    </div>
        
                    <button id="continueButton" type="submit" class="btn btn-primary">Continue</button>
                </form>
            `);

            //Configure the footer of the modal
            $('#modal .modal-footer').html(`
                <button type="button" class="btn btn-secondary" onclick="fromOtherCategory()">From other category</button>
            `);

            //In other case... (other file)
        } else {
            //Configure the title of the modal
            $('#modal .modal-title').text('Add a other file');

            //Configure the body of the modal
            $('#modal .modal-body').html(`
                <form id="addFiles" action="/library/api/update-file/${option}/${document.getElementById('idBestPractise').value}" method="POST"
                    enctype="multipart/form-data">

                    <div class="col">
                        <input class="form-control" type="file" id="files" name="files"
                            accept=".pdf, .mp3, .mp4" multiple required>
                    </div>
    
                    <br>
    
                    <button id="continueButton" type="submit" class="btn btn-primary">Continue</button>
                </form>
            `);
        }

        //Apply the funcionality for the continue button
        $('#continueButton').on('click', function () {
            //Store the ID of the best practise 
            let idBestPractise = document.getElementById('idBestPractise').value;

            //Send the id of the best practise to the backend
            fetch(`/library/api/setIdBestPractise/${idBestPractise}`, {
                method: 'POST'
            })
                //Control the response
                .then(response => response.json())

                //Control the data
                .then(data => {
                    console.log('Respuesta del servidor:', data);

                    //Create a variable to set the timer
                    let timerInterval;

                    //Configure the alert
                    Swal.fire({
                        title: "Thanks for your time",
                        html: "Reloading page, please wait <b></b> milliseconds...",
                        timer: 5000,
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

                //Control the error
                .catch((error) => {
                    console.error('Error:', error);
                });
        });

        //Show the modal
        $('#modal').modal('show');
    });
}

/**
 * Función para obtener las imagenes de otras categorias de las buena práctica
 */
function fromOtherCategory() {
    //Cerramos el modal principal
    $('#modal').modal('hide');

    //Configuramos el titulo del modal del selector de la imagen
    $('#modal .modal-title').text('Select a file from the other categories');

    //Preparamos la petición GET para obtener las imagenes de la buena práctica
    fetch(`/library/api/obtenerFicheros/${document.getElementById('idBestPractise').value}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que haya salido mal
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos obtenidos
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Llamamos a la función para disponer la información en el modal
            disponerImagenesOtraCategorias(data);
        });
}

/**
 * Función para disponer las imagenes de las otras categorias de la buena práctica
 * @param {Array} data Argumento que contiene las imagenes de las otras categorias
 */
function disponerImagenesOtraCategorias(data) {
    //Creamos una instancia del cuerpo del modal
    const modalBody = document.querySelector('#modal .modal-body');

    //Limpiamos el cuerpo del modal
    modalBody.innerHTML = '';

    //Iteramos por los path de la imagenes
    data.forEach(item => {
        //Creamos un contenedor para la imagen
        const contenedorImagen = crearContenedorImagen(item);

        //Creamos la instancia de la imagen
        const imagen = crearImagen(item);

        //Añadimos la imagen al contenedor
        contenedorImagen.appendChild(imagen);

        //Añadimos el contenedor al cuerpo del modal
        modalBody.appendChild(contenedorImagen);
    });

    //Configuramos el cuerpo del modal
    $('#modal .modal-footer').html(``);

    //Llamamos a la función para disponer la alerta retardada
    alertaRetardada();
}

/**
 * Función para mostrar la alerta retardada y cuando finalice, disponer el modal
 */
function alertaRetardada() {
    console.log("Dentro de la alerta");
    //Creamos una variable para el conteo
    let timerInterval;

    Swal.fire({
        title: 'Loading',
        html: "Looking for images, please wait <b></b> milliseconds...",
        timer: 5000,
        allowOutsideClick: false,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
            }, 1000);
        },
        willClose: () => {
            clearInterval(timerInterval);
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            //Mostramos el modal
            $('#modal').modal('show');
        }
    });
}

/**
 * Función para crear una instancia de la imágen
 * @param {String} item Argumento que contiene el path de la imagen
 * @returns Devolvemos la instancia de la imagen
 */
function crearImagen(item) {
    //Creamos y configuramos la instancia de la imagen
    const image = document.createElement('img');
    image.src = item.path;
    image.style.width = '150px';
    image.style.height = '150px';
    image.style.objectFit = 'cover';
    image.style.border = '1px solid #ccc';
    image.style.borderRadius = '8px';

    //Añadimos la funcionalidad para cuando se pulse sobre la imagen
    image.addEventListener('click', () => {
        //Llamamos a la función para disponer la alerta
        mostrarAlertaMainImage(item.path);
    });

    //Devolvemos la instancia de la imagen
    return image;
}

/**
 * Función para disponer la alerta para añadir la imagen como principal
 * @param {String} path Argumento que contiene la ruta
 */
function mostrarAlertaMainImage(path) {
    //Almacenamos en una variable el nombre del fichero con la extensión
    const fileName = path.split('/').pop();

    //Configuramos la alerta
    Swal.fire({
        title: `Do you want to set ${fileName} as the main image of the best practise?`,
        showCancelButton: true,
        confirmButtonText: 'Yes',
    }).then((result) => {
        //En caso de que el usuario haya confirmado...
        if (result.isConfirmed) {
            //Llamamos a la función para añadir el registro en la tabla
            anyadirMainImage_anterior(path);
        }
    });
}

/**
 * Función para añadir la imagen principal desde una carga anterior
 * @param {String} path Argumento que contiene la ruta a la imágen
 */
function anyadirMainImage_anterior(path) {
    //Almacenamos en una variable el nombre y la extensión del fichero usando el argumento
    const fileName = path.split('/').pop();

    console.log("File name: ", fileName);

    //Preparamos la petición POST
    fetch(`/library/api/insertarMainImage_imagenAnterior/${document.getElementById('idBestPractise').value}/${fileName}`, {
        method: "POST"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que haya salido bien
            if (response.status === 201) {
                mostrarAlertaTimer("Main Image added");

                //En caso de que haya salido mal
            } else if (response.status === 501) {
                mostrarAlerta('Error', 'Unabled to add the Main Image', 'error');

                //En cualquier otro caso...
            } else {
                mostrarAlerta('Uncontrolloed Status', 'Contact the administrator', 'question');
            }
        });
}

/**
 * Función para crear una instancia de contenedor que contendrá la imagen
 * @returns Devolvemos el contenedor que contendrá la imagen
 */
function crearContenedorImagen() {
    //Creamos y configuramos la instancia del contenedor de la imagen
    const imagenContainer = document.createElement('div');
    imagenContainer.classList.add('image-container');
    imagenContainer.style.display = 'inline-block';
    imagenContainer.style.margin = '10px';
    imagenContainer.style.cursor = 'pointer';

    //Devolvemos la instancia del contenedor de la imagen
    return imagenContainer;
}

/**
 * EventListener to configure the method from the page
 */
document.addEventListener('DOMContentLoaded', function () {
    fillData();
});