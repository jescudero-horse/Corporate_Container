//Creamos una variab le global para almacenar el ID de la etapa, la distancia total en metros y el numero de curvas
let id_etapa, totalDistanceMeters, curveCount, points, ruta_plano, numero_cruces, numero_puertas, frecuencia_recorrido, maquina_usada, velocidad, descripcion, etapa_nombre;

/**
 * Función para obtener el plano
 */
async function fetchData() {
    //Almacenamos en una variable los datos de los parámetros de la URL
    const rowData = obtenerInformacionURL();

    /** OBTENEMOS LA RUTA DEL PLANO */
    try {
        //Llamamos al end point para obtener la ruta del plano
        const response = await fetch(`/film/api/obtenerPlano/${rowData[0]}`);

        //Controlamos la respuesta
        if (!response.ok) throw new Error("Error fetching data");

        //Almacenamos en una variab le los datos obtenidos
        const data = await response.json();

        //Almacenamos en una variable global la ruta del plano
        ruta_plano = data[0].mapa;

    } catch (error) {
        console.error("Error: ", error);
    }

    /** OBTENEMOS LOS DATOS DEL PLANO */
    try {
        //Llamamos al end point para obtener la información del plano
        const response = await fetch(`/film/api/obtenerInformacionPlano/${id_puesto}`);

        //Controlamos la respuesta
        if (!response.ok) throw new Error('Error fetching data');

        //Almacenamos los datos obtenidos
        const data = await response.json();

        //En caso de que esa etapa tenga datos
        if (data.length > 0) {
            //Almacenamos en la variable global la distancia total
            totalDistanceMeters = data[0].distancia_total;

            //Almacenamos en la variable global el número de curvas
            curveCount = data[0].numero_curvas;

            //Convertimos los puntos de string a array de objetos
            points = JSON.parse(data[0].puntos);

            //Almacenamos en la variable global el número de cruces
            numero_cruces = data[0].numero_cruces;

            //Almacenamos en la variable global el número de puertas
            numero_puertas = data[0].numero_puertas;

            //En caso de que no haya podido encontrar la distancia total, curvas o los puntos...
            if (!totalDistanceMeters || !curveCount || !points) {
                //Inicializamos el mapa sin datos
                inicializarMapa();

                //En cualquier otro caso...
            } else {
                //Llamamos a la función para inicializar el mapa con los datos obtenidos
                inicializarMapaConDatos(points);
            }

            //En cualquier otro caso...
        } else {
            if (rowData[2] === null || rowData[2] === undefined) {
                //Almacenamos en la variable global el ID del puesto
                id_puesto = rowData[0];

                //Inicializamos el mapa sin datos y mostramos el campo extra para la frecuencia del recorrido
                inicializarMapa();
            }
        }
    } catch (error) {
        console.error("Error: ", error);
    }
}

/**
 * Función para disponer el botón de añadir la union entre etapas
 */
function inicializarBotonAnyadirUnion() {
    //Creamos una instancia del botón de actualizar
    const botonActualizarInformacionPlano = document.getElementById('botonActualizarInformacionPlano');

    //Creamos el nuevo boton
    const botonAnyadirDesplazamiento = document.createElement('button');

    //Asignamos el ID al nuevo boton
    botonAnyadirDesplazamiento.id = 'botonActualizarInformacionPlano';

    //Añadimos el class al nuevo boton
    botonAnyadirDesplazamiento.className = "bg-[#2563eb] text-black font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out";

    //Añadimos el contenido HTML al nuevo boton
    botonAnyadirDesplazamiento.innerHTML = `Añadir desplazamiento entre zonas`;

    //Añadimos la funcionalidad al botón
    botonAnyadirDesplazamiento.onclick = function () {
        //Llamamos a la función para obtener el número de cruces, puertas y la frecuencia del recorrido
        obtenerNumeroCruces_Puertas_FrecuenciaRecorrido();

        //Convertimos los puntos JSON
        const puntos = JSON.stringify(points);

        //Preparamos la solicitud POST para insertar el desplazamiento
        fetch(`/film/api/anyadirDesplazamientoZona/${id_puesto}/${totalDistanceMeters}/${curveCount}/${puntos}/${numero_cruces}/${numero_puertas}/${frecuencia_recorrido}/${maquina_usada}/${velocidad}/${descripcion}`, {
            method: "POST"
        })
            //Controlamos la respuesta
            .then(response => {
                //En caso de que todo haya salido bien
                if (response.status === 201) {
                    //Configuramos la alerta
                    Swal.fire({
                        title: "Unión entre etapa añadida",
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
                            //Cerramos la página
                            window.location.close();
                        }
                    });

                    //En caso de que haya fallado
                } else if (response.status === 501) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Error a la hora de añadir el desplazamiento entre etapas"
                    });

                    //En cualquier otro caso...
                } else {
                    Swal.fire({
                        icon: "question",
                        title: "Estado no controlado",
                        text: "No ha sido capaz de controlar el estado"
                    });
                }
            })
    }

    //Reemplazamos el botón de actualizar por el de desbloquear
    botonActualizarInformacionPlano.parentNode.replaceChild(botonAnyadirDesplazamiento, botonActualizarInformacionPlano);
}

