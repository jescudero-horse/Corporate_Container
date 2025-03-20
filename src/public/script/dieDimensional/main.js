//Variables globales
let planta_global;

/**
 * Función para controlar la respuesta
 * @param {*} response Argumento que contiene la respuesta del backend
 */
function controlarRespuestaComentario(response) {
    //En caso de que haya salido bien
    if (response.status === 201) {
        mostrarAlerta("Comentário adicionado com sucesso", null, null, 1);

        //En caso de que haya salido mal
    } else if (response.status === 501) {
        mostrarAlerta("Erro ao adicionar o comentário", "Ocorreu um erro ao adicionar o comentário", "error", 0);

        //En cualquier otro caso...
    } else {
        mostrarAlerta("Estado não controlado", "Não foi possível controlar o estado", "question", null);
    }
}

/**
 * Función para mostrar la alerta
 * @param {String} titulo Argumento que contiene el titulo de la alerta
 * @param {String} mensaje Argumento que contiene el mensaje de la alerta
 * @param {String} icono Argumento que contiene el nombre del icono
 * @param {int} opcion Argumento que contiene la opción de configuración de la alerta
 */
function mostrarAlerta(titulo, mensaje, icono, opcion) {
    //Controlamos la creación de la alerta usando el argumento "opcion"
    if (opcion === 1) {
        //Creamos una variable para configurar el timer
        let timerInterval;

        //Configuramos la alerta
        Swal.fire({
            title: titulo,
            html: "Recargando página, por favor espere <b></b> milliseconds...",
            timer: 500,
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

            //Cuando el timer haga su cuenta atras
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                //Recargammos la página
                window.location.reload();
            }
        });

        //En caso de que el valor de opcion sea 0 o null
    } else if (opcion == 0 || opcion === null) {
        Swal.fire({
            icon: icono,
            title: titulo,
            text: mensaje
        });
    }
}

/**
 * Función para disponer la información básica en los campos
 * @param {Array} data 
 */
function disponerInformacionCampos(data) {
    //Asignamos la información dentro de los campos
    document.getElementById('fecha_creacion_reporte').value = data[0].fecha_registro.split("T")[0];
    document.getElementById('pieza_medida').value = data[0].datamatrix;
    document.getElementById('tipo_molde').value = data[0].tipo_pieza;
    document.getElementById('molde').value = data[0].molde;
    document.getElementById('comentarios').value = data[0].comentario;
}

/**
 * Función para disponer la información del listado de no conformidades - PREMECANIZADO
 * @param {Array} data Argumento que contiene los datos para el listado de no conformidades
 */
function renderizarTablaAlertaMolde(data, planta) {
    //Creamos uns instancia del dt
    const table = $('#dataTable').DataTable({
        paging: false
    });
    table.clear();

    //Almacenamos la planta en la variable global
    planta_global = planta;

    //Iteramos por los datos obtenidos
    data.forEach(item => {
        //Almacenamos los datos que necesitamos
        const rowData = [
            item.caracteristica,
            item.descripcion,
            item.valor_exceed === 1
                ? `<button onclick="(function(){ mostrarInforme(${id}, ${item.id_listado_caracteristica}, '${planta}'); })()"><i class="bi bi-check-circle"></i></button>`
                : `<button onclick="(function(){ mostrarInforme(${id}, ${item.id_listado_caracteristica}, '${planta}'); })()"><i class="bi bi-exclamation-triangle-fill"></i></button>`
        ];

        //Añadimos los datos a la fila del dt
        table.row.add(rowData);
    });

    //Dibujamos el dt
    table.draw();
}

/**
 * Función para obtener la información del informe detallado 
 * @param {int} id Argumento que contiene el ID de la no conformidad
 * @param {int} id_caracteristica Argumento qur contiene el ID de la caracteristica
 */
