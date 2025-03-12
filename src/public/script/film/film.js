//Creamos las variable globales que hacen falta
let cantidad_a_mover = [], referencia_componente = "", categoria_seleccionada, operacion_seleccionada, puestoID, linea, fs_totales, ultimoBotonPulsado, conteosPorPuesto = [], contador = 0, cantidadAMoverCadena, mote, planta, tipo_carga = "UM", tipo_operacion = "Programa_Expedicion_Forklift", primer_dia, numero_picadas, tiempoDesplazamiento;

//Variable global donde almacenarems en un diccionario la referencia y el número de embalajes
let referencia_embalaje = {};

//Declaramos las variables gloables necesarias para controlar las etapas
let id_etapa, comment, distance_empty_zone, loading_type, engins, number_of_packages_loaded_at_once, engines, code_mtm3, correspondence, speed;

//Variable global para almacenar la cantidad de referencias
let cantidad_referencias = 0;

//Variable que contiene los datos para el gráfico de chimenea
let conteoGraficoChimenea = [];

//Creamos un array donde contendrá la información para representar los gráficos
let peticionesFinalizadas = {
    puestos: false,
    graficoChimenea: false
};

//Array para almacenar los puestos ocultos
let puesto_ocultos = [];

//Creamos un diccionario con las plantas y sus códigos
let diccionario_plantas = {
    "Aveiro": "00900165",
    "Sevilla": "00910175",
    "Valladolid": "00910177",
    "Chile": "00900095",
    "HORSE ROBV": "00900123",
    "Motores": "00900125",
    "Oyak": "00900144",
    "Brasil": "00900186"
};

/**
 * Función asincrona para obtener los puestos de la base de datos
 */
async function fetchData() {
    /**Obtenemos los PUESTOS */
    try {
        //Almacenamos en una variable la respuesta de la llamada al end point para obtener los puestos
        const response = await fetch('/film/api/obtenerPuestos');

        //Controlamos la respuesta
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos los puestos obtenidos
        const data = await response.json();

        //Llamamos al método para disponer los puestos en el panel superior
        gestionarPuesto(data);

        //Llamamos al método para obtener los datos para el gráfico de chimenea
        gestionarGraficoChimenea(data);

    } catch (exception) {
        console.error("Error al obtener los puestos: ", exception);
    }

    /**Obtenemos el conteo de Fs */
    try {
        //Almacenamos en una variable la respuesta a la llamada al end point para obtener el conteo de Fs
        const response = await fetch('/film/api/conteoFs');

        //Controlamos la respuesta
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Almacenamos en una variable el conteo obtenido
        const data = await response.json();

        //Almacenamos en una variable global el total obtenido del end point
        fs_totales = data[0]['COUNT(id)'];

    } catch (exception) {
        console.error("Error al obtener el conteo de las Fs: ", exception);
    }
}

/**
 * Función para obtener el conteo de las etapas usando el ID del puesto
 * @param {*} data Argumento que contiene la información de los puestos
 */
function gestionarPuesto(data) {
    //Creamos una variable para almacenar el número de peticiones completadas
    let peticionesCompletadas = 0;

    console.log("Data: ", data);

    //Almacenamos en una variable el número de puestos disponibles
    const totalPuestos = data.length;

    //Iteramos por los datos del puesto
    data.forEach(item => {
        //Preparamos la petición GET para obtener el tiempo total de un puesto
        fetch(`/film/api/tiempoTotal/${item.id}`, { method: "GET" })
            //Controlamos la respuesta
            .then(response => {
                //En caso de que sea mala
                if (!response.ok) throw new Error('Error fetching data');

                //Devolvemos los datos
                return response.json();
            })

            //Controlamos los datos
            .then(data => {
                //Almacenamos en una variable los minutos totales de un puesto
                const sumaTotal_puesto = (data.length > 0) ? data[0]["SUM(actividad_en_minutos + nuevo)"] : 0;

                //Almacenamos en el array la información necesarias
                conteosPorPuesto.push({
                    id: item.id,
                    nombre: item.nombre_puesto,
                    conteo: sumaTotal_puesto,
                    turno: item.turno
                });

                //Ordenamos los puestos por el ID del mismo
                conteosPorPuesto.sort((a, b) => a.id - b.id);

                //Aumentamos el contador de peticiones
                peticionesCompletadas++;

                //En caso de que las peticiones se hayan completado
                if (peticionesCompletadas === totalPuestos) {
                    //Establecemos a true la información
                    peticionesFinalizadas.puestos = true;

                    //Llamamos al método para controlar los datos para generar los gráficos
                    verificarFinalizacionDeDatos();
                }
            })

            //Controlamos el error
            .catch(error => console.error('Error al cargar datos:', error));
    });
}

/**
 * Función para verificar que tenemos todos los datos para renderizar los gráficos
 */
function verificarFinalizacionDeDatos() {
    //En caso de que tengamos todos los datos necesarios...
    if (peticionesFinalizadas.puestos && peticionesFinalizadas.graficoChimenea) {
        //Llamamos a la función para renderizar el gráfico
        renderizarGrafico();
    }
}

/**
 * Función para obtener la información de los puestos para rellenar los graficos de chimenes
 * @param {*} data Argumento que contiene los datos de cada puesto
 */
function gestionarGraficoChimenea(data) {
    //Creamos una variable para almacenar el número de peticiones completadas
    let peticionesCompletadas = 0;

    //Almacenamos en una variable el número de puestos disponibles
    const totalPuestos = data.length;

    //Iteramos por los datos del puesto
    data.forEach(item => {
        //Preparamos la petición GET para obtener los tiempos para generar el gráfico de chimenea
        fetch(`/film/api/graficoChimenea/${item.id}`, { method: "GET" })
            //Controlamos la respuesta
            .then(response => {
                //En caso de que sea mala
                if (!response.ok) throw new Error('Error fetching data');
                //Devolvemos los datos
                return response.json();
            })
            //Controlamos los datos
            .then(data => {
                //Iteramos por los datos obtenidos
                data.forEach(itemChimenea => {
                    //Almacenamos en el array los datos que necesitamos para generar el gráfico de chimenea
                    conteoGraficoChimenea.push({
                        id: item.id,
                        dinamico_NoVA: itemChimenea.dinamico_NoVA,
                        dinamico_VA: itemChimenea.dinamico_VA,
                        estatico_VA: itemChimenea.estatico_VA,
                        estatico_NoVA: itemChimenea.estatico_NoVA
                    });
                });

                //Almacenamos el array por el ID del puesto
                conteoGraficoChimenea.sort((a, b) => a.id - b.id);

                //Aumentamos el contador de las peticiones
                peticionesCompletadas++;

                //En caso de que no haya peticiones
                if (peticionesCompletadas === totalPuestos) {
                    //Establecemos a true la información
                    peticionesFinalizadas.graficoChimenea = true;

                    //Llamamos al método para controlar los datos para generar los gráficos
                    verificarFinalizacionDeDatos();
                }
            })

            //Controlamos el error
            .catch(error => console.error('Error al cargar datos:', error));
    });
}

/**
 * Función para representar los gráficos
 */
