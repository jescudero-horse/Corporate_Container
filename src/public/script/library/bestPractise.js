//Variable global para almacenar los datos originales
let original_data = [], animation_modal;

/**
 * Method to obtein the information from the "best_practise" table and rendering into the dataTable
 */
async function fetchData() {
    /**RETRIEVE THE BEST PRACTISE */
    try {
        //Call the method to obtein the information
        const response = await fetch('/library/api/getBestPractise');
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Store the information
        const data = await response.json();

        original_data = data;

        //Call the method to send and render the information
        renderCards(data);

    } catch (error) {
        console.error('Error no se han podido obtener/gestionar los datos de las buenas prácticas', error);
    }

    /**RETRIEVE THE NUMBER OF BEST PRACTISE */
    try {
        //Call the end point to retrieve the number of best practise
        const response = await fetch('/library/api/count/best_practise');
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Store the information
        const count_data = await response.json();

        //Store the count of the best practise into a hidden input
        document.getElementById('numberOfBestPractiase').value = count_data.count;

    } catch (error) {
        console.error('Error no se han podido obtener/gestionar el número de las buenas prácticas', error);
    }
}

/**
 * Función para renderizar las tarjetas
 * @param {Array} data Array con la información de las buenas prácticas
 */
function renderCards(data) {
    //Creamos una instancia del contenedor de las tarjetas
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML = '';

    console.log("Data: ", data)

    //Recorremos los datos obtenidos
    data.forEach(item => {
        //Almacenamos en una variable los tags separados por ";"
        const tags = item.keyword.split(';').filter(tag => tag.trim() !== '');

        //Creamos una tarjeta
        const card = document.createElement('div');

        //Aplicamos el estilo a la tarjeta
        card.className = 'new-card';

        //Añadimos el HTML al cuerpo a la tarjeta con la información de la buena práctica
        card.innerHTML = `
            <img src="${item.path}" alt="${item.title}" class="new-card-img">
            <div class="new-card-body">
                <h3 class="new-card-title" style="color: black">${item.title}</h3>
                <p class="new-card-text" hidden>${item.factory}</p>
                <p class="new-card-text" hidden>${item.metier}</p>
                <p class="new-card-text" hidden>${item.line}</p>
                <p class="new-card-text" hidden>${item.technology}</p>
                <p class="new-card-text" hidden>${item.category}</p>
                <p class="new-card-text" hidden>${item.categorization}</p>
                <a class="new-card-text" href="mailto:${item.owner}">${item.owner}</a>
                <p class="new-card-text" hidden>${item.userID}</p>
                <input type="text" class="form-control tags-input" data-tags='${JSON.stringify(tags)}' readonly>

                <hr><br><button class="new-card-button" onclick="obtenerInformacionDetallada('${item.id}')"><i class="bi bi-eye"></i></button>
            </div>
        `;

        //Añadimos la tarjeta al contenedor de las tarjetas
        cardContainer.appendChild(card);
    });

    //Llamamos a la función para inicializar Tagify
    setTimeout(() => {
        initializeTagify('.tags-input');
    }, 1000);
}

/**
 * Función para disponer la información detallada de la buena práctica dentro del modal
 * @param {int} id Argumento que contiene el ID de la buena práctica
 */
function obtenerInformacionDetallada(id) {
    //Preparamos la petición GET para obtener la información detallada de la buena práctica
    fetch(`/library/api/obtenerInformacionDetallada-bestPractica/${id}`, {
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
            console.log("Informacion detallada: ", data);

            //Llamamos al método para disponer la información detallada de la buena práctica en un modal
            disponerInformacionDetallada(data);
        })
}

/**
 * Función para disponer la información dentro del modal
 * @param {Array} data Argumento que contiene la información detallada de la buena práctica
 */