function mostrarInforme(id, id_caracteristica, planta) {
    //Preparamos la petición GET
    fetch(`/dieDimensional/api/obtener-informacion-detallada-premecanizado/${id}/${id_caracteristica}/${planta}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que no haya salido bien
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos obtenidos
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Creamos un switch para controlar el tipo de caracteristica
            switch (data[0].tipo_caracteristica) {
                //En caso de que sea "1"
                case '1':
                    //Llamamos a la función para configurar el respectivo modal
                    configurarModalPlanitud1(data);
                    break;

                //En caso de que sea '2'
                case '2':
                    //Llammos a la función para configura el respectivo modal
                    obtenerCorrespondenciaEntreTaladros(data, planta);
                    break;

                //En caso de que sea "3"
                case '3':
                    //Llamamos a la función parar configurar el respectivo modal
                    configurarModalCorrespondenciaEntreTaladros2(data, planta);
                    break;

                default:
                    break;
            }
        });
}

/**
 * Función para disponer la información dentro de un modal
 * @param {Array} data Array que contiene los datos para disponer la información de la alerta
 */
async function configurarModalPlanitud1(data) {
    //Creamos una variable para almacenar el idioma
    let translation = await fetchIdioma('rumania');

    //Configuramos el titulo del modal
    $('#modalInformation .modal-title').text('');

    //Añadimos un control para el valor excedido... en caso de que el valor excedido sea 0
    if (data[0].valor_exceed === 0) {
        //Configuramos el cuerpo del modal
        $('#modalInformation .modal-body').html(`
            <div class="container">
                <div class="row mb-3">
                    <!-- CARACTERISTICA A TRATAR -->
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text">${translation.caracteristica_a_tratar_normal}</span>
                            <input type="text" id="caracteristica_a_tratar" name="caracteristica_a_tratar" class="form-control" disabled value="${data[0].paralelismo}">
                        </div>
                    </div>
    
                    <!-- DESCRIPCION -->
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text">${translation.descripcion_normal}</span>
                            <input type="text" id="descripcion" name="descripcion" class="form-control" disabled value="${data[0].descripcion}">
                        </div>
                    </div>
                </div>
    
                <!--MENSAJE FINAL-->
                <div class="text-field-bad">
                    <i class="bi bi-exclamation-diamond-fill"> ${translation.caracteristica_fuera_de_limites} <br> ${translation.avisar_a_mantenimiento} </i>
                </div>
            </div>
        `);
    } else {
        //Configuramos el cuerpo del modal
        $('#modalInformation .modal-body').html(`
            <div class="container">
                <div class="row mb-3">
                    <!-- CARACTERISTICA A TRATAR -->
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text">Characteristic to treat</span>
                            <input type="text" id="caracteristica_a_tratar" name="caracteristica_a_tratar" class="form-control" disabled value="${data[0].paralelismo}">
                        </div>
                    </div>

                    <!-- DESCRIPCION -->
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text">Description</span>
                            <input type="text" id="descripcion" name="descripcion" class="form-control" disabled value="${data[0].descripcion}">
                        </div>
                    </div>
                </div>

                <!--MENSAJE FINAL-->
                <div class="text-field-good">
                    CHARACTERISTICS WITHIN LIMITS
                </div>
            </div>
        `);
    }

    //Configuramos el footer del modal
    $('#modalInformation .modal-footer').html(``);

    //Mostramos el modal
    $('#modalInformation').modal('show');
}

/**
 * Funció para confifurar la petición GET para obtener lo datos de la correspondencia entre taladros
 * @param {Array} data Array que contiene los datos básicos de la no conformidad
 */
async function obtenerCorrespondenciaEntreTaladros(data) {
    //Creamos una variable para almacenar el idioma
    //let translation = await obtenerIdioma();

    //Preparamos la petición GET para obtener la correspondencia entre taladros
    fetch(`/dieDimensional/api/obtener-correspondencia-entre-taladros/${id}/${data[0].tipo_caracteristica}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que no haya salido bien
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos
            return response.json();
        })

        //Controlamos los datos 
        .then(correspondencia_taladros => {
            console.log("Correspondencia entre taladros: ", correspondencia_taladros);

            //Llamamos a la función para disponer la información en el modal
            configurarModalCorrespondenciaEntreTaladros(correspondencia_taladros, data, planta);
        });
}

