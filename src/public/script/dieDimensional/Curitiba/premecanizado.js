let translation;

/**
 * Función asíncrona para obtener los datos del premecanizado de Curitiba
 */
async function fetchData() {
    try {
        //Almacenamos en una variable la respuesta a la llamada del end point para obtener las no conformidades 
        const response = await fetch('/dieDimensional/api/no-conformidades-premecanizado_Curitiba');

        //En caso de que no haya salido bien
        if (!response) {
            throw new Error('Error fetching data');
        }

        //Almacenamos en una variable los datos obtenidos
        const data = await response.json();

        //Llamamos a la función para disponer la información dentro de la tabla
        renderizarTabla(data);

    } catch (error) {
        console.error("Error fetching data");
    }
}

/**
 * Funbción para disponer el idioma
 * @param {JSON} translation_arg Variable que contiene el idioma correspondiente
 */
function establecerIdioma(translation_arg) {
    /**Página principal */
    //Leave a comment
    document.getElementById('leave_a_comment_nav').innerText = translation_arg.deja_comentario;

    //Titulo
    document.getElementById('titulo').innerText = translation_arg.heading;

    /**DataTable */
    //Date
    document.getElementById('date_dt').innerText = translation_arg.fecha;
    //Measured part
    document.getElementById('measured_part_dt').innerText = translation_arg.tipo_pieza;
    //Mold type
    document.getElementById('mold_type_dt').innerText = translation_arg.tipo_molde;
    //Mold
    document.getElementById('mold_dt').innerText = translation_arg.molde;
    //Injection machine
    document.getElementById('injection_machine_dt').innerText = translation_arg.inyectora;
    //3D machine
    document.getElementById('3d_machine_dt').innerText = translation_arg.maquina_sala;
    //Measured type
    document.getElementById('measured_type_dt').innerText = translation_arg.tipo_medicion;
    //Non-conformities
    document.getElementById('non_conformities_dt').innerText = translation_arg.no_conformidades;

    //Almacenamos en la variable global el contenido de la traduccion
    translation = translation_arg;
}

/**
 * Función para disponer la información en la tabla
 * @param {Array} data Array que contiene los datos del premecanizado de Curitiba
 */
function renderizarTabla(data) {
    //Creamos uns instancia del dt
    const table = $('#dataTable').DataTable();
    table.clear();

    //Iteramos por los datos obtenidos
    data.forEach(item => {
        //Almacenamos los datos que necesitamos
        const rowData = [
            `<button type="button" onclick="verInforme(${item.id})" class="btn btn-outline-primary"><i class="bi bi-search"></i></button>`,
            item.fecha_registro.split('T')[0], //Date
            item.datamatrix, //Measured part
            1, //MAG
            1, //MAG Position
            item.tipo_pieza, //Mold type
            item.molde, //Mold
            "INY" + item.inyectora, //Injection machine
            "pc_1", //3D machine
            "FRECUENCIAL", //Measured type
            `<button type="button" onclick="obtenerNoConformidades(${item.id})"  class="btn btn-primary">${2}</button>` //Non-conformities
        ];

        //Añadimos los datos a la fila del dt
        table.row.add(rowData);
    });

    //Dibujamos el dt
    table.draw();
}

/**
 * Función para obtener los datos necesarios
 * @param {int} id Argumento que contiene el ID de la conformidad
 */
function obtenerNoConformidades(id) {
    //Preparamos la petición GET para obtener los datos necesarios
    fetch(`/dieDimensional/api/obtenerno-conformidades/${{ id }}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => { response.json; })

        //Controlamos los datos
        .then(data => {
            //Llamamos a la función para disponer la información dentro del modal
            disponerNoConformidades(data);
        })
}

/**
 * Función para disponer la no conformidades dentro del modal
 * @param {Array} data Argumento que contiene los datos de las no conformidades
 */
function disponerNoConformidades(data) {
    console.log("Data: ", data);

    //Configuramos el título del modal
    $('#modal .modal-title').text(translation.listado_de_caracteristicas_no_conformes);

    //En caso de que no haya recuperado datos
    if (data.length === 0) {
        //Configuramos el cuerpo del modal
        $('#modal .modal-body').text(translation.todas_las_caracteristicas_dentro_de_los_limites);

        //En caso de que haya recuperado datos
    } else if (data.length >= 1) {
        //Configuramos el cuerpo del modal
        $('#modal .modal-body').html(`
            <div id="table-container" class="overflow-x-auto mt-4">
                <table class="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-gray-100">
                            <th>${translation.caracteristica_mayus}</th>
                            <th>${translation.mayus}</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody"></tbody>
                </table>
            </div>
        `);

        //Creamos una instancia del cuerpo de la tabla
        const tbody = $('#tableBody');

        //Creamos una variable donde almacenerá el contenido de la fila
        const fila_informacion = '';

        //Iteramos por los datos obtenidos
        data.forEach(item => {
            //Añadimos la información dentro de la variable
            fila_informacion += `
                <tr class="cursor-pointer">
                    <td>${item.reference}</td>
                    <tr>${item.descripcion}</td>
                </tr>`;
        });

        //Añadimos las filas al cuerpo de la tabla
        tbody.html(fila_informacion);
    }

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para ver el informe de la no conformidad
 * @param {int} id Argumento que contiene el ID de la no conformidad
 */
function verInforme(id) {
    //Almacenamos el ID en formato JSON
    const id_json = encodeURIComponent(JSON.stringify(id));

    //Redireccionamos la página para poder ver el informe y enviamos el ID de la no conformidad
    window.location.href = `/dieDimensional/viewReport_premachining?data=${id_json}`;
}