function disponerInformacionDetallada(data) {
    console.log("Data: ", data);
    //Almacenamos en variables las before y after images
    const before_images = data[0].before_images
        ? data[0].before_images.split(',')
        : ['/assets/library/no-image.png'];

    const after_images = data[0].after_images
        ? data[0].after_images.split(',')
        : ['/assets/library/no-image.png'];

    //Almacenamos la estructura HTML de las before images y after images
    const estructura_before_image = before_images.map((imgSrc) => `
        <li class="splide__slide">
            <img src="${imgSrc.trim()}" class="img-fluid">
        </li>
    `).join(''),

        estructura_after_image = after_images.map((imgSrc) => `
            <li class="splide__slide">
                <img src="${imgSrc.trim()}" class="img-fluid">
            </li>
        `).join('');

    //Almacenamos en una variable los tags
    const tags = data[0].keyword.split(';').filter(tag => tag.trim() !== '');

    //Configuramos el título del modal
    $('#modal .modal-title').text(data[0].title);

    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container">
            <table id="modal-table" class="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Factory</th>
                        <th>Metier</th>
                        <th>Line</th>
                        <th>Technology</th>
                        <th>Category</th>
                        <th>Categorization</th>
                        <th>Keywords</th>
                        <th>Owner</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${data[0].title}</td>
                        <td>${data[0].factory}</td>
                        <td>${data[0].metier}</td>
                        <td>${data[0].line}</td>
                        <td>${data[0].technology}</td>
                        <td>${data[0].category}</td>
                        <td>${data[0].categorization}</td>
                        <td><input type="text" class="form-control tags-input-informacionDetallada" data-tags='${JSON.stringify(tags)}' readonly></td>
                        <td><a href="mailto: ${data[0].owner}">${data[0].owner}</td>
                    </tr>
                </tbody>
            </table>
            <hr>
            <div class="row mt-3 align-items-start">
                <div class="col-md-4">
                    <h5>After images</h5>
                    <div id="splide-after-${data[0].id}" class="splide">
                        <div class="splide__track">
                            <ul class="splide__list">
                                ${estructura_after_image}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <h5>Before images</h5>
                    <div id="splide-before-${data[0].id}" class="splide">
                        <div class="splide__track">
                            <ul class="splide__list">
                                ${estructura_before_image}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <h5>Main image</h5>
                    <img src="${data[0].main_images || '/assets/library/no-image.png'}" alt="Main Image" class="img-fluid">
                </div>
            </div>
        </div>
    `);

    //Llamamos a la función para inicializar el campo Tagify
    initializeTagify('.tags-input-informacionDetallada');

    //Llamamos a la función para controlar el footer del modal
    controlarFooter(data[0].userID);

    //Aplicamos la funcionalidad para cuando se pulse sobre el botón de eliminar la buena práctica
    $('#deleteButtonMainModal').on('click', function () {
        //Llamamos a la función para configurar el botón de eliminar la buena práctica
        configurarBotonEliminar(data[0].id, data[0].title);
    })

    //Aplicamos la funcionalidad para cuando se pulse sobre el botón de visualizar la buena práctica
    $('#previewButton').on('click', function () {
        //Llamamos a la función para configurar el botón de visualizar la buena práctica
        configurarBotonPrevisualizar(data[0].id);
    });

    //Aplicamos la funcionalidad para cuando se pulse sobre el botón de actualizar la buena práctica
    $('#updateButton').on('click', function () {
        //Llamamos a la función para configurar el botón de actualizar la buena práctica
        configurarBotonActualizar(data[0].id);
    });

    //Aplicamos la funcionalidad para cuando se pulse sobre el botón de aplicar la buena práctica
    $('#applyBestPractise').on('click', function () {
        //Llamamos a la función para configurar el botón de aplicar la buena práctica
        configurarBotonAplicar(data[0].id, data[0].title);
    });

    //Aplicamos la funcionalidad para cuando el modal este abierto
    $('#modal').on('shown.bs.modal', function () {
        //Creamos asignamos la instancia de Horsito
        animation_modal = lottie.loadAnimation({
            container: document.getElementById('lottie-icon-container'),
            render: 'svg',
            loop: false,
            autoplay: false,
            path: '/animations/library/Asistente.json'
        });

        //Creamos una instancia del Horsito
        const button = document.getElementById('horsito_button_modalPrincipal');

        //Comprobamos  si el botón existe
        if (button) {
            //Aplicamos la funcionalidad para el contenedor de Lottie
            button.addEventListener('click', function () {
                console.log("Dentro de Horsito");
                //Establecemos la velocidad para el animador
                animation_modal.setSpeed(2);

                //Reproducimos la animación
                animation_modal.play();

                //Creamos una variable con las etapas
                const tourSteps = inicializarTourSteps_ModalPrincipal();

                //Esperamos a que la animación se complete y llamar al método
                animation_modal.addEventListener('complete', function () {
                    console.log("Animación terminada")

                    //Creamos una instancia de Driver.js
                    const driver = new Driver({
                        animate: true,
                        padding: 10,
                        allowClose: false,
                        opacity: 0,
                        stageBackground: 'transparent',
                    });

                    // Define los pasos del tour
                    driver.defineSteps(tourSteps);
                    driver.start();
                });
            });

        } else {
            console.warn('Element #horsito_button not found.');
        }
    });

    //Mostramos el modal
    $('#modal').modal('show');

    //Inicializamos los carruseles Splide
    new Splide(`#splide-before-${data[0].id}`, {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        gap: '1rem',
    }).mount();

    new Splide(`#splide-after-${data[0].id}`, {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        gap: '1rem',
    }).mount();
}

/**
 * Función para configurar la funcionalidad del botón de aplicar la buena práctica
 * @param {int} id Argumento que contiene el ID de la buena práctica
 * @param {String} titulo Argumento que contiene el título de la buena ráctica
 */