/**
 * Función para disponer la información entre taladros 
 * @param {Array} data Argumento que contiene los datos
 */
async function configurarModalCorrespondenciaEntreTaladros2(data, planta) {
    //Creamos una variable para el estado de la caracteristica
    let clase, estado_caracteristica, translation = await fetchIdioma(planta);

    //Creamos un if para controlar el valor excecido... en caso de que sea 0
    if (data[0].valor_exceed === 0) {
        clase = 'text-field-bad'
        estado_caracteristica = `<span class="bg-danger font-weight-bold text-center"><i class="bi bi-exclamation-triangle-fill"></i> ${translation.fuera_limites}</span>`;

        //En cualquier otro caso
    } else {
        clase = 'text-field-good';
        estado_caracteristica = '<span class="font-weight-bold text-center"><i class="bi bi-check-circle"></i> OK</span>';
    }

    //Configuramos el titulo del modal
    $('#modalInformation .modal-title').text('');

    //Confdiguramos el cuerpo del modal
    $('#modalInformation .modal-body').html(`
        <div class="container">
            <!-- Característica y descripción -->
            <div class="row mb-3">
                <div class="col-md-6">
                    <div class="input-group">
                        <span class="input-group-text">${translation.caracteristica_a_tratar_normal}</span>
                        <input type="text" id="caracteristica_a_tratar" name="caracteristica_a_tratar" class="form-control" disabled value="${data[0].paralelismo}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="input-group">
                        <span class="input-group-text">${translation.descripcion_normal}</span>
                        <input type="text" id="descripcion" name="descripcion" class="form-control" disabled value="${data[0].descripcion}">
                    </div>
                </div>
            </div>

            <!-- Mensaje final -->
            <div class="row mb-3">
                <div class="col text-center">
                    <div class="${clase}">
                        ${estado_caracteristica}
                    </div>
                </div>
            </div>
            
            <hr>

            <!-- Datos en X -->
            <h5 class="text-center">${translation.informacion_x}</h5>
            <div class="row mb-3">
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">${translation.pos_x_nominal}</span>
                        <input type="text" id="nominal_x" name="nominal_x" class="form-control" disabled value="${data[0].pos_x_nominal}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">${translation.pos_x_actual}</span>
                        <input type="text" id="actual_x" name="actual_x" class="form-control" disabled value="${data[0].pos_x_actual}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">${translation.tolerancia_x}</span>
                        <input type="text" id="tolerancia_x" name="tolerancia_x" class="form-control" disabled value="${data[0].pos_x_tolerancia_superior} - ${data[0].pos_x_tolerancia_inferior}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">${translation.desviacion_x}</span>
                        <input type="text" id="desviacion_x" name="desviacion_x" class="form-control" disabled value="${data[0].desviacion_x}">
                    </div>
                </div>
            </div>

            <hr><br>

            <!-- Datos en Y -->
            <h5 class="text-center">${translation.informacion_y}</h5>
            <div class="row mb-3">
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">${translation.pos_y_nominal}</span>
                        <input type="text" id="nominal_y" name="nominal_y" class="form-control" disabled value="${data[0].pos_y_nominal}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">${translation.pos_x_actual}</span>
                        <input type="text" id="actual_y" name="actual_y" class="form-control" disabled value="${data[0].pos_y_actual}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">${translation.tolerancia_y}</span>
                        <input type="text" id="tolerancia_y" name="tolerancia_y" class="form-control" disabled value="${data[0].pos_y_tolerancia_superior} - ${data[0].pos_y_tolerancia_inferior}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text">${translation.desviacion_y}</span>
                        <input type="text" id="desviacion_y" name="desviacion_y" class="form-control" disabled value="${data[0].desviacion_y}">
                    </div>
                </div>
            </div>
        </div>
    `);

    //Configuramos el footer del modal
    $('#modalInformation .modal-footer').html('');

    //Mostramos el modal
    $('#modalInformation').modal('show');
}

