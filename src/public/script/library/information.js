/**
 * Function to display the modal if the fetch fail
 */
function displayInformationModal() {
    //Configure the title of the information modal
    $('#modalInformation .modal-title').html(
        `
        <h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
            </svg>
            Warning
        </h1>
        `
    );

    //Configure the body of the information modal
    $('#modalInformation .modal-body').html(
        `
            <p>Check if you're logged in to the Okta proxy and if ZScaler is set up correctly<p>
            
            <div class="row">
                <div class="col">
                    <img src="/assets/library/proxy_OKTA.png" class="img-fluid" alt="Proxy OKTA Image">
                </div>
                <div class="col">
                        <img src="/assets/library/logo_ZSCALER.png" class="img-fluid" alt="Logo Zscaler Image">
                    </a>
                </div>
            </div>

            <p>To log in to the Okta proxy:</p>
            <ol>
                <li>Open a new tab</li>
                <li>Search anything (you will be redirected to the Okta page)</li>
                <li>Log in with your credentials</li>
                <li>Return to the Digital Library web</li>
                <li>Reload the page</li>
            </ol>
        `
    );

    //Conifigure the button of the information modal
    $('#modalInformation .modal-footer').html(
        `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        `
    );

    //Show the information modal
    $('#modalInformation').modal('show');
}

/**
 * Function to configure Driver.js
 * */
function onAnimationComplete(tourSteps) {
    console.log("Dentro del onAnimationComplete");

    //Creamos una instancia del Driver
    const driver = new Driver({
        animate: true,
        padding: 10,
        allowClose: false,
        opacity: 0,
        stageBackground: 'transparent',
    });

    //Use the driver object to configure the steps
    driver.defineSteps(tourSteps);

    console.log("Driver: ", driver);

    //Set a time out
    setTimeout(function () {
        driver.start();
    }, 100);

    //Stop the animation
    animation.stop();
}

/**
 * Función para disponer la alerta
 * @param {String} titulo Argumento que contien el titulo de la alerta
 * @param {String} mensaje Argumento que contiene el mensaje de la alerta
 * @param {String} icono Argumento que contiene el icono de la alerta
 */
function mostrarAlerta(titulo, mensaje, icono) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono
    });
}

/**
 * Función para disponer una alerta con cuenta atras
 * @param {String} titulo Argumento que contiene el título para la alerta
 */
function mostrarAlertaTimer(titulo) {
    //Creamos una variable para el conteo
    let timerInterval;

    Swal.fire({
        title: titulo,
        html: "Reloading page, please wait <b></b> milliseconds...",
        timer: 500,
        allowOutsideClick: false,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
            }, 1000);
        },
        willClose: () => {
            clearInterval(timerInterval);
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            window.location.reload();
        }
    });
}