function renderizarGrafico() {
    //Almacenamos la instancia del contenedor de gráficos
    const graficosContainer = document.getElementById('graficos-container');
    graficosContainer.innerHTML = '';

    //Iteramos sobre los datos del puesto
    conteosPorPuesto.forEach((puesto, index) => {
        //Creamos un div para el gráfico del puesto
        const graficoContainer = document.createElement('li');

        //Añadimos la clase de Glide
        graficoContainer.classList.add('glide__slide');

        //Aplicamos estilos al contenedor del gráfico del puesto
        graficoContainer.style.display = 'flex';
        graficoContainer.style.flexDirection = 'column';
        graficoContainer.style.alignItems = 'center';
        graficoContainer.style.margin = '10px';
        graficoContainer.style.border = '1px solid #ddd';
        graficoContainer.style.padding = '15px';
        graficoContainer.style.borderRadius = '8px';
        graficoContainer.style.backgroundColor = '#496183';

        //Añadimos el ID del puesto al contenedor
        graficoContainer.setAttribute('data-id', puesto.id);

        //Añadimos el turno al contenedor
        graficoContainer.setAttribute('data-turno', puesto.turno);

        //Añadimos el gráfico al contenedor de gráficos principales
        graficosContainer.appendChild(graficoContainer);

        //Creamos el lienzo para el gráfico de la saturación
        const canvasSaturacion = document.createElement('canvas');
        canvasSaturacion.width = 200;
        graficoContainer.appendChild(canvasSaturacion);

        //Almacenamos en una variable la jornada laboral
        const jornadaTotal = 455;

        //Almacenamos la saturación del puesto
        const saturacion = (puesto.conteo / jornadaTotal) * 100;

        console.log("Puesto conteo: ", puesto.conteo, "\nSaturacion: ", saturacion, "\tNombre del puesto: ", puesto.nombre);

        //console.log("> Saturación: ", saturacion, "\nPuesto conteo: ", puesto.conteo);

        /** Inicializamos la gráfica de la saturación */
        new Chart(canvasSaturacion, {
            type: 'doughnut',
            data: {
                labels: ['Tiempo Utilizado', 'Tiempo Libre'],
                datasets: [{
                    data: [saturacion.toFixed(2), (100 - saturacion).toFixed(2)],
                    backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(211, 211, 211, 0.3)'],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: `Puesto: ${puesto.nombre}`,
                        font: { size: 13 },
                        color: '#ffffff',
                        padding: { top: 5, bottom: 10 }
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.label}: ${context.raw}%`
                        }
                    }
                },
                responsive: false,
                cutout: '70%',
                rotation: -90
            }
        });

        //Creamos el lienzo para el gráfico de las actividades
        const canvasChimenea = document.createElement('canvas');
        canvasChimenea.height = 250;
        graficoContainer.appendChild(canvasChimenea);

        //Almacenamos en una variable los datos del puesto
        const datosChimenea = conteoGraficoChimenea.find(c => c.id === puesto.id);

        //En caso de que haya datos
        if (datosChimenea) {
            /** Almacenamos en variables los datos necesarios */
            const dinamico_NoVA = datosChimenea.dinamico_NoVA || 0;
            const dinamico_VA = datosChimenea.dinamico_VA || 0;
            const estatico_VA = datosChimenea.estatico_VA || 0;
            const estatico_NoVA = datosChimenea.estatico_NoVA || 0;
            const total = (dinamico_NoVA + dinamico_VA + estatico_VA + estatico_NoVA).toFixed(2);
            //const total = 480;
            const porcentaje_NoVA = total > 0 ? ((dinamico_NoVA / total) * 100).toFixed(2) : 0;
            const porcentaje_VA = total > 0 ? ((dinamico_VA / total) * 100).toFixed(2) : 0;
            const porcentaje_estatico_VA = total > 0 ? ((estatico_VA / total) * 100).toFixed(2) : 0;
            const porcentaje_estatico_NoVA = total > 0 ? ((estatico_NoVA / total) * 100).toFixed(2) : 0;

            // const porcentaje_NoVA = total > 0 ? ((dinamico_NoVA / 60 / total) * 100).toFixed(2) : 0;
            // const porcentaje_VA = total > 0 ? ((dinamico_VA / 60 / total) * 100).toFixed(2) : 0;
            // const porcentaje_estatico_VA = total > 0 ? ((estatico_VA / 60 / total) * 100).toFixed(2) : 0;
            // const porcentaje_estatico_NoVA = total > 0 ? ((estatico_NoVA / 60 / total) * 100).toFixed(2) : 0;

            console.log(
                "Porcentaje dinamico NO VA: ", porcentaje_NoVA,
                "Valor dinamico VA: ", dinamico_NoVA,
                "Porcentaje dinamico VA: ", porcentaje_VA,
                "Porcentaje estatico VA: ", porcentaje_estatico_VA,
                "total: ", total,

                // // "Porcentaje estatico NO VA: ", porcentaje_estatico_NoVA,
                // // "Estatico no valor: ", estatico_NoVA
            )

            /** Inicializamos la gráfica de la actividad */
            new Chart(canvasChimenea, {
                type: 'bar',
                data: {
                    labels: ['Actividades'],
                    datasets: [
                        { label: 'Dinamico NoVA', data: [porcentaje_NoVA], backgroundColor: '#024d7e', borderColor: '#024d7e', borderWidth: 1, stack: 'Stack 0' },
                        { label: 'Dinamico VA', data: [porcentaje_VA], backgroundColor: '#0493f2', borderColor: '#0493f2', borderWidth: 1, stack: 'Stack 0' },
                        { label: 'Estático VA', data: [porcentaje_estatico_VA], backgroundColor: '#67adea', borderColor: '#67adea', borderWidth: 1, stack: 'Stack 0' },
                        { label: 'Estático NoVA', data: [porcentaje_estatico_NoVA], backgroundColor: '#ffffff', borderColor: '#ffffff', borderWidth: 1, stack: 'Stack 0' },
                        { label: 'Tiempo desplazamiento', data: [1], backgroundColor: '#7374cc', borderColor: '#7374cc', borderWidth: 1, stack: 'Stack 0' }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#ffffff'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                color: '#ffffff',
                                callback: value => `${value}%`
                            }
                        },
                        x: {
                            ticks: {
                                color: '#ffffff'
                            }
                        }
                    }
                }
            });
        }

        /** Creamos el contenedor para los botones */
        const botonesContainer = document.createElement('div');
        botonesContainer.id = "botonesContainer";
        botonesContainer.style.display = 'flex';
        botonesContainer.style.justifyContent = 'center';
        botonesContainer.style.gap = '8px';
        botonesContainer.style.marginTop = '10px';

        /** Botón para visualizar las etapas de un puesto */
        const { botonInformeDetallado, botonEntrePuestos, button, botonEliminarPuesto } = creacionBotones();

        //En caso de que haya un puesto
        if (puesto.nombre !== "" || puesto.nombre !== null) {
            //Añadimos los botones al contenedor
            graficoContainer.appendChild(botonesContainer);
        }

        //Funcionalidad para visualizar la información del puesto de forma detallada
        botonInformeDetallado.addEventListener('click', () => {
            //Llamamos a la función para disponer el modal
            modalPuestoDetallado(botonInformeDetallado.getAttribute('data-id'), botonInformeDetallado.getAttribute('data-nombre-puesto'));
        });

        botonInformeDetallado.setAttribute('hidden', 'true');

        //Funcionalidad para crear el desplazamiento entre puestos
        botonEntrePuestos.addEventListener('click', () => {
            const idPuesto = botonEntrePuestos.getAttribute('data-id');
            const rowData = [idPuesto, null, null];
            const rowDataJson = encodeURIComponent(JSON.stringify(rowData));
            window.open(`/film/visualizarPlano?data=${rowDataJson}`, "_blank");
        });

        //Funcionalidad para visualizar las etapas
        button.addEventListener('click', () => {
            //Llamos a la función para inicializar el botón de las etapas
            inicializarBotonEtapas(button);

            //Quitamos el resaltado de otros elementos
            document.querySelectorAll('.resaltado').forEach(el => el.classList.remove('resaltado'));

            //Buscar el <li> del contenedor del botón presionado
            const li_elemento = event.target.closest('li');

            //En caso de que lo encuentre
            if (li_elemento) {
                //Agregamos la clase
                li_elemento.classList.add('resaltado');
            }
        });

        //Funcionalidad para eliminar un puesto
        botonEliminarPuesto.addEventListener('click', () => {
            //Llamamos al método para disponer la alerta de confirmación de elemento
            const idPuesto = botonEliminarPuesto.getAttribute('data-id');
            confirmarEliminar("question", "Vas a eliminar este puesto... ¿Estas seguro de lo que vas hacer?", idPuesto, "puestos");
        });

        //Funcionalidad para ocultar el puesto
        botonOcultarPuesto.addEventListener('click', () => {
            //Creamos una instancia del LI
            const li_elemento = event.target.closest('li');

            //En caso de que se haya encontrado el elemento LI
            if (li_elemento) {
                //Agregamos la animación de ocultar el puesto
                li_elemento.classList.add('ocultarElemento');

                //Añadimos el elemento al array de puestos ocultos
                puesto_ocultos.push(li_elemento);
                setTimeout(() => {
                    li_elemento.style.display = 'none';
                }, 500);
            }
        });

        /**
         * Función para crear los botones y disponerlos en el puesto
         * @returns Devuelve los botones formateados
         */
        function creacionBotones() {
            /** Botón para visualizar las etapas */
            const button = document.createElement('button');
            button.innerHTML = '<i class="bi bi-eye"></i>';
            button.className = "bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-500 transition duration-300";
            button.setAttribute('data-id', puesto.id);
            button.setAttribute('data-nombre-puesto', puesto.nombre);
            botonesContainer.appendChild(button);

            /** Botón para eliminar un puesto */
            const botonEliminarPuesto = document.createElement('button');
            botonEliminarPuesto.innerHTML = '<i class="bi bi-trash3"></i>';
            botonEliminarPuesto.className = "bg-red-600 text-white py-1 px-2 rounded hover:bg-red-500 transition duration-300";
            botonEliminarPuesto.setAttribute('data-id', puesto.id);
            botonesContainer.appendChild(botonEliminarPuesto);

            /** Botón para crear un desplazamiento entre puestos */
            const botonEntrePuestos = document.createElement('button');
            botonEntrePuestos.innerHTML = '<i class="bi bi-person-walking"></i>';
            botonEntrePuestos.className = "bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-400 transition duration-300";
            botonEntrePuestos.setAttribute('data-id', puesto.id);
            botonesContainer.appendChild(botonEntrePuestos);

            /**Botón para visualizar la información del puesto de forma detallada */
            const botonInformeDetallado = document.createElement('button');
            botonInformeDetallado.innerHTML = '<i class="bi bi-clipboard2-data-fill"></i>';
            botonInformeDetallado.className = "bg-green-600 text-white py-1 px-2 rounded hover:bg-green-500 transition duration-300";
            botonInformeDetallado.setAttribute('data-id', puesto.id);
            botonInformeDetallado.setAttribute('data-nombre-puesto', puesto.nombre);
            botonesContainer.appendChild(botonInformeDetallado);

            /**Botón para ocultar el puesto */
            botonOcultarPuesto = document.createElement('button');
            botonOcultarPuesto.innerHTML = '<i class="bi bi-eye-slash-fill"></i>';
            botonOcultarPuesto.className = "bg-gray-600 text-white py-1 px-2 rounded hover:bg-gray-500 transition duration-300 bg-gray-700";
            botonOcultarPuesto.setAttribute('data-id', puesto.id);
            botonesContainer.appendChild(botonOcultarPuesto);

            //Devolvemos los botones
            return { botonInformeDetallado, botonEntrePuestos, button, botonEliminarPuesto, botonOcultarPuesto };
        }
    });

    //Creamos un contenedor vacio para añadirlo al final del slider
    const dummySlide = document.createElement('li');
    dummySlide.classList.add('glide__slide');
    dummySlide.style.visibility = 'hidden';
    graficosContainer.appendChild(dummySlide);

    //Inicializamos Glide.js
    const glide = new Glide('.glide', {
        //Especificamos el tipo
        type: 'slider',

        //El número de elementos que se mostrarán al mismo tiempo
        perView: 4,

        //Espacio entre los elementos
        gap: 20,

        //Centramos la vista en el primer puesto
        focusAt: 0,

        //Configuramos los puntos de interrupción dependiendo de tipo de pantallas
        breakpoints: {
            1024: { perView: 2 },
            768: { perView: 1 }
        }
    });

    //Montamos el carrusel
    glide.mount();
}

/**
 * Función para inicializar el botón de visualizar las etapas
 * @param {} button Argumento que contiene el botón de visualizar las etapas
 */
function inicializarBotonEtapas(button) {
    //Añadimos un control el último botón de visualizar las etapas... en casa de que haya un botón pulsado
    if (ultimoBotonPulsado) {
        //Quitamos el color del fondo del botón
        ultimoBotonPulsado.style.backgroundColor = "";

        //Le quitamos la clase
        ultimoBotonPulsado.classList.remove("bg-highlight");
    }

    //Establecemos color al fondo del botón
    button.style.backgroundColor = "#7b8f8f";

    //ALmacenamos el último botón pulsado
    ultimoBotonPulsado = button;

    //Almacenamos el ID del puesto de los atributos del botón
    const puestoId = button.getAttribute('data-id');

    //Almacenemos el nombre del puesto de los atributos del botón
    const nombrePuesto = button.getAttribute('data-nombre-puesto');

    //Almacenamos el ID del puesto en la variable global
    puestoID = puestoId;

    //Creamos una instancia del botón de añadir la etapa
    const botonAnyadirEtapa = document.getElementById('anyadirEtapa');

    //Aplicamos el estilo al botón de añadir puesto
    botonAnyadirEtapa.classList.add('resaltadoBotones');

    //Aplicamos el atributo 'onclick'
    botonAnyadirEtapa.setAttribute('onclick', `anyadirEtapa(${puestoId})`);

    //Mostramos el botón de añadir la etapa
    botonAnyadirEtapa.style.display = 'block';

    //Creamos una instancia del buscador
    const botonBuscadorEtapas = document.getElementById('buscadorEtapa');

    //Mostramos el buscador
    botonBuscadorEtapas.style.display = 'block';

    //Añadimos el título al encabezado de la sección de las etapas
    document.getElementById('tituloPrincipalEtapasDisponibles').textContent = "Etapas disponibles para el puesto: " + nombrePuesto;

    //Llamamos a la función para visualizar el turno
    obtenerTurno(puestoId);

    //Llamamos a la función para disponer las etapas
    obtenerEtapas(puestoId);
}

/**
 * Función para disponer el turno del puesto
 * @param {int} puestoId Argumento que contiene el ID del puesto
 */
function obtenerTurno(puestoId) {
    //Preparamos la solicitud GET para obtener los turnos
    fetch(`/film/api/obtenerTurno/${puestoId}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Controlamos que haya datos
            if (data.length !== 0) {
                //Llamamos a la función para disponer la información en el panel de opciones
                disponerTurno(data[0].turno, data[0].jornada_inicio, data[0].jornada_fin);

                //En cualquier otro caso...
            } else {
                //Ocultamos el contenedor del turno
                document.getElementById('visualizarTurno').classList.remove('block');
                document.getElementById('visualizarTurno').classList.add('hidden');
            }
        });
}

/**
 * Función para disponer la jornada laboral de un puesto en el panel de opciones
 * @param {String} turno Argumento que contiene el turno del puesto
 * @param {String} jornadaInicio Argumento que contiene el inicio de la jornada
 * @param {String} jornadaFin Argumento que contiene el final de la jornada
 */
function disponerTurno(turno, jornadaInicio, jornadaFin) {
    //Creamos una variable para almacenar el turno y el icono
    let turno_final, icono;

    //Controlamos el turno... en caso de que el turno sea de mañana
    if (turno === "M") {
        turno_final = "Mañana";
        icono = '<i class="bi bi-brightness-alt-high-fill"></i>';

        //En caso de que el turno sea de tarde
    } else if (turno === "T") {
        turno_final = "Tarde";
        icono = '<i class="bi bi-brightness-high-fill"></i>';

        //En caso de que el turno sea de noche
    } else if (turno === "N") {
        turno_final = "Noche";
        icono = '<i class="bi bi-moon-fill"></i>';
    }

    //En caso de que haya datos...
    if (turno || jornadaInicio || jornadaFin) {
        //Establecemos el título del modal
        document.getElementById('jornadaLaboralTitle').innerHTML = `Jornada Laboral: ${turno_final} ${icono}`;

        //Establecemos el inicio de la jornada
        document.getElementById('jornadaInicio').innerText = jornadaInicio.split('T')[1].split('.')[0];

        //Establecemos el final de la jornada
        document.getElementById('jornadaFinal').innerText = jornadaFin.split('T')[1].split('.')[0];

        console.log("Jornada inicio: ", jornadaInicio, "\tJornada final: ", jornadaFin)

        //Mostramos el contenedor de la jornada
        document.getElementById('visualizarTurno').classList.remove('hidden');
        document.getElementById('visualizarTurno').classList.add('block');

        //En cualquier otro caso...
    } else {
        //Ocutamos el contenedor de los turnos
        document.getElementById('visualizarTurno').classList.remove('block');
        document.getElementById('visualizarTurno').classList.add('hidden');
    }
}

/**
 * Función para disponer la alerta para eliminar un elemento
 * @param {String} icono Argumento que contiene el tipo de icono
 * @param {String} titulo Argumento que contiene el titulo de la alerta
 * @param {int} id Argumento que contiene el ID del elemento a eliminar
 * @param {String} tabla Argumento que contiene el nombre de la tabla
 */
function confirmarEliminar(icono, titulo, id, tabla) {
    //Configuramos y mostramos la alerta
    Swal.fire({
        title: titulo,
        icon: icono,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: "Si",
        cancelButtonText: "No"
    }).then(result => {
        //En caso de que el usuario haya pulsado sobre el confirmar
        if (result.isConfirmed) {
            //Llamamos a la función para eliminar el elemento
            eliminarRegistro(id, tabla);
        }
    });
}

/**
 * Función para obtener las etapas asociadas a un puesto usando el ID del mismo
 * @param {int} puestoID Argumento que contiene el ID del puesto seleccioonado
 */
function obtenerEtapas(puestoID) {
    //Iniciamos la solicitud GET para obtener las etapas de un puesto
    fetch(`/film/api/obtenerEtapas_Puesto/${puestoID}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que se produzca un error
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos la información formateada
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            data.sort((a, b) => a.orden - b.orden); // Asegurar orden correcto
            //Llammos al método para mostrar las etapas de un puesto
            generarTablasPorEtapa(data);
        });
}

/**
 * Función para calcular el número de la semana actual
 */
function obtenerNumeroSemana(fecha = new Date()) {
    //Creamos una copia del argumento
    const fecha_copia = new Date(fecha.getTime());

    //Establecemos el primero día como lunea
    const diaSemana = fecha_copia.getUTCDay() || 7;
    fecha_copia.setUTCDate(fecha_copia.getUTCDate() + 4 - diaSemana);

    //Creamos una variable con el primer día del año
    const inicioAño = new Date(Date.UTC(fecha_copia.getUTCFullYear(), 0, 1));

    //Calculamos el número de la semana
    const numeroSemana = Math.ceil(((fecha_copia - inicioAño) / 86400000 + 1) / 7);

    //Devolvemos el día de la semana
    return numeroSemana;
}

/**
 * Función para disponer la información detalla del puesto
 */
function modalPuestoDetallado(puesto_id, nombre_puesto) {
    //Eliminamos el contenido del cuerpo del modal
    $('#modalDetalle .modal-body').html(``);

    //Configuramos el título del modal
    $('#modalDetalle .modal-title').text("Detalles del puesto: ", nombre_puesto);

    //Almacenamos en auna variable la semana actual
    const semana_actual = obtenerNumeroSemana();

    //Preparamos la petición GET para obtener las referencias asociadas al puesto
    fetch(`/film/api/obtenerReferencias-puesto/${puesto_id}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que no sea válida
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Llamamos a la función para obtener las fechas de las referencias
            obtenerFechas_Referencias(puesto_id, data);
        });
}

/**
 * Función para obtener las fechas de cada referencia
 * @param {int} puesto_id Argumento que contiene el ID del puesto
 * @param {Array} data Array que contiene las referencias de un puesto junto al tipo de operación
 */
function obtenerFechas_Referencias(puesto_id, data) {
    //Iteramos por las referencias obtenidas
    data.forEach(item => {
        //Preparamos la peticón GET para obtener las fechas
        //fetch(`/film/api/obtenerFechas-Programa-Recepcion/${item.referencia_componente}/${item.tipo_operacion}`, {
        fetch(`/film/api/obtenerCantidad-grafico/${item.referencia_componente}/${'2025-04-30'}/${puesto_id}`, {
            method: "GET"
        })
            //Controlamos la respuesta
            .then(response => {
                //En caso de que no haya salido bien
                if (!response.ok) {
                    throw new Error('Error fetching data');
                }

                //Devolvemos los los fechas obtenidas
                return response.json();
            })

            //Controlamos las fechas
            .then(data => {
                //Llamamos a la función para disponer el el modal del informe detallado
                configurarModalInformeDetallado(data);
            });
    })
}

/**
 * Función para configurar el modal para mostrar el informe detallado
 * @param {Array} data Array que contiene las fechas de las referencias
 */
function configurarModalInformeDetallado(data) {
    //Almacenamos en una variable las fechas formateadas de forma correcta
    // const fechas_formateadas = data.map(item => {
    //     return item.fecha.split('T')[0];
    // });

    $('#informe-detallado').fadeIn();
}

/**
 * Función para representar las etapas por puesto
 * @param {*} etapas Argumento que contiene la información de las etapas
 */
function generarTablasPorEtapa(etapas) {
    //Obtenemos el contenedor donde se agregarán las tablas
    let contenedorTablas = document.getElementById('tablaEtapas');
    contenedorTablas.innerHTML = '';

    //Creamos un mapa para agrupar las etapas por el valor "F"
    const agrupadoPorF = etapas.reduce((acc, etapa) => {
        if (!acc[etapa.F]) {
            acc[etapa.F] = [];
        }
        acc[etapa.F].push(etapa);
        return acc;
    }, {});

    //Iteramos sobre cada grupo de "F" para crear una tabla por cada uno
    Object.keys(agrupadoPorF).forEach(FKey => {
        //Almacenamos en una variable las etapas del grupo "F"
        const etapasDeF = agrupadoPorF[FKey];
        console.log(`ETAPA: ${etapasDeF[0].F} -> ${etapasDeF[0].orden}`)


        console.log("Etapas DEF: ", etapasDeF)

        //Almacenamos en variables la información básica de la etapa
        const id_etapa1 = etapasDeF[0].id;
        let linea = etapasDeF[0].linea;
        let speed = etapasDeF[0].speed;
        const f = etapasDeF[0].F;
        const numero_picadas = etapasDeF[0].numero_picadas
        const id_puesto = etapasDeF[0].id_puesto;
        const actividad_en_minutos_x_picada = etapasDeF[0].nuevo_picadas;

        console.log("ID1:", id_etapa1)

        //Creamos una solicitud para obtener los datos de las etapas
        fetch(`/film/api/obtenerEtapas/${encodeURIComponent(FKey)}`, {
            method: "GET"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching etapas');
                }
                return response.json();
            })
            .then(etapasData => {
                etapasDeF.forEach((etapaDeF, index) => {
                    /** Almacenamos las variable necesarias */
                    var { mote_etapa, referenciaComponente, nombre_etapa, actividad_en_minutos, id_etapa, distancia_total, TL_TV, numero_curvas, CDV_CDL, numero_cruces, NC, numero_puertas, NP, PS10, PS14, simbolo_especial, valor_simbolo_especial, DC221, TC_TL, DS10, CDL, CCPE, TC, CT10, PP1, TL, M1, DL, PDU34, PPU34, TV, PPD32, PDD34, PPU43, CHMAN, numberOfPackagesLoadedAtOnce, CHMAN_2, CHMAN_3, DC113, CDC, PS15, DI21, DS14, DS15, DC, D1, W5, TT, AL, P2, L2, G1, P5, W5_2, nuevo, nuevo_picadas, tiempo_distancia_total } = inicializarVariablesEtapas(etapaDeF);

                    console.log("ID:", id_etapa, "\fnombre:", nombre_etapa);

                    //En caso de que no haya una descripción para la etapa....
                    if (mote_etapa === null || mote_etapa === "null") {
                        //Asignnamos un icono
                        mote_etapa = '<i class="bi bi-stars"></i>';
                    }

                    //En caso de que no haya una linea para la etapa...
                    if (linea === null || linea === "null") {
                        //Asignamos un icono
                        linea = '<i class="bi bi-stars"></i>';
                    }

                    //Preparamos la petición GET para obtener el conteos de UM
                    fetch(`/film/api/conteoUM/${referenciaComponente}`, {
                        method: "GET"
                    })
                        //Controlamos la respuesta
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Error fetching total pieces');
                            }
                            return response.json();
                        })

                        //Controlamos la respuesta
                        .then(totalPiecesData => {
                            let totalPieces = totalPiecesData[0].total_pieces || 1;
                            let color_etapa;
                            let actividad_en_minutos_final = 0;

                            //Creamos un if para controlar la distancia total de la etapa y asi poder modificar el color de la misma... en caso de la distancia sea de 0 a 49
                            if (distancia_total >= 0 && distancia_total <= 49) {
                                //Asignamos el color verde
                                color_etapa = 'bg-green-300';

                                //En caso de que la distancia sea entre de 50 a 100
                            } else if (distancia_total >= 50 && distancia_total <= 99) {
                                //Asignamos el color amarillo
                                color_etapa = 'bg-yellow-300';

                                //En caso de que la distancia sea más de 100
                            } else if (distancia_total >= 100) {
                                //Asignamos el color rojo
                                color_etapa = 'bg-red-300';

                                //En cualquier otro caso
                            } else {
                                //Asignamos el color azul
                                color_etapa = 'bg-blue-300';
                            }

                            //Generamos el HTML de la tabla para la etapa
                            const tablaHTML = `
                                <div id="${id_etapa1}-${id_puesto}" class="mb-4 draggable-container" data-id-etapa="${id_etapa}">
                                    <h3 id="encabezadoEtapa-${FKey}-${referenciaComponente}"
                                        class="text-lg font-semibold mb-2 flex flex-wrap justify-between items-center p-2 rounded-lg animate-fadeIn 
                                            ${f === 'X' ? 'bg-stone-200 text-black' : color_etapa} text-black"
                                        ${f !== 'X' ? `onclick="toggleVisibility('etapa-${FKey}-${referenciaComponente}')"` : ''}>

                                        <span class="min-w-[150px]">Etapa: <strong>${nombre_etapa}</strong></span>
                                        <span class="min-w-[150px]">Descripción: <strong>${mote_etapa}</strong></span>
                                        ${f !== 'X' ? `<span class="min-w-[150px]">Componente: <strong>${referenciaComponente}</strong></span>` : ''}
                                        ${f !== 'X' ? `<span class="min-w-[150px]">Línea: <strong>${linea}</strong></span>` : ''}
                                        <span class="min-w-[150px]"><i class="bi bi-stopwatch-fill"></i> <strong>${actividad_en_minutos_x_picada}</strong></span>

                                        ${f !== 'X' ? `
                                            <button id="botonVisualizarEtapa" type="button" class="text-blue-500 ml-2" 
                                                onclick="visualizarEtapa('${FKey}', '${referenciaComponente}', '${id_etapa}')">
                                                <i class="bi bi-file-earmark-ruled"></i>
                                            </button>`
                                    : ''}

                                        <button id="botonEliminarEtapa" type="button" class="text-red-500 ml-2" 
                                            onclick="eliminarRegistro('${id_etapa}', 'EN_IFM_STANDARD')">
                                            <i class="bi bi-trash-fill"></i>
                                        </button>

                                        <button id="botonActualizarEtapa" hidden type="button" class="text-red-500 ml-2" 
                                            onclick="actualizarEtapa('${id_etapa}', 'EN_IFM_STANDARD')">
                                            <i class="bi bi-trash-fill"></i>
                                        </button>

                                        ${f !== 'X' ? `
                                            <button id="botonGestionarEtapa" type="button" class="text-gray-500 ml-2" 
                                                onclick="gestionarEtapa('${id_etapa}')">
                                                <i class="bi bi-arrows-move"></i>
                                            </button>`
                                    : ''}
                                    </h3>

                                    <div id="etapa-${FKey}-${referenciaComponente}" class="${f === 'X' ? 'hidden' : 'hidden animate-slideInUp'}">
                                        <table class="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                                            <thead>
                                                <tr class="bg-gray-100">
                                                    <th class="px-4 py-2 border">Operación</th>
                                                    <th class="px-4 py-2 border">Símbolo (estándar MTM3)</th>
                                                    <th class="px-4 py-2 border">Distancia (metros)</th>
                                                    <th class="px-4 py-2 border"><i class="bi bi-arrow-clockwise"></i></th>
                                                    <th class="px-4 py-2 border"><i class="bi bi-clock-history"></i> Minutos</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                ${etapasData.map(etapa => {
                                        let distanceValue = etapa.distance || 0, tiempoCalculado = 0;

                                        if (etapa.symbol === 'TL' || etapa.symbol === 'TV' && f === 'F29') {
                                            distanceValue = distancia_total;
                                            tiempoCalculado = TL_TV;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'CDV') {
                                            tiempoCalculado = CDV_CDL;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'NC') {
                                            distanceValue = numero_cruces;
                                            tiempoCalculado = NC;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'NP') {
                                            distanceValue = numero_puertas;
                                            tiempoCalculado = NP;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'PS10') {
                                            tiempoCalculado = PS10;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'PS14') {
                                            tiempoCalculado = PS14;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'CC124') {
                                            etapa.symbol = simbolo_especial;
                                            distanceValue = valor_simbolo_especial;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'DC221') {
                                            tiempoCalculado = DC221;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'TL' && f === "F29") {
                                            distanceValue = distancia_total;
                                            tiempoCalculado = TC_TL;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'DS10') {
                                            tiempoCalculado = DS10;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'CDL') {
                                            tiempoCalculado = CDL;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'CCPE') {
                                            tiempoCalculado = CCPE;
                                        } else if (etapa.symbol === 'TC') {
                                            distanceValue = distancia_total;
                                            tiempoCalculado = TC;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'CT10') {
                                            tiempoCalculado = CT10;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'PP1') {
                                            tiempoCalculado = PP1;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === "TL" && f !== 'F29') {
                                            tiempoCalculado = TL;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'M1') {
                                            tiempoCalculado = M1;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'DL') {
                                            tiempoCalculado = DL;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'PDU34') {
                                            tiempoCalculado = PDU34;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'PPU34') {
                                            tiempoCalculado = PPU34;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'TV') {
                                            tiempoCalculado = TV;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'PPD32') {
                                            tiempoCalculado = PPD32;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'PDD34') {
                                            tiempoCalculado = PDD34;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'PPU43') {
                                            tiempoCalculado = PPU43;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === "CHMAN" && f === 'Coger bac y colocar en carro/estanteria') {
                                            distanceValue = CHMAN;
                                            tiempoCalculado = etapaDeF.cantidad_a_mover * CHMAN;

                                            actividad_en_minutos = ((CHMAN * 2) + distancia_total) / 100;
                                            actividad_en_minutos_final += tiempoCalculado;

                                        } else if (etapa.symbol === 'CHMAN' && f === 'Carga cassette nacelle J 22 bacs') {
                                            distanceValue = CHMAN;
                                            tiempoCalculado = etapaDeF.cantidad_a_mover * distanceValue;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'CHMAN_2' && f === 'Carga cassette nacelle J 22 bacs') {
                                            distanceValue = 136;
                                            tiempoCalculado = etapaDeF.cantidad_a_mover * distanceValue;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === "CHMAN_3" && f === 'Carga cassette nacelle J 22 bacs') {
                                            distanceValue = CHMAN_3;
                                            tiempoCalculado = etapaDeF.cantidad_a_mover * CHMAN_3;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (f === 'Carga cassette nacelle J 22 bacs') {
                                            actividad_en_minutos = ((CHMAN + CHMAN_2 + CHMAN_3) + (distancia_total * 0.6)) / 100
                                        } else if (etapa.symbol === 'CHMAN' && f === 'Colocacion carros manualmente') {
                                            distanceValue = CHMAN;
                                            tiempoCalculado = etapaDeF.cantidad_a_mover * CHMAN;

                                            actividad_en_minutos = ((CHMAN + distancia_total)) / 100;
                                            actividad_en_minutos_final += tiempoCalculado;

                                        } else if (etapa.symbol === "CHMAN") {
                                            distanceValue = CHMAN;
                                            tiempoCalculado = etapaDeF.cantidad_a_mover * CHMAN;

                                            let valor;

                                            if (speed === 10) {
                                                valor = 0.6
                                            } else if (speed === 12) {
                                                valor = 0.5;
                                            } else if (speed === 15) {
                                                valor = 0.4;
                                            } else if (speed === 20) {
                                                valor = 0.3
                                            }

                                            actividad_en_minutos = ((CHMAN * 2) + (distancia_total * valor)) / 100;
                                            actividad_en_minutos_final += tiempoCalculado;

                                        } else if (etapa.symbol === 'DC113') {
                                            tiempoCalculado = DC113;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'CDC') {
                                            tiempoCalculado = CDC;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'PS15') {
                                            tiempoCalculado = PS15;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'DI21') {
                                            tiempoCalculado = DI21;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'DS14') {
                                            tiempoCalculado = DS14;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'DS15') {
                                            tiempoCalculado = DS15;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'DC') {
                                            tiempoCalculado = DC;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'D1') {
                                            tiempoCalculado = D1;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'W5') {
                                            tiempoCalculado = W5;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'TT') {
                                            tiempoCalculado = TT;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'AL') {
                                            tiempoCalculado = AL;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'P2') {
                                            tiempoCalculado = P2;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'L2') {
                                            tiempoCalculado = L2;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'G1') {
                                            tiempoCalculado = G1;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'P5') {
                                            tiempoCalculado = P5
                                            actividad_en_minutos_final += tiempoCalculado;
                                        } else if (etapa.symbol === 'W5_2') {
                                            tiempoCalculado = W5_2;
                                            actividad_en_minutos_final += tiempoCalculado;
                                        }

                                        if (speed === 10) {
                                            valor = 0.6
                                        } else if (speed === 12) {
                                            valor = 0.5;
                                        } else if (speed === 15) {
                                            valor = 0.4;
                                        } else if (speed === 20) {
                                            valor = 0.3
                                        } else {
                                            valor = 1;
                                        }
                                        tiempoDesplazamiento = Math.round((distancia_total * valor * etapaDeF.cantidad_a_mover) / 100)


                                        return `
                                    <tr>
                                        <td class="px-4 py-2 border">${etapa.method_operation}</td>
                                        <td class="px-4 py-2 border">${etapa.symbol}</td>
                                        <td class="px-4 py-2 border">${distanceValue}</td>
                                        <td class="px-4 py-2 border">${etapaDeF.cantidad_a_mover}</td>
                                        <td class="px-4 py-2 border">${tiempoCalculado}</td>
                                    </tr>
                                `;
                                    }).join('')}${console.log("Tiempo desplazamiento: ", tiempoDesplazamiento)}
}
                            
                                                <tr>
                                                    <td class="px-4 py-2 border font-semibold" rowspan="2">Distancia</td>
                                                    <td class="px-4 py-2 border font-semibold">Metros<br>${distancia_total}</td>
                                                    <td class="px-4 py-2 border font-semibold">Velocidad<br>${valor}</td>
                                                    <td class="px-4 py-2 border font-semibold">${etapaDeF.cantidad_a_mover}</td>
                                                    <td class="px-4 py-2 border">${tiempo_distancia_total}</td>
                                                </tr>

                                                <tr>
                                                </tr>

                                                <tr>
                                                    <td class="px-4 py-2 border font-semibold" colspan="4">Actividad total en minutos</td>
                                                    <td class="px-4 py-2 border">${nuevo}</td>
                                                </tr>

                                                <tr>
                                                    <td class="px-4 py-2 border font-semibold" colspan="4">Actividad en minutos (según el número de picadas simultáneas)</td>
                                                    <td class="px-4 py-2 border">${nuevo_picadas}</td>
                                                </tr>

                                                <tr>
                                                    <td class="px-4 py-2 border font-semibold" colspan="4">Número de picadas</td>
                                                    <td class="px-4 py-2 border">${numero_picadas}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            `;

                            let orden = [];

                            contenedorTablas.insertAdjacentHTML('beforeend', tablaHTML);
                            

                            // Inicializa SortableJS en el contenedor de las tablas
                            new Sortable(contenedorTablas, {
                                animation: 150,
                                ghostClass: 'sortable-ghost',
                                handle: '.draggable-container',
                                onStart: function(evt) {
                                    // Llenar el array 'orden' antes de que comience el cambio
                                    orden = Array.from(contenedorTablas.children).map(child => child.id);
                                    console.log("Orden inicial: ", orden);
                                },
                                onEnd: function(evt) {
                                    console.log("Orden antes de enviarlo al servidor:", orden);
                                    
                                    // Actualiza el array 'orden' con los nuevos valores
                                    orden = Array.from(contenedorTablas.children).map(child => child.id);
                                    console.log("Orden actualizado: ", orden);
                                    
                                    // Enviar el orden al backend
                                    ordernarEtapa(orden);
                                }
                            });
                        })
                        .catch(error => {
                            console.error('Error fetching total pieces:', error);
                        });
                });
            })
            .catch(error => {
                console.error('Error fetching etapas:', error);
            })
    });
}