function configurarBotonAplicar(id, titulo) {
    //Ocultamos el modal principal
    $('#modal').modal('hide');

    console.log("Dentro del modal")

    //Configuramos el título del modal
    $('#bestPractiseModalForm .modal-title').text('Apply: ' + titulo);

    //Llamamos a la función para configurar el cuerpo del modal
    configurarModalAplicarBuenaPractica(id);

    //Configuramos la visibilidad del status
    $('#statusInput').on('change', function () {
        //En caso de que el status sea "Not applicable"
        if (this.value === "Not applicable") {
            //Mostramos el input de la razón
            $('#reasonDiv').show();

            //Habilitamos el campo de la razón
            $('#reasonInput').removeAttr('disabled');

            //Ocultamos el contenedor del presupuesto
            $('#budgetDiv').hide();

            //En cuaquier otro caso...
        } else {
            //Ocultamos el campo de la razón
            $('#reasonDiv').hide();

            //Quitamos el valor por defecto del campo de la razón
            $('#reasonInput').attr('disabled', 'true');

            //Mostramos el contenedor del presupuesto
            $('#budgetDiv').show();
        }
    });

    //Añadimos a Horsito en el footer
    $('#bestPractiseModalForm .modal-footer').html(`
        <button id="horsito_button_modalAplicarPractica" class="btn btn-outline-primary">
            <div id="lottie-icon-container"></div>
        </button>
    `);

    //Aplicamos la funcionalidad para cuando el modal este abierto
    $('#bestPractiseModalForm').on('shown.bs.modal', function () {
        //Creamos asignamos la instancia de Horsito
        animation_modal = lottie.loadAnimation({
            container: document.getElementById('lottie-icon-container'),
            render: 'svg',
            loop: false,
            autoplay: false,
            path: '/animations/library/Asistente.json'
        });

        //Creamos una instancia del Horsito
        const button = document.getElementById('horsito_button_modalAplicarPractica');

        //Comprobamos  si el botón existe
        if (button) {
            //Aplicamos la funcionalidad para el contenedor de Lottie
            button.addEventListener('click', function () {
                console.log("Dentro de Horsito");
                //Establecemos la velocidad para el animador
                animation_modal.setSpeed(2);

                //Reproducimos la animación
                animation_modal.play();

                //Creamos una variable con las etapas
                const tourSteps = inicializarTourSteps_ModalAplicarPractica();

                //Esperamos a que la animación se complete y llamar al método
                animation_modal.addEventListener('complete', function () {
                    console.log("Animación terminada")

                    //Creamos una instancia de Driver.js
                    const driver = new Driver({
                        animate: true,
                        padding: 10,
                        allowClose: false,
                        opacity: 0,
                        stageBackground: 'transparent',
                    });

                    // Define los pasos del tour
                    driver.defineSteps(tourSteps);
                    driver.start();
                });
            });

        } else {
            console.warn('Element #horsito_button not found.');
        }
    });

    //Mostramos el modal
    $('#bestPractiseModalForm').modal('show');
}

/**
 * Función para configurar el cuerpo del modal de aplicar la buena práctica
 */
function configurarModalAplicarBuenaPractica(id) {
    //Configuramos el cuerpo del modal
    $('#bestPractiseModalForm .modal-body').html(`
        <form id="applyBestPractiseForm" action="/library/api/applyBestPractise" method="POST" autocomplete="OFF" onsubmit="return validateForm(event)">
            <div class="container">
                <input type="text" id="idBestPractise" name="idBestPractise" value="${id}" hidden>

                <div class="input-group mb-3">
                    <label class="input-group-text" for="factoryLabel" id="factoryLabel">Factory</label>
                    <select class="form-select" id="factoryInput" name="factoryInput">
                        <option value="PFA">PFA</option>
                        <option value="Curitiba">Curitiba</option>
                        <option value="Motores">Motores</option>
                        <option value="Mioveni">Mioveni</option>
                        <option value="Bursa">Bursa</option>
                        <option value="Aveiro">Aveiro</option>
                        <option value="Sevilla">Sevilla</option>
                        <option value="CMC">CMC</option>
                    </select>
                </div>

                <div class="input-group mb-3">
                    <span class="input-group-text" id="statusLabel">State</span>
                    <select class="form-select" id="statusInput" name="statusInput">
                        <option value="I'm going to apply it">I'm going to apply it</option>
                        <option value="Not applicable">Not applicable</option>
                        <option value="I'm applying it">I'm applying it</option>
                    </select>
                </div>

                <div id="reasonDiv" class="input-group mb-3" style="display: none">
                    <label class="input-group-text" for="reasonLabel">Reason</label>

                    <select class="form-select" id="reasonInput" name="reasonInput">
                        <option value="Different technology">Different technology</option>
                        <option value="Different process">Different process</option>
                        <option value="End of life">End of life</option>
                    </select>
                </div>
                
                <div class="input-group mb-3">
                    <span class="input-group-text" id="estimatedDateILabel">Estimated Date</span>
                    <input type="date" id="estimatedDateInput" name="estimatedDateInput" class="form-control">
                </div>

                <div class="form-check form-switch" id="budgetDiv">
                    <label class="form-check-label" for="budgetForTheYearLabel">Included in the budget of the year</label>
                    <input class="form-check-input" type="checkbox" id="budgetForTheYear" name="budgetForTheYear">
                </div>

                <br>

                <button id="botonAplicarBuenaPractica" type="submit" class="btn btn-primary"><i class="bi bi-sliders"></i> Apply the best practise</button>
            </div>
        </form>
    `);
}

