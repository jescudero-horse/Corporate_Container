async function fetchData() {
    try {
        //Almacenamos en una variable la respuesta a la llamada del end point para obtener los datos
        const response = await fetch('/dieDimensional/api/rumania');

        //En caso de que no haya salido bien
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos los datos obtenidos
        const data = await response.json();

        //Llamamos a la función para disponer la información dentro de la tabla

    } catch (error) {
        console.error("Error fetching data");
    }
}