/**
 * Función para actualizar el orden de las etapas
 * @param {Array} array Argumento que contiene las etapas ordenadas
 */
function ordernarEtapa(array) {
    console.log("Array enviado al servidor:", array);
    let arrayString = array.join(','); // Unir con "," para enviarlo correctamente
    console.log("ArrayString enviado al servidor:", arrayString);

    // Enviar la solicitud al servidor
    fetch(`/film/api/actualizarOrden/${encodeURIComponent(arrayString)}`, {
        method: "PUT",
    })
    .then(response => {
        if (response.ok) {
            console.log('Orden actualizado correctamente');
        } else {
            console.error('Error al actualizar el orden');
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });
}

/**
 * Función para configurar el cuerpo del modal con los datos de la etapa
 * @param {Array} data Argumento que contiene los datos de la etapa 
 */
function gestionarEtapa_Visualizacion(data) {
    //Creamos un stwich para controlar el tipo de F
    switch (data[0].F) {
        //F5
        case 'F5':
            //Llamamos a la función para configurar el cuerpo del modal F5
            configurarModal_F5(data);
            break;

        //F29
        case 'F29':
            //Llamamos a la función para configurar el cuerpo del modal F29
            configurarModal_F29(data);
            break;

        //F10
        case 'F10':
            //Llamamos a la función para configurar el cuerpo del modal F10
            configurarModal_F10(data);
            break;

        //F14
        case 'F14':
            //Llamamos a la función para configurar el cuerpo del modal F14
            configurarModal_F14(data);
            break;

        //F27
        case 'F27':
            //Llamamos a la función para confdigurar del modal F27
            configurarModal_F27(data);
            break;

        //F12
        case 'F12':
            //Llamamos a la función para condigurar el cuerpo del modal F12
            configurarModal_F12(data);
            break;

        //Coger UC/UM y dejar en stock altura media
        case 'Coger UC/UM y dejar en stock altura media':
            //Llamamos a la función para configurar el modal
            configurarModal_Coger_UC_UM_dejar_stock_altura_media(data);
            break;

        //Coger bac y colocar en carro/estanteria
        case 'Coger bac y colocar en carro/estanteria':
            //Llamamos a la función para configfurar el modal
            configurarModal_Coger_bac_colocar_en_carro_estanteria(data);
            break;

        //Carga cassette nacelle J 22 bacs
        case 'Carga cassette nacelle J 22 bacs':
            //Llamamos a la función para configurar el modal
            configurarModal_carga_cassette_nacelle_J_22_bacs(data);
            break;

        //Colocacion carros manualmente
        case 'Colocacion carros manualmente':
            //Llamamos a la función para configurar el modal
            configurarModal_colocacionCarrosManualmente(data);
            break;

        default:
            confifurarModal_general(data);
            break;
    }
}

function confifurarModal_general(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `);

    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para condfigurar los datos de la etapa Colocacion carros manualmente
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarModal_colocacionCarrosManualmente(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `);

    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para configurar los datos de la etapa Coger bac y colocar en carro/estanteria
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarModal_carga_cassette_nacelle_J_22_bacs(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `);

    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modal').modal('show');
}


/**
 * Función para configurar los datos de la etapa Coger bac y colocar en carro/estanteria
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarModal_Coger_bac_colocar_en_carro_estanteria(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `);

    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para disoner los datos de la etapa Coger UC/UM y dejar en stock altura media
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarModal_Coger_UC_UM_dejar_stock_altura_media(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `);

    //Llamamos a la función para establecer la información de la etapa dentro del cuerpo del modal
    //configurarEtapaF12(data);

    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para disoner los datos de la etapa F29
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarModal_F12(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <!--CONTENEDOR COMENTARIO-->
            <h4 class="text-xl font-semibold mb-4">Comentario</h4>
            <div class="mb-6">
                <textarea id="comentario" name="comentario" class="w-full h-24 p-2 border border-gray-300 rounded-md" disabled></textarea>
            </div>

            <hr class="my-4">

            <!--CONTENEDOR AJUSTES-->
            <!--Distancia-->
            <div class="mb-4" hidden>
                <label class="block text-gray-700 font-medium mb-2">Distancia GR <i class="bi bi-arrow-right"></i> tienda</label>
                <input type="number" id="distancia" name="distancia" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Distancia GR --> tienda" value="1">
            </div>
            <!--Número de bultos-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Número de bultos por pila en GR</label>
                <input type="number" id="numero_bultos" name="numero_bultos" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Número de bultos por pila en GR" value="1">
            </div>
            <!--Altura del embalaje-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Altura del embalaje</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="altura_embalaje" name="altura_embalaje">
                    <option value="40m<-H<-0">40m<-H<-0</option>
                    <option value="65m">65m</option>
                    <option value="66m<-H<-0">66m<-H<-0</option>
                    <option value="95m">95m</option>
                    <option value="H->0">H->0</option>
                    <option value="96m">96m</option>
                </select>
            </div>
            <!--Almacenamiento de embalajes mediante-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Almacenamiento de embalajes mediante</label>
                <input type="number" id="almacenamiento_embalajes" name="almacenamiento_embalajes" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Almacenamiento de embaajes mediante" value="1">
            </div>

            <hr class="my-4">

            <!--CONTENEDOR CONDICIONES-->
            <h4 class="text-xl font-semibold mb-4">Condiciones</h4>
            <!--Equipo utilizado-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Equipo utilizado</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="maquina_usada" name="maquina_usada">
                    <option value="Carretilla elevadora eléctrica acompañada">Carretilla elevadora eléctrica acompañada</option>
                    <option value="Carretilla elevadora eléctrica con conductor sentado">Carretilla elevadora eléctrica con conductor sentado</option>
                    <option value="Carretilla elevadora eléctrica con apilador acompañante">Carretilla elevadora eléctrica con apilador acompañante</option>
                    <option value="Apilador eléctrico delantero">Apilador eléctrico delantero</option>
                    <option value="Apilador eléctrico con mástil retráctil">Apilador eléctrico con mástil retráctil</option>
                    <option value="Apilador térmico delantero">Apilador térmico delantero</option>
                    <option value="Tractor eléctrico de 200 a 500 daN">Tractor eléctrico de 200 a 500 daN</option>
                    <option value="Tractor eléctrico de 1500 daN">Tractor eléctrico de 1500 daN</option>
                    <option value="Tractor térmico (agrícola)">Tractor térmico (agrícola)</option>
                    <option value="Ninguno">Ninguno</option>
                </select>
            </div>
            <!--Velocidad-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad de la máquina usada</label>
                <input type="text" id="velocidad_maquina_usada" name="velocidad_maquina_usada" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Speed machine used" disabled>
            </div>
            <!--Código MTM3-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Código MTM3</label>
                <input type="text" id="codigo_mtm3" name="codigo_mtm3" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Código MTM3" disabled>
            </div>
            <!--Velocidad de la máquina-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="velocidad" name="velocidad">
                    <option value="10" ${speed === "10" ? "selected" : ""}>10 km/h</option>
                    <option value="12" ${speed === "12" ? "selected" : ""}>12 km/h</option>
                    <option value="15" ${speed === "15" ? "selected" : ""}>15 km/h</option>
                    <option value="20" ${speed === "20" ? "selected" : ""}>20 km/h</option>
                </select>
            </div>
            <!--Correspondencia-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Correspondencia</label>
                <input type="text" id="correspondencia" name="correspondencia" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Correspondencia" disabled>
            </div>
            <!--En la tienda pila de-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">En pila de</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="en_pila_de" name="en_pila_de">
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
            </div>
            <!--Soporte embalaje-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Soporte embalaje</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="soporte_embalaje" name="soporte_embalaje">
                    <option value="Unitario">Unitario</option>
                    <option value="Doble">Doble</option>
                </select>
            </div>

            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `);

    //Llamamos a la función para establecer la información de la etapa dentro del cuerpo del modal
    configurarEtapaF12(data);

    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para disponer la información los datos de la etapa F12
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarEtapaF12(data) {
    ///Delcaramos las variables necesarias
    let comentario, distancia, numero_bultos, altura_embalaje, almacenamiento_embalaje, equipo_utilizado, codigo_mtm3, correspondencia, en_pila_de, soporte_embalaje;

    //Iteramos sobre el array
    data.forEach(item => {
        comentario = item.comments;
        distancia = item.distancia;
        numero_bultos = item.numero_bultos_por_pila;
        altura_embalaje = item.altura_embalaje;
        almacenamiento_embalaje = item.almacenamiento_emlabajes_mediante;
        equipo_utilizado = item.engins;
        codigo_mtm3 = item.code_MTM3;
        correspondencia = item.correspondance;
        en_pila_de = item.en_la_tienda_pila;
        soporte_embalaje = item.soporte_embalaje;
    });

    //Llamamos a la función para dar funcionalidad al campo de la velocidad
    funcionalidadVelocidad();

    /**Añadimos la información a los campos */
    //Categoria de los comentarios
    document.getElementById('comentario').value = comentario;

    //Categoria de los ajustes
    document.getElementById('distancia').value = distancia;
    document.getElementById('numero_bultos').value = numero_bultos;
    document.getElementById('altura_embalaje').value = altura_embalaje;
    document.getElementById('almacenamiento_embalajes').value = almacenamiento_embalaje;
    document.getElementById('maquina_usada').value = equipo_utilizado;
    document.getElementById('codigo_mtm3').value = codigo_mtm3;
    document.getElementById('correspondencia').value = correspondencia;
    document.getElementById('en_pila_de').value = en_pila_de;
    document.getElementById('soporte_embalaje').value = soporte_embalaje;
}

/**
 * Función para disponer los datos de la etapa F10
 * @param {Array} Argumento que contiene los datos de la etapa
 */
function configurarModal_F27(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <!--CONTENEDOR COMENTARIO-->
            <h4 class="text-xl font-semibold mb-4">Comentario</h4>
            <div class="mb-6">
                <textarea id="comentario" name="comentario" class="w-full h-24 p-2 border border-gray-300 rounded-md" disabled></textarea>
            </div>

            <hr class="my-4">

            <!--CONTENEDOR AJUSTES-->
            <!--Distancia del remolque-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Distancia del remolque <i class="bi bi-arrow-right"></i> zona GE vacia</label>
                <input type="number" id="distancia_remolque" name="distancia_remolque" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Distancia del remolque --> zona GE vacia" value="1">
            </div>
            <!--Altura del paquete-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Altura del paquete</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="altura_paquete" name="altura_paquete">
                    <option value="0,40m<h<0,65m">0,40m<h<0,65m</option>
                    <option value="0,66m<h<0,95m">0,66m<h<0,95m</option>
                    <option value="h>0,96m">h>0,96m</option>
                </select>
            </div>
            <!--Número de paquetes por pila-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Número de paquetes por pila en el área de almacenamiento</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="numero_paquetes_pila" name="numero_paquetes_pila">
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
            </div>
            <!--Número UC por UM-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Cantidad de UC por palé</label>
                <input type="number" id="cantidad_uc_por_pallet" name="cantidad_uc_por_pallet" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Cantidad de UC por palé" disabled>
            </div>

            <hr class="my-4">

            <!--CONTENEDOR CONDICIONES-->
            <h4 class="text-xl font-semibold mb-4">Condiciones</h4>
            <!--Equipo utilizado-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Equipo utilizado</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="maquina_usada" name="maquina_usada">
                    <option value="Carretilla elevadora eléctrica acompañada">Carretilla elevadora eléctrica acompañada</option>
                    <option value="Carretilla elevadora eléctrica con conductor sentado">Carretilla elevadora eléctrica con conductor sentado</option>
                    <option value="Carretilla elevadora eléctrica con apilador acompañante">Carretilla elevadora eléctrica con apilador acompañante</option>
                    <option value="Apilador eléctrico delantero">Apilador eléctrico delantero</option>
                    <option value="Apilador eléctrico con mástil retráctil">Apilador eléctrico con mástil retráctil</option>
                    <option value="Apilador térmico delantero">Apilador térmico delantero</option>
                    <option value="Tractor eléctrico de 200 a 500 daN">Tractor eléctrico de 200 a 500 daN</option>
                    <option value="Tractor eléctrico de 1500 daN">Tractor eléctrico de 1500 daN</option>
                    <option value="Tractor térmico (agrícola)">Tractor térmico (agrícola)</option>
                    <option value="Ninguno">Ninguno</option>
                </select>
            </div>
            <!--Velocidad-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad de la máquina usada</label>
                <input type="text" id="velocidad_maquina_usada" name="velocidad_maquina_usada" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Speed machine used" disabled>
            </div>
            <!--Código MTM3-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Código MTM3</label>
                <input type="text" id="codigo_mtm3" name="codigo_mtm3" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Código MTM3" disabled>
            </div>
            <!--Velocidad de la máquina-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="velocidad" name="velocidad">
                    <option value="10" ${speed === "10" ? "selected" : ""}>10 km/h</option>
                    <option value="12" ${speed === "12" ? "selected" : ""}>12 km/h</option>
                    <option value="15" ${speed === "15" ? "selected" : ""}>15 km/h</option>
                    <option value="20" ${speed === "20" ? "selected" : ""}>20 km/h</option>
                </select>
            </div>
            <!--Correspondencia-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Correspondencia</label>
                <input type="text" id="correspondencia" name="correspondencia" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Correspondencia" disabled>
            </div>
            <!--Soporte embalaje-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Soporte embalaje</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="soporte_embalaje" name="soporte_embalaje">
                    <option value="Unitario">Unitario</option>
                    <option value="Doble">Doble</option>
                </select>
            </div>

            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `);

    //Llamamos a la función para estabecer la información de la etapa dentro del cuerpo del modal
    configuarEtapaF27(data);


    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para configurar la etapa F27
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configuarEtapaF27(data) {
    //Declaramos las variables necesarias
    let comentario, distancia_remolque, altura_embalaje, numero_paquetes_pila, equipo_utilizado, codigo_mtm3, correspondencia, soporte_embalaje;

    //Iteramos sobre el array
    data.forEach(item => {
        comentario = item.comments;
        distancia_remolque = item.distancia;
        altura_embalaje = item.altura_embalaje;
        numero_paquetes_pila = item.numero_bultos_por_pila;
        equipo_utilizado = item.engins;
        codigo_mtm3 = item.code_MTM3;
        correspondencia = item.correspondance;
        soporte_embalaje = item.soporte_embalaje
    });

    //Llamamos a la función para dar funcionalidad al campo de la velocidad
    funcionalidadVelocidad();

    /**Añadimos la información a los campos */
    //Categoria de los comentarios
    document.getElementById('comentario').value = comentario;

    //Categoria de los ajustes
    document.getElementById('distancia_remolque').value = distancia_remolque;
    document.getElementById('altura_paquete').value = altura_embalaje;
    document.getElementById('numero_paquetes_pila').value = numero_paquetes_pila;

    //Llamamos a la función para disponer la cantidad de UC por pallet
    obtenerConteosUM(data[0].referencia_componente);

    //Categoria de las condiciones
    document.getElementById('maquina_usada').value = equipo_utilizado;
    document.getElementById('correspondencia').value = correspondencia;
    document.getElementById('soporte_embalaje').value = soporte_embalaje;
    document.getElementById('codigo_mtm3').value = codigo_mtm3;
}

/**
 * Función para disponer los datos de la etapa F10
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarModal_F10(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <!--CONTENEDOR COMENTARIO-->
            <h4 class="text-xl font-semibold mb-4">Comentario</h4>
            <div class="mb-6">
                <textarea id="comentario" name="comentario" class="w-full h-24 p-2 border border-gray-300 rounded-md" disabled></textarea>
            </div>

            <hr class="my-4">

            <!--CONTENEDOR AJUSTES-->
            <!--Distancia GR-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Distancia GR <i class="bi bi-arrow-right"></i> tienda</label>
                <input type="number" id="distancia" name="distancia" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Distancia GR tienda" value="1">
            </div>
            <!--Número de bultos por pila en GR-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Número de bultos por pila en GR</label>
                <input type="number" id="numero_bultos" name="numero_bultos" class="w-full p-2 border border-gray-300 rounded-mdl" placeholder="Número de bultos por pila en GR" value="1">
            </div>
            <!--Altura del embalaje-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Altura del embalaje</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="altura_embalaje" name="altura_embalaje">
                    <option value ="0.40 X 0.65">0.40 X 0.65</option>
                    <option value ="0.66 X 0.95">0.66 X 0.95</option>
                    <option value="0.96 X 1.35">0.96 X 1.35</option>
                    <option value="1.36 X 1.80">1.36 X 1.80</option>
                </select>
            </div>
            <!--Almacenamiento de embalajes mediante-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Almacenamiento de embalajes mediante</label>
                <input type="number" id="almacenamiento_embalaje" name="almacenamiento_embalaje" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Almacenamiento de embalajes" value="1">
            </div>
            <!--Número UC por UM-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Cantidad de UC por palé</label>
                <input type="number" id="cantidad_uc_por_pallet" name="cantidad_uc_por_pallet" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Cantidad de UC por palé" disabled>
            </div>

            <hr class="my-4">

            <!--CONTENEDOR CONDICIONES-->
            <h4 class="text-xl font-semibold mb-4">Condiciones</h4>
            <!--Equipo utilizado-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Equipo utilizado</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="maquina_usada" name="maquina_usada">
                    <option value="Carretilla elevadora eléctrica acompañada">Carretilla elevadora eléctrica acompañada</option>
                    <option value="Carretilla elevadora eléctrica con conductor sentado">Carretilla elevadora eléctrica con conductor sentado</option>
                    <option value="Carretilla elevadora eléctrica con apilador acompañante">Carretilla elevadora eléctrica con apilador acompañante</option>
                    <option value="Apilador eléctrico delantero">Apilador eléctrico delantero</option>
                    <option value="Apilador eléctrico con mástil retráctil">Apilador eléctrico con mástil retráctil</option>
                    <option value="Apilador térmico delantero">Apilador térmico delantero</option>
                    <option value="Tractor eléctrico de 200 a 500 daN">Tractor eléctrico de 200 a 500 daN</option>
                    <option value="Tractor eléctrico de 1500 daN">Tractor eléctrico de 1500 daN</option>
                    <option value="Tractor térmico (agrícola)">Tractor térmico (agrícola)</option>
                    <option value="Ninguno">Ninguno</option>
                </select>
            </div>
            <!--Velocidad-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad de la máquina usada</label>
                <input type="text" id="velocidad_maquina_usada" name="velocidad_maquina_usada" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Speed machine used" disabled>
            </div>
            <!--Código MTM3-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Código MTM3</label>
                <input type="text" id="codigo_mtm3" name="codigo_mtm3" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Código MTM3" disabled>
            </div>
            <!--Velocidad de la máquina-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="velocidad" name="velocidad">
                    <option value="10" ${speed === "10" ? "selected" : ""}>10 km/h</option>
                    <option value="12" ${speed === "12" ? "selected" : ""}>12 km/h</option>
                    <option value="15" ${speed === "15" ? "selected" : ""}>15 km/h</option>
                    <option value="20" ${speed === "20" ? "selected" : ""}>20 km/h</option>
                </select>
            </div>
            <!--Correspondencia-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Correspondencia</label>
                <input type="text" id="correspondencia" name="correspondencia" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Correspondencia" disabled>
            </div>
            <!--Número de paquetes-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Número de paquetes</label>
                <input type="text" id="numero_paquetes" name="numero_paquetes" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Número de paquetes" disabled>
            </div>
            <!--En la tienda pila de-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">En pila de</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="en_pila_de" name="en_pila_de">
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
            </div>
            <!--Soporte embalaje-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Soporte embalaje</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="soporte_embalaje" name="soporte_embalaje">
                    <option value="Unitario">Unitario</option>
                    <option value="Doble">Doble</option>
                </select>
            </div>

            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `);

    //Llamamos a la función para establecer la información de la etapa dentro del cuerpo del modal
    configurarEtapaF10(data);

    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para disponer los datos de la etyapa F14
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarModal_F14(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <!--CONTENEDOR COMENTARIO-->
            <h4 class="text-xl font-semibold mb-4">Comentario</h4>
            <div class="mb-6">
                <textarea id="comentario" name="comentario" class="w-full h-24 p-2 border border-gray-300 rounded-md" disabled></textarea>
            </div>

            <hr class="my-4">

            <!--CONTENEDOR AJUSTES-->
            <!--Distancia del tren-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Distancia del tren <i class="bi bi-arrow-right"></i> zona de entrega vacía</label>
                <input type="number" id="distancia_tren" name="distancia_tren" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Distancia del tren --> zona de entrega vacia" value="1">
            </div>
            <!--Distancia de la zona de entrega vacía-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Distancia de la zona de entrega vacía <i class="bi bi-arrow-right"></i> tienda</label>
                <input type="number" id="distancia_zona_entrega" name="distancia_zona_entrega" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Distancia de la zona de entrega vacía --> tienda" value="1">
            </div>
            <!--Distancia de almacenamiento-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Distancia de almacenamiento <i class="bi bi-arrow-right"></i> tren base rodante</label>
                <input type="number" id="distancia_almacenamiento" name="distancia_almacenamiento" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Distancia de almacenamiento --> tren base rodante" value="1">
            </div>
            <!--Número bases rodantes-->
                <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Número de bases rodantes por tren</label>
                <input type="number" id="numero_bases_rodantes" name="numero_bases_rodantes" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Número bases rodantes" value="1">
            </div>
            <!--Número UC por UM-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Cantidad de UC por palé</label>
                <input type="number" id="cantidad_uc_por_pallet" name="cantidad_uc_por_pallet" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Cantidad de UC por palé" disabled>
            </div>

            <hr class="my-4">

            <!--CONTENEDOR CONDICIONES-->
            <h4 class="text-xl font-semibold mb-4">Condiciones</h4>
            <!--Equipo utilizado-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Equipo utilizado</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="maquina_usada" name="maquina_usada">
                    <option value="Carretilla elevadora eléctrica acompañada">Carretilla elevadora eléctrica acompañada</option>
                    <option value="Carretilla elevadora eléctrica con conductor sentado">Carretilla elevadora eléctrica con conductor sentado</option>
                    <option value="Carretilla elevadora eléctrica con apilador acompañante">Carretilla elevadora eléctrica con apilador acompañante</option>
                    <option value="Apilador eléctrico delantero">Apilador eléctrico delantero</option>
                    <option value="Apilador eléctrico con mástil retráctil">Apilador eléctrico con mástil retráctil</option>
                    <option value="Apilador térmico delantero">Apilador térmico delantero</option>
                    <option value="Tractor eléctrico de 200 a 500 daN">Tractor eléctrico de 200 a 500 daN</option>
                    <option value="Tractor eléctrico de 1500 daN">Tractor eléctrico de 1500 daN</option>
                    <option value="Tractor térmico (agrícola)">Tractor térmico (agrícola)</option>
                    <option value="Ninguno">Ninguno</option>
                </select>
            </div>
            <!--Velocidad-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad de la máquina usada</label>
                <input type="text" id="velocidad_maquina_usada" name="velocidad_maquina_usada" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Speed machine used" disabled>
            </div>
            <!--Código MTM3-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Código MTM3</label>
                <input type="text" id="codigo_mtm3" name="codigo_mtm3" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Código MTM3" disabled>
            </div>
            <!--Velocidad de la máquina-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="velocidad" name="velocidad">
                    <option value="10" ${speed === "10" ? "selected" : ""}>10 km/h</option>
                    <option value="12" ${speed === "12" ? "selected" : ""}>12 km/h</option>
                    <option value="15" ${speed === "15" ? "selected" : ""}>15 km/h</option>
                    <option value="20" ${speed === "20" ? "selected" : ""}>20 km/h</option>
                </select>
            </div>
            <!--Correspondencia-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Correspondencia</label>
                <input type="text" id="correspondencia" name="correspondencia" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Correspondencia" disabled>
            </div>

            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `);

    //Llamamos a la función para establecer la información de la etapa dentro del cuerpo del modal
    configurarEtapaF14(data);

    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función para configurar la etapa F14
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarEtapaF14(data) {
    //Declaramos las variables necesarias
    let comentario, distancia_tren, distance_empty_zone, distancia_almacenamiento, numero_bases_rodantes, equipo_utilizado, codigo_mtm3, correspondencia;

    //Iteramos sobre el array
    data.forEach(item => {
        comentario = item.comments;
        distancia_tren = item.distancia_tren;
        distance_empty_zone = item.distance_empty_zone;
        distancia_almacenamiento = item.distancia_almacenamiento;
        numero_bases_rodantes = item.numero_bases_rodantes;
        equipo_utilizado = item.engins;
        codigo_mtm3 = item.code_MTM3;
        correspondencia = item.correspondance;
    });

    //Llamamos a la función para dar funcionalidad al campo de la velocidad
    funcionalidadVelocidad();

    /**Añadimos la informacion a los campos */
    //Categoria de los comentarios
    document.getElementById('comentario').value = comentario;

    //Categoria de los ajustes
    document.getElementById('distancia_tren').value = distancia_tren;
    document.getElementById('distancia_zona_entrega').value = distance_empty_zone;
    document.getElementById('distancia_almacenamiento').value = distancia_almacenamiento;
    document.getElementById('numero_bases_rodantes').value = numero_bases_rodantes;

    //Llamamos a la función para disponer la cantidad de UC por pallet
    obtenerConteosUM(data[0].referencia_componente);

    //Categoria de las condiciones
    document.getElementById('maquina_usada').value = equipo_utilizado;
    document.getElementById('codigo_mtm3').value = codigo_mtm3;
    document.getElementById('correspondencia').value = correspondencia;
}

/**
 * Función para disponer los datos de la etapa F29
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarModal_F29(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <!--CONTENEDOR COMENTARIO-->
            <h4 class="text-xl font-semibold mb-4">Comentario</h4>
            <div class="mb-6">
                <textarea id="comentario" name="comentario" class="w-full h-24 p-2 border border-gray-300 rounded-md" disabled></textarea>
            </div>

            <hr class="my-4">

            <!--CONTENEDOR AJUSTES-->
            <h4 class="text-xl font-semibold mb-4">Ajustes</h4>
            <!--Distancia de la zona vacia -->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Distancia de la zona vacía => camión</label>
                <input type="number" id="distancia" name="distancia" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Distancia de la zona vacía" value="0">
            </div>
            <!--Número de paquetes cargados a la vez-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Número de paquetes cargados a la vez (pila)</label>
                <input type="number" id="numero_paquetes_cargados" name="numero_paquetes_cargados" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Número de paquetes cargados a la vez (pila)" value="0">
            </div>
            <!--Tipo de carga-->
            <div class="mb-4" hidden>
                <label class="block text-gray-700 font-medium mb-2">Tipo de carga</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="tipo_carga" name="tipo_carga">
                    <option value="Muelle">Muelle</option>
                    <option value="Avion">Avión</option>
                </select>
            </div>
            <!--Número UC por UM-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Cantidad de UC por palé</label>
                <input type="number" id="cantidad_uc_por_pallet" name="cantidad_uc_por_pallet" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Cantidad de UC por palé" disabled>
            </div>

            <hr class="my-4">

            <!--CONTENEDOR CONDICIONES-->
            <h4 class="text-xl font-semibold mb-4">Condiciones</h4>
            <!--Equipo utilizado-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Equipo utilizado</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="maquina_usada" name="maquina_usada">
                    <option value="Carretilla elevadora eléctrica acompañada">Carretilla elevadora eléctrica acompañada</option>
                    <option value="Carretilla elevadora eléctrica con conductor sentado">Carretilla elevadora eléctrica con conductor sentado</option>
                    <option value="Carretilla elevadora eléctrica con apilador acompañante">Carretilla elevadora eléctrica con apilador acompañante</option>
                    <option value="Apilador eléctrico delantero">Apilador eléctrico delantero</option>
                    <option value="Apilador eléctrico con mástil retráctil">Apilador eléctrico con mástil retráctil</option>
                    <option value="Apilador térmico delantero">Apilador térmico delantero</option>
                    <option value="Tractor eléctrico de 200 a 500 daN">Tractor eléctrico de 200 a 500 daN</option>
                    <option value="Tractor eléctrico de 1500 daN">Tractor eléctrico de 1500 daN</option>
                    <option value="Tractor térmico (agrícola)">Tractor térmico (agrícola)</option>
                    <option value="Ninguno">Ninguno</option>
                </select>
            </div>
            <!--Velocidad-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad de la máquina usada</label>
                <input type="text" id="velocidad_maquina_usada" name="velocidad_maquina_usada" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Speed machine used" disabled>
            </div>
            <!--Código MTM3-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Código MTM3</label>
                <input type="text" id="codigo_mtm3" name="codigo_mtm3" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Código MTM3" disabled>
            </div>
            <!--Velocidad de la máquina-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="velocidad" name="velocidad">
                    <option value="10" ${speed === "10" ? "selected" : ""}>10 km/h</option>
                    <option value="12" ${speed === "12" ? "selected" : ""}>12 km/h</option>
                    <option value="15" ${speed === "15" ? "selected" : ""}>15 km/h</option>
                    <option value="20" ${speed === "20" ? "selected" : ""}>20 km/h</option>
                </select>
            </div>
            <!--Correspondencia-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Correspondencia</label>
                <input type="text" id="correspondencia" name="correspondencia" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Correspondencia" disabled>
            </div>
            <!--Número de paquetes-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Número de paquetes</label>
                <input type="number" id="numero_paquetes" name="numero_paquetes" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Número de paquetes" disabled>
            </div>

            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `);

    //Llamamos a la función para establecer la información de la etapa dentro del cuerpo de modal
    configurarEtapaF29(data);

    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modalLarge').modal('show');
}