/**
 * Función para inicializar el mapa con datos
 * @param {*} pointsData Argumento que contiene las coordenadas
 */
function inicializarMapaConDatos(pointsData) {
    //Inicializamos el lienzo utilizando fabric.js
    const canvas = new fabric.Canvas('planoCanvas');

    //Creamos una instancia de la imagen
    const img = new Image();

    //Establecemos la ruta de la imagen
    img.src = ruta_plano;

    //Añadimos la funcionalidad para cuando la imagen haya sido cargada
    img.onload = function () {
        //Creamos una instancia de la imagen y su configuración
        const imgInstance = new fabric.Image(img, {
            left: 0,
            top: 0,
            scaleX: 1,
            scaleY: 1
        });

        //Establcemos el ancho y el alto del lienzo según la imagen
        canvas.setWidth(img.width);
        canvas.setHeight(img.height);

        //Añadimos la imagen en el fondo del lienzo
        canvas.setBackgroundImage(imgInstance, canvas.renderAll.bind(canvas));

        //Desactivamos el modo dibujo de forma inicial
        canvas.isDrawingMode = false;

        /** Declaramos las variables que vamos a utilizar para realizar los cáculos */
        let totalDistancePixels = 0; //Acumulamos la distancia total en píxeles
        points = []; //Almacenamos los puntos dibujados
        curveCount = 0; //Almacenamos las curvas contadas
        let previousEndPoint = null; //Almacenamos el último punto de la línea

        //Renderizamos las líneas ya almacenadas
        pointsData.forEach((point, index) => {
            //Obtenemos la posición de cada cordenadas
            const currentPoint = new fabric.Point(point.x, point.y);

            //En caso de que haya puntos que representar 
            if (previousEndPoint) {
                //Configuramos la línea
                const line = new fabric.Line([previousEndPoint.x, previousEndPoint.y, currentPoint.x, currentPoint.y], {
                    stroke: 'blue',
                    strokeWidth: 5,
                    selectable: false,
                    evented: false
                });

                //Añadimos la linea al lienzo
                canvas.add(line);

                //Calculamos la distancia en píxeles
                const distance = Math.sqrt(
                    Math.pow(currentPoint.x - previousEndPoint.x, 2) +
                    Math.pow(currentPoint.y - previousEndPoint.y, 2)
                );

                //Aumentamos la distancia en píxeles
                totalDistancePixels += distance;

                //Comprobamos las curvas
                if (index > 1) {
                    const angle = calculateAngle(points[index - 2], points[index - 1], currentPoint);
                    if (angle > 15) curveCount++;
                }
            }

            //De los contrario añadimos almacenamos la última línea
            previousEndPoint = currentPoint;

            //Añadimos los puntos en el array
            points.push(currentPoint);
        });

        //Calculamos los píxeles en metros
        const pixelsPerMeter = ((canvas.width / 70) + (canvas.height / 140)) / 2;

        //Almacenamos la distancia total en metros
        totalDistanceMeters = Math.ceil(totalDistancePixels / pixelsPerMeter);

        //Mostramos la distancia total en metros en su respectivo label
        document.getElementById('distanciaTotalMetros').innerText = `${totalDistanceMeters.toFixed(2)} metros`;

        //Mostramos el número de curvas en su respectivo label
        document.getElementById('numeroCurvas').innerText = `${curveCount}`;

        //Añadimos la información al conteo de número de cruces
        document.getElementById('numeroCruces').value = numero_cruces;

        //Añadimos la información del conteo de número de puertas
        document.getElementById('numeroPuertas').value = numero_puertas;

        //Llamamos al método para disponer el botón de desbloquear mapa
        inicializarbotonAnyadirDesplazamiento();
    };

    //En caso de que el renderizado falle
    img.onerror = function () {
        console.error('Error al cargar la imagen');
    };
}

