/**
 * Función asíncrona para obtener los datos del premecanizado de Curitiba
 */
async function fetchData () {
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
            `<button type="button" class="btn btn-primary">${2}</button>`, //Non-conformities
        ];

        //Añadimos los datos a la fila del dt
        table.row.add(rowData);
    });

    //Dibujamos el dt
    table.draw();
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

//Añadimos la funcionalidad para cuando haya terminado de cargar la página web
window.addEventListener('DOMContentLoaded', function () {
    //Llamamos a la función para obtener los datos y disponerlos en la tabla
    fetchData();
});