/**
 * Función para controlar los campos del formulario de aplicar una buena práctica
 * @param {*} event Argumento que contiene el control del formulario
 */
function validateForm(event) {
    /**Creamos la instancia de los valores de los campos */
    const factory = document.getElementById('factoryInput').value,
        status = document.getElementById('statusInput').value;

    //En caso de que haya algun campo vacio...
    if (factory === '' || status === '') {
        //Llamamos a la función para disponer la alerta
        mostrarAlerta('Oops...', 'You have to insert all the neccesary information', 'error');

        //Detenemos la proopagación
        event.preventDefault();

        //En cualquier otro caso...
    } else {
        //Configuramos y mostramos una alerta con cuenta atras
        Swal.fire({
            icon: 'success',
            title: 'Best practice has been applied',
            timer: 1500
        });

        //Ocultamos el modal
        ('#bestPractiseModalForm').modal('hide');

        //Paramos la propagación
        event.preventDefault();
    }
}

/**
 * Función para declarar los pasos que deberá de explicàr Horsito
 * @returns Devolvemos el array con los pasos
 */
function inicializarTourSteps_ModalPrincipal() {
    //Declaramos una variable que contenga los pasos para el asistente
    let tourSteps = [];

    //Añadimos los pasos
    tourSteps = [
        {
            element: '#modal-header',
            popover: {
                title: 'Title',
                description: "This is the title of the best practise",
                position: "auto"
            }
        },
        {
            element: '#modal-body',
            popover: {
                title: 'Information of the best practise',
                description: "In this section, you will be able to view the detailed information of the best practice, such as: the factory, métier, line, technology... and you will even be able to view the associated images.",
                position: "bottom"
            }
        },
        {
            element: '#modal-footer',
            popover: {
                title: "Operations bar",
                description: "In this section, you will be able to view much more detailed information about the best practice. You can apply the best practice to a factory, and even if you are the creator of the best practice, you will be able to delete or update it.",
                position: "auto"
            }
        }
    ]

    //Devolvemos los pasos
    return tourSteps;
}

/**
 * Función para obtener los pasos de como aplicar una buena práctica
 * @returns Array donde contendrá los pasos para expicar como aplicar la buena práctica
 */
function inicializarTourSteps_ModalAplicarPractica() {
    //Creamos el array que contendrá los pasos
    let tourSteps = [];

    //Añadimos los pasos
    tourSteps = [
        {
            element: '#factoryLabel',
            popover: {
                title: "Factory",
                description: "Here, you must select the factory where you want to apply the best practice.",
                position: "auto"
            }
        },
        {
            element: "#statusLabel",
            popover: {
                title: "Status",
                description: "Here, you must select the status of the best practice to apply: I will apply it, Not applicable, or I am applying it. If you select Not applicable, you will need to specify the reason.",
                position: "auto"
            }
        },
        {
            element: '#estimatedDateILabel',
            popover: {
                title: "Estimated Date",
                description: "In this field, you must set the estimated date to apply the best practice... if you're unsure, the field can be left blank.",
                position: "auto"
            }
        },
        {
            element: '#budgetDiv',
            popover: {
                title: "Budget of the year",
                description: "This switch should be toggled if the best practice is included in the year's budget.",
                position: "auto"
            }
        },
        {
            element: '#botonAplicarBuenaPractica',
            popover: {
                title: "Apply the best practise",
                description: "By clicking on the blue button, you will be applying the best practice.",
                position: "auto"
            }
        }
    ];

    //Devolvemos la variable
    return tourSteps;
}

/**
 * Función para disponer los botones del footer en función de si el usuario esta autenticado
 */
