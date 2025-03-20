//Variable global para almacenar el ID
let id;

/**
 * Función asíncrona para obtener la información necesaria
 */
async function fetchData() {
    //Llamamos a la función para obtener el ID
    obtenerID();

    /**INFORMACIÓN BÁSICA */
    try {
        //Almacenamos en una variable la respuesta de la petición GET
        const response = await fetch(`/dieDimensional/api/obtenerInformacionBasica-premecanizado-rumania/${id}`);

        //En caso de que haya salido mal
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos en una variable la información obtenida
        const data = await response.json();

        //Llamamos a la función para disponer la información necesaria
        disponerInformacionCampos(data);

    } catch (error) {
        console.error("Error al obtener la información básica: ", error);
    }

    /**INFORMACIÓN PARA LA TABLA STATUS */
    try {
        //Almacenamos en una variable la respuesta
        const response = await fetch(`/dieDimensional/api/obtener-status-premecanizado/${id}/${'rumania'}`);

        //En caso de que haya salido mal
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos en una variable la información obtenida
        const data = await response.json();

        //Llamamos al método para disponer la información en la tabla del status
        renderizarTablaAlertaMolde(data, 'rumania');

    } catch (error) {
        console.error("Error al obtenedor la tabla status: ", error);
    }

    /**IDIOMA */
    try {
        //Almacenamos en una variable la respuesta de la petición GET
        const response = await fetch('/dieDimensional/api/rumania-translation');

        //En caso de que haya salido mal
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos los datos obtenidos en una variable
        const translation = await response.json();

        //Llamamos a la función para cambiar el idioma
        establecerIdioma(translation);

    } catch (error) {
        console.error("Error al obtener el idioma: ", error);
    }
}

/**
 * Función para estabecer el idioma
 * @param {JSON} translation Argumento que contiene los datos del idioma
 */
function establecerIdioma(translation) {
    /**Encabezado */
    //Leave a comment
    document.getElementById('leave_a_comment_nav').innerText = translation.deja_comentario;

    /**Información básica */
    //Report creation date
    document.getElementById('fecha_creacion_span').innerText = translation.fecha_creacion;
    //Measured part
    document.getElementById('pieza_medida_span').innerText = translation.pieza_medida;
    //Mold type
    document.getElementById('tipo_molde_span').innerText = translation.tipo_molde;
    //Mold
    document.getElementById('molde_span').innerText = translation.molde;
    //Machine
    document.getElementById('maquina_span').innerText = translation.inyectora;
    //Position
    document.getElementById('puesto_span').innerText = translation.puesto_min;
    //Comments
    document.getElementById('comentario_span').innerText = translation.comentario;

    /**DataTable */
    //CHARACTERISTIC
    document.getElementById('characteristic_dt').innerText = translation.caracteristica;
    //DESCRIPTION
    document.getElementById('description_dt').innerText = translation.descripcion_mayus;
    //STATUS
    document.getElementById('status_dt').innerText = translation.estado;
}

/**
 * Función para obtener el ID de la URL
 */
function obtenerID() {
    //Obtenemos el valor de la URL
    const url_params = new URLSearchParams(window.location.search);
    const id_json = url_params.get('data');

    //Almacenamos en la variable global el ID
    id = JSON.parse(decodeURIComponent(id_json));
}

window.addEventListener('DOMContentLoaded', () => {
    fetchData();
});