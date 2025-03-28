/**
 * Función asíncrona para obtener la informaciòn de la control matrix
 */
async function fetchData() {
    try {
        //Almacenamos en una variable la respuesta de la llamada a peticion GET
        const response = await fetch('/library/api/obtener-controlMatrix');

        //En caso de que no haya salido bien
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos en una variable los datos
        const data = await response.json();
        
        //Llamamos a la función para filtrar la informacion
        const filtered_data = consolidarDatos(data);
        
        //Llamamos a la función para disponer la información
        renderTable(filtered_data);

    } catch (error) {
        console.error("Error al obtenener los datos de la control matrix: ", error);
    }
}

/**
 * Función para disponer los datos dentro de la tabla
 * @param {Array} data Argumento que contiene los datos
 */
function renderTable(data) {
    //Inicializamos el dataTable con la configuración para ocultar la primera columna y quitar paginación
    const table = $('#dataTable').DataTable({
        "paging": false,
        "info": false,
        "lengthChange": false, 
        "columnDefs": [
            { "targets": 0, "visible": false }
        ]
    });
    table.clear();

    //Iteramos por los datos
    data.forEach(item => {
        // Función para formatear celdas según contenido
        function formatCell(value, isCreator) {
            if (value === 'X') {
                return '<i class="bi bi-ban text-danger"></i>';
            } else if (isCreator) {
                return `<span class="text-primary">${value}</span>`;
            } else {
                return `<span class="text-success">${value}</span>`;
            }
        }

        //Creamos un array para almacenar los datos
        const rowData = [
            item.id,
            item.SECTION,
            formatCell(item.Sevilla, item.factory === 'Sevilla'),
            formatCell(item.Bursa, item.factory === 'Bursa'),
            formatCell(item.Aveiro, item.factory === 'Aveiro'),
            formatCell(item.Motores, item.factory === 'Motores'),
            formatCell(item.Mioveni, item.factory === 'Mioveni'),
            formatCell(item.CMC, item.factory === 'CMC'),
            formatCell(item.PFA, item.factory === 'PFA')
        ];

        //Añadimos la fila al dataTable
        table.row.add(rowData);
    });

    //Dibujamos la tabla
    table.draw();
}

/**
 * Función para consolidar los datos
 * @param {Array} data Argumento que contiene los datos de la tabla de las buenas prácticas
 * @returns Devuelve los dato consolidados
 */
function consolidarDatos(data) {
    let latestData = {};
    
    data.forEach(item => {
        let key = item.SECTION.trim();
        
        if (!latestData[key]) {
            latestData[key] = { ...item };
        } else {
            Object.keys(item).forEach(col => {
                if (col !== 'id' && col !== 'SECTION') {
                    let existingDate = latestData[key][col];
                    let newDate = item[col];
                    
                    if (newDate !== 'X' && (existingDate === 'X' || new Date(newDate) > new Date(existingDate))) {
                        latestData[key][col] = newDate;
                    }
                }
            });
        }
    });
    
    return Object.values(latestData);
}


window.addEventListener('DOMContentLoaded', () => {
    fetchData();
});