/**
 * Función para disponer la información de la correspondencia entre taladros
 * @param {Array} data Array con la información de la correspondencia entre taladros
 * @param {JSON} translation Argumento que contiene la información del idioma
 */
async function configurarModalCorrespondenciaEntreTaladros(data, planta) {
    //Creamos una variable para el estado de la caracteristica
    let estado_caracteristica, translation = await fetchIdioma(planta);

    //Creamos un if para controlar el valor excecido... en caso de que sea 0
    if (data[0].valor_exceed === 0) {
        estado_caracteristica = `<span class="bg-danger font-weight-bold text-center"><i class="bi bi-exclamation-triangle-fill"></i> ${translation.fuera_limites}</span>`;

        //En cualquier otro caso
    } else {
        estado_caracteristica = '<span class="font-weight-bold text-center"><i class="bi bi-check-circle"></i> OK</span>';
    }

    //Configuramos el titulo del modal
    $('#modalInformation .modal-title').text('');

    //Configuramos el cuerpo del modal
    $('#modalInformation .modal-body').html(`
        <div class="container">
            <div class="row mb-3">
                <!-- CARACTERISTICA A TRATAR -->
                <div class="col-md-6">
                    <div class="input-group">
                        <span class="input-group-text">${translation.caracteristica_a_tratar_normal}</span>
                        <input type="text" id="caracteristica_a_tratar" name="caracteristica_a_tratar" class="form-control" disabled value="${data[0].caracteristica}">
                    </div>
                </div>

                <!-- DESCRIPCION -->
                <div class="col-md-6">
                    <div class="input-group">
                        <span class="input-group-text">${translation.descripcion_normal}</span>
                        <input type="text" id="descripcion" name="descripcion" class="form-control" disabled value="${data[0].descripcion}">
                    </div>
                </div>
            </div>

            <!-- MENSAJE FINAL EN UNA SEGUNDA LÍNEA CENTRADO -->
            <div class="row">
                <div class="col text-center">
                    <div class="text-field-good">
                        ${estado_caracteristica}
                    </div>
                </div>
            </div>
        </div>
    `);

    //Mostramos el modal
    $('#modalInformation').modal('show');
}

/**
 * FUnción para obtener el idioma
 * @param {String} planta Argumento que contiene el nombre de la planta
 * @returns Devuelve el array con la información
 */
async function fetchIdioma(planta) {
    //Creamos una variable para almacenar el idioma del backend
    let translation = null;

    try {
        //Almacenamos en una variable la respuesta de la petición GET
        const response = await fetch(`/dieDimensional/api/${planta}-translation`);

        //En caso de que haya salido mal
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos en una variable la traducción
        translation = await response.json();

    } catch (error) {
        console.error("Error en la obtención del idioma: ", error);
    }

    //Devolvemos la variable con la información
    return translation;
}

/**
 * Event listener para cuando la página este lista
 */
$(document).ready(function () {
    //Añadimos la funcionalidad para cuando se pulse sobre el botón del comentario
    $('#comentarios').on('keydown', function (event) {
        //En caso de que el usuario envie un enter
        if (event.key === 'Enter') {
            //Paramos la propagación
            event.preventDefault();

            //Obtenemos el valor del campo del comentario de la medida
            let comentario_medida = document.getElementById('comentarios').value;

            //En caso de que comentario ekste vacio
            if (comentario_medida === '') {
                comentario_medida = ' ';
            }

            //Preparamos la peticion POST para actualizar el comentario
            fetch(`/dieDimensional/api/actualizar-comentario-medida/${id}/${comentario_medida}/${planta_global}`, {
                method: "POST"
            })
                //Controlamos la respuesta
                .then(response => {
                    //Llamamos a la función para mostrar la alerta
                    controlarRespuestaComentario(response);
                });
        }
    });
});