//Declaramos las variable globales
let translation, id_no_conformidad;

/**
 * Función asíncrona para obtener los datos de Rumania
 */
async function fetchData() {
    //Almacenamos en una variable el idioma de la planta
    translation = fetchIdioma('rumania');
}

console.log("Idioma: ", translation);

window.addEventListener('DOMContentLoaded', () => {
    fetchData();
})