/**
 * Función para disponer los datos de la etapa F5
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarModal_F5(data) {
    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <div class="container mx-auto p-4">
            <!--CONTENEDOR COMENTARIO-->
            <h4 class="text-xl font-semibold mb-4">Comentario</h4>
            <div class="mb-6">
                <textarea id="comentario" name="comentario" class="w-full h-24 p-2 border border-gray-300 rounded-md" disabled></textarea>
            </div>
            <!--Distancia-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Distancia</label>
                <input type="number" id="distancia" name="distancia" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Empaque descargado por" value="1">
            </div>

            <hr class="my-4">

            <!--CONTENEDOR AJUSTES-->
            <h4 class="text-xl font-semibold mb-4">Ajustes</h4>
            <!--Acceso al camión por-->
            <div class="mb-4">  
                <label class="block text-gray-700 font-medium mb-2">Acceso al caminón por el lado</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="acceso_camion" name="acceso_camion">
                    <option value="1">1 (Descarga por muelle)</option>
                    <option value="2">2 (Descarga lateral)</option>
                </select>
            </div>
            <!--Empaque descargado por-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Número de contenedores (UM) por picada</label>
                <input type="number" id="empaque_descargado" name="empaque_descargado" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Empaque descargado por" value="1">
            </div>
            <!--Número UC por UM-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Cantidad de UC por palé</label>
                <input type="number" id="cantidad_uc_por_pallet" name="cantidad_uc_por_pallet" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Cantidad de UC por palé" disabled>
            </div>

            <hr class="my-4">

            <!--CONTENEDOR CONDICIONES-->
            <h4 class="text-xl font-semibold mb-4">Condiciones</h4>
            <!--Equipo utilizado-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Equipo utilizado</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="maquina_usada" name="maquina_usada">
                    <option value="Apilador eléctrico delantero">Apilador eléctrico delantero</option>
                    <option value="Apilador eléctrico con mástil retráctil">Apilador eléctrico con mástil retráctil</option>
                    <option value="Apilador térmico delantero">Apilador térmico delantero</option>
                    <option value="Tractor eléctrico de 200 a 500 daN">Tractor eléctrico de 200 a 500 daN</option>
                    <option value="Tractor eléctrico de 1500 daN">Tractor eléctrico de 1500 daN</option>
                    <option value="Tractor térmico (agrícola)">Tractor térmico (agrícola)</option>
                    <option value="Ninguno">Ninguno</option>
                </select>
            </div>
            <!--Velocidad-->
            <div class="mb-4" hidden>
                <label class="block text-gray-700 font-medium mb-2">Velocidad de la máquina usada</label>
                <input type="text" id="velocidad_maquina_usada" name="velocidad_maquina_usada" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Speed machine used" disabled>
            </div>
            <!--Código MTM3-->
            <div class="mb-4" hidden>
                <label class="block text-gray-700 font-medium mb-2">Código MTM3</label>
                <input type="text" id="codigo_mtm3" name="codigo_mtm3" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Código MTM3" disabled>
            </div>
            <!--Velocidad de la máquina-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Velocidad</label>
                <select class="w-full p-2 border border-gray-300 rounded-md" id="velocidad" name="velocidad">
                    <option value="10" ${speed === "10" ? "selected" : ""}>10 km/h</option>
                    <option value="12" ${speed === "12" ? "selected" : ""}>12 km/h</option>
                    <option value="15" ${speed === "15" ? "selected" : ""}>15 km/h</option>
                    <option value="20" ${speed === "20" ? "selected" : ""}>20 km/h</option>
                </select>
            </div>
            <!--Correspondencia-->
            <div class="mb-4" hidden>
                <label class="block text-gray-700 font-medium mb-2">Correspondencia</label>
                <input type="text" id="correspondencia" name="correspondencia" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Correspondencia" disabled>
            </div>
            <!--Número de paquetes-->
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2">Número de paquetes</label>
                <input type="number" id="numero_paquetes" name="numero_paquetes" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Número de paquetes" disabled>
            </div>

            <div class="mt-6 flex justify-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" id="botonVisualizarPlano" onclick="visualizarPlano('${puestoID}', '${data[0].id}')">Visualizar plano</button>
            </div>
        </div>
    `)

    //Llamamos a la función para establecer la información de la etapa dentro del cuerpo del modal
    configurarEtapaF5(data);

    //Llamamos a la función para configurar el footer del modal
    configurarFooterModal_Etapa(data[0].id, data[0].F);

    //Mostramos el modal
    $('#modal').modal('show');
}

/**
 * Función manejador para el campo del speed
 * @param {String} value Argumento que contiene el valor de la velocidad 
 */