/**
 * Función para obtener el ID del puesto de los parámetros de la URL
 * @returns Devuelve el ID del puesto
 */
function obtenerInformacionURL() {
    //Obtenemos el valor de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const rowDataJSON = urlParams.get('data');

    //Almacenamos los valores de los parámetros de la URL
    const rowData = JSON.parse(decodeURIComponent(rowDataJSON));

    console.log("ROW DATA: ", rowData);

    //Almacenamos en la variable global el ID de la etapa y el nombre de la etapa
    id_puesto = rowData[0], etapa_nombre = rowData[1];

    //Devolvemos el ID del puesto
    return rowData;
}

/**
 * Función para asignar el número de cruces y de puertas en las variables globales
 */
function obtenerNumeroCruces_Puertas_FrecuenciaRecorrido() {
    /** Asignamos en las variables globales la información del número de cruces y el número de puertas */
    numero_cruces = document.getElementById('numeroCruces').value;
    numero_puertas = document.getElementById('numeroPuertas').value;
    frecuencia_recorrido = document.getElementById('frecuenciaRecorrido').value;
    maquina_usada = document.getElementById('maquinaUsada').value;
    velocidad = document.getElementById('velocidad').value;
    descripcion = document.getElementById('descripcion').value;
}

/**
 * Función para actualizar la información del plano usando el ID de la etapa
 */
function actualizarInformacionPlano() {
    //Llamamos a la función para obtener el número de cruces y el número de puertas
    obtenerNumeroCruces_Puertas_FrecuenciaRecorrido();

    //Convertimos las coordenadas a formato JSON
    const puntosJSON = JSON.stringify(points);

    //Comprobamos la información de las variables necesarias
    if (!id_puesto || !totalDistanceMeters || !curveCount || totalDistanceMeters === 0 || numero_cruces === '' || numero_puertas == '') {
        //Llamamos a la funcion para disponer la alerta de error
        mostrarAlertaMapa('Error', 'La información no puede estar vacía', 'error', 0);

        //En otro caso...
    } else {
        //Iniciamos la solicitud POST para actualizar la informacion del mapa
        fetch(`/film/api/actualizarInformacionMapa/${id_puesto}/${totalDistanceMeters}/${curveCount}/${puntosJSON}/${numero_cruces}/${numero_puertas}/${etapa_nombre}`, {
            method: "POST"
        })

            //Controlamos la respuesta
            .then(response => {
                //En caso de que todo haya salido bien
                if (response.status === 201) {
                    //Llamamos a la función para mostrar la alerta
                    mostrarAlertaMapa('Éxito', 'La información del mapa se ha actualizado. Volviendo a la página de inicio...', 'success', 0);

                    history.back();
                    setTimeout(() => {
                        window.close();
                    }, 800);

                    //En caso de que haya salido mal
                } else if (response.status === 501) {
                    //Llamamos a la función para mostrar la alerta
                    mostrarAlertaMapa('Error', 'Se ha producido un error a la hora de actualizar la información del mapa', 'error', 0);

                    //Otros casos no controlados
                } else {
                    //Llamamos a la función para mostrar la alerta
                    mostrarAlertaMapa('Estado no controlado', 'No ha sido capaz de controlar el estado', 'question', 0);
                }
            });
    }
}

/**
 * Función para reemplazar el botón de actualizar información del plano por el de desbloquear plano
 */
function inicializarbotonAnyadirDesplazamiento() {
    //Creamos una instancia del botón de actualizar
    const botonActualizarInformacionPlano = document.getElementById('botonActualizarInformacionPlano');

    //Creamos el nuevo boton
    const botonAnyadirDesplazamiento = document.createElement('button');

    //Asignamos el ID al nuevo boton
    botonAnyadirDesplazamiento.id = 'botonActualizarInformacionPlano';

    //Añadimos el class al nuevo boton
    botonAnyadirDesplazamiento.className = "bg-[#2563eb] text-black font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out";

    //Añadimos el contenido HTML al nuevo boton
    botonAnyadirDesplazamiento.innerHTML = `Desbloquear plano <i class="bi bi-unlock-fill"></i>`;

    //Añadimos la funcionalidad al botón
    botonAnyadirDesplazamiento.onclick = function () {
        //Llamamos al método para mostrar la alerta
        mostrarAlertaMapa("Desbloquear diseño del plano", "¿Deseas desbloquear el mapa? ¡Eliminará la información actual del plano!", "question", 2);
    }

    //Reemplazamos el botón de actualizar por el de desbloquear
    botonActualizarInformacionPlano.parentNode.replaceChild(botonAnyadirDesplazamiento, botonActualizarInformacionPlano);

    /** Desbloqueamos los inputs del número de cruces y del número de puertas */
    document.getElementById('numeroCruces').setAttribute('disabled', true);
    document.getElementById('numeroPuertas').setAttribute('disabled', true);
}