function controlarFooter(ipn) {
    //Creamos una instancia del input del IPN
    const ipn_usuario = document.getElementById('ipn');

    //En caso de que el usuario este autenticado...
    if (ipn === ipn_usuario.value) {
        //Añadimos los botones de control
        $('#modal .modal-footer').html(`
            <button id="horsito_button_modalPrincipal" class="btn btn-outline-primary">
                <div id="lottie-icon-container"></div>
            </button>
            <button type="button" id="previewButton" class="btn btn-dark"><i class="bi bi-eye-fill"></i> Preview information</button>
            <button type="button" id="applyBestPractise" data-bs-target="#bestPractiseModalForm" class="btn btn-light"><i class="bi bi-sliders"></i> Apply best practise</button>
            <button type="button" class="btn btn-outline-danger" data-bs-target="#modalConfirmDelete" data-bs-toggle="modal" id="deleteButtonMainModal"><i class="bi bi-trash3"></i> Delete</button>
            <button type="button" id="updateButton" class="btn btn-primary"><i class="bi bi-pen"></i> Update</button>
        `);

        //En cualquier otro caso dejamos los botones por defecto
    } else {
        $('#modal .modal-footer').html(`
            <button type="button" id="previewButton" class="btn btn-dark"><i class="bi bi-eye-fill"></i> Preview information</button>
        `);
    }
}

/**
 * Función para configurar la funcionalidad del botón de actualizar
 * @param {int} id Argumento que contiene el ID de la buena práctica
 */
function configurarBotonActualizar(id) {
    //Redirigimos la página al apartado de actualizar la buena práctica
    window.location.href = `/library/editBestPractise?data=${id}`;
}

/**
 * Función para configurar el boton de eliminar
 * @param {int} id Argumento que contiene el ID de la buena práctica
 * @param {String} titulo Argumento que contien el titulo de la buena práctica
 */
function configurarBotonEliminar(id, titulo) {
    //Configuramos el titulo del modal de confirmar
    $('#modalConfirmDelete .modal-title').text('Do you want to delete this source?');

    //Configuramos el cuerp del modal
    $('#modalConfirmDelete .modal-body').text(titulo);

    //Configure the buttons of the delete modal (footer buttons)
    $('#modalConfirmDelete .modal-footer').html(`
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="deleteRow">Confirm</button>
    `);

    //Configuramos la funcionalidad del botón de eliminar la buena práctica
    $('#deleteRow').on('click', function () {
        //Preparamos la petición DELETE
        fetch(`/library/api/delete-row/${id}/${"best_practise"}`, {
            method: 'DELETE'
        })
            //Controlamos la respuesta
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error deleting the record');
                }

                //Ocultamos el modal
                $('#modalConfirmDelete').modal('hide');

                //Llamamos a la función para disponer la alerta
                deleteElement("Item successfully deleted. Reloading page");
            })

            //Controlamos los errores
            .catch(error => {
                console.error('Error:', error);
            });
    });
}

/**
 * Función para configurar el botón de visualizar la buena práctica
 * @param {int} id Argumento que contiene el ID de la buena práctica
 */
function configurarBotonPrevisualizar(id) {
    //Redirigimos la página al apartado de visualizar la página y le enviamos el ID de la buena práctica
    window.location.href = `/library/previewBestPractise?data=${id}`;
}

/**
 * Method to display all the information into the dataTable
 * @param {*} data Variable that contain the best practise information
 */
function renderTable(data) {
    //Initialize the dataTable
    const table = $('#dataTable').DataTable();
    table.clear();

    //Hide the entities column
    table.column

    console.log("Datos de las buenas prácticas: ", data);

    //Iterate throw the data and display it into the dataTable
    data.forEach(item => {
        //Split the tags by ";"
        const tagsArray = item.keyword.split(';').filter(tag => tag.trim() !== '');

        //Variable to store the entities depending by thr factory
        let entite;

        //Create a switch to assign the differents entities for each factory
        switch (item.factory) {
            case 'PFA':
                entite = 'hpdc/casting_flujo';
                break;

            case 'Curitiba':
                entite = 'motor_mecanizado/motor_montaje/motor_flujo/hpdc/lpdc/casting_flujo';
                break;

            case 'Motores':
                entite = 'motor_mecanizado/motor_montaje/motor_flujo/hpdc/casting_flujo';
                break;

            case 'Mioveni':
                entite = 'caja_mecanizado/caja_montaje/caja_flujo/motor_mecanizado/motor_montaje/motor_flujo/hpdc/casting_flujo';
                break;

            case 'Bursa':
                entite = 'caja_mecanizado/caja_montaje/caja_flujo/casting_flujo';
                break;

            case 'Aveiro':
                entite = 'caja_mecanizado/caja_montaje/caja_flujo';
                break;

            case 'Sevilla':
                entite = 'caja_mecanizado/caja_montaje/caja_flujo';
                break;

            case 'CMC':
                entite = 'caja_mecanizado/caja_montaje/caja_flujo';
                break;
        }

        //Check if theres any after image
        if (item.path === "" || item.path === null) {
            item.path = "/assets/library/no-image.png";
        }

        //Store the images splited by ","
        const imagesPath = item.path.split(',');

        console.log("Image path: ", imagesPath)

        //Store the <li> element using for the splide element
        const images = imagesPath.map((imgSrc) => `
            <li class="splide__slide">
                <img src="${imgSrc.trim()}" class="img-fluid">
            </li>
        `).join('');

        //Create a row store the data of the best practise
        const rowData = [
            item.id,
            item.title,
            item.factory,
            item.metier,
            item.line,
            item.technology,
            item.category,
            item.categorization,
            `
                <input type="text" class="form-control tags-input" data-tags='${JSON.stringify(tagsArray)}' readonly>
            `,
            item.userID,
            entite,
            `<a href="mailto:${item.owner}">${item.owner}</a>`,
            `
            <div id="splide-${item.id}" class="splide">
                <div class="splide__track">
                    <ul class="splide__list">
                        ${images}
                    </ul>
                </div>
            </div>
            `
        ];

        //Add the row data
        table.row.add(rowData);
    });

    //Draw the dataTable
    table.draw();
}