function updateSpeedMachine(value) {
    const velocidad_maquina_usada = document.getElementById('velocidad_maquina_usada');
    if (velocidad_maquina_usada) {
        switch (value) {
            case "10":
                velocidad_maquina_usada.value = "0.6";
                break;
            case "12":
                velocidad_maquina_usada.value = "0.5";
                break;
            case "15":
                velocidad_maquina_usada.value = "0.4";
                break;
            case "20":
                velocidad_maquina_usada.value = "0.3";
                break;
            default:
                velocidad_maquina_usada.value = "";
        }
    }
}

/**
 * Función para la etapa F29
 * @param {Array} data Argumemento que contiene los datos de la etapa
 */
function configurarEtapaF29(data) {
    //Declaramos las variables necesarias
    let comentario, distancia_entra_zonas, numero_paquetes_cargados, tipo_carga, cantidad_UC, equipo_utilizado, velocidad_maquina_usada, velocidad, codigo_mtm3, correspondencia, numero_paquetes;

    //Iteramos sobre el array
    data.forEach(item => {
        comentario = item.comments;
        distancia_entra_zonas = item.distance_empty_zone;
        numero_paquetes_cargados = item.number_of_packages_loaded_at_once;
        tipo_carga = item.loading_type;
        equipo_utilizado = item.engins;
        codigo_mtm3 = item.id_MTM3;
        correspondencia = item.correspondance;
    });

    //Llamamos a la función para dar funcionalidad al campo de la velocidad
    funcionalidadVelocidad();

    /**Añadimos la información a los campos */
    //Categoria del comentario
    document.getElementById('comentario').value = comentario;

    //Categoria de los ajustes
    document.getElementById('distancia').value = distancia_entra_zonas;
    document.getElementById('numero_paquetes_cargados').value = numero_paquetes_cargados;
    document.getElementById('tipo_carga').value = tipo_carga;

    //Llamamos a la función para disponer la cantidad de UC por pallet
    obtenerConteosUM(data[0].referencia_componente);

    //Categoria de las condiciones
    document.getElementById('maquina_usada').value = equipo_utilizado;
    document.getElementById('codigo_mtm3').value = codigo_mtm3;
    document.getElementById('correspondencia').value = correspondencia
}

/**
 * Función para configurar la etapa F10
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarEtapaF10(data) {
    //Declaramos las variables necesarias
    let comentario, distancia, numero_bultos, altura_embalaje, almacenamiento_embalaje, cantidad_UC, equipo_utilizado, velociddad_maquina_usada, codigo_mtm3, correspondencia, numero_paquetes, en_pila_de, soporte_embalaje;

    //Iteramos sobre el array
    data.forEach(item => {
        comentario = item.comments;
        distancia = item.distancia;
        numero_bultos = item.numero_bultos_por_pila;
        altura_embalaje = item.altura_embalaje;
        almacenamiento_embalaje = item.almacenamiento_embalajes_mediante;
        equipo_utilizado = item.engins;
        codigo_mtm3 = item.code_MTM3;
        correspondencia = item.correspondance;
        en_pila_de = item.en_la_tienda_pila;
        soporte_embalaje = item.soporte_embalaje;
    });

    //Llamamos a la función para dar funcionalidad al campo de la velocidad
    funcionalidadVelocidad();

    /**Añadimos la información a los campos */
    //Categoria de los comentarios
    document.getElementById('comentario').value = comentario;

    //Categoria de los ajustes
    document.getElementById('distancia').value = distancia;
    document.getElementById('numero_bultos').value = numero_bultos;
    document.getElementById('altura_embalaje').value = altura_embalaje;

    //Llamamos a la función para disponer la cantidad de UC por pallet
    obtenerConteosUM(data[0].referencia_componente);

    //Categoria de las condiciones
    document.getElementById('maquina_usada').value = equipo_utilizado;
    document.getElementById('codigo_mtm3').value = codigo_mtm3;
    document.getElementById('correspondencia').value = correspondencia;
    document.getElementById('en_pila_de').value = en_pila_de;
    document.getElementById('soporte_embalaje').value = soporte_embalaje;
}

/**
 * Función para configurar la etapa F5
 * @param {Array} data Argumento que contiene los datos de la etapa
 */
function configurarEtapaF5(data) {
    //Declaramos las variables necesarias
    let comentario, distancia, acceso_camion, empaque_descargado, codigo_mtm3, cantidad_UC, equipo_utilizado, velocidad_maquina_usada, velocidad, correspondencia, numero_paquetes;

    //Iteramos por el array de los datos
    data.forEach(item => {
        id_etapa = item.id;
        distancia = item.distancia_F5;
        comentario = item.comments;
        acceso_camion = item.acceso_al_camion_F5;
        empaque_descargado = item.embalaje_descargado_F5;
        equipo_utilizado = item.engins;
        codigo_mtm3 = item.id_MTM3;
        correspondencia = item.correspondance;
    });

    //Llamamos a la función par dar funcionalidad al campo de la velocidad
    funcionalidadVelocidad();

    /**Añadimos la información a los campos */
    //Categoria del comentario
    document.getElementById('comentario').value = comentario;
    document.getElementById('distancia').value = distancia;

    //Categoria de los ajustes
    document.getElementById('acceso_camion').value = acceso_camion;
    document.getElementById('empaque_descargado').value = empaque_descargado;


    //Categoria de las condiciones
    document.getElementById('maquina_usada').value = equipo_utilizado;
    document.getElementById('codigo_mtm3').value = codigo_mtm3;
    document.getElementById('correspondencia').value = correspondencia;

    //Llamamos a la función para disponer la cantidad de UC por pallet
    obtenerConteosUM(data[0].referencia_componente);
}

/**
 * Función para dar la funcionalidad al campo de la máquina usada en la velocidad 
 */
function funcionalidadVelocidad() {
    const velocidad_input = document.getElementById('velocidad');

    //En caso de que exista
    if (velocidad_input) {
        //Llamamos a la función para controlar el campo de la velocidad de la máquina
        updateSpeedMachine(velocidad_input.value);

        //Añadimos el listener al input de la velocidad
        velocidad_input.addEventListener('change', function () {
            //Llamamos a la función para controlar el campo de la velocidad de la máquina donde le pasamos el valor
            updateSpeedMachine(this.value);
        });
    }
}

/**
 * Función para obtener el conteom de UMs
 * @param {String} referencia_compontente Argumento que contiene la referencia del componente
 */