/**
 * Función para controlar y disponer una alerta
 * @param {String} titulo Argumento que contiene el titulo de la alerta
 * @param {String} mensaje Argumento que contiene el mensaje de la alerta
 * @param {String} icono Argumento que contiene el icono de la alerta
 * @param {int} opcion Argumento que contiene la opción de control
 */
function mostrarAlertaMapa(titulo, mensaje, icono, opcion) {
    //Controlamos la creacion de la alerta usando el argumento "opcion"... en caso de que opcion sea 1
    if (opcion === 1) {
        Swal.fire({
            title: titulo,
            text: mensaje,
            icon: icono,
            showCancelButton: true,
            confirmButtonText: 'Sí, adelante',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            ///En caso de que el usuario presione el botón de actualizar la informacion del mapa
            if (result.isConfirmed) {
                //Llamamos a la función para actualizar la información del mapa
                actualizarInformacionPlano();

                //En caso de que no quiera actualizar la informacion
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire(
                    'Cancelado',
                    'Tu acción ha sido cancelada',
                    'error'
                );
            }
        });

        //En caso de que la opcion sea 0
    } else if (opcion === 0) {
        Swal.fire({
            title: titulo,
            text: mensaje,
            icon: icono
        });

        //En caso de que la opción sea 2
    } else if (opcion === 2) {
        Swal.fire({
            title: titulo,
            text: mensaje,
            icon: icono,
            showCancelButton: true,
            confirmButtonText: 'Sí, adelante',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            //En caso de que el usuario presione el botón de desbloquear
            if (result.isConfirmed) {
                //Llamamos la función para eliminar los datos del plano y recargar la página
                desbloquearPlano();

                //En caso de que el usuario presiente el botón de no desbloquear
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire(
                    'Cancelado',
                    'Tu acción ha sido cancelada',
                    'error'
                );
            }
        })

        //En caso de que la opción sea 3
    } else if (opcion === 3) {
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
                }, 100);
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
}

/**
 * Función para desbloquear el plano
 */
function desbloquearPlano() {
    //Inicializamos la solicitud POST para eliminar los datos del plano usando el ID de la etapa
    fetch(`/film/api/actualizarInformacionMapa/${id_puesto}/${null}/${null}/${null}/${null}/${null}`, {
        method: "POST"
    })

        //Controlamos la respuesta
        .then(response => {
            //En caso de que todo haya salido bien
            if (response.status === 201) {
                //LLamamos la función para refrescar la página
                mostrarAlertaMapa("Mapa desbloqueado", null, null, 3)

                //En caso de que ocurra algun fallo
            } else if (response.status === 501) {
                //Llamamos a la función para mostrar un mensaje de error
                mostrarAlertaMapa('Error', 'No se ha podido desbloquear el mapa', 'error', 0);

                //Otros casos no controlados
            } else {
                //Llamamos a la función para mostrar la alerta
                mostrarAlertaMapa('Estado no controlado', 'No ha sido capaz de controlar el estado', 'question', 0);
            }
        });
}

/**
 * Función para inicializar el plano
 * @param {*} data Argumento que contiene el path del plano
 */
