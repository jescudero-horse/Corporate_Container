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
        console.log("Data: ", data);

    } catch (error) {
        console.error("Error al obtenener los datos de la control matrix: ", error);
    }
}