function obtenerConteosUM(referencia_compontente) {
    let total_pieces = null;

    fetch(`/film/api/conteoUM/${referencia_compontente}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que falle
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos el dato obtenido
            return response.json();
        })

        //Controlamos los datos obtenidos
        .then(data => {
            //Establecemos el valor en el campo Number of UC per pallet
            document.getElementById('cantidad_uc_por_pallet').value = data[0].total_pieces;
        });

    return total_pieces;
}

/**
 * Función para configurar el footer del modal de la etapa
 * @param {int} id_etapa Argumento que contiene el ID de la etapa
 * @param {String} F Argumento que contiene el nombre de la F
 */
function configurarFooterModal_Etapa(id_etapa, F) {
    //Configuramos el footer del modal
    $('#modal .modal-footer').html(`
        <div class="modal-footer border-secondary">
            <button id="botonActualizarEtapa" class="btn btn-primary">Actualizar etapa</button>
            <button id="closeModalLarge" class="btn btn-danger" data-bs-dismiss="modal">Cerrar</button>
        </div>
    `);

    //Añadimos la funcionalidad para el botón de actualizar etapa
    $('#botonActualizarEtapa').on('click', function () {
        //Llamamos la función para actualizar la etapa
        controlActualizacionEtapa(id_etapa, F);
    });
}

/**
 * Función para inicializar las etapas, calculos, variables... de las etapas
 * @param {Array} etapaDeF Array que contiene la información de las etapas
 * @returns Devolvemos las variables con la información requerida
 */
function inicializarVariablesEtapas(etapaDeF) {
    /**Almacenamos en variables el contenido de los calculos */
    const numberOfPackagesLoadedAtOnce = etapaDeF.number_of_packages_loaded_at_once || 1;
    const referenciaComponente = etapaDeF.referencia_componente;
    const id_etapa = etapaDeF.id;
    const nombre_etapa = etapaDeF.name;
    let mote_etapa = etapaDeF.mote;
    const distancia_total = etapaDeF.distancia_total ? etapaDeF.distancia_total : '0';
    const numero_curvas = etapaDeF.numero_curvas ?? 0;
    const TL_TV = etapaDeF.TL_TV ? etapaDeF.TL_TV.toFixed(2) : '0.00';
    const CDV_CDL = etapaDeF.CDVB_CDL ? etapaDeF.CDVB_CDL : '0';
    const actividad_en_minutos = etapaDeF.actividad_en_minutos ? etapaDeF.actividad_en_minutos.toFixed(2) : '0.00';
    const numero_cruces = etapaDeF.numero_cruces ? etapaDeF.numero_cruces : '0';
    const numero_puertas = etapaDeF.numero_puertas ? etapaDeF.numero_puertas : '0';
    const NC = etapaDeF.NC ? etapaDeF.NC : '0';
    const NP = etapaDeF.NP ? etapaDeF.NP : '0';
    const PS10 = etapaDeF.PS10 ? etapaDeF.PS10 : '0';
    const PS14 = etapaDeF.PS14 ? etapaDeF.PS14 : '0';
    const simbolo_especial = etapaDeF.simbolo_especial;
    const valor_simbolo_especial = etapaDeF.valor_simbolo_especial ? etapaDeF.valor_simbolo_especial : '0';
    const DC221 = etapaDeF.DC221 ? etapaDeF.DC221 : '0';
    const TC_TL = distancia_total * etapaDeF.cantidad_a_mover * etapaDeF.speed;
    const DS10 = etapaDeF.DS10 ? etapaDeF.DS10 : '0';
    const CDL = etapaDeF.CDL ? etapaDeF.CDL : '0';
    const CCPE = etapaDeF.CCPE ? etapaDeF.CCPE : '0';
    const TC = etapaDeF.TC ? etapaDeF.TC : '0';
    const CT10 = etapaDeF.CT10 ? etapaDeF.CT10 : '0';
    const PP1 = etapaDeF.PP1 ? etapaDeF.PP1 : '0';
    const TL = etapaDeF.TL ? etapaDeF.TL : '0';
    const M1 = etapaDeF.M1 ? etapaDeF.M1 : '0';
    const DL = etapaDeF.DL ? etapaDeF.DL : '0';
    const PDU34 = etapaDeF.PDU34 ? etapaDeF.PDU34 : '0';
    const PPU34 = etapaDeF.PPU34 ? etapaDeF.PPU34 : '0';
    const TV = etapaDeF.TV ? etapaDeF.TV : '0';
    const PPD32 = etapaDeF.PPD32 ? etapaDeF.PPD32 : '0';
    const PDD34 = etapaDeF.PDD34 ? etapaDeF.PDD34 : '0';
    const PPU43 = etapaDeF.PPU43 ? etapaDeF.PPU43 : '0';
    const CHMAN = etapaDeF.CHMAN ? etapaDeF.CHMAN : '0';
    const CHMAN_2 = etapaDeF.CHMAN_2 ? etapaDeF.CHMAN_2 : '0';
    const CHMAN_3 = etapaDeF.CHMAN_3 ? etapaDeF.CHMAN_3 : '0';
    const DC113 = etapaDeF.DC113 ? etapaDeF.DC113 : '0';
    const CDC = etapaDeF.CDC ? etapaDeF.CDC : '0';
    const PS15 = etapaDeF.PS15 ? etapaDeF.PS15 : '0';
    const DI21 = etapaDeF.DI21 ? etapaDeF.DI21 : '0';
    const DS14 = etapaDeF.DS14 ? etapaDeF.DS14 : '0';
    const DS15 = etapaDeF.DS15 ? etapaDeF.DS15 : '0';
    const DC = etapaDeF.DC ? etapaDeF.DC : '0';
    const D1 = etapaDeF.D1 ? etapaDeF.D1 : '0';
    const W5 = etapaDeF.W5 ? etapaDeF.W5 : '0';
    const TT = etapaDeF.TT ? etapaDeF.TT : '0';
    const AL = etapaDeF.AL ? etapaDeF.AL : '0';
    const P2 = etapaDeF.P2 ? etapaDeF.P2 : '0';
    const L2 = etapaDeF.L2 ? etapaDeF.L2 : '0';
    const G1 = etapaDeF.G1 ? etapaDeF.G1 : '0';
    const P5 = etapaDeF.P5 ? etapaDeF.P5 : '0';
    const W5_2 = etapaDeF.W5_2 ? etapaDeF.W5_2 : '0';
    const nuevo = etapaDeF.nuevo ? etapaDeF.nuevo : '0';
    const nuevo_picadas = etapaDeF.nuevo_picadas ? etapaDeF.nuevo_picadas : '0';
    const tiempo_distancia_total = etapaDeF.tiempo_distancia_total ? etapaDeF.tiempo_distancia_total : '0';

    //Devolvemos las variables
    return { mote_etapa, referenciaComponente, nombre_etapa, actividad_en_minutos, id_etapa, distancia_total, TL_TV, numero_curvas, CDV_CDL, numero_cruces, NC, numero_puertas, NP, PS10, PS14, simbolo_especial, valor_simbolo_especial, DC221, TC_TL, DS10, CDL, CCPE, TC, CT10, PP1, TL, M1, DL, PDU34, PPU34, TV, PPD32, PDD34, PPU43, CHMAN, numberOfPackagesLoadedAtOnce, CHMAN_2, CHMAN_3, DC113, CDC, PS15, DI21, DS14, DS15, DC, D1, W5, TT, AL, P2, L2, G1, P5, W5_2, nuevo, nuevo_picadas, tiempo_distancia_total };
}

/**
 * Función para disponer el modal de staturación de la UAT
 */
function visualizarInformeStaturacionUAT() {
    //Mostramos el modal antes de añadir el gráfico
    $('#modalInforme').fadeIn(() => {
        //Creamos una instancia del contenedor del gráfico
        const graficoContainer = document.getElementById('modal-grafico-container');
        graficoContainer.innerHTML = '';

        let fecha = new Date()

        let fecha_actual = document.createElement("h4");
        fecha_actual.append(`Fecha de toma de datos:`);
        fecha_actual.append(document.createElement("br"));
        fecha_actual.append(`${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}`);
        graficoContainer.append(fecha_actual);

        //Creamos el lienzo para el gráfico
        const canvas = document.createElement('canvas');
        graficoContainer.appendChild(canvas);

        fecha.setDate(fecha.getDate() + 3 * 7);
        let fecha_3_semanas = document.createElement("h4");
        fecha_3_semanas.append(`Fecha a tres semanas:`);
        fecha_3_semanas.append(document.createElement("br"));
        fecha_3_semanas.append(`${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}`);
        graficoContainer.append(fecha_3_semanas);

        //Calculamos la saturación total
        const saturacionTotal = calcularSaturacionTotal(conteosPorPuesto);

        //Creamos el gráfico
        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: ['Saturación Total', 'Tiempo Libre'],
                datasets: [{
                    data: [saturacionTotal, (100 - saturacionTotal)],
                    backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(211, 211, 211, 0.5)'],
                    hoverBackgroundColor: ['rgba(75, 192, 192, 1)', 'rgba(211, 211, 211, 0.7)'],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Saturación Total de Todos los Puestos',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        });
    });
}

/**
 * Función para calcular la saturación total de todos los puestos
 * @param {*} conteosPorPuesto Argumento que contiene la información de los puestos
 * @returns Devuelve la saturación total de todos los puestos
 */
function calcularSaturacionTotal(conteosPorPuesto) {
    //Almacenamos en una variable el tiempo total en minutos 
    const jornadaPorPuesto = 445;
    const numeroDePuestos = conteosPorPuesto.length;
    const jornadaTotal = jornadaPorPuesto * numeroDePuestos;

    //Suamos el tiempo utilizado en todos los puestos
    const tiempoUtilizadoTotal = conteosPorPuesto.reduce((suma, puesto) => suma + puesto.conteo, 0);

    //Caulculamos la saturación total como porcentaje
    const saturacionTotal = (tiempoUtilizadoTotal / jornadaTotal) * 100;

    //Devolvemos la saturación total
    return saturacionTotal.toFixed(2);
}

/**
 * Función para obtener el código MTM3 usando el ID del machine used
 * @param {int} machine_used Argumento que contiene el ID del machine used
 * @returns Devuelve el código MTM3
 */
function obtenerCodigoMTM3(machine_used) {
    //Declaramos la variable que almacenará el código MTM3
    let code_MTM3 = "";

    //Preparamos la solicitud GET para obtener el código MTM3
    return fetch(`/film/api/obtenerCodigoMTM3/${machine_used}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching data');
            }
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Asignamos a code_MTM3 el código obtenido de la consulta
            code_MTM3 = data[0].code_MTM3;

            //Devolvemos el código MTM3
            return code_MTM3;
        })

        //Controlamos los datos
        .catch(error => {
            console.error("Error fetching code_MTM3:", error);
            return "";
        });
}

/**
 * Función para ocultar la información de la etapa
 * @param {int} id Argumento que contiene el ID de la etapa del puesto
 */
function toggleVisibility(id) {
    const content = document.getElementById(id);
    content.classList.toggle('hidden');
}

/**
 * Función para obtener las referencias de los componentes
 * @param {String} tipo_operacion Argumento que contiene el tipo de operación
 * @param {int} puesto_id Argumento que contiene el ID del puesto
 */
function buscadorReferencias(puesto_id) {
    const tipo_operacion = document.getElementById('bbdd').value;

    console.log("Dentro de la función")

    //Preparamos la petición GET para obtener las referencias y disponerlas en un modal dependiendo de la operación y del turno del puesto
    fetch(`/film/api/obtener-referencias/${tipo_operacion}/${puesto_id}/${getCookie('planta')}`, {
        method: "GET"
    })
        .then(response => {
            //En caso de que haya salido mal
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos obtenidos
            return response.json();
        })

        .then(data => {
            //Llamamos a la función para disponer las referencias dentro de la tabla
            disponerReferenciasBuscador(data, puesto_id)
        });
}

/**
 * Función para disponer las referencias dentro de la tabla con un buscador
 * @param {Array} data 
 */
function disponerReferenciasBuscador(data, puesto_id) {
    //Ocultamos el modal principal
    $('#modal').modal('hide');

    //Configuramos el titulo del modal
    $('#modalInformeFinal .modal-title').text("Referencias obtenidas:");

    //Configuramos el cuerpo del modal
    $('#modalInformeFinal .modal-body').html(`
        <div>
            <input type="text" id="searchInput" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Buscar referencia...">
        </div>
        <div id="table-container" class="overflow-x-auto mt-4">
            <table class="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead>
                    <tr class="bg-gray-100">
                        <th>Referencias</th>
                    </tr>
                </thead>
                <tbody id="tableBody"></tbody>
            </table>
        </div>
    `);

    //Configuramos el footer del modal
    $('#modalInformeFinal .modal-footer').html(`
        <button id="saveSelected" type="button" class="btn btn-outline-light">Guardar selección</button>
    `);

    //Creamos una instancia del cuerpo de la tabla
    let tbody = $('#tableBody');

    //Creamos una variable donde almacenará el contenido de la fila
    let fila_informacion = "";

    //Iteramos por las referencias
    data.forEach(item => {
        //Asignamos el HTML por cada referencia
        fila_informacion += `<tr class="cursor-pointer" data-ref="${item.reference}"><td>${item.reference}</td></tr>`;
    });

    //Añadimos el contenido de la tabla al cuerpo de la tabla
    tbody.html(fila_informacion);

    let selectedReferences = new Set();

    //Manejador de selección/deselección
    $('#tableBody tr').on('click', function () {
        //Creamos una variable con la fila seleccionada
        let ref = $(this).attr('data-ref');
        if (selectedReferences.has(ref)) {
            selectedReferences.delete(ref);
            $(this).removeClass('bg-blue-200 text-white font-bold');
        } else {
            selectedReferences.add(ref);
            $(this).addClass('bg-blue-200 text-white font-bold');
        }
    });

    //Manejador para el buscador
    $('#searchInput').on('input', function () {
        let searchText = $(this).val().toLowerCase();
        $('#tableBody tr').each(function () {
            let text = $(this).text().toLowerCase();
            $(this).toggle(text.includes(searchText));
        });
    });

    //Funcionalidad del botón del guardado de referencias
    $('#saveSelected').on('click', function () {
        let selectedArray = Array.from(selectedReferences);
        referencia_componente = selectedArray.join(" ");

        //Ocultamos el modal
        $('#modalInformeFinal').modal('hide');

        //Llamamos a la función para disponer el modal para añadir unna etapa
        anyadirEtapa(puesto_id);
    });

    //Mostramos el modal
    $('#modalInformeFinal').modal('show');
}

/**
 * Función para añadir una etapa a un puesto
 * @param {int} id Argumento que contiene el ID del puesto
 */
function anyadirEtapa(id) {
    //Controlamos el valor del argumento "id"... en caso de que el argumento sea NULL
    if (id === '' || id === null) {
        //Llamamos al método para mostrar una alerta de aviso
        mostrarAlerta('Error al mostrar el moda de añadir etapa', 'Debes de seleccionar un puesto antes de añadir una etapa', 'error', 0);

        //En cualquier otro caso...
    } else {
        //Configuramos el titulo del modal
        $('#modal .modal-title').text('Introduzca los campos para realizar la busqueda');

        //Configuramos el cuerpo del modal para que el usuario introduzca el referencia del componente y la línea
        $('#modal .modal-body').html(`
            <form id="consultarValores" method="GET">
                <!-- Tipo de operación -->
                <div class="relative inline-block w-64 mb-4">
                    <label for="bbdd" class="block text-sm font-medium text-white mb-2">Seleccione perímetro de trabajo</label>
                    <select id="bbdd" name="bbdd" class="block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-white" onclick="configurarLinea()">
                        <option value="Programa_Expedicion_Forklift">Expedición</option>
                        <option value="Programa_Fabricacion">Fabricación</option>
                        <option value="Programa_Recepcion">Recepción</option>
                    </select>
                </div>

                <!-- Referencia del componente -->
                <div class="mb-4">
                    <label for="referencia_componente" class="block text-white font-bold mb-2">Referencia del componente:</label>
                    <div class="flex items-center border border-gray-600 rounded-lg bg-white">
                        <input type="text" id="referencia_componente" name="referencia_componente" 
                            class="w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black rounded-l-lg" 
                            placeholder="Ingresa la referencia del componente" required>
                        <button type="button" class="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600" onclick="buscadorReferencias(${id})">
                            <i class="bi bi-search"></i>
                        </button>
                    </div>
                </div>

                <!-- Línea -->
                <div class="mb-4" id="contenedorLinea" hidden>
                    <label for="linea" class="block text-white font-bold mb-2">Línea:</label>
                    <input type="number" id="linea" name="linea" class="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-white" placeholder="Ingresa la línea">
                </div>

                <!-- Descripción -->
                <div class="mb-4">
                    <label for="mote" class="block text-white font-bold mb-2">Descripción:</label>
                    <input type="text" id="mote" name="mote" class="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-white" placeholder="Ingrese una descripción">
                </div>

                <!-- Tipo de carga -->
                <div class="relative inline-block w-64 mb-4" hidden>
                    <label for="tipoCarga" class="block text-sm font-medium text-white mb-2">Seleccione un tipo de carga</label>
                    <select id="tipoCarga" name="tipoCarga" class="block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-white">
                        <option value="UM">UM</option>
                        <option value="UC">UC</option>
                    </select>
                </div>

                <!--Numero picadas -->
                <div class="relative inline-block w-64 mb-4">
                    <label for="numeroPicadas" class="block text-sm font-medium text-white mb-2">Número de picadas</label>
                    <select id="numeroPicadas" name="numeroPicadas" class="block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-white">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                </div>

                <!-- Botón obtener información -->
                <div class="mt-6">
                    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition duration-300">Obtener información <i class="bi bi-info-circle-fill"></i></button>
                </div>
            </form>

            <!-- Botón de añadir referencias a mano -->
            <div class="mt-6">
                <button type="button" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition duration-300" onclick="anyadirReferenciaManual()">
                    Añadir referencias manualmente <i class="bi bi-pencil"></i>
                </button>
            </div>
        `);

        //Ocultamos el footer del modal
        $('#modal .modal-footer').html('');

        //Mostramos el modal
        $('#modal').modal('show');

        console.log("Referencias: ", referencia_componente);

        //En caso de que la variable ya tenga referencias...
        if (referencia_componente !== null) {
            //Las añadimos al campo de las referencias
            document.getElementById('referencia_componente').value = referencia_componente;
        }

        //Añadimos la funcionalidad para el formulario de consultar la información usando la referencia del componente y la linea
        $('#consultarValores').on('submit', async function (e) {
            //Paramos la propagación
            e.preventDefault();

            //Almacenamos en una variable global la referencia del componente
            referencia_componente = document.getElementById('referencia_componente').value;

            //Almacenamos en una variable global la linea
            linea = document.getElementById('linea').value;

            //Almcenamos en una variable global el mote
            mote = document.getElementById('mote').value;

            //Almacenamos en la variable global el tipo de carga
            tipo_carga = document.getElementById('tipoCarga').value;

            //Almacenamos en una variable el número de picadas
            numero_picadas = document.getElementById('numeroPicadas').value;

            //Almacenamos las referencias separadas por ";"
            const referencias = referencia_componente.split(";").map(ref => ref.trim()).filter(ref => ref !== "");

            //Preparamos la petición GET para obtener las referencias válidas
            fetch(`/film/api/comprobarReferencias/${referencia_componente}/${tipo_operacion}/${planta}`, {
                method: "GET"
            })
                //Controlamos la respuesta
                .then(response => {
                    //En caso de que no este bien
                    if (!response.ok) {
                        throw new Error('Error fetching data');
                    }

                    //Devolvemos los datos obtenidos
                    return response.json();
                })

                //Controlamos los datos
                .then(data => {
                    //Almacenamos en una variable las referencias válidas
                    const referencias_validas = data.validReferences;
                    referencia_componente = referencias_validas;

                    //En caso de que no haya referencias válidas
                    if (referencias_validas.length === 0) {
                        //Llamamos a la función para disponer una alerta para informar al usuario
                        mostrarAlerta('Error', 'No hay referencias válidas', 'error', null);

                        //Cerramos el modal principal
                        $('#modal').modal('hide');

                        //Paramos la propagación
                        return;
                    }

                    //Creamos un switch para controlar el tipo de operación
                    switch (tipo_operacion) {
                        case "Programa_Expedicion_Forklift":
                            //Llamamos a la función para obtener la cantidad a expedir por cada referencia
                            obtenerCantidadExpedir(referencias_validas, "quantitea_a_expedir", id);
                            break;

                        case "Programa_Recepcion":
                            //Llamamos a la función para obtener la cantidad a expedir por cada referencia
                            obtenerCantidadExpedir(referencias_validas, "quantite_de_forcage", id);
                            break;

                        default:
                            break;
                    }
                });
        });
    }
}

/**
 * Función para obtener la cantidad a expedir por cada referencia
 * @param {Array} referencias_validas Argumento que contiene las referencias válidas
 * @param {String} columna Argumento que contiene el nombre de la columna a la que hora del conteo
 */
function obtenerCantidadExpedir(referencias_validas, columna, puesto_id) {
    //Iteramos por cada referencia
    referencias_validas.forEach(referencia => {
        //Preparamos la petición GET
        fetch(`/film/api/cantidadExpedirHoras/${referencia}/${tipo_operacion}/${planta}/${columna}/${puesto_id}`, {
            method: "GET"
        })
            //Controlamos la respuesta
            .then(response => {
                //En caso de que no sea correcta
                if (!response.ok) {
                    throw new Error('Error fetching data');
                }

                //Devolvemos la información
                return response.json();
            })

            //Controlamos los datos
            .then(data => {
                //Almacenamos en una variable la cantidad a expedir
                const cantidad_a_expedir = data[0].cantidad_expedir;

                //Llamamos a la función para obrener el valor de la carga
                obtenerValorCarga(referencia, cantidad_a_expedir, tipo_operacion);
            });
    });

    //Llamamos al método para cerrar el modal principal y disponer el modal del informe
    mostrarModalInforme();
}

/**
 * Función para obtener el valor de la carga
 * @param {String} item Argumento que contiene la referencia
 * @param {int} cantidad_a_expedir Argumento que contiene la cantidad a expedir de dicha referencia
 * @param {String} tipo_operacion Argumento que contiene el tipo de la operación
 */