function inicializarMapa() {
    //Inicializamos el lienzo utilizando fabric.js
    const canvas = new fabric.Canvas('planoCanvas');

    //Creamos una instancia de la imagen
    const img = new Image();

    //Establecemos la imagen
    img.src = ruta_plano;

    //Añadimos la funcionalidad para cuando la imagen haya sido cargada
    img.onload = function () {
        //Creamos una instancia de la imagen y su configuración
        const imgInstance = new fabric.Image(img, {
            left: 0,
            top: 0,
            scaleX: 1,
            scaleY: 1
        });

        //Establecemos el ancho y alto del lienzo según la imagen
        canvas.setWidth(img.width);
        canvas.setHeight(img.height);

        //Añadimos la imagen en el fondo del lienzo
        canvas.setBackgroundImage(imgInstance, canvas.renderAll.bind(canvas));

        //Desactivamos el modo de dibujo inicialmente
        canvas.isDrawingMode = false;

        /** Declaramos las variables que vamos a utilizar para realizar los cálculos */
        let previousEndPoint = null; //Almacenamos el último punto de la línea
        let totalDistancePixels = 0; //Acumulamos la distancia total en píxeles
        points = []; //Almacenamos los puntos dibujados
        curveCount = 0; //Almacenamos las curvas contadas

        //Añadimos la funcionalidad para cuando se hace clic sobre el lienzo
        canvas.on('mouse:down', function (options) {
            /** Obtenemos la posición de los clics */
            const pointer = canvas.getPointer(options.e);
            const currentPoint = new fabric.Point(pointer.x, pointer.y);

            //En caso de que sea el primer clic almacenamos el primer punto
            if (!previousEndPoint) {
                //Guardamos el primer punto
                previousEndPoint = currentPoint;

                //Agregamos el primer punto en el array
                points.push(currentPoint);
                return;
            }

            //Dibujamos la línea desde el primer punto hasta el segundo
            const line = new fabric.Line([previousEndPoint.x, previousEndPoint.y, currentPoint.x, currentPoint.y], {
                stroke: 'blue', //Color de la  línea
                strokeWidth: 5, //Grosor de la línea
                selectable: false, //La línea no es seleccionable
                evented: false //La línea no responde a eventos
            });

            //Agregamos la línea al canvas
            canvas.add(line);

            //Calculamos la distancia entre el último punto y el actual
            const distance = Math.sqrt(Math.pow(currentPoint.x - previousEndPoint.x, 2) + Math.pow(currentPoint.y - previousEndPoint.y, 2));

            //Acumulamos la distancia total
            totalDistancePixels += distance;

            //Verificamos si hay más de dos puntos para calcular el ángulo
            if (points.length > 1) {
                //Último punto de la línea actual
                const lastPoint = points[points.length - 1];

                //Penúltimo punto
                const secondLastPoint = points[points.length - 2];

                //Llamamos a la función para calcular el ángulo para determinar si hay una curva
                const angle = calculateAngle(secondLastPoint, lastPoint, currentPoint);

                //15 grados para considerar una curva
                if (angle > 15) {
                    //Incrementamos el contador de curvas
                    curveCount++;
                }
            }

            /** Actualizamos el punto final para la próxima línea */
            //Establecemos el nuevo punto final
            previousEndPoint = currentPoint;

            //Añadimos el nuevo punto al array
            points.push(currentPoint);

            //Añadimos el numero de curvas en el label
            document.getElementById('numeroCurvas').innerText = `${curveCount}`;
        });

        /** Escalamos en píxeles por metro para convertir la distancia */
        //Ancho del lienzo
        const pixelsPerMeterWidth = canvas.width / 70;

        //Alto del lienzo
        const pixelsPerMeterHeight = canvas.height / 140;

        //Promedio (cálculo de píxeles por metro en horizontal y vertical)
        const pixelsPerMeter = (pixelsPerMeterWidth + pixelsPerMeterHeight) / 2;

        //Añadimos la funcionalidad para cuando se suelta el botón del mouse
        canvas.on('mouse:up', function () {
            //Convierte la distancia total a metros
            totalDistanceMeters = Math.ceil(totalDistancePixels / pixelsPerMeter);
            console.log('Distancia total (en metros):', totalDistanceMeters);

            //Añadimos la distinacia total en el label correspondiente
            document.getElementById('distanciaTotalMetros').innerText = `${totalDistanceMeters} metros`;
        });
    };

    //Manejo de error al cargar la imagen
    img.onerror = function () {
        console.error('Error al cargar la imagen');
    };
}

/**
 * Función para calcular el ángulo usando tres puntos
 * @param {*} p1 Argumento que contiene el primer punto A
 * @param {*} p2 Argumento que contiene el segundo punto B
 * @param {*} p3 Argumento que contiene el tercer punto C
 * @returns Devuelve el ángulo
 */
function calculateAngle(p1, p2, p3) {
    //Ángulo del primer segmento
    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    //Ángulo del segundo segmento
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);

    //Convertimos a grados
    const angle = Math.abs(angle1 - angle2) * (180 / Math.PI);

    //Devolvemos el angulo
    return angle > 180 ? 360 - angle : angle;
}

//Evento para programar cuando se cargue la ventana
document.addEventListener('DOMContentLoaded', function () {
    //Llamamos al metodo para obtener el plano
    fetchData();
});