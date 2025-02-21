//Declaramos las variables globales
let ipn;

/**
 * Función asíncrona para obtener la información de la tabla Data Driven
 */
async function fetchData() {
    /**DATA DRIVEN */
    try {
        //Creamos una variable que llame al end point para obtener la informacion
        const response = await fetch('/library/api/getDataDriven');

        //Comprobamos la respuesta
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos en una variable los datos obtenidos
        const data = await response.json();

        //Llamamos a la función para renderizar la tabla
        renderTable(data);

    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

/**
 * Función para disponer la información obtenida dentro de la tabla
 * @param {*} data Argumento que contiene los datos del Data Driven
 */
function renderTable(data) {
    //Obtenemos una instancia de la taba
    const table = $('#dataTable').DataTable();

    //Limpiamos la tabla
    table.clear();

    //Iteramos por los datos obtenidos
    data.forEach(item => {
        //Almacenamos los datos obtenidos en un array 
        const rowData = [
            item.id,
            item.title,
            `
            <a href="mailto:${item.pilot}" target="_blank">${item.pilot}</a>
            `,
            item.external_scalability,
            `
            <div class="image-container" id="image-container-${item.id}">
                <img src="${item.path}" alt="Imagen de ${item.title}" class="image-element">
            </div>
            `,
            item.userID,
            item.status,
            item.plant
        ];

        console.log(rowData);

        //Añadimos la información usando el array con los datos
        table.row.add(rowData);
    });

    //Dibujamos la tabla
    table.draw();

    //Llamamos a la función para configurar los filtros
    configurarFiltros(table);
}

/**
 * Función para configurar los filtros para el apartado del Data Driven
 * @param {*} table Argumento que contiene una instancia de la tabla
 */
function configurarFiltros(table) {
    //Filtros por planta
    $('.plant-filter').on('change', function () {
        const selected = $('.plant-filter:checked').map(function () {
            return $(this).val();
        }).get();

        table.column(3).search(selected.join('|'), true, false).draw();
    });

    //Filtros por status
    $('#statusFilter input[type="checkbox"]').on('change', function () {
        const selected = $('#statusFilter input[type="checkbox"]:checked').map(function () {
            return $(this).val();
        }).get();

        table.column(6).search(selected.join('|'), true, false).draw();
    });

    // Filtros por la planta
    $('#pilotPlantContainer').on('change', '.pilotPlant', function () {
        const selected = $('#pilotPlantContainer input[type="checkbox"]:checked')
            .map(function () {
                return $(this).val();
            })
            .get();

        table.column(7).search(selected.join('|'), true, false).draw();
    });
}

/**
 * Función para configurar el DataTable
 */
function comprobarRol() {
    //Preparamos la solicitud GET para obtener el IPN
    fetch('/library/api/user-id', {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Almacenamos en la variable global el IPN
            ipn = data.userId;
            let table;

            //Comrpobamos el contenido de la variable
            if (ipn !== null || ipn !== '') {
                //Obtenemos una instancia del DataTable
                table = inicializarDataTable();
            }

            //Llamamos a la función para configurar la funcionalidad del DataTable
            aplicarFuncionalidad(table, ipn);
        })

        //Controlamos el error
        .catch((error) => {
            //Ocultamos las columnas
            $('#dataTable').DataTable({
                columnDefs: [
                    { targets: 0, visible: false },
                    { targets: 5, visible: false },
                    { targets: 6, visible: false },
                    { targets: 7, visible: false }
                ]
            });

            //Obtenemos la instancia del DataTable para el modo normal
            let table = inicializarDataTableModoNormal();

            //Llamamos a la función para configurar la funcionalidad del DataTable
            aplicarFuncionalidad(table, null);
        });
}

function inicializarDataTableModoNormal() {
    //En caso de que ya haya una instancia existente...
    if ($.fn.DataTable.isDataTable('#dataTable')) {
        //La eliminamos
        $('#dataTable').DataTable().destroy();
    }

    //Creamos una instancia del data table
    const table = $('#dataTable').DataTable({
        //Ocultamos las columnas que no nos interesan
        columnDefs: [
            { targets: 0, visible: false },
            { targets: 5, visible: false },
            { targets: 6, visible: false },
            { targets: 7, visible: false }
        ]
    });

    //Devolvemos la tabla
    return table;
}

/**
 * Función para inicializar el DataTable
 * @returns Devuelve la instancia del DataTable
 */
function inicializarDataTable() {
    //En caso de que ya haya una instancia existente...
    if ($.fn.DataTable.isDataTable('#dataTable')) {
        //La eliminamos
        $('#dataTable').DataTable().destroy();
    }

    //Creamos una instancia del data table 
    const table = $('#dataTable').DataTable({
        //Ocultamos las columnas que no nos interesan
        columnDefs: [
            { targets: 0, visible: false },
            { targets: 5, visible: false },
            { targets: 6, visible: false },
            { targets: 7, visible: false }
        ],

        //Habilitamos los botones de exportación
        dom: 'Bfrtip',

        //Establecemos los botones para añadir al drop down
        buttons: [
            //Botón de copiar al porta papeles
            {
                extend: 'copy',
                text: 'Copy to clipboard <i class="bi bi-clipboard2-data-fill"></i>',
                className: 'dropdown-item',
                exportOptions: {
                    modifier: {
                        selected: true
                    },
                    columns: [0, 1, 2, 3, 5, 6, 7]
                }
            },

            //Botón para exportar a fichero Excel
            {
                extend: 'excel',
                text: 'Export to Excel file <i class="bi bi-filetype-xlsx"></i>',
                className: 'dropdown-item',
                exportOptions: {
                    modifier: {
                        selected: true
                    },
                    columns: [0, 1, 2, 3, 5, 6, 7]
                }
            },

            //Botón para mostrar/ocultar columnas
            {
                extend: 'colvis',
                text: 'Show/Hide columns <i class="bi bi-eye"></i>',
                className: 'dropdown-item'
            },

            //Botón para ver la lista personal
            {
                text: 'View the personal list <i class="bi bi-list-ol"></i>',
                className: 'dropdown-item',
                action: function (e, dt, node, config) {
                    $('#dataTable').DataTable().column(5).search(ipn).draw();

                    //Llamamos a la función para mostrar el toast
                    mostrarToast();
                }
            }
        ]
    });

    //Agregamos los botones al drop down
    $('#dropdown').append(table.buttons().container());

    return table;
}

/**
 * Función para mostrar el toast
 */
function mostrarToast() {
    //Creamos una instancia del toast
    const toast = document.getElementById('liveToast');

    //Configuramos el cuerpo del toast
    $('#liveToast .toast-body').html(
        `
        <p>If you want to return to the normal list, make a clic on the "Return to normal list"<p>
        <button onclick="returnNormalList(5)" type="button" class="btn btn-primary btn-sm">Return to normal list</button>
    `
    );

    //Configuramos la cabecera del toast
    $('#liveToast .toast-header').html(
        `
        <img src="/assets/library/HORSE_FAVICON.ico" class="rounded me-2" style="width: 50px; height: 50px;">
        <strong class="me-auto">Digital Library</strong>
    `
    );

    //Configuramos el toast para que no se cierre de forma automática
    const toastBootstrap = new bootstrap.Toast(toast, {
        autohide: false
    });

    //Mostramos el toast
    toastBootstrap.show();
}

/**
 * Función para añadir la funcionalidad por cada fila
 * @param {*} table Instancia del DataTable
 */
function aplicarFuncionalidad(table, ipn) {
    //Aplicamos la funcionalidad por cada fila del DataTable
    table.on('click', 'tr', function () {
        //Almacenamos el ID del elemento
        var rowData = table.row(this).data();

        //Creamos un array con el index de las columnas seleccionabales
        var columnIndex = [0, 1, 1, 4];

        //Almacenamos en una variable el index de la columna actual
        var clickedColumnIndex = $(event.target).closest('td').index();

        //En caso de que el index pulsado este permitido...
        if (columnIndex.includes(clickedColumnIndex)) {
            //Llamamos a la función para obtener la información detallada
            obtenerInformacionDetallada(rowData, ipn);
        }
    });
}

/**
 * Función para obtener la información detallada
 * @param {Array} rowData Argumento que contiene la información básica del elemento
 * @param {String} ipn Aegumento que contiene el IPN de la persona
 */
function obtenerInformacionDetallada(rowData, ipn) {
    console.log("Dentro del informe detallado");
    //Preparamos la solictud GET para obtener la información detalla del Data Driven
    fetch(`/library/api/informacionDetallada-DataDriven/${rowData[0]}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que no este bien
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos obtenidos
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Llamamos a la función para disponer la información obtenida en el modal
            disponerInformacionDetallada(data, ipn);
        });
}

/**
 * Función para disponer la información obtenida en un modal
 * @param {Array} data Argumento que contiene la información detallada
 * @param {String} ipn Argumento que contiene el IPN de la persona que ha iniciado sesión
 */
function disponerInformacionDetallada(data, ipn) {
    //Creamos una variable para almacenar los datos obtenidos
    let rowData;

    //Iteramos por los datos obtenidos
    data.forEach(item => {
        rowData = [
            item.id,
            item.title,
            item.context,
            item.pilot,
            item.dataNeeded,
            item.standardsApplied,
            item.solution,
            item.scalability,
            item.plant,
            item.resources,
            item.saving,
            item.nextSteps,
            item.userID,
            item.main_image_path,
            item.secondary_image_path,
            item.status,
            item.implemented_date ? item.implemented_date.split('T')[0] : null,
            item.external_scalability
        ];
    });

    /**Almacenamos el listado de las ganancias, necesidades y siguientes pasos en un array separados por ";" */
    let savingList = rowData[10].split(';'),
        nextStepsList = rowData[11].split(';'),
        resourcesList = rowData[9].split(';');

    //Configuramos el título del modal
    $('#modal .modal-title').text(rowData[1]);

    console.log("RowData: ", rowData);

    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <table id="modal-table" class="table table-striped">
            <thread>
                <tr>
                    <th>Title</th>
                    <th>Context</th>
                    <th>Pilot</th>
                    <th>Pilot Plant</th>
                    <th>Data Needed</th>
                    <th>Standards Applied</th>
                    <th>Solution</th>
                    <th>Internal Scalability</th>
                    <th>External Scalability</th>
                    <th>Implementation Date</th>
                    <th>Status</th>
                </tr>
            </thread>

            <tbody>
                <tr>
                    <th>` + rowData[1] + `</th>
                    <th>` + rowData[2] + `</th>
                    <th>` + rowData[3] + `</th>
                    <th>` + rowData[6] + `</th>
                    <th>` + rowData[4] + `</th>
                    <th>` + rowData[5] + `</th>
                    <th>` + rowData[6] + `</th>
                    <th>` + rowData[7] + `</th>
                    <th>` + rowData[17] + `</th>
                    <th>` + rowData[16] + `</th>
                    <th>` + rowData[15] + `</th>
                </tr>
            </tbody>

        </table>

        <hr>

        <div class="row">
            <div class="col-md-4">
                <h5>Saving</h5>
                <ul>
                    ${savingList.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="col-md-4">
                <h5>Next Steps</h5>
                <ul>
                    ${nextStepsList.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="col-md-4">
                <h5>Resources</h5>
                <ul>
                    ${resourcesList.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>

        <hr>

        <div class="row mt-3">
            <div class="col-md-6">
                <h5>Main Image</h5>
                <img src="${rowData[13]}" alt="Main Image" class="img-fluid">
            </div>
            <div class="col-md-6">
                <h5>RoadMap and Deployment</h5>
                <img src="${rowData[14]}" alt="RoadMap and Deployment" class="img-fluid">
            </div>
        </div>
    `);

    //Comprobamos que el usuario sea el creado del elemento
    if (rowData[12] === ipn) {
        //Añadimos los botones de control en el footer
        $('#modal .modal-footer').html(`
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-outline-danger" data-bs-target="#modalConfirmDelete" data-bs-toggle="modal" id="deleteButtonMainModal"><i class="bi bi-trash-fill"></i> Delete</button>
            <button type="button" class="btn btn-primary" id="updateRow"><i class="bi bi-pencil-square"></i> Update</button>
        `);

        //En cualquier otro caso...
    } else {
        //Añadimos los botones básicos al footer
        $('#modal .modal-footer').html(`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`);
    }

    //Llamamos a la función para configurar el modal de cofneliminar
    configurarModalDelete(rowData);

    //Aplicamos la funcionalidad para el botón de actualizar
    $('#updateRow').on('click', function () {
        //Llamamos a la función para configurar el modal de actualizar
        configurarModalUpdate(rowData);
    });

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para preparar el modal de actualizar el elemento Data Driven
 * @param {Array} rowData Argumento que contiene todos los datos del Data Driven a actualizar
 */
function configurarModalUpdate(rowData) {
    //Cerramos el modal principal
    $('#modal').modal('hide');

    //Configuramos el titulo del modal
    $('#modalInformation .modal-title').text('Update element: ' + rowData[1]);

    //Configuramos el cuerpo del modal
    $('#modalInformation .modal-body').html(`
        <div class="container">
            ${createFloatingInput('title', 'Title', rowData[1])}
            ${createFloatingInput('context', 'Context', rowData[2])}
            ${createFloatingInput('pilot', 'Pilot', rowData[3])}
            ${createFloatingInput('dataNeeded', 'Data Needed', rowData[4])}
            ${createFloatingInput('standardsApplied', 'Standards Applied', rowData[5])}
            ${createFloatingInput('solution', 'Solution', rowData[6])}
            ${createFloatingInput('scalability', 'Internal Scalability', rowData[7])}

            <div class="form-floating">
                <select class="form-select" id="externalScalability" name="externalScalability" aria-label="External Scalability">
                    <option value="HLT" ${rowData[17] === 'HLT' ? 'selected' : ''}>HTL</option>
                    <option value="Motores" ${rowData[17] === 'Motores' ? 'selected' : ''}>Motores</option>
                    <option value="Sevilla" ${rowData[17] === 'Sevilla' ? 'selected' : ''}>Sevilla</option>
                    <option value="Aveiro" ${rowData[17] === 'Aveiro' ? 'selected' : ''}>Aveiro</option>
                    <option value="Oyak" ${rowData[17] === 'Oyak' ? 'selected' : ''}>Oyak</option>
                    <option value="Rumania" ${rowData[17] === 'Rumania' ? 'selected' : ''}>Rumania</option>
                    <option value="Curitiba" ${rowData[17] === 'Curitiba' ? 'selected' : ''}>Curitiba</option>
                    <option value="Los Andes" ${rowData[17] === 'Los Andes' ? 'selected' : ''}>Los Andes</option>
                    <option value="Argentina" ${rowData[17] === 'Argentina' ? 'selected' : ''}>Argentina</option>
                    <option value="All Horse" ${rowData[17] === 'All Horse' ? 'selected' : ''}>All Horse</option>
                </select>
                <label for="External Scalability" class="form-label" style="color: #6c757d;">External Scalability</label>
            </div>

            <br>

            <div class="form-floating">
                <select class="form-select" id="status" name="status" aria-label="Status" value="${rowData[15]}">
                    <option value="Backlock">Backlock</option>
                    <option value="In progress">In progress</option>
                    <option value="Finish">Finish</option>
                </select>
                <label for="status" class="form-label" style="color: #6c757d;">Status</label>
            </div>

            <br>

            <div class="input-group mb-3">
                <span class="input-group-text">Implementation Date</span>
                <input type="date" id="implementationDate" name="implementationDate" class="form-control" value="${rowData[16]}">
            </div>

            <div class="form-floating">
                <select class="form-select" id="plant" name="plant" aria-label="Plant">
                    <option value="HLT" ${rowData[8] === 'HLT' ? 'selected' : ''}>HTL</option>
                    <option value="Motores" ${rowData[8] === 'Motores' ? 'selected' : ''}>Motores</option>
                    <option value="Sevilla" ${rowData[8] === 'Sevilla' ? 'selected' : ''}>Sevilla</option>
                    <option value="Aveiro" ${rowData[8] === 'Aveiro' ? 'selected' : ''}>Aveiro</option>
                    <option value="Oyak" ${rowData[8] === 'Oyak' ? 'selected' : ''}>Oyak</option>
                    <option value="Rumania" ${rowData[8] === 'Rumania' ? 'selected' : ''}>Rumania</option>
                    <option value="Curitiba" ${rowData[8] === 'Curitiba' ? 'selected' : ''}>Curitiba</option>
                    <option value="Los Andes" ${rowData[8] === 'Los Andes' ? 'selected' : ''}>Los Andes</option>
                    <option value="Argentina" ${rowData[8] === 'Argentina' ? 'selected' : ''}>Argentina</option>
                </select>
                <label for="plant" class="form-label" style="color: #6c757d;">Pilot Plant</label>
            </div>
        </div> 

        <div class="row mt-3">
            <div class="col-md-6">
                <div class="d-flex justify-content-between align-items-center">
                    <h5>
                        Main Image 
                        <i class="bi bi-pen" 
                            onclick='actualizarImagen(${JSON.stringify(rowData[0])}, ${JSON.stringify(rowData[13])}, ${1})'
                            style="cursor: pointer; margin-left: 8px;" 
                            role="button" 
                            aria-label="Edit Main Image">
                        </i>
                    </h5>
                </div>
                <img src="${rowData[13]}" alt="Main Image" class="img-fluid">
            </div>
            <div class="col-md-6">
                <div class="d-flex justify-content-between align-items-center">
                    <h5>RoadMap and Deployment
                        <i class="bi bi-pen" 
                                onclick='actualizarImagen(${JSON.stringify(rowData[0])}, ${JSON.stringify(rowData[14])}, ${0})'
                                style="cursor: pointer; margin-left: 8px;" 
                                role="button" 
                                aria-label="Edit RoadMap and Deplayment image">
                        </i>
                    </h5>
                </div>
                <img src="${rowData[14]}" alt="RoadMap and Deployment" class="img-fluid">
            </div>
        </div>
    `);

    //Configuramos el footer del modal
    $('#modalInformation .modal-footer').html(`
        <button id="closeModalLarge" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
        <button class="btn btn-primary" onclick="actualizarInformacion(${rowData[0]})">Continue</button>
    `);

    //Mostramos el modal
    $('#modalInformation').modal('show');
}

/**
 * Función para actualizar la información básica del elemento Data Driven
 * @param {int} id Argumento que contiene el ID del elemento Data Driven
 */
function actualizarInformacion(id) {
    //Almacenamos en variables los elementos del modal
    const title = document.getElementById('title').value,
        context = document.getElementById('context').value,
        pilot = document.getElementById('pilot').value,
        dataNeeded = document.getElementById('dataNeeded').value,
        standardsApplied = document.getElementById('standardsApplied').value,
        solution = document.getElementById('solution').value,
        scalability = document.getElementById('scalability').value,
        plant = document.getElementById('plant').value;

    externalScalability = document.getElementById('externalScalability').value,
        implementationDate = document.getElementById('implementationDate').value,
        status_value = document.getElementById('status').value;

    //Preparamos la petición POST para actualizar la información del Data Driven
    fetch(`/library/api/actualizarInformacion-DataDriven/${id}/${title}/${context}/${pilot}/${dataNeeded}/${standardsApplied}/${solution}/${scalability}/${plant}/${externalScalability}/${implementationDate}/${status_value}`, {
        method: "POST"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de todo haya salido bien
            if (response.status === 201) {
                mostrarAlerta_Recarga('Item successfully updated');

                //En caso de que haya fallado
            } else if (response.stgarus === 501) {
                mostrarAlerta('Error', 'All fields must be filled in', 'error');

                //En cualquier otro caso
            } else {
                mostrarAlerta('Exception', 'Unable to control response', 'question');

            }
        });
}

/**
 * Función para disponer el modal para actualizar la imagen
 * @param {int} id Aregumento que contiene el ID del Data Driven
 * @param {String} path Argumento que contiene el path al fichero
 */
function actualizarImagen(id, path, mainImage) {
    //Cerramos el modal principal
    $('#modalInformation').modal('hide');

    //Configuramos el titulo del modal
    $('#modal .modal-title').text('Upload a new file');

    //Preparamos la solicitud POST para actualizar el ID del Data Driven
    fetch(`/library/api/setId-DataDriven/${id}`, {
        method: "POST"
    });

    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <form id="addFiles" action="/library/api/upload-file-dataDriven/${id}/${encodeURIComponent(path)}/${mainImage}" method="POST"
            enctype="multipart/form-data">
    
            <div class="mb-3">
                <input class="form-control" type="file" id="files" name="files" accept=".png, .jpg, .jpeg" required>
            </div>
    
            <button type="submit" class="btn btn-primary" onclick="mostrarAlerta_Recarga('Updated image')">Continue</button>
        </form>
    `);

    //Configuramos el footer del modal
    $('#modal .modal-footer').html(`
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    `);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para preparar el modal de confirmar la eliminación del Data Driven
 * @param {Array} rowData Argumento que contiene todos los datos del Data Driven a eliminar
 */
function configurarModalDelete(rowData) {
    //Configuramos el titulo del modal
    $('#modalConfirmDelete .modal-title').text('Do you want to delete this source?');

    //Configuramos el cuerpo del modal
    $('#modalConfirmDelete .modal-body').text(rowData[1]);

    //Configuramos el botón de confirmar la descarga
    $('#deleteRow').on('click', function () {
        //Preparamos la solicitud DELETE para eliminar el registro de la base de datos y de las imagenes
        fetch(`/library/api/delete-row-dataDriven/${rowData[0]}`, {
            method: "DELETE"
        })
            //Controlamos la respuesta
            .then(response => {
                //En caso de que todo haya salido bien
                if (response.status === 200) {
                    //Llamamos a la función para recargar la página
                    mostrarAlerta_Recarga('Item successfully deleted');

                    //En caso de que algo haya salido mal
                } else if (response.status === 501) {
                    //Llamamos a la función para disponer una alerta
                    mostrarAlerta('Error', 'No se puedo eliminar el elemento', 'error');
                }
            });
    });
}

/**
 * Función para mostrar la alerta que recargue la página
 * @param {String} titulo Argumento que contiene el titulo de la alerta
 */
function mostrarAlerta_Recarga(titulo) {
    //Declaramos una variable para la cuenta atras
    let timerInterval;

    //Configuramos la alerta
    Swal.fire({
        title: titulo,
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
 * Función para mostrar el modal de añadir información en la categoría Data Driven
 */
function anyadirInformacionModal() {
    //Configuramos el título del modal
    $('#modal .modal-title').text("Add the Data Driven");

    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container">
            ${createFloatingInput('title', 'Title', null)}
            ${createFloatingInput('context', 'Context', null)}
            ${createFloatingInput('pilot', 'Pilot', null)}
            ${createInputWithList('resourcesNeeded', 'Resources Needed')}<hr>
            ${createFloatingInput('dataNeeded', 'Data Needed', null)}
            ${createFloatingInput('standardsApplied', 'Standards Applied', null)}
            ${createFloatingInput('solution', 'Solution', null)}
            ${createInputWithList('savings', 'Savings')}<hr>
            ${createInputWithList('nextSteps', 'Next Steps')}<hr>
            ${createFloatingInput('scalability', 'Internal Scalability', null)}

            <br>

            <div class="form-floating">
                <select class="form-select" id="externalScalability" name="externalScalability" aria-label="Plant">
                    <option value="HLT">HTL</option>
                    <option value="Motores">Motores</option>
                    <option value="Sevilla">Sevilla</option>
                    <option value="Aveiro">Aveiro</option>
                    <option value="Oyak">Oyak</option>
                    <option value="Rumania">Rumania</option>
                    <option value="Curitiba">Curitiba</option>
                    <option value="Los Andes">Los Andes</option>
                    <option value="Argentina">Argentina</option>
                    <option value="All Horse">All Horse</option>
                </select>
                <label for="externalScalability" class="form-label" style="color: #6c757d;">External Scalability</label>
            </div>

            <br>

            <div class="input-group mb-3">
                <span class="input-group-text">Implementation Date</span>
                <input type="date" id="implementationDate" name="implementationDate" class="form-control">
            </div>

            <br>

            <div class="form-floating">
                <select class="form-select" id="status" name="status" aria-label="Status">
                    <option value="Backlock">Backlock</option>
                    <option value="In progress">In progress</option>
                    <option value="Finish">Finish</option>
                </select>
                <label for="status" class="form-label" style="color: #6c757d;">Status</label>
            </div>

            <br>

            <div class="form-floating">
                <select class="form-select" id="plant" name="plant" aria-label="Plant">
                    <option value="HLT">HTL</option>
                    <option value="Motores">Motores</option>
                    <option value="Sevilla">Sevilla</option>
                    <option value="Aveiro">Aveiro</option>
                    <option value="Oyak">Oyak</option>
                    <option value="Rumania">Rumania</option>
                    <option value="Curitiba">Curitiba</option>
                    <option value="Los Andes">Los Andes</option>
                    <option value="Argentina">Argentina</option>
                </select>
                <label for="plant" class="form-label" style="color: #6c757d;">Pilot Plant</label>
            </div>
        </div>
    `);

    //Agregamos lógica para manejar listas dinámicas
    handleDynamicList('resourcesNeeded');
    handleDynamicList('savings');
    handleDynamicList('nextSteps');

    //Configuramos el footer del modal 
    $('#modal .modal-footer').html(`
        <button class="btn btn-primary" onclick="checkInformation()">Add information</button>
        <button id="closeModalLarge" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
    `);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para crear un campo flotante
 * @param {String} id Argumento que contiene el ID
 * @param {String} label Argumento que contiene el nombre del place holder
 * @param {String} value Argumento que contiene el valor por defecto
 * @returns Devuelve el campo
 */
function createFloatingInput(id, label, value) {
    //En caso de que el valor este vacio
    if (value === null) {
        //Vaciamos el argumento
        value = "";
    }

    return `
        <div class="mb-3 form-floating">
            <input type="text" class="form-control" id="${id}" name="${id}" placeholder="${label}" value="${value}">
            <label for="${id}" class="form-label" style="color: #6c757d;">${label}</label>
        </div>
    `;
}

/**
 * Función para crear el campo para añadir elementos
 * @param {string} id - ID del grupo de entrada.
 * @param {string} label - Etiqueta para el grupo.
 * @returns {string} - HTML del grupo con lista.
 */
function createInputWithList(id, label) {
    return `
        <div class="mb-3">
            <label for="${id}Input" class="form-label" style="color: #6c757d;">${label}</label>
            <div class="input-group">
                <input type="text" class="form-control" id="${id}Input" placeholder="Enter an item">
                <button class="btn btn-primary" id="${id}AddButton" type="button">Add</button>
            </div>
        </div>
        <ul class="list-group" id="${id}List"></ul>
    `;
}

/**
 * Función para agregar los elementos a la listas dinámicas
 * @param {string} id - ID del grupo de lista.
 */
function handleDynamicList(id) {
    //Agregamos los elementos a la lista
    $(`#${id}AddButton`).on('click', function () {
        const inputValue = $(`#${id}Input`).val().trim();
        if (inputValue) {
            $(`#${id}List`).append(createListItem(inputValue));
            $(`#${id}Input`).val('');
        }
    });

    //Añadimos la funcionalidad con el Enter
    $(`#${id}Input`).on('keypress', function (e) {
        if (e.which === 13) {
            $(`#${id}AddButton`).click();
        }
    });

    //Aplicamos la funcionalidad para poder eliminar los elementos de la lista
    $(`#${id}List`).on('click', '.deleteItemButton', function () {
        $(this).closest('li').remove();
    });
}

/**
 * Función para disponer los elementos en la lista junto al botón de eliminar el registro
 * @param {string} text - Texto del elemento de lista.
 * @returns {string} - HTML del elemento de lista.
 */
function createListItem(text) {
    return `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${text}
            <button class="btn btn-danger btn-sm deleteItemButton"><i class="bi bi-trash3"></i></button>
        </li>
    `;
}

/**
 * Función para obtener los items de una lista separados por ";"
 * @param {*} listId Argumento que contiene el ID de la lista
 * @returns Devuelve los items de la lista separados por ";"
 */
function getListValues(listId) {
    const items = [];
    $(`#${listId} li`).each(function () {
        items.push($(this).text().trim());
    });
    return items.join(';');
}

/**
 * Función para añadir la información a la tabla
 */
function checkInformation() {
    /**Obtenemos la instancia de todos los campos */
    const title = document.getElementById('title').value,
        context = document.getElementById('context').value,
        pilot = document.getElementById('pilot').value,
        dataNeeded = document.getElementById('dataNeeded').value,
        standardsApplied = document.getElementById('standardsApplied').value,
        solution = document.getElementById('solution').value,
        scalability = document.getElementById('scalability').value,
        plant = document.getElementById('plant').value

    externaScalability = document.getElementById('externalScalability').value,
        implementationDate = document.getElementById('implementationDate').value,
        status_input = document.getElementById('status').value;

    console.log("External: ", externaScalability, "\tImplementdation date: ", implementationDate, "\tStatus: ", status_input);

    /**Almacenamos la información de las listas en variables separados por ";" */
    const resourcesNeeded = getListValues('resourcesNeededList');
    const savings = getListValues('savingsList');
    const nextSteps = getListValues('nextStepsList');

    //Almacenamos en una variable los campos almacenados
    const fields = [
        { value: title, name: 'Title' },
        { value: context, name: 'Context' },
        { value: pilot, name: 'Pilot' },
        { value: dataNeeded, name: 'Data Needed' },
        { value: standardsApplied, name: 'Standards Applied' },
        { value: solution, name: 'Solution' },
        { value: scalability, name: 'Scalability' },
        { value: plant, name: 'Plant/Function' },
        { value: resourcesNeeded, name: 'Resources Needed (list)' },
        { value: savings, name: 'Savings (list)' },
        { value: nextSteps, name: 'Next Steps (list)' },
        { value: externaScalability, name: 'External Scalability' },
        { value: implementationDate, name: 'Implementation Date' },
        { value: status_input, name: 'Status' }
    ];

    //Creamos una variable para comprobar si todos los campos estan rellenos
    let isValid = true;

    //Iteramos por los campos
    fields.forEach(item => {
        if (!item.value) {
            isValid = false;
        }
    });

    //En caso de que haya un campo vacio....
    if (!isValid) {
        //Llamamos a la función para disponer
        mostrarAlerta('Error', 'All fields must be filled in', 'error');
        return;

        //En cuaquier otro caso...
    } else {
        //Llamamos a la función para procesar los datos obtenidos
        addInformation(fields);
    }
}

/**
 * Función para utilizar el end point para añadir la información básica del end point
 * @param {*} data Argumento que contiene los datos del Data Driven
 */
function addInformation(data) {
    console.log(">>> DATA: ", data);

    /**Crear una instancia de los objetos */
    const [titleObj, contextObj, pilotObj, dataNeededObj, standardsAppliedObj, solutionObj, scalabilityObj, plantObj, resourcesObj, savingObj, nextStepsObj, externalScalabilityObj, implementationDateObj, statusObj] = data;

    /**Almacenar la información del array que contiene los datos */
    const title = titleObj.value;
    const context = contextObj.value;
    const pilot = pilotObj.value;
    const dataNeeded = dataNeededObj.value;
    const standardsApplied = standardsAppliedObj.value;
    const solution = solutionObj.value;
    const scalability = scalabilityObj.value;
    const plant = plantObj.value;
    const resources = resourcesObj.value;
    const saving = savingObj.value;
    const nextSteps = nextStepsObj.value;

    const externalScalability = externalScalabilityObj.value;
    const implementationDate = implementationDateObj.value;
    const status = statusObj.value;

    console.log("> External Scalability: ", externalScalability);

    //Preparamos la solicitud POST para añadir la información a la base de datos
    fetch(`/library/api/insert-data-dataDriven/${encodeURIComponent(title)}/${encodeURIComponent(context)}/${encodeURIComponent(pilot)}/${encodeURIComponent(dataNeeded)}/${encodeURIComponent(standardsApplied)}/${encodeURIComponent(solution)}/${encodeURIComponent(scalability)}/${encodeURIComponent(plant)}/${encodeURIComponent(resources)}/${encodeURIComponent(saving)}/${encodeURIComponent(nextSteps)}/${encodeURIComponent(externalScalability)}/${encodeURIComponent(implementationDate)}/${encodeURIComponent(status)}`, {
        method: "POST"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que todo haya salido bien
            if (response.status === 201) {
                //Cerramos el modal principal
                $('#modal').modal('hide');

                //Llamamos a la función para mostrar el modal para adjuntar los ficheros
                anyadirFicherosModal();

                //En caso de que haya fallado
            } else if (response.status === 501) {
                mostrarAlerta('Error', 'Error when adding Data Driven', 'error');

                //En cualquier otro caso...
            } else {
                mostrarAlerta('Uncontrolled State', 'Uncontrolled state when adding information', 'question');
            }
        });
}

/**
 * Función para disponer el modal para que los usuarios puedan adjuntar los ficheros 
 */
function anyadirFicherosModal() {
    //Configuramos el titulo del modal
    $('#modalInformation .modal-title').text('Share the files');

    //Configuramos el cuerpo del modal
    $('#modalInformation .modal-body').html(`
        <div class="container">
            <h3>Share the principal image (.png, .jpg)</h3>
            <form id="addFiles" action="/library/api/insertDataDriven-files/${0}" method="POST"
                enctype="multipart/form-data">

                <div class="mb-3">
                    <input class="form-control" type="file" id="file" name="file" accept=".png, .jpg, .jpeg" required>
                </div>

                <button type="submit" class="btn btn-primary">Continue</button>
            </form><hr>

            <h3>Share the roadmap and deployment image (.png, .jpg)</h3>
            <form id="addFiles" action="/library/api/insertDataDriven-files/${1}" method="POST"
                enctype="multipart/form-data">

                <div class="mb-3">
                    <input class="form-control" type="file" id="file" name="file" accept=".png, .jpg, .jpeg" required>
                </div>

                <button type="submit" class="btn btn-primary">Continue</button>
            </form>
        </div>
    `);

    //Configuramos el modal
    $('#modalInformation').modal({
        backdrop: 'static',
        keyboard: false
    });

    //Configuramos el footer del modal
    $('#modalInformation .modal-footer').html(`
        <button type="button" class="btn btn-secondary" onclick="comprobarFicheros()">Close</button>
    `);

    //Mostramos el modal
    $('#modalInformation').modal('show');
}

function comprobarFicheros() {
    //Preparamos la petición GET para comprobar si han adjuntado los ficheros
    fetch('/library/api/comprobarFicheros-dataDriven', {
        method: "GET"
    })
        //Controlamos la repuesta
        .then(response => {
            //En caso de que haya salido mal
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //En caso de que haya dos o más registros....
            if (data.count >= 2) {
                //Recargamos la página
                mostrarAlerta_Recarga('Successfully added data');

                //En cualquier otro caso...
            } else {
                //Mostramos el mensaje de error
                mostrarAlerta('Error', 'You must attach the sources', 'error');
            }

        });
}

/**
 * Añadimos la funcionalidad para cuando la página haya terminado de cargar
 */
window.addEventListener('DOMContentLoaded', function () {
    //Llamamos a la función para obtener los datos y disponerlos en la tabla
    fetchData();

    //Llamamos a la función para configurar el DataTable
    comprobarRol()

    //Ocultamos a Horsito
    this.document.getElementById('lottie-container').setAttribute('hidden', true);
});