function obtenerValorCarga(item, cantidad_a_expedir, tipo_operacion) {
    //Preparamos la petición GET
    fetch(`/film/api/obtenerValorCarga/${tipo_carga}/${planta}/${item}/${tipo_operacion}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que no haya salido bien
            if (!response.ok) {
                //Llamamos a la función para mostrar la alerta para informar al usuario
                mostrarAlerta('Error al obtener el valor de la carga', 'La referencia no pertenece al turno del puesto', 'error', 0);
            }

            //Devolvemos los datos
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Almacenamos en una variable el valor de la carga
            const valor_carga = data.valor_carga;

            //Almacenamos en una variable el número de embalajes redondeado a la alta
            const numero_embalajes = Math.ceil((cantidad_a_expedir / valor_carga) / 8);

            //Añadimos las referencias junto a sus numeros de embalajes en el diccionario
            referencia_embalaje[item] = numero_embalajes;

            //Llamamos al método para disponer la información en el modal
            //disponerInformacionModal2(item, cantidad_a_expedir, valor_carga, numero_embalajes);
            mostrarModalEtapas();
        });
}

/**
 * Función para cerrar el modal principal y mostrar el modal de informe
 */
function mostrarModalInforme() {
    //Cerramos el modal principal
    $('#modal').modal('hide');

    //Cuando se abrá el modal
    $('#modal').on('hidden.bs.modal', function () {
        //Limpiamos el contenido de la tabla en el modal de informe
        $('#modalInformeFinal .modal-body table tbody').empty();

        //Mostramos el modal de informe
        $('#modalInformeFinal').modal('show');

        //Eliminamos el event listener para evitar múltiples disparos
        $('#modal').off('hidden.bs.modal');
    });
}


/**
 * Función para disponer la información en el modal
 * @param {String} referencia Argumento que contiene la referencia
 * @param {int} cantidad_a_expedir Argumento que contiene la cantidad a expedir
 * @param {int} valor_carga Aregumento que contiene el valor de la carga
 * @param {int} numero_embalajes Argumento que contiene el número de ambalajes a mover
 */
function disponerInformacionModal2(referencia, cantidad_a_expedir, valor_carga, numero_embalajes) {
    //Creamos una instancia del cuerpo de la tabla
    let tbody = $('#modalInformeFinal .modal-body table tbody');

    //En caso de que la tabla no exista
    if (tbody.length === 0) {
        //Añadimos la tabla al cuerpo del modal
        $('#modalInformeFinal .modal-body').html(`
            <div id="table-container" class="overflow-x-auto mt-6">
                <table class="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                    <thead>
                        <tr class="bg-gray-100">
                            <th>Referencia del componente</th>
                            <th>Tipo de carga</th>
                            <th>Pieza por tipo de carga</th>
                            <th>Cantidad de piezas</th>
                            <th>Número de embalajes</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `);

        //Reasignamos el cuerpo de la tabla
        tbody = $('#modalInformeFinal .modal-body table tbody');
    }

    //Creamos una variable para la fila
    let fila_informacion;

    //En caso de que el número de embalajes sea 0 o NULL
    if (numero_embalajes === 0 || numero_embalajes === null) {
        //Hacemos el campo editable
        fila_informacion = `
            <tr>
                <td>${referencia}</td>
                <td>${tipo_carga}</td>
                <td>${valor_carga}</td>
                <td>${cantidad_a_expedir}</td>
                <td>
                    <input type="number" 
                        class="form-input border rounded p-1 referencia-embalaje" 
                        data-referencia="${referencia}" 
                        value="${numero_embalajes}" />
                </td>
            </tr>
        `;

        //Inicializamos el diccionario con el valor por defecto
        referencia_embalaje[referencia] = numero_embalajes;

        //En cualquier otro caso
    } else {
        //Asignamos el campo de forma normal
        fila_informacion = `
            <tr>
                <td>${referencia}</td>
                <td>${tipo_carga}</td>
                <td>${valor_carga}</td>
                <td>${cantidad_a_expedir}</td>
                <td>${numero_embalajes}</td>
            </tr>
        `;
    }

    //Añadimos la fila al cuerpo de la tabla
    tbody.append(fila_informacion);

    //Solo añadimos el evento si el campo es editable
    if (numero_embalajes === 0) {
        //Obtenemos la instancia del campo
        tbody.find(`.referencia-embalaje[data-referencia="${referencia}"]`).on('input', function () {
            //Obtenemos el valor del campo
            const nuevoValor = $(this).val();

            //Asignamos el nuevo valor
            referencia_embalaje[referencia] = nuevoValor;
        });
    }
}

/**
 * Función para disponer el modal del selector de etapas para las referencias
 */
function mostrarModalEtapas() {
    //Cerramos el modal del informe
    $('#modalInformeFinal').modal('hide');

    //Configuramos el título del modal del selector de etapas
    $('#modal .modal-title').text('Selecciona una etapa');

    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <form id="formulario_anyadirEtapa" method="POST">
            <!-- Referencia del componente -->
            <div class="mb-4">
                <label for="referencia_componente" class="block text-gray-700 font-bold mb-2">Referencia del componente:</label>
                <input type="text" id="referencia_componente" name="referencia_componente" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value="${referencia_componente}" disabled>
            </div>

            <!-- Categorias de las etapas -->
            <div class="relative inline-block w-64">
                <label for="categoria" class="block text-sm font-medium text-gray-700 mb-2">Selecciona una categoría</label>
                <select id="categoria" name="categoria" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option value="descarga_carga">DESCARGA/CARGA</option>
                    <option value="compras">COMPRAS</option>
                    <option value="preparacion">PREPARACIÓN</option>
                    <option value="distribucion">DISTRIBUCIÓN</option>
                    <option value="varios">VARIOS</option>
                    <option value="gestion_de_vacios_y_residuos">GESTIÓN DE VACÍOS Y RESIDUOS</option>
                    <option value="operaciones_manuales">OPERACIONES MANUALES</option>
                </select>
            </div>

            <!-- Operacion de la categoria -->
            <div class="relative inline-block w-64">
                <label for="operacion" class="block text-sm font-medium text-gray-700 mb-2">Selecciona una operación</label>
                <select id="operacion" name="operacion" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">

                </select>
            </div>

            <!-- Botón de continuar -->
            <div class="mt-6">
                <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition duration-300">Continuar</button>
            </div>
        </form>
    `);

    //Añadimos la funcionalidad para el dropdown de la categoria cada vez que cambie
    document.getElementById('categoria').addEventListener('change', actualizarOperacion);

    //Llamamos al método para inicializar los dropdown
    actualizarOperacion();

    //Añdiamos la funcionalidad para el dropdown de la categoria
    $('#categoria').on('change', function () {
        //Almacenamos la categoria seleccionada
        categoria_seleccionada = $(this).val();

        //Creamos una instancia el dropdown de las operaciones
        const dropdown_operaciones = $('#operacion');

        //Limpiamos las operaciones
        dropdown_operaciones.empty();

        //Hacemos un match para obtener las operaciones de la categoria
        if (categoria_seleccionada) {
            operaciones[categoria_seleccionada].forEach(function (op) {
                dropdown_operaciones.append(`<option value="${op.value}">${op.text}</option>`);
            });
        }
    });

    //Añadimos la operación cada vez que se seleccione una operación
    $('#operacion').on('change', function () {
        //Almacenamos la operación seleccionada
        operacion_seleccionada = $(this).val();
    });

    //Mostramos el modal
    $('#modal').modal('show');

    //Llamamos a la función para añadir la etapa al puesto
    subirEtapa();
}

/**
 * Función para añadir una etapa al puesto
 */
function subirEtapa() {
    //Añadimos la funcionalidad al formulario de añadir la etapa
    $("#formulario_anyadirEtapa").on('submit', function (e) {
        //Paramos la propagación
        e.preventDefault();

        //En caso de que el campo mote este vacio
        if (typeof mote === "string" && mote.trim() === '') {
            //Le asignamos NULL
            mote = null;
        }

        //mote = "DESCRIPCION";

        //Serializamos el diccionario con las referencias y el número de embalahjes
        referencia_embalaje = encodeURIComponent(JSON.stringify(referencia_embalaje));

        //Iniciamos la solicitud GET para añadir la etapa al puesto
        fetch(`/film/api/anyadirEtapa/${puestoID}/${referencia_embalaje}/${encodeURIComponent(operacion_seleccionada)}/${mote}/${tipo_operacion}/${numero_picadas}`, {
            method: "POST"
        })
            //Controlamos la respuesta
            .then(response => {
                //Llamamos a la función para controlar la respuesta
                controlarRespuesta(response);
            });
    });
}

/**
 * Función para controlar la respuesta
 * @param {*} response Argumento que contiene la respuesta del backend
 */