/**
 * 
 * @param {String} selector Argumento que contiene el nombre del selector
 */
function initializeTagify(selector) {
    //Iteramos sobre los elementos que coinciden con el selector
    $(selector).each(function () {
        //Obtenemos los tags almacenados en el atributo 'data-tags'
        const dataTags = $(this).attr('data-tags');

        //Creamos una variable para almacenar los tags en formato JSON
        let tags = [];

        //Convertimos los tags en formato JSON y almacenarlos en la variable "tags"
        try {
            tags = JSON.parse(dataTags) || [];
        } catch (e) {
            console.error('Error parsing JSON for tags:', e);
        }

        //Creamos la configuración de Tagify
        const tagify = new Tagify(this, {
            whitelist: tags.map(tag => ({ value: tag })),
            readOnly: true,
            enforceWhitelist: true
        });

        //Aplicamos los tags
        tagify.addTags(tags);
    });
}

/**
 * Function to clear the filters
 */
function clearFilters() {
    window.location.reload();
}

/**
 * Function to retrieve the information using the name of the end point
 * @param {string} endPoint Argument that contain the name of the end point
 */
function callEndPoint(endPoint) {
    console.log("End point: ", endPoint)

    //Call the end point using the argument
    fetch(endPoint)
        .then(response => response.json())
        .then(data => {
            console.log("Datos obtenidos de la consulta: ", data);

            let groupedData;

            //Group the data by factories
            groupedData = data.reduce((acc, item) => {
                if (!acc[item.factory]) {
                    acc[item.factory] = [];
                }
                acc[item.factory].push(item);
                return acc;
            }, {});

            //Store the number of the best practise from the hidden input
            const numnberOfBestPractise = document.getElementById('numberOfBestPractiase').value;

            //Store the number of the best practise applied from the hidden input
            const numberOfBestPractiaseApplied = document.getElementById('numberOfBestPractiaseApplied').value;

            //Call the method to display the report into a modal
            generateReport(groupedData, numnberOfBestPractise, numberOfBestPractiaseApplied);
        });
}

/**
 * Función para configurar el modal del reporte
 */
function displayGenerateReportModal() {
    //Configure the title of the modal
    $('#modalReport .modal-title').text('Generate report KPI');

    //Configure the footer of the modal
    $('#modalReport .modal-footer').html(`
        <div class="input-group mb-3">
            <span class="input-group-text" id="entitieLabel">Categorie</span>
            <select class="form-select" id="entitieInput" name="entitieLabel">
                <optgroup label="Transmissions">
                    <option value="caja_mecanizado">Machining</option>
                    <option value="caja_montaje">Assembly</option>
                    <option value="caja_flujo">Flow</option>
                </optgroup>
                <optgroup label="Engine">
                    <option value="motor_mecanizado">Machining</option>
                    <option value="motor_montaje">Assembly</option>
                    <option value="motor_flujo">Flow</option>
                </optgroup>
                <optgroup label="Casting">
                    <option value="hpdc">HPDC</option>
                    <option value="lpdc">LPDC</option>
                    <option value="casting_flujo">Flow</option>
                </optgroup>
            </select>

            <button id="showReportButton" "type="button" class="btn btn-primary"><i class="bi bi-file-earmark-check"></i> Show report</button>
        </div>
    `);

    //Apply the funcionality for the show report button
    $('#showReportButton').on('click', function () {
        //Get the selected value from the <select>
        const entitieSelected = $('#entitieInput').val();

        console.log("Entidad seleccionada: ", entitieSelected);

        switch (entitieSelected) {
            case 'caja_mecanizado':
                //Call the method to use the end point
                callEndPoint('/library/api/getTransmission_machining');
                break;

            case 'caja_montaje':
                //Call the method to use the end point
                callEndPoint('/library/api/getTransmission_assembly');
                break;

            case 'caja_flujo':
                //Call the method to use the end point
                callEndPoint('/library/api/getTransmission_flow');
                break;

            case 'motor_mecanizado':
                //Call the method to use the end point
                callEndPoint('/library/api/getEngine_machining');
                break;

            case 'motor_montaje':
                //Call the method to use the end point
                callEndPoint('/library/api/getEngine_assembly');
                break;

            case 'motor_flujo':
                //Call the method to use the end point
                callEndPoint('/library/api/getEngine_flow');
                break;

            case 'hpdc':
                //Call the method to use the end point
                callEndPoint('/library/api/getCasting_hpdc');

            case 'lpdc':
                //Call the method to use the end point
                callEndPoint('/library/api/getCasting_lpdc');
                break;

            case 'casting_flujo':
                //Call the method to use the end point
                callEndPoint('/library/api/getCasting_flow');
                break;

            default:
                break;
        }
    });

    //Configure the body of the modal
    $('#modalReport .modal-body').html(``);

    //Show the modal
    $('#modalReport').modal('show');
}

