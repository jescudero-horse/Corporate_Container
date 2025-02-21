/**
 * Función para controlar la respuesta
 * @param {*} response Argumento que contiene la respuesta del backend
 */
function controlarRespuestaComentario(response) {
    //En caso de que haya salido bien
    if (response.status === 201) {
        mostrarAlerta("Comment added successfully", null, null, 1);

        //En caso de que haya salido mal
    } else if (response.status === 501) {
        mostrarAlerta("Error when adding the comment", "An error occurred while adding the comment", "error", 0);

        //En cualquier otro caso...
    } else {
        mostrarAlerta("Uncontrolled state", "It has not been possible to control the state", "question", null);
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