function controlarRespuesta(response) {
    //En caso de que haya salido bien
    if (response.status === 201) {
        mostrarAlerta("Etapa creada", null, null, 1);

        //En caso de que haya salido mal
    } else if (response.status === 501) {
        mostrarAlerta("Error en la creación de la etapa", "Se ha producido un error a la hora de crear la etapa", "error", 0);

        //En cualquier otro caso...
    } else {
        mostrarAlerta("Estado no controlado", "No se ha sido capaz de controlar el estado de la creación de la etapa", "question", null);
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

/**
 * Función para visualizar la información de una etapa
 * @param {String} etapa Argumento que contiene el nombre de la etapa
 */
function visualizarEtapa(etapa, referencia_componente, id_etapa) {
    //Configuramos el título de la etapa
    $('#modalLargeTitle').text('Información de la etapa ', etapa);

    //Preparamos la petición GET para obtener la información de la etapa
    fetch(`/film/api/obtenerInformacionEtapa/${id_etapa}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de fallo
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos obtenidos
            return response.json();
        })

        //Controlamos los datos obtenidos
        .then(data => {
            //Llamamos a la función para configurar la visualización de la etapa dependiendo de cual sea
            gestionarEtapa_Visualizacion(data);
        });
}

/**
 * Función para obtener la información de las etapas
 * @param {int} id_etapa Argumento que contiene el ID de la etap
 */
function disponerTablaOperaciones(id_etapa) {
    console.log("ID de la etapa dentro de la etapa de las opciones: ", id_etapa);

    //Preparamos la petición GET para obtener los valores de cada etapa
    fetch(`/film/api/obtenerInformacionEtapa_Valores/${id_etapa}`, {
        method: "GET"
    })

        //Controlamos la respuesta
        .then(response => {
            //En caso de que la respuesta no sea buena
            if (!response.ok) { throw new Error('Error fetching data'); }

            //Devolvemos los valores
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Declaramos las variables globales donde se almacenerán los datos obtenidos
            let fStandard, cantidad_a_mover, distancia_total, numero_curvas;

            //Iteramos por los datos obtenidos
            data.forEach(item => {
                /** Almacenamos los datos obtenidos en las variables globales */
                fStandard = item.F;
                cantidad_a_mover = item.cantidad_a_mover;
                distancia_total = item.distancia_total;
                numero_curvas = item.numero_curvas;
            });
        });
}

/**
 * Función para llamalr al end point para acualizar la información de la etapa
 * @param {int} id_etapa Argumento que contiene el ID de la etapa
 */
function actualizarInformacionEtapa_viejo(id_etapa) {
    //Iniciamos la peticion POST para actualizar la información de la etapa
    fetch(`/film/api/actualizarInformacionEtapa/${id_etapa}/${document.getElementById('distance_empty_zone_input').value}/${document.getElementById('number_packages_at_once_input').value}/${document.getElementById('loading_type_input').value}/${document.getElementById('machine_used_input').value}/${document.getElementById('speed_input').value}/F29`, {
        method: "POST"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que ocurra un error
            if (!response.ok) {
                throw new Error('Error to upload the phase');
            }

            //Llamamos al método para mostrar la alerta
            mostrarAlerta("Etapa actualizada", null, null, 1);
        });
}

/**
 * Función para controlar la actualización de las etapas dependiendo del tipo de F
 * @param {int} id_etapa Argumento que contiene el ID de la etapa
 * @param {String} F Argumento que contiene el tipo de F
 */
function controlActualizacionEtapa(id_etapa, F) {
    //Creamos un switch para controlar la F
    switch (F) {
        //F5
        case 'F5':
            //Preparamos la petición POST para actualizar la etapa F5
            fetch(`/film/api/actualizarEtapa-F5/${id_etapa}/${document.getElementById('distancia').value}/${document.getElementById('acceso_camion').value}/${document.getElementById('empaque_descargado').value}/${document.getElementById('maquina_usada').value}/${document.getElementById('velocidad').value}`, {
                method: "POST"
            })
                //Controlamos la respuesta
                .then(response => {
                    //Llamamos a la función para disponer la alerta
                    controlarRespuesta_Etapa(response);
                });
            break;

        //F29
        case 'F29':
            //Preparamos la petición POST para actualizar la etapa F29
            fetch(`/film/api/actualizarEtapa-F29/${id_etapa}/${document.getElementById('distancia').value}/${document.getElementById('numero_paquetes_cargados').value}/${document.getElementById('tipo_carga').value}/${document.getElementById('maquina_usada').value}/${document.getElementById('velocidad').value}`, {
                method: "POST"
            })
                //Controlamos la respuesta
                .then(response => {
                    //Llamamos a la función para disponer la alerta
                    controlarRespuesta_Etapa(response);
                });
            break;

        //F10
        case 'F10':
            //Preparamos la petición POST para actualizar la etapa F10
            fetch(`/film/api/actualizarEtapa-F10/${id_etapa}/${document.getElementById('distancia').value}/${document.getElementById('numero_bultos').value}/${document.getElementById('altura_embalaje').value}/${document.getElementById('almacenamiento_embalaje').value}/${document.getElementById('maquina_usada').value}/${document.getElementById('velocidad').value}/${document.getElementById('en_pila_de').value}/${document.getElementById('soporte_embalaje').value}`, {
                method: "POST"
            })
                //Controlamos la respuesta
                .then(response => {
                    //Llamamos a la función para disponer la alerta
                    controlarRespuesta_Etapa(response);
                });
            break;

        //F14
        case 'F14':
            //Prepramos la petición POST para actualizar la etapa F14
            fetch(`/film/api/actualizarEtapa-F14/${id_etapa}/${document.getElementById('distancia_tren').value}/${document.getElementById('distancia_zona_entrega').value}/${document.getElementById('distancia_almacenamiento').value}/${document.getElementById('numero_bases_rodantes').value}/${document.getElementById('maquina_usada').value}/${document.getElementById('velocidad').value}`, {
                method: "POST"
            })
                //Controlamos la respuesta
                .then(response => {
                    //Llamamos a la función para disponer la alerta
                    controlarRespuesta_Etapa(response);
                });
            break;

        //F27
        case 'F27':
            //Preparamos la petición POST para actualizar la etapa F27
            fetch(`/film/api/actualizarEtapa-F27/${id_etapa}/${document.getElementById('distancia_remolque').value}/${encodeURIComponent(document.getElementById('altura_paquete').value)}/${document.getElementById('numero_paquetes_pila').value}/${document.getElementById('maquina_usada').value}/${document.getElementById('velocidad').value}/${document.getElementById('soporte_embalaje').value}`, {
                method: "POST"
            })
                //Controlamos la respuesta
                .then(response => {
                    //Llamamos a la función para disponer la alerta
                    controlarRespuesta_Etapa(response);
                });
            break;

        //F12
        case 'F12':
            //Preparamos la peticón POST para actualizar la etapa F12
            fetch(`/film/api/actualizarEtapa-F12/${id_etapa}/${document.getElementById('distancia').value}/${document.getElementById('numero_bultos').value}/${document.getElementById('altura_embalaje').value}/${document.getElementById('maquina_usada').value}/${document.getElementById('velocidad').value}/${document.getElementById('en_pila_de').value}/${document.getElementById('soporte_embalaje').value}`, {
                method: "POST"
            })
                //Controlamos la respuesta
                .then(response => {
                    //Llamamos a la función para disponer la alerta
                    controlarRespuesta_Etapa(response);
                })

        default:
            break;
    }
}

/**8
 * Función para disponer una alerta dependiendo del tipo de respuesta
 * @param {*} response Argumento que contiene la respuesta
 */
function controlarRespuesta_Etapa(response) {
    //Añadimos un control a la respuesta... en caso de que haya salido bien
    if (response.status === 501) {
        mostrarAlerta("Error", "Error en la actualización de la etapa", 'error', 0);

        //En caso de que haya salido bien...
    } else if (response.status === 201) {
        mostrarAlerta("Etapa actualizada", null, null, 1);

        //En otro caso...
    } else {
        mostrarAlerta("Estado no controlado", "No se ha sido capaz de controlar el estado de la creación del puesto", "question", null);
    }
}

/**
 * Función para abrir el plano en una nueva pestaña
 * @param {int} puestoID Argumento que contiene el ID del puesto
 */
function visualizarPlano(puesto_id, id_etapa) {
    //Creamos un array con los datos que tenemos que enviar
    const rowData = [
        puesto_id,
        id_etapa,
        null
    ];

    console.log("Row data: ", rowData);

    //Convertimos el array a JSON
    const rowDataJson = encodeURIComponent(JSON.stringify(rowData));

    //Abrimos la página del plano en una nueva pestaña
    window.open(`/film/visualizarPlano?data=${rowDataJson}`, '_blank');
}

/**
 * Función para llamar al end point para eliminar el registro
 * @param {int} id_elemento Argumento que contiene el ID del elemento a eliminar
 * @param {String} tabla Argumento que contiene el nombre de la tabla del elemento a eliminar
 */
function eliminarRegistro(id_elemento, tabla) {
    //Preparamos la solicitud DELETE
    fetch(`/film/api/eliminarRegistro/${id_elemento}/${tabla}`, {
        method: "DELETE"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que todo haya salido bien
            if (response.status === 201) {
                mostrarAlerta("Puesto eliminado", null, null, 1);

                //En caso de que falle
            } else if (response.status === 501) {
                mostrarAlerta("Error en la creación del puesto", "Se ha producido un error a la hora de crear el puesto", "error", 0);

                //En casos no controlados
            } else {
                mostrarAlerta("Estado no controlado", "No se ha sido capaz de controlar el estado de la creación del puesto", "question", null);
            }
        });
}

/**
 * Función para dar funcionalidad al buscador
 */
function buscarEtapas() {
    //Creamos una instancia del buscador
    const buscador = document.getElementById('buscadorEtapa').value.toLowerCase();

    //Almacenamos todas las etapas
    const etapas = document.querySelectorAll('.mb-4');

    //Iteramos por todas las etapas
    etapas.forEach(function (etapa) {
        /** Almacenamos en variable la información de todas las etapas */
        const etapaTexto = etapa.querySelector('span') ? etapa.querySelector('span').textContent.toLowerCase() : '';
        const descripcionTexto = etapa.querySelector('span:nth-of-type(2)') ? etapa.querySelector('span:nth-of-type(2) strong')?.textContent.toLowerCase() : '';
        const componenteTexto = etapa.querySelector('span:nth-of-type(3)') ? etapa.querySelector('span:nth-of-type(3) strong')?.textContent.toLowerCase() : '';
        const lineaTexto = etapa.querySelector('span:nth-of-type(4)') ? etapa.querySelector('span:nth-of-type(4) strong')?.textContent.toLowerCase() : '';
        const tiempoTexto = etapa.querySelector('span:nth-of-type(5)') ? etapa.querySelector('span:nth-of-type(5) strong')?.textContent.toLowerCase() : '';

        //En caso de que la busqueda encuentre resultados
        if (etapaTexto.includes(buscador) || descripcionTexto.includes(buscador) || componenteTexto.includes(buscador) || lineaTexto.includes(buscador) || tiempoTexto.includes(buscador)) {
            //Mostramos la etapa
            etapa.style.display = '';

            //De los contrario
        } else {
            //Ocultamos la etapa
            etapa.style.display = 'none';
        }
    });
}

/**
 * Función para mostrar el modal para gestionar la etapa
 * @param {int} id_etapa Argumento que contiene el ID de la etapa
 */
function gestionarEtapa(id_etapa) {
    //Preparamos la solicitud GET para obtener todos los puestos
    fetch('/film/api/obtenerPuestos', {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que la respuesta no sea correcta
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos la respuesta
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Creamos una variable donde se almacenarán los puestos disponibles
            let opciones = data.map(item => `<option value="${item.id}">${item.nombre_puesto}</option>`).join("");

            //Configuramos el titulo del modal
            $('#modalTitle').text('Gestión de etapas');

            //Configure the body of the modal
            $('.modal-body').html(`
                <form id="gestionarEtapa" method="POST">
                    <!-- Select para los puestos -->
                    <div class="mt-6">
                        <label for="puesto" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione una opción para gestionar la etapa</label>
                        <select id="puesto" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            ${opciones}
                        </select>
                    </div>

                    <!-- Select para las opciones -->
                    <div class="mt-6">
                        <label for="gestion" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione una opción para gestionar la etapa</label>
                        <select id="gestion" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option value="copiar">Copiar</option>
                            <option value="mover">Mover</option>
                        </select>
                    </div>

                    <!-- Botón de continuar -->
                    <div class="mt-6">
                        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition duration-300">Aceptar</button>
                    </div>
                </form>
            `);

            //Aplicamos la funcionalidad al formulario
            $('#gestionarEtapa').on('submit', async function (e) {
                //Paramos la propagación
                e.preventDefault();

                /** Almacenamos en variables las opciones elegidas */
                const id_puesto = document.getElementById('puesto').value, gestion = document.getElementById('gestion').value;

                //Preparamos la solicitud POST para llamar al end point para gestionar la etapa
                fetch(`/film/api/gestionarEtapa/${id_etapa}/${id_puesto}/${gestion}`, {
                    method: "POST"
                })
                    //Controlamos la respuesta
                    .then(response => {
                        console.log("Response: ", response);
                        //En caso de que todo haya salido bien
                        if (response.status === 201) {
                            //mostrarAlerta("Etapa gestionada", null, null, 1);
                            //Configuramos la alerta para dar un aviso a la persona
                            Swal.fire({
                                title: "Etapa gestionada",
                                text: "¡Recuerda que debes de actualizar la información del plano!",
                                icon: "warning",
                                confirmButtonText: "De acuerdo",
                                allowOutsideClick: false
                            });

                            //En caso de que haya fallado
                        } else if (response.status === 501) {
                            mostrarAlerta("Error", "Se ha producido un error en la gestión de la etapa", "error", 0);

                            //En cualquier otro caso
                        } else {
                            mostrarAlerta("Estado no controlado", "No se ha sido capaz de controlar el estado de la creación del puesto", "question", null);
                        }
                    });
            });

            //Mostramos el modal
            $('#modal').fadeIn();
        })
}

/**
 * Función para configurar y mostrar el modal de selección de la planta
 */
function mostrarModalSeleccionPlanta() {
    //Configuramos el modal para que no se pueda cerrar
    $('#modalPlanta').modal({
        backdrop: 'static',
        keyboard: false
    });

    //Mostramos el modal
    $('#modalPlanta').fadeIn()
}

/**
 * Función para establecer la planta seleccionada
 */
function establecerPlanta() {
    //Almacenamos en una variable global la planta seleccionada
    planta = document.getElementById('planta').value;
    console.log("Planta: ", planta)

    //Llamamos a la función para almacenar la cookie
    setCookie("planta", planta, 30);

    console.log("Cookie almacenada: ", getCookie("planta"))

    //Ocultamos el modal del selector de planta
    $('#modalPlanta').fadeOut();

    //Llamamos a la función para establecer la planta seleccionada
    establecerPlantaSeleccionada(null);
}

/**
 * Función para establecer en el botón la planta seleccionada
 */
function establecerPlantaSeleccionada(planta_seleccion) {
    //En caso de que planta sea NULL
    if (planta_seleccion === '' || planta_seleccion === null) {
        //Almacenamos en una variable el valor seleccionado
        let planta_seleccionada = document.getElementById('planta').options[document.getElementById('planta').selectedIndex].text;

        console.log("Planta seleccionada: ", planta_seleccionada);

        //Establecemos el nombre de la planta seleccionada
        document.getElementById('plantaSeleccionada').innerHTML = `
            <span><h3>${planta_seleccionada}</span><br><i class="bi bi-house"></i></h3>
        `;

        //Llamamos a la función para establecer la cookie
        setCookie("planta", document.getElementById('planta').value, 30);

        //Estabecemos la planta en la variable global
        planta = document.getElementById('planta').value;

        //En caso de que haya un valor
    } else {
        //Establecemos el nombre de la planta seleccionada
        document.getElementById('plantaSeleccionada').innerHTML = `
            <span><h3>${obtenerPlantaPorCodigo(planta_seleccion)}</span><br><i class="bi bi-house"></i></h3>
        `;

        //Almacenamos en la variable global la planta seleccionada
        planta = planta_seleccion;

        //Llamamos a la función para establecer la cookie
        if (diccionario_plantas[planta_seleccion]) {
            setCookie("planta", diccionario_plantas[planta_seleccion], 30);
        } else {
            setCookie("planta", planta_seleccion, 30);
        }
    }
}

/**
 * Función para obtener el nombre de la planta 
 * @param {String} codigo Argumento que contiene el codigo de la planta
 * @returns Devuelve el nombre de la planta
 */
function obtenerPlantaPorCodigo(codigo) {
    return Object.entries(diccionario_plantas).find(([key, value]) => value === codigo)?.[0] || null;
}

/**
 * Función para configurar la disposición del input de la línea
 */
function configurarLinea() {
    //Creamos una intancia del tipo de operación
    const bbdd = document.getElementById('bbdd');

    //Creamos una instancia del contenedor de la línea
    const contenedorLinea = document.getElementById('contenedorLinea');

    //Creamos el eveneto para el dropdown del tipo de operación
    bbdd.addEventListener('change', (event) => {
        //Almacenamos en una variable el tipo de operación
        const tipoOperacion = event.target.value;

        //Almacenamos en la variable global el tipo de operación
        tipo_operacion = tipoOperacion;

        //Creamos un switch para controlar el tipo de operación
        switch (tipoOperacion) {
            //En caso de las opciones sean programa de expedición o programa de recepción...
            case 'Programa_Expedicion_Forklift':
            case 'Programa_Recepcion':
                //Ocultamos el contenedor de la linea
                contenedorLinea.hidden = true;
                break;

            //En caso de que el tipo de operación sea programa de fabricación...
            case 'Programa_Fabricacion':
                contenedorLinea.hidden = false;
                break;

            default:
                console.warn("Operación no reconocida:", tipoOperacion);
        }
    });
}

/**
 * Función para disponer la fecha de inicio y la fecha de fin de la los datos disponibles
 */
function mostrarTomaDatos() {
    //Preparamos la peticion GET para obtener las fechas 
    fetch('/film/api/fechaTomaDatos', {
        method: "GET"
    })
        //Controlamos los datos
        .then(response => {
            //En caso de que no haya salido bien
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Establecemos la fecha de inicio
            document.getElementById('fechaInicio').innerHTML = data.fecha_inicio.split('T')[0];

            //Establecemos la fecha de finalización
            document.getElementById('fechaFinal').innerHTML = data.fecha_fin.split('T')[0];
        });
}

/**
 * Función para obtener el primer día
 * @param {String} tipo_operacion Argumento que contiene el nombre de la tabla de la base de datos
 */
function obtenerPrimerDia(tipo_operacion) {
    //Preparamos la petición GET
    fetch(`/film/api/obtenerPrimerDia/${tipo_operacion}`, {
        method: "GET"
    })
        //Controlamos la respuesta
        .then(response => {
            //En caso de que haya fallado
            if (!response.ok) {
                throw new Error('Error fetching data');
            }

            //Devolvemos los datos
            return response.json();
        })

        //Controlamos los datos
        .then(data => {
            //Asignamos el primer día a la variable global
            primer_dia = data[0].primer_dia.split('T')[0];

            //Llamamos a la función para obtener el resto de los días quitando los fines de semana en cuatro semanas 
            //obtenerRestoFechas(primer_dia);
        });
}

/**
 * Función para configurar el modal para introducir referencia manuales
 */
function anyadirReferenciaManual() {
    //Configuramos el título del modal
    $('#modal .modal-title').text('Introduzca los campos');

    //Configuramos el cuerpo del modal
    $('#modal .modal-body').html(`
        <!-- Referencia del componente -->
        <div class="mb-4">
            <label for="referencia_componente" class="block text-gray-700 font-bold mb-2" required>Referencia del componente:</label>
            <input type="text" id="referencia_componente" name="referencia_componente" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingresa la referencia del componente" required>
        </div>

        <!-- Línea -->
        <div class="mb-4" id="contenedorLinea" hidden>
            <label for="linea" class="block text-gray-700 font-bold mb-2">Línea:</label>
            <input type="number" id="linea" name="linea" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Ingresa la línea">
        </div>

        <!-- Descripción -->
        <div class="mb-4">
            <label for="mote" class="block text-gray-700 font-bold mb-2">Descripción:</label>
            <input type="text" id="mote" name="mote" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingrese una descripción">
        </div>

        <!-- Pieza por tipo de carga -->
        <div class="mb-4">
            <label for="pieza_por_carga" class="block text-gray-700 font-bold mb-2">Pieza por tipo de carga:</label>
            <input type="number" id="pieza_por_tipo_carga" required name="pieza_por_tipo_carga" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Pieza por tipo de carga">
        </div>

        <!-- Cantidad de piezas -->
        <div class="mb-4">
            <label for="cantidad_piezas" class="block text-gray-700 font-bold mb-2">Cantidad de piezas:</label>
            <input type="number" id="cantidad_piezas" name="cantidad_piezas" required class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Cantidad de piezas">
        </div>

        <!-- Numero de embalajes -->
        <div class="mb-4">
            <label for="numero_embalajes" class="block text-gray-700 font-bold mb-2">Número de embalajes:</label>
            <input type="number" id="numero_embalajes" name="numero_embalajes" required class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Número de embalajes">
        </div>

        <!-- Tipo de operación -->
        <div class="relative inline-block w-64 mb-4">
            <label for="bbdd" class="block text-sm font-medium text-gray-700 mb-2">Seleccione perímetro de trabajo</label>
            <select id="bbdd" name="bbdd" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" onclick="configurarLinea()">
                <option value="Programa_Expedicion_Forklift">Expedición</option>
                <option value="Programa_Fabricacion">Fabricación</option>
                <option value="Programa_Recepcion">Recepción</option>
            </select>
        </div>

        <!-- Tipo de carga -->
        <div class="relative inline-block w-64 mb-4">
            <label for="tipoCarga" class="block text-sm font-medium text-gray-700 mb-2">Seleccione un tipo de carga</label>
            <select id="tipoCarga" name="tipoCarga" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="UM">UM</option>
                <option value="UC">UC</option>
            </select>
        </div>

        <!-- Botón vincular etapa -->
        <div class="mt-6">
            <button 
                type="button" 
                class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition duration-300" 
                id="btnVincular">
                Vincular a una etapa <i class="bi bi-link-45deg"></i>
            </button>
        </div>
    `);

    //Mostramos el modal
    $('#modal').modal('show');

    //Añadimos un controlador al botón para almacenar los datos del formulario
    document.getElementById("btnVincular").addEventListener("click", function () {
        //Llamamos a la función para almacenar los datos
        almacenarDatosManuales();
    });
}

/**
 * Función para almacenar los datos del formulario
 */
function almacenarDatosManuales() {
    /**Almacenamos los datos del formulario */
    let referencia = document.getElementById('referencia_componente').value;
    let mote = document.getElementById('mote').value;
    let pieza_por_carga = document.getElementById('pieza_por_tipo_carga')?.value || "";
    let cantidad_piezas = document.getElementById('cantidad_piezas')?.value || "";
    let numero_embalajes = document.getElementById('numero_embalajes')?.value || "";
    let bbdd = document.getElementById('bbdd')?.value || "";
    let tipo_carga = document.getElementById('tipoCarga')?.value || "";
    let linea = document.getElementById('linea')?.value || "";

    linea = linea;

    //Cerramos el modal principal
    $('#modal').modal('hide');

    //Asignamos la referencia introducida por el usuario en la variable global
    referencia_componente = referencia;

    //Asignamos al diccionario la referencia y el nmúmero de embalajes
    referencia_embalaje[referencia] = numero_embalajes;

    //Almacenamos en la variable global el tipo de operación
    tipo_operacion = bbdd;

    //Llamamos a la funcion para disponer el modal de las etapas
    mostrarModalEtapas();
}

/**
 * Función para guardar los gráficos de los puestos en un informe PDF
 */
async function generarInforme() {
    //Creamos una instancia de jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    //Almacenamos los gráficos de los puestos de dentro del carrousel
    let items = document.querySelectorAll('#graficos-container li');

    //En caso de que no haya puestos...
    if (items.length === 0) {
        console.error("No se encontraron elementos en el carrusel.");
        return;
    }

    /**
     * Función para configurar el gráfico 
     */
    function addBackground() {
        //Configuramos el color del fondo del PDF
        doc.setFillColor(73, 97, 131);

        //Establecemos el color del fondo
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    }

    //Iteramos por los elementos del carrousel
    items.forEach((item, index) => {
        //Obtenemos los canvas
        let canvases = item.querySelectorAll("canvas");

        //En caso de que no haya gráficos, pasamos al siguiente
        if (canvases.length === 0) return;

        //Agregamos una nueva pa´gina si no es la primera 
        if (index > 0) {
            doc.addPage();
        }

        //Llamamos a la función para disponer el fondo del PDF
        addBackground();

        //Declaramos las variables para disponer los gráficos
        let x1 = 10, y1 = 20; //Gráfico de saturación
        let x2 = 10, y2 = 120; //Gráfico de chimenea

        //Iteramos los gráficoos
        canvases.forEach((canvas, i) => {
            //Convertimos los gráficos a la calidad más alta
            let imgData = canvas.toDataURL('image/png', 1.0);

            //Ajustamos el tamaño de los gráficos
            let width = 180;
            let height = 80;

            //Agregamos los gráficos en sus respectivas posiciones
            if (i === 0) {
                doc.addImage(imgData, 'PNG', x1, y1, width, height);
            } else if (i === 1) {
                doc.addImage(imgData, 'PNG', x2, y2, width, height);
            }
        });
    });

    //Guardamos el archivo PDF con los gráficos
    doc.save("informe.pdf");
}

/**
 * Función para ocultar un puesto
 */
function restaurarPuestosOcultos() {
    //Creamos una instancia del span del elemento oculto
    const conteoElemento = document.getElementById('conteoPuestosOcultos');

    //Si hay puestos ocultos mostramos la cantidad
    if (puesto_ocultos.length > 0) {
        conteoElemento.innerText = puesto_ocultos.length;

        //En cualquier otro caso...
    } else {
        conteoElemento.innerText = "";
    }

    //Restauramos el puesto si hay al menos uno oculto
    if (puesto_ocultos.length > 0) {
        const puesto_restaurado = puesto_ocultos.pop();
        puesto_restaurado.style.display = '';

        //Añadimos la clase de animación
        puesto_restaurado.classList.add('restaurarElemento');
    }
}

/**
 * Función para configurar la funcionalidad de la cookie de la planta
 */
function configurarPlanta() {
    //En caso de que no haya una cookie con la planta seleccionada
    if (!getCookie('planta')) {
        //Llamamos a la función para disponer el modal de selección de planta
        mostrarModalSeleccionPlanta();

        //En cualquier otro caso
    } else {
        //Llamamos a la función para establecer la planta y la cookie
        establecerPlantaSeleccionada(getCookie('planta'));
    }
}

/**
 * Función para obtener el valor de la cookie usando el nombre de la misma
 * @param {String} name Argumento que contiene el nombre de la cookie
 * @returns Devuelve el valor de la cookie
 */
function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

/**
 * Función para establecer la información de la cookie
 * @param {String} name Argumento que contiene el nombre de la cookie
 * @param {String} value Argumento que contiene el valor de la cookie
 * @param {Date} days Argumeto que contiene los días de duración de la cookie
 */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + "; path=/" + expires;
}

/**
 * Añadimos la configuación para cuando la página este cargada
 */
window.addEventListener('DOMContentLoaded', function () {
    //Llamamos a la función para establecer la planta
    configurarPlanta();

    //Llamamos a la función para disponer las fechas de la toma de datos
    mostrarTomaDatos();

    //Llamamos al método para obtener los puestos
    fetchData();

    //Llamamos a la función para obtener el primer día
    obtenerPrimerDia("Programa_Expedicion_Forklift");

    //Añadimos la funcionalidad al buscador de etapas
    document.getElementById('buscadorEtapa').addEventListener('input', buscarEtapas);
});