/**
 * Function to generate the report
 * @param {array} groupedData Argument that contains the factories grouped
 * @param {int} numberOfBestPractise Argument that contains the number of best practises
 * @param {int} numberOfBestPractiaseApplied Argument that contains the number of applied best practises
 */
function generateReport(groupedData, numberOfBestPractise, numberOfBestPractiaseApplied) {
    //Variable to store the content of the modal
    let modalContent = '';

    //Variable to store the factory-specific applied best practices data
    let factoryAppliedData = {};

    //Variable to track pending requests
    let pendingRequests = Object.keys(groupedData).length;

    //Variable to store the reason numbers
    let reasonsData = {};

    //Iterate throw the agrouped factory
    Object.keys(groupedData).forEach(factory => {
        //Add the HTML content
        modalContent += `
            <h3>Factory: ${factory}</h3>
            <div class="container">
                <div style="display: flex;">
                    <div style="flex: 1;">
                        <canvas id="bestPractiseFrom_${factory}" style="display: block; box-sizing: border-box; height: 400px; width: 400px;"></canvas>
                    </div>
                    <div style="flex: 1;">
                        <canvas id="totalBestPractise_${factory}" style="display: block; box-sizing: border-box; height: 400px; width: 400px;"></canvas>
                    </div>
                    <div style="flex: 1;">
                        <canvas id="reasonsChart_${factory}" style="display: block; box-sizing: border-box; height: 400px; width: 400px;"></canvas>
                    </div>
                </div>
            </div>
        `;

        //Use AJAX to call the end point to obtein the number of best practise applied for each factory
        $.ajax({
            url: `/library/api/count/bestPractiseApplied/factory_applied/${factory}`,
            method: 'GET',
            success: function (response) {
                //Store the number of the best practise applied for each factory
                factoryAppliedData[factory] = response.count || 0;

                //Use AJAX to call the end point to obtein the reason for each factory and for eachd reason
                $.ajax({
                    url: `/library/api/countReason/${factory}`,
                    method: 'GET',
                    success: function (reasons) {
                        reasonsData[factory] = reasons;
                    },
                    error: function (err) {
                        console.error(`Error fetching reasons data for ${factory}:`, err);
                        reasonsData[factory] = { endOfLife: 0, differentTechnology: 0, differentProcess: 0 };
                    },
                    complete: function () {
                        //Disminish the number of the petitions
                        pendingRequests--;

                        //When all the petitios is over
                        if (pendingRequests === 0) {
                            //Insert the HTML content on the modal
                            $('#modalReport .modal-body').html(modalContent);

                            //Create the grapish on the modal
                            Object.keys(groupedData).forEach(factory => {
                                //Use the data of the best practise applied
                                const appliedPractices = factoryAppliedData[factory] || 0;
                                const remainingPractices = numberOfBestPractiaseApplied - appliedPractices;

                                console.log(`Graficando para la fábrica ${factory}: Aplicadas: ${appliedPractices}, Totales: ${numberOfBestPractiaseApplied}`);

                                /**Options for the first chart --> Number of best practise vs Number of the best practise per factory */
                                const ctx2 = document.getElementById(`totalBestPractise_${factory}`).getContext('2d');
                                new Chart(ctx2, {
                                    type: 'pie',
                                    data: {
                                        labels: ['Applied Best Practices', 'Remaining Best Practices'],
                                        datasets: [{
                                            label: 'Total Best Practices vs Applied',
                                            data: [appliedPractices, remainingPractices],
                                            backgroundColor: ['#ff6384', '#36a2eb'],
                                            borderColor: '#fff',
                                            borderWidth: 1
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: `Total best practise applied: ${numberOfBestPractiaseApplied}\nBest practise applied: ${appliedPractices}`,
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (tooltipItem) {
                                                        return tooltipItem.label + ': ' + tooltipItem.raw;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });

                                /**Options for the second chart --> Number of the best practise applied vs Number of the best practise applied per factory */
                                const ctx1 = document.getElementById(`bestPractiseFrom_${factory}`).getContext('2d');
                                new Chart(ctx1, {
                                    type: 'pie',
                                    data: {
                                        labels: ['Best Practices for Factory', 'Remaining Best Practices'],
                                        datasets: [{
                                            label: 'Number of Best Practices',
                                            data: [groupedData[factory].length, numberOfBestPractise - groupedData[factory].length],
                                            backgroundColor: ['#36a2eb', '#ff6384'],
                                            borderColor: '#fff',
                                            borderWidth: 1
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Total best practise:' + numberOfBestPractise + "\nBest practise created: " + groupedData[factory].length,
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (tooltipItem) {
                                                        return tooltipItem.label + ': ' + tooltipItem.raw;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });

                                /**Options for the third chart --> Number of not applied best practise (for each reason) poer factory */
                                const ctx3 = document.getElementById(`reasonsChart_${factory}`).getContext('2d');
                                new Chart(ctx3, {
                                    type: 'bar',
                                    data: {
                                        labels: ['End of Life', 'Different Technology', 'Different Process'],
                                        datasets: [{
                                            label: 'Reasons Count',
                                            data: [
                                                reasonsData[factory]?.endOfLife || 0,
                                                reasonsData[factory]?.differentTechnology || 0,
                                                reasonsData[factory]?.differentProcess || 0
                                            ],
                                            backgroundColor: ['#36a2eb', '#ff6384', '#ffcd56'],
                                            borderColor: '#fff',
                                            borderWidth: 1
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Best practise not applied: ' + (reasonsData[factory]?.endOfLife + reasonsData[factory]?.differentTechnology + reasonsData[factory]?.differentProcess),
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (tooltipItem) {
                                                        return tooltipItem.label + ': ' + tooltipItem.raw;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    }
                });
            },
            error: function (err) {
                console.error(`Error fetching data for ${factory}:`, err);
            }
        });
    });
}

/**
 * Función para aplicar los filtros
 */
function applyFilters() {
    //Filtros para las factorias
    const selectedFactories = Array.from(document.querySelectorAll('#factoryFilters .form-check-input'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    //Filtros para la categorización
    const selectedCategorizacion = Array.from(document.querySelectorAll('#categorizationFilter .form-check-input'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    //Filtros para las entidades
    const selectedEntities = Array.from(document.querySelectorAll('#entitiesFilter .form-check-input'))
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    //Almacenamos las buenas prácticas filtradas
    const filteredData = original_data.filter(item =>
        (selectedFactories.length === 0 || selectedFactories.includes(item.factory)) &&
        (selectedCategorizacion.length === 0 || selectedCategorizacion.includes(item.categorization)) &&
        (selectedEntities.length === 0 || selectedEntities.some(entity => item.category.includes(entity)))
    );

    //Llamamos a la función para disponer las buenas prácticas filtradas
    renderCards(filteredData);
}

/**
 * Function to configure the methods when the dataTable is render
 */
window.addEventListener('DOMContentLoaded', function () {
    //Llamamos a la función para para obtener la información
    fetchData();

    //Identify the tag input from the filters
    const tagInput = document.querySelector('#tags-input');

    //Instance the Tagify input
    const tagify = new Tagify(tagInput, {
        whitelist: [],
        enforceWhitelist: false,
        dropdown: {
            enabled: 0,
        }
    });

    /**
     * Función para filtrar tarjetas según las tags
     */
    function filterCardsByTags() {
        //Obtenemos las tags ingresadas por el usuario
        const selectedTags = tagify.value.map(tag => tag.value.trim().toLowerCase());

        //Obtenemos todas las tarjetas
        const cards = document.querySelectorAll('.new-card');

        //Iteramos sobre las tarjetas
        cards.forEach(card => {
            //Obtenemos los tags de la tarjeta desde el atributo data-tags
            const tags = JSON.parse(card.querySelector('input.tags-input').dataset.tags || '[]');

            //Normalizamos las tags (minúsculas y sin espacios extra)
            const normalizedTags = tags.map(tag => tag.trim().toLowerCase());

            //Verificamos si alguna tag seleccionada coincide con las tags de la tarjeta
            const matches = selectedTags.length === 0 || selectedTags.some(tag => normalizedTags.includes(tag));

            //Mostramos o cultamos las tarjeta según si coincide
            card.style.display = matches ? '' : 'none';
        });
    }

    //Creamos el evento de cambio para Tagify
    tagify.on('change', filterCardsByTags);

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