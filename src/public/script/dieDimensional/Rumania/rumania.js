/**
 * Función asíncrona para obtener los datos de rumania
 */
async function fetchData() {
    try {
        //Creamos una variable con la respuesta de la llamada al end point
        const response = await fetch('/dieDimensional/api/rumania-no-conformidades');

        //En caso de que la respuesta no sea buena
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos en una variable los datos obtenidos
        const data = await response.json();

        //Llamamos a la función para disponer la información dentro del DataTable
        renderTable(data);

    } catch (error) {
        console.error("Error fetching data");
    }
}

/**
 * Función para disponer el idioma
 * @param {JSON} translation Variable que contiene el idioma correspondiente
 */
function establecerIdioma(translation) {
    /**Página principal */
    //Leave a comment
    document.getElementById('leave_a_comment_nav').innerText = translation.deja_comentario;

    /**DataTable */
    //Date
    document.getElementById('date_dt').innerText = translation.fecha;
    //Measured part
    document.getElementById('mesasured_part_dt').innerText = translation.pieza_medida;
    //Description
    document.getElementById('description_dt').innerText = translation.descripcion;
    //Mold type
    document.getElementById("mold_type_dt").innerHTML = translation.tipo_molde;
}

/**
 * Función para disponer las no conformidades dentro del DataTable
 * @param {Array} data Argumento que contiene los datos de las no conformidades de Rumania
 */
function renderTable(data) {
    //Creamos una instancia del DataTable
    const table = $('#dataTable').DataTable();
    table.clear();

    //Iteramos por los datos obtenidos
    data.forEach(item => {
        //Almacenamos en un array los datos necesarios
        const rowData = [
            `<button type="button" onclick="verInforme(${item.id})" class="btn btn-outline-primary"><i class="bi bi-search"></i></button>`, //Botón para ver el informe
            item.fecha_registro.split('T')[0], //Fecha
            item.datamatrix, //Referencia
            item.description, //Descripción
            item.AX, //AX
            item.mold_type //Tipo de molde 
        ];

        //Añadimos la fila al DataTable
        table.row.add(rowData);
    });

    //Dibujamos el DataTable
    table.draw();
}

/**
 * Función para disponer el informe de la no conformidad
 * @param {int} id Argumento que contiene el ID de la no conformidad
 */
function verInforme(id) {
    //Almacenamos en ID en formato JSON
    const id_json = encodeURIComponent(JSON.stringify(id));

    //Redireccionamos la página para poder ver el informe y enviamos el ID de la no conformidad
    window.location.href = `/dieDimensional/viewReport-premachining-rumania?data=${id_json}`;
}