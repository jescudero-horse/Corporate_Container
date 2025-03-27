//Importamos Express y los módulos necesarios
import express from "express";
import mysql from "mysql";

//Creamos una instancia de router
const router = express.Router();

//Inicializamos Express
const app = express();

//Creamos el pool de conexiones
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'portal-motores.vll.renault.es',
    user: 'corporatecentral',
    password: '1GJYbSrM_Oxv@PSF',
    database: 'corporate_central_re7',
    port: 31009,
    multipleStatements: true,
    timezone: 'z'
});

/**
 * Función para obtener una conexión del pool
 * @param {*} callback La función de callback a ejecutar.
 */
function getDBConnection(callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error de conexión:', err);
            callback(err, null);
        } else {
            callback(null, connection);
        }
    });
}

/**
 * End point para añadir un nuevo puesto
 */
router.post('/anyadirPuesto/:numero_puesto/:nombre_puesto/:numero_operarios/:mapa/:turno/:planta', (req, res) => {
    //Almacenamos los valores del formulario
    const { numero_puesto, nombre_puesto, numero_operarios, mapa, turno, planta } = req.params;

    //Creamos una variable para almacenar el path del mapa
    const ruta_mapa = `/assets/film/${mapa}`;

    //Controlamos los valores de los campos necesarios
    if (!numero_puesto || !nombre_puesto || !numero_operarios) {
        return res.status(400).send('Faltan campos en la solicitud');
    }

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        if (err) {
            //En caso de que se produzca un error...
            console.error('> Error al conectar a la base de datos: ', err);
            return res.status(500).send('Error al conectar a la base de datos');
        }

        //Almacenamos en una variable la consulta SQL para obtener el ID del turno usando el turno y la planta
        const queryTurno = `
            SELECT
                pt.turno_id
            FROM
                plantas_turnos pt
            JOIN
                plantas p
            ON
                pt.planta_id = p.id
            JOIN
                turnos t
            ON
                pt.turno_id = t.id
            WHERE
                p.codigo = ? AND
                t.turno = ?
        `;

        //Ejecutamos la consulta para obtener el ID del turno
        connection.query(queryTurno, [planta, turno], (errorTurno, resultTurno) => {
            if (errorTurno) {
                console.error('> Error a la hora de obtener el ID del turno: ', errorTurno);
                return res.status(500).send('Error al obtener el ID del turno');
            }

            if (resultTurno.length === 0) {
                return res.status(404).send('No se encontró el turno especificado');
            }

            //Almacenamos en la variable el ID del turno
            const id_turno = resultTurno[0].turno_id;

            //Almacenamos en una nueva variable la consulta SQL para añadir el puesto
            const queryPuesto = `
                INSERT INTO
                    puestos(numero_puesto, nombre_puesto, numero_operarios, mapa, id_turno)
                VALUES
                    (?, ?, ?, ?, ?)
            `;

            //Ejecutamos la consulta para añadir el puesto
            connection.query(queryPuesto, [numero_puesto, nombre_puesto, numero_operarios, ruta_mapa, id_turno], (errorPuesto, resultPuesto) => {
                if (errorPuesto) {
                    console.error('> Error a la hora de añadir el puesto: ', errorPuesto);
                    return res.status(500).send('Error a la hora de añadir el puesto');
                }

                //Enviamos el status
                res.status(201).send('Puesto añadido');
            });
        });
    });
});

/**
 * Función para obtener la query dependiendo de la operación seleccionada por el usuario
 * @param {String} operacion_seleccionada Argumento que contiene la operación seleccionada
 * @returns Devolvemos la query dependiendo de la operación seleccionada
 */
function queryOperacionSeleccionada(operacion_seleccionada) {
    //Creamos una variable para almacenar la query
    let query;

    //Creamos un switch para controlar la operación seleccionada
    switch (operacion_seleccionada) {
        //En caso de que sea F5
        case 'F5':
            query = `
                INSERT INTO 
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, comments, distancia_F5, acceso_al_camion_F5, embalaje_descargado_F5, machine_used, speed, DC221, DS10, CDL, CCPE)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de sea F29
        case 'F29':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, comments, distance_empty_zone, number_of_packages_loaded_at_once, loading_type, machine_used, speed)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea F10
        case 'F10':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, comments, distancia, numero_bultos_por_pila, altura_embalaje, almacenamiento_emlabajes_mediante, machine_used, speed, en_la_tienda_pila, soporte_embalaje, TC, CT10, PP1, CCPE, TL, CDL)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea F14
        case 'F14':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, comments, distancia_tren, distance_empty_zone, distancia_almacenamiento, numero_bases_rodantes, machine_used, speed, M1, DL, TL, PS10, CDV, TV, PDU34, CDL, PPU34, CCPE, TC, DS10)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea F27
        case 'F27':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, comments, distancia, altura_embalaje, numero_bultos_por_pila, machine_used, speed, PS10, CDV, TV, CT10, PDU34, TL, CDL, soporte_embalaje)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea F12
        case 'F12':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, comments, distancia, numero_bultos_por_pila, altura_embalaje, almacenamiento_emlabajes_mediante, machine_used, speed, en_la_tienda_pila, soporte_embalaje, PPD32, TC, CT10, PP1, CCPE, PDD34, TL)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "Coger UC/UM y dejar en stock altura media":
        case 'Coger UC/UM y dejar en stock altura media':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, comments, machine_used, speed, CHMAN)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,. ?)
            `;
            break;

        //En caso de que sea "Coger bac y colocar en carro/estanteria"
        case 'Coger bac y colocar en carro/estanteria':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, comments, CHMAN, machine_used)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "Carga cassette nacelle J 22 bacs"
        case 'Carga cassette nacelle J 22 bacs':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, comments, CHMAN, CHMAN_2, CHMAN_3, machine_used, speed)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "Colocacion carros manualmente"
        case 'Colocacion carros manualmente':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, comments, CHMAN, machine_used)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "Descarga camión en muelle (UM)"
        case 'Descarga camión en muelle (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, DC113, CDC, DS10, CDL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "De estantería a puesto inferior (UM)":
        case 'De estantería a puesto inferior (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, PS15, DI21, CDL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "De imagen camión a stock (UM)":
        case 'De imagen camión a stock (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, PS14, CDC, DS14, CDL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "De stock a estantería (UM)":
        case 'De stock a estantería (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, PS14, CDC, DS15, CDL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "De imagen camión a estantería (UM)":
        case 'De imagen camión a estantería (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, PS14, CDC, DS15, CDL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "Apertura (UM)":
        case 'Apertura (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, DC, D1, W5, TT, M1, AL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "Gestión de residuos (UM)":
        case 'Gestión de residuos (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, DC, D1, W5, TT, M1, AL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "Plegar y apilar (UC)":
        case 'Plegar y apilar (UC)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, P2, L2, G1, P5, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "De puesto inferior a carro (UC)":
        case 'De puesto inferior a carro (UC)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, G1_1, W5, P2_1, W5_2, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "Nacelle J 22bacs (UC)"
        case 'Nacelle J 22bacs (UC)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, W5, M1, PS14, TT, G1, P2, E2, P2_1, TT_2, DS10, M1_2, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "Documentacion camión (UM)"
        case 'Documentacion camión (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, DC, D1, W5, TT, W5_2, M1, AL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea "Zipado (UM)"
        case 'Zipado (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, DC, D1, W5, G1, W5_2, M1, AL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `;
            break;

        //En caso de que sea "De stock a imagen camion (UM)"
        case 'De stock a imagen camion (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, PS14, CDC, DS10, CDL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea 'De imagen camion a muelle (UM)'
        case 'De imagen camion a muelle (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, PS14, CDC, DS10, CDL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //En caso de que sea 'Plegado de vacíos (UM)'
        case 'Plegado de vacíos (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, DC, D1, W5, TT, TT_2, W5_2, M1, AL, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        //<En caso de que sea 'De stock a carro (UM)'
        case 'De stock a carro (UM)':
            query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, mote, tipo_operacion, numero_picadas, linea, machine_used, speed, PP11, CDC, DS15, CDL, PS14, CDC_2, DI21, CDL_2, nuevo, nuevo_picadas)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            break;

        default:
            query = null;
            break;
    }

    //Devolvemos la query
    return query;
}

/**
 * Función para añadir una etapa operativa en la base de datos
 * @param {import("mysql").Connection} connection Argumento que contiene la conexión a la base de datos
 * @param {String} query Argumento que contiene la sentencia SQL para añadir la etapa
 * @param {Array} data Argumento que contiene los datos de inserción de la etapa
 * @param {String} operacion_seleccionada Argumento que contiene la operación seleccionada por el usuario
 */
function anyadirEtapa_Operacion(connection, query, data, operacion_seleccionada) {
    //Creamos una variable 
    let cantidad_mover = data[2], numero_picadas = data[6];

    console.log("Data FINAL --> ", data);

    //Controlamos el tipo de operación
    switch (operacion_seleccionada) {
        //F5
        case 'F5':
            //Añadimos los datos restantes al Array
            data.push(
                "Descarga de UM y depósito en zona de identificación", //Comentario
                20, //Distancia
                1, //Acceso al camion
                1, //Embalaje
                4, //Maquina usada
                12, //Velocidad
                37 * cantidad_mover, //DC221
                19 * cantidad_mover, //DS10
                6 * cantidad_mover, //CDL
                6 * cantidad_mover //CCPE
            );

            break;

        //F29
        case 'F29':
            //Añadimos los datos restantes al Array
            data.push(
                'Área de almacenamiento de envases vacíos => Camión',
                40,
                2,
                'Muelle',
                1,
                12
            );

            console.log("Data F29: ", data);

            break;

        //F10
        case 'F10':
            //Añadimos los datos
            data.push(
                "Recogida de envases en GR y almacenamiento en almacén en tierra",
                30,
                3,
                "0.40 X 0.65",
                1,
                1,
                12,
                4,
                "Unitario",
                30,
                5,
                12 * cantidad_mover,
                6 * cantidad_mover,
                0,
                6 * cantidad_mover
            );
            break;

        //F14
        case 'F14':
            //Añadimos los datos
            data.push(
                "Cargando un tren de bases rodantes", //Comentario
                30, //Distancia del tren
                50, //Distancia de la zona de entrega vacia
                100, //Distancia de almacenamiento
                5, //Número de bases rodantes por tren
                1, //Mäquina usada
                12, //Velocidad
                6.5 * cantidad_mover, //M1
                4 * cantidad_mover, //DL
                0, //TL
                19 * cantidad_mover, //PS10
                6 * cantidad_mover, //CDV
                0, //TV
                31 * cantidad_mover, //PDU34
                6 * cantidad_mover, //CDL
                30 * cantidad_mover, //PPU34
                6 * cantidad_mover, //CDC
                0, //TC
                19 * cantidad_mover, //DS10
            );
            break;

        //F27
        case 'F27':
            //Añadimos los datos
            data.push(
                "Recogida de embalajes vacíos de los remolques y almacenamiento en una zona específica", //Comentario
                40, //Distancia del remolque
                "0,40m<h<0,65m", //Altura del paquete
                4, //Número de paquetes por pila
                1, //Máquina usada
                12, //Velocidad
                19 * cantidad_mover, //PS10
                6 * cantidad_mover, //CDV
                0, //TV
                5 * cantidad_mover, //CT10
                31 * cantidad_mover, //PDU34
                0, //TL
                6 * cantidad_mover, //CDL
                "Unitario" //Soporte embalaje
            );
            break;

        //F12
        case 'F12':
            //Añadimos los datos
            data.push(
                "Recogida de palés en GR y almacenamiento en almacén en tierra. Si se toman dobles pallets, doble almacenamiento.", //Comentario
                30, //Distancia
                2, //Número bultos
                '40m<-H<-0', //Altura del embalaje
                2, //Número de bultos
                1, //Máquina usada
                12, //Velocidad
                2, //Almacenamiento de embalajes  
                //2, //Almacenar en pila de
                "Unitario", //Soporte embalaje
                18 * cantidad_mover, //PDD32
                0, //TC
                5 * cantidad_mover, //CT10
                12 * cantidad_mover, //PP1
                6 * cantidad_mover, //CDC
                24 * cantidad_mover, //PDD34
                0 //TL
            );
            break;

        //En caso de que sea "Coger UC/UM y dejar en stock altura media":
        case 'Coger UC/UM y dejar en stock altura media':
            data.push(
                4, //Linea
                'Coger UC/UM y dejar en stock altura media', //Comentario
                1, //Máquina usada
                10, //Velocidad
                40 //CHMAN
            );
            break;

        //En caso de que sea "Coger bac y colocar en carro/estanteria"
        case 'Coger bac y colocar en carro/estanteria':
            data.push(
                4, //Linea
                'Coger UC/UM y dejar en stock altura media', //Comentario
                1.86, //CHMAN
                10 //Máquina usada
            );
            break;

        //En caso de que sea "Carga cassette nacelle J 22 bacs"
        case 'Carga cassette nacelle J 22 bacs':
            data.push(
                4, //Linea
                'Carga cassette nacelle J 22 bacs', //Comentario
                315, //CHMAN
                6, //CHMAN_2
                315, //CHMAN_3
                10, //Máquina usada,
                10, //Velocidad
            );
            break;

        //En caso de que sea "Colocacion carros manualmente"
        case 'Colocacion carros manualmente':
            data.push(
                4, //Linea
                'Colocacion carros manualmente', //Comentario
                20, //CHMAN
                10, //Máquina usada
            );
            break;

        //En caso de que sea "Descarga camión en muelle (UM)"
        case 'Descarga camión en muelle (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((42 * cantidad_mover) / 100), // DC113
                Math.ceil((6 * cantidad_mover) / 100), // CDC
                Math.ceil((19 * cantidad_mover) / 100), // DS10
                Math.ceil((6 * cantidad_mover) / 100), // CDL
                Math.ceil(
                    (42 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (19 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (42 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (19 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            );
            break;

        //En caso de que sea "De estantería a puesto inferior (UM)"
        case 'De estantería a puesto inferior (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((44 * cantidad_mover) / 100), // PS15
                Math.ceil((30 * cantidad_mover) / 100), // DI21
                Math.ceil((6 * cantidad_mover) / 100), // CDL
                Math.ceil(
                    (44 * cantidad_mover) / 100 +
                    (30 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (44 * cantidad_mover) / 100 +
                        (30 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            );
            break;

        //En caso de que sea "De imagen camión a stock (UM)"
        case 'De imagen camión a stock (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((38 * cantidad_mover) / 100), // PS14
                Math.ceil((6 * cantidad_mover) / 100), // CDC
                Math.ceil((38 * cantidad_mover) / 100), // DS14
                Math.ceil((6 * cantidad_mover) / 100), // CDL
                Math.ceil(
                    (38 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (38 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (38 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (38 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            );
            break;

        //En caso de que sea "De stock a estantería (UM)"
        case 'De stock a estantería (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((38 * cantidad_mover) / 100), // PS14
                Math.ceil((6 * cantidad_mover) / 100), // CDC
                Math.ceil((49 * cantidad_mover) / 100), // DS15
                Math.ceil((6 * cantidad_mover) / 100), // CDL
                Math.ceil(
                    (38 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (49 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (38 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (49 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picadas
            );
            break;

        //En caso de que sea "De imagen camión a estantería (UM)"
        case 'De imagen camión a estantería (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((38 * cantidad_mover) / 100), // PS14
                Math.ceil((6 * cantidad_mover) / 100), // CDC
                Math.ceil((49 * cantidad_mover) / 100), // DS15
                Math.ceil((6 * cantidad_mover) / 100), // CDL
                Math.ceil(
                    Math.ceil((38 * cantidad_mover) / 100) +
                    Math.ceil((6 * cantidad_mover) / 100) +
                    Math.ceil((49 * cantidad_mover) / 100) +
                    Math.ceil((6 * cantidad_mover) / 100)
                ), // Actividad en minutos
                Math.ceil(
                    Math.ceil(
                        Math.ceil((38 * cantidad_mover) / 100) +
                        Math.ceil((6 * cantidad_mover) / 100) +
                        Math.ceil((49 * cantidad_mover) / 100) +
                        Math.ceil((6 * cantidad_mover) / 100)
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            );
            break;

        //En caso de que sea "Apertura (UM)"
        case 'Apertura (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((4 * cantidad_mover) / 100), // DC
                Math.ceil((6 * cantidad_mover) / 100), // D1
                Math.ceil((1 * cantidad_mover) / 100), // W5
                Math.ceil((20 * cantidad_mover) / 100), // TT
                Math.ceil((7 * cantidad_mover) / 100), // M1
                Math.ceil((2 * cantidad_mover) / 100), // AL
                Math.ceil(
                    (4 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (1 * cantidad_mover) / 100 +
                    (20 * cantidad_mover) / 100 +
                    (7 * cantidad_mover) / 100 +
                    (2 * cantidad_mover) / 100
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (4 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (1 * cantidad_mover) / 100 +
                        (20 * cantidad_mover) / 100 +
                        (7 * cantidad_mover) / 100 +
                        (2 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            );
            break;

        //En caso de que sea "Gestión de residuos (UM)"
        case 'Gestión de residuos (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((4 * cantidad_mover) / 100), // DC
                Math.ceil((6 * cantidad_mover) / 100), // D1
                Math.ceil((1 * cantidad_mover) / 100), // W5
                Math.ceil((35 * cantidad_mover) / 100), // TT
                Math.ceil((7 * cantidad_mover) / 100), // M1
                Math.ceil((2 * cantidad_mover) / 100), // AL
                Math.ceil(
                    (4 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (1 * cantidad_mover) / 100 +
                    (35 * cantidad_mover) / 100 +
                    (7 * cantidad_mover) / 100 +
                    (2 * cantidad_mover) / 100
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (4 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (1 * cantidad_mover) / 100 +
                        (35 * cantidad_mover) / 100 +
                        (7 * cantidad_mover) / 100 +
                        (2 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            );
            break;

        //En caso de que sea "Plegar y apilar (UC)"
        case 'Plegar y apilar (UC)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((1 * cantidad_mover) / 100), // P2
                Math.ceil((1 * cantidad_mover) / 100), // L2
                Math.ceil((1 * cantidad_mover) / 100), // G1
                Math.ceil((2 * cantidad_mover) / 100), // P5
                Math.ceil(
                    (1 * cantidad_mover) / 100 +
                    (1 * cantidad_mover) / 100 +
                    (1 * cantidad_mover) / 100 +
                    (2 * cantidad_mover) / 100
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (1 * cantidad_mover) / 100 +
                        (1 * cantidad_mover) / 100 +
                        (1 * cantidad_mover) / 100 +
                        (2 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            );
            break;

        //En caso de que sea "De puesto inferior a carro (UC)"
        case 'De puesto inferior a carro (UC)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((1 * cantidad_mover) / 100), // G1_1
                Math.ceil((1 * cantidad_mover) / 100), // W5
                Math.ceil((1 * cantidad_mover) / 100), // P2_1
                Math.ceil((2 * cantidad_mover) / 100), // W5_2
                Math.ceil(
                    (1 * cantidad_mover) / 100 +
                    (1 * cantidad_mover) / 100 +
                    (1 * cantidad_mover) / 100 +
                    (2 * cantidad_mover) / 100
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (1 * cantidad_mover) / 100 +
                        (1 * cantidad_mover) / 100 +
                        (1 * cantidad_mover) / 100 +
                        (2 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            );
            break;

        //En caso de que sea "Nacelle J 22bacs (UC)":
        case 'Nacelle J 22bacs (UC)': +
            data.push(
                null, //Linea
                10, //Linea
                10, //Velocidad
                (10 * cantidad_mover) / 100, //W5
                (6 * cantidad_mover) / 100, //M1
                (38 * cantidad_mover) / 100, //PS14
                (40 * cantidad_mover) / 100, //TT
                (2 * cantidad_mover) / 100, //G1
                (1 * cantidad_mover) / 100, //P2
                (2 * cantidad_mover) / 100, //E2
                (2 * cantidad_mover) / 100, //PS2_1
                (40 * cantidad_mover) / 100, //TT_2
                (19 * cantidad_mover) / 100, //DS10
                (7 * cantidad_mover) / 100, //M2
                (10 * cantidad_mover) / 100 + (6 * cantidad_mover) / 100 + (38 * cantidad_mover) / 100 + (40 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100 + (1 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100 + (40 * cantidad_mover) / 100 + (19 * cantidad_mover) / 100 + (7 * cantidad_mover) / 100, //Actividad en minutos
                ((10 * cantidad_mover) / 100 + (6 * cantidad_mover) / 100 + (38 * cantidad_mover) / 100 + (40 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100 + (1 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100 + (40 * cantidad_mover) / 100 + (19 * cantidad_mover) / 100 + (7 * cantidad_mover) / 100) / numero_picadas // Actividad en minutos x picadas
            );
            break;

        //En el caso 'Documentacion camión (UM)'
        case 'Documentacion camión (UM)':
            data.push(
                null, //Linea
                10, //Linea
                10, //Velocidad
                (4 * cantidad_mover) / 100, //DC
                (6 * cantidad_mover) / 100, //D1
                (2 * cantidad_mover) / 100, //W5
                (400 * cantidad_mover) / 100, //TT
                (2 * cantidad_mover) / 100, //W5_2
                (7 * cantidad_mover) / 100, //M1
                (2 * cantidad_mover) / 100, //AL
                (4 * cantidad_mover) / 100 + (6 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100 + (400 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100 + (7 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100, //Actividad en minutos
                ((4 * cantidad_mover) / 100 + (6 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100 + (400 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100 + (7 * cantidad_mover) / 100 + (2 * cantidad_mover) / 100) / numero_picadas //Actividad en minutos x numero picadas
            )
            break;

        //En caso de que sea'Zipado (UM)'
        case 'Zipado (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((4 * cantidad_mover) / 100), // DC
                Math.ceil((6 * cantidad_mover) / 100), // D1
                Math.ceil((2 * cantidad_mover) / 100), // W5
                Math.ceil((4 * cantidad_mover) / 100), // G1
                Math.ceil((2 * cantidad_mover) / 100), // W5_2
                Math.ceil((7 * cantidad_mover) / 100), // M1
                Math.ceil((2 * cantidad_mover) / 100), // AL
                Math.ceil(
                    (4 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (2 * cantidad_mover) / 100 +
                    (4 * cantidad_mover) / 100 +
                    (2 * cantidad_mover) / 100 +
                    (7 * cantidad_mover) / 100 +
                    (2 * cantidad_mover) / 100
                ), // Actividad en 
                Math.ceil(
                    (
                        (4 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (2 * cantidad_mover) / 100 +
                        (4 * cantidad_mover) / 100 +
                        (2 * cantidad_mover) / 100 +
                        (7 * cantidad_mover) / 100 +
                        (2 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            )
            break;

        //En caso de que sea 'De stock a imagen camion (UM)'
        case 'De stock a imagen camion (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((38 * cantidad_mover) / 100), // PS14
                Math.ceil((6 * cantidad_mover) / 100), // CDC
                Math.ceil((19 * cantidad_mover) / 100), // DS10
                Math.ceil((6 * cantidad_mover) / 100), // CDL
                Math.ceil(
                    (38 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (19 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (38 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (19 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            )
            break;

        //En caso de que swwa 'De imagen camion a muelle (UM)'
        case 'De imagen camion a muelle (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((38 * cantidad_mover) / 100), // PS14
                Math.ceil((6 * cantidad_mover) / 100), // CDC
                Math.ceil((19 * cantidad_mover) / 100), // DS10
                Math.ceil((6 * cantidad_mover) / 100), // CDL
                Math.ceil(
                    (38 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (19 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (38 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (19 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            );
            break;

        //En caso de que sea 'Plegado de vacíos (UM)'
        case 'Plegado de vacíos (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((4 * cantidad_mover) / 100), // DC
                Math.ceil((6 * cantidad_mover) / 100), // D1
                Math.ceil((2 * cantidad_mover) / 100), // W5
                Math.ceil((20 * cantidad_mover) / 100), // TT
                Math.ceil((20 * cantidad_mover) / 100), // TT_2
                Math.ceil((2 * cantidad_mover) / 100), // W5_2
                Math.ceil((7 * cantidad_mover) / 100), // M1
                Math.ceil((2 * cantidad_mover) / 100), // AL
                Math.ceil(
                    (4 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (2 * cantidad_mover) / 100 +
                    (20 * cantidad_mover) / 100 +
                    (20 * cantidad_mover) / 100 +
                    (2 * cantidad_mover) / 100 +
                    (7 * cantidad_mover) / 100 +
                    (2 * cantidad_mover) / 100 
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (4 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (2 * cantidad_mover) / 100 +
                        (20 * cantidad_mover) / 100 +
                        (20 * cantidad_mover) / 100 +
                        (2 * cantidad_mover) / 100 +
                        (7 * cantidad_mover) / 100 +
                        (2 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            );
            break;

        //<En caso de que sea 'De stock a carro (UM)'
        case 'De stock a carro (UM)':
            data.push(
                null, // Línea 
                10, // Máquina usada
                10, // Velocidad
                Math.ceil((38 * cantidad_mover) / 100), // PP11
                Math.ceil((6 * cantidad_mover) / 100), // CDC
                Math.ceil((49 * cantidad_mover) / 100), // DS15
                Math.ceil((6 * cantidad_mover) / 100), // CDL
                Math.ceil((38 * cantidad_mover) / 100), // PS14
                Math.ceil((6 * cantidad_mover) / 100), // CDC_2
                Math.ceil((29 * cantidad_mover) / 100), // DL21
                Math.ceil((9 * cantidad_mover) / 100), //CDL_3
                Math.ceil(
                    (38 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (49 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (38 * cantidad_mover) / 100 +
                    (6 * cantidad_mover) / 100 +
                    (29 * cantidad_mover) / 100 +
                    (9 * cantidad_mover) / 100 
                ), // Actividad en minutos
                Math.ceil(
                    (
                        (38 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (49 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (38 * cantidad_mover) / 100 +
                        (6 * cantidad_mover) / 100 +
                        (29 * cantidad_mover) / 100 +
                        (9 * cantidad_mover) / 100
                    ) / numero_picadas
                ) // Actividad en minutos X picada
            )
        break;

        default:
            break;
    }

    //Ejecutamos la sentencia
    connection.query(query, data, (error, result) => {
        //En caso de que ocurra algun error...
        if (error) {
            console.error("> Error a la hora de añadir la operación: ", error);

            //En cualquier otro caso...
        } else {
            console.log('> Resultados: ', result);
        }
    });
}

/**
 * End point para añadir una nueva etapa a un puesto
 */
router.post('/anyadirEtapa/:puesto_id/:referencia_embalaje/:operacion_seleccionada/:descripcion/:tipo_operacion/:numero_picadas', async (req, res) => {
    try {
        //Almacenamos los parámetros de la URL
        const { puesto_id, operacion_seleccionada, descripcion, tipo_operacion, numero_picadas } = req.params;

        //Decodificamos y parseamos el JSON de referencia_embalaje con manejo de errores
        let referencia_embalaje;

        try {
            referencia_embalaje = JSON.parse(decodeURIComponent(req.params.referencia_embalaje));
            console.log("> Referencia embalajes: ", referencia_embalaje);
        } catch (err) {
            return res.status(400).send('Error en el formato de referencia_embalaje');
        }

        //Obtenemos la query
        const query = queryOperacionSeleccionada(operacion_seleccionada);

        console.log("> Query: ", query);
        if (!query) {
            return res.status(400).send('Operación no válida');
        }

        console.log(
            "Puesto ID: ", puesto_id,
            "\nDiccionario: ", referencia_embalaje,
            "\nOperación seleccionada: ", operacion_seleccionada,
            "\nDescripción: ", descripcion
        );

        //Creamos la conexión a la base de datos
        const connection = await new Promise((resolve, reject) => {
            getDBConnection((err, conn) => {
                if (err) reject(err);
                else resolve(conn);
            });
        });

        //Iteramos sobre las referencias y ejecutamos las operaciones
        const keys = Object.keys(referencia_embalaje);
        for (const referencia of keys) {
            //Obtenemos 
            const valor = referencia_embalaje[referencia];

            const data = [
                puesto_id,
                referencia,
                valor,
                operacion_seleccionada,
                descripcion,
                tipo_operacion,
                numero_picadas
            ];

            //Llamamos a la función para añadir la etapa
            anyadirEtapa_Operacion(connection, query, data, operacion_seleccionada);
        }

        //Liberamos la conexión después de finalizar todas las operaciones
        connection.release();

        //Enviamos la respuesta al cliente
        return res.status(201).send("End point procesado correctamente");
    } catch (err) {
        console.error("> Error en el procesamiento: ", err);
        return res.status(500).send('Error interno del servidor');
    }
});

/**
 * End point para añadir la referencia manual
 */
router.post('/anyadirEtapaManual/:puesto_id/:referencia/:operacion_seleccionada/:mote/:tipo_operacion/:numero_picadas', async (req, res) => {
    //Almacenamos la información de los parámetrod
    const { puesto_id, operacion_seleccionada, mote, tipo_operacion, numero_picadas } = req.params;

    //Decofificamos el diccionario
    let referencia;
    try {
        referencia = JSON.parse(decodeURIComponent(req.params.referencia));
    } catch (error) {
        return res.status(400).send("Error al decodificar la referencia.");
    }

    // reamos la conexión a la base de datos
    const connection = await new Promise((resolve, reject) => {
        getDBConnection((err, conn) => {
            if (err) reject(err);
            else resolve(conn);
        });
    });

    //Almacenamos la key de la referencia
    const keys = Object.keys(referencia);

    //Obtenemos sobre las keys
    for (const referenciaKey of keys) {
        //Almacenamos el valor de cada referencia
        const valor = referencia[referenciaKey];

        //Almacenamos en una variable la consulta SQL para saber si ya existe esa referencia
        const query = `SELECT * FROM x WHERE id_puesto = ? AND referencia_componente = ?`;

        //Ejecutamos la consulta SQL
        connection.query(query, [puesto_id, referenciaKey], (err, rows) => {
            if (err) {
                console.error("Error en la consulta de verificación:", err);
                return;
            }

            if (rows.length > 0) {
                console.log(`Referencia ${referenciaKey} ya existe para id_puesto ${puesto_id}. No se insertará.`);
            } else {
                console.log(`Referencia ${referenciaKey} no existe. Procediendo a insertar.`);

                //Almacenamos los datos para la inserción
                const data = [
                    puesto_id,
                    referenciaKey,
                    valor,
                    operacion_seleccionada,
                    mote,
                    tipo_operacion,
                    numero_picadas
                ];

                //Llamamos a la función para insertar
                anyadirEtapa_Operacion(connection, query, data, operacion_seleccionada);
            }
        });
    }

    //Liberamos la conexión después de finalizar todas las operaciones
    connection.release();

    //Enviamos la respuesta
    return res.status(201).send("End point procesado correctamente");
});

/**
 * End point para añadir una nueva etapa a un puesto BUENO
 */
router.post('/anyadirEtapa-viejo/:puesto_id/:referencia_embalaje/:operacion_seleccionada/:descripcion/:tipo_operacion', (req, res) => {
    //Almacenamos en variables los parámetros
    let { puesto_id, referencia_embalaje, operacion_seleccionada, descripcion, tipo_operacion } = req.params;

    //Almacenamos el diccionario deserializado
    //referencia_embalaje = JSON.parse(decodeURIComponent(referencia_embalaje));

    //Almacenamos en una variable la consulta SQL
    const query = `
        INSERT INTO
            EN_IFM_STANDARD (id_puesto, referencia_componente, cantidad_a_mover, F, comments, distance_empty_zone, number_of_packages_loaded_at_once, loading_type, machine_used, speed, mote, tipo_operacion)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    console.log(
        "Puesto ID: ", puesto_id,
        "\nDiccionario: ", referencia_embalaje,
        "\nOperacion seleccionada: ", operacion_seleccionada,
        "\nDescripcion: ", descripcion
    )

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error...
        if (err) {
            console.log("> Error en la conexión a la base de datos: ", err);
            return res.status(501).send('Error en la conexión a la base de datos');
        }

        //Iteramos el diccionario
        for (const referencia in referencia_embalaje) {
            //Comprobamos que la clave pertenece al objeto
            if (referencia_embalaje.hasOwnProperty(referencia)) {
                console.log(`>>> Clave: ${referencia} \tValor: ${referencia_embalaje[referencia]}`);

                //Ejecutamos la sentencia por cada referencia válida
                connection.query(query, [puesto_id, referencia, referencia_embalaje[referencia], operacion_seleccionada, 'Área de almacenamiento de envases vacíos => Camión', 40, 2, 'Air plane', 1, 12, descripcion, tipo_operacion], (error, result) => {
                    //En caso de ocurra algún error...
                    if (error) {
                        console.log("> Error en la consulta: ", error);
                        res.status(501).send('Error a la hora de añadir la etapa: ', error);
                    }

                    console.log("> Resultados: ", result);
                });
            }
        }

        //Liberamos la conexión
        connection.release();

        //Enviamos el estados
        return res.status(201).send("End point procesado");
    });
});

/**
 * 
 */
router.put('/actualizarOrden/:array_ordenado', (req, res) => {
    let array_ordenado = decodeURIComponent(req.params.array_ordenado);

    let query = `
        UPDATE
            EN_IFM_STANDARD
        SET
            orden = ?
        WHERE
            id = ? AND
            id_puesto = ?
    `;

    let array = array_ordenado.split('-')

    getDBConnection((err, connection) => {
        //En caso de que se produzaca un error...
        if (err) {
            return res.status(400).send('Error al conectar con la base de datos');
        }

        array.forEach((item, index) => {
            connection.query(query, [array_ordenado[index], item[0], item[1]], (error, result) => {
                //Liberamos la conexión
                connection.release();

                //En caso de que se produzca un error...
                if (error) {
                    console.error("> Error: ", error);

                    //Enviamos el status
                    return res.status(500).send('Error en la consulta');

                    //En otro caso...
                } else {
                    return res.status(201);
                }
            })
        })
    });
});

/**
 * End point para obtener las etapas de un puesto
 */
router.get('/obtenerEtapas_Puesto/:id_puesto', (req, res) => {
    //Almacenamos el ID del puesto
    const id_puesto = req.params.id_puesto;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzaca un error...
        if (err) {
            return res.status(400).send('Error al conectar con la base de datos');
        }

        //Almacenamos en una variable la consulta SQL
        const query = `
            SELECT 
                EN.*,
                FS.name
            FROM
                EN_IFM_STANDARD AS EN
            INNER JOIN
                FStandard_Name AS FS
            ON 
                EN.F = FS.FStandard
            WHERE EN.id_puesto = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [id_puesto], (error, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que se produzca un error...
            if (error) {
                console.error("> Error: ", error);

                //Enviamos el status
                return res.status(500).send('Error en la consulta');

                //En otro caso...
            } else {
                console.log("> Resultados: ", results);

                //Enviamos la información
                res.json(results);
            }
        })
    });
});

/**
 * End point para obtener el codigo MTM3 usando el ID de la machine used
 */
router.get('/obtenerCodigoMTM3/:machine_used', (req, res) => {
    //Almacenamos la variable de los parámetros
    const machine_used = req.params.machine_used;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que la conexión falle
        if (err) {
            return res.status(400).send('Error al conectar con la base de datos');
        }

        //Almacenamos en una variable la consulta SQL
        const query = `
            SELECT 
                code_MTM3
            FROM
                MTM3
            WHERE 
                id_MTM3 = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [machine_used], (error, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que se produzca un error
            if (error) {
                console.error("> Error: ", error);

                //Devolvemos el estado
                return res.status(501).send("No se pudo procesar la consulta")
            }

            console.log("> Resultados: ", results);

            //Enviamos la información
            return res.json(results);
        })
    });
})

/**
 * End point para obtener el conteo de todas las etapas disponibles
 */
router.get("/conteoFs", (req, res) => {
    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca un error
        if (err) {
            return res.status(400).send('Error al conectar con la base de datos');
        }

        //Almacenamos en una variable la consulta SQL
        const query = `
            SELECT 
                COUNT(id)
            FROM
                EN_IFM_STANDARD
        `;

        //Ejecutamos la consulta SQL
        connection.query(query, [], (error, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que se produzca un error
            if (error) {
                console.log("> Error: ", error);

                //Enviamos el status
                return res.status(500).send('Error en la consulta');

            }

            console.log("> Result: ", results);

            //Enviamos la información
            res.json(results);
        })
    })
});

/**
 * End point para obtener las etapas usando el F
 */
router.get(`/obtenerEtapas/:Fstandard`, (req, res) => {
    //Almacenamos en una variable el F
    const fStandard = req.params.Fstandard;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzaca un error...
        if (err) {
            return res.status(400).send('Error al conectar con la base de datos');
        }

        //Almacenamos en una variable la consulta SQL
        const query = `
            SELECT *
            FROM table_method_operation
            WHERE Fstandard = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [fStandard], (error, results) => {
            //Liberamos la conexión
            connection.release();

            //Si ocurre algun error...
            if (error) {
                console.log("> Error: ", error);

                //Enviamos el status
                return res.status(500).send('Error en la consulta');

                //En otro caso...
            } else {
                console.log("> Resultados: ", results);

                //Enviamos la información
                res.json(results);
            }
        });
    });
});

/**
 * End point para obtener los datos de la etapa usando el ID de la misma
 */
router.get('/obtenerInformacionEtapa_Valores/:id_etapa', (req, res) => {
    //Almacenamos el ID de la etapa
    const id_etapa = req.params.id_etapa;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca un error...
        if (err) {
            return res.status(400).send('Error al conectar con la base de datos');
        }

        //Almacenamos en una variable la sentencia SQL
        const query = `
            SELECT 
                cantidad_a_mover, distancia_total, numero_curvas, F
            FROM 
                EN_IFM_STANDARD
            WHERE 
                id = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [id_etapa], (error, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que se produza un error
            if (error) {
                console.log("> Error: ", error);
                return res.status(500).send('Error en la consulta');
            }

            //Enviamos la información
            res.json(results);
        });
    });
});

/**
 * End point para obtener los detalles de una etapa
 */
router.get('/obtenerInformacionEtapa/:id_etapa', (req, res) => {
    //Almacenamos la variable de los parametros
    const id_etapa = req.params.id_etapa;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca un error...
        if (err) {
            return res.status(400).send('Error al conectar con la base de datos');
        }

        //Almacenamos en una variable la consulta SQL para obtener la información de la etapa
        const query = `
            SELECT
                EI.*,
                MT.*
            FROM
                EN_IFM_STANDARD AS EI
                INNER JOIN MTM3 AS MT ON EI.machine_used = MT.id_MTM3
            WHERE
                EI.id = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [id_etapa], (error, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que se produza un error
            if (error) {
                console.log("> Error: ", error);
                return res.status(500).send('Error en la consulta');
            }

            console.log("Results: ", results);

            //Enviamos la información
            res.json(results);
        });
    });
});

/**
 * End point para obtener la ruta del puesto
 */
router.get('/obtenerPlano/:puesto_id', (req, res) => {
    //Obtenemos el ID del puesto de los argumentos
    const puesto_id = req.params.puesto_id;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca un error...
        if (err) {
            return res.status(400).send('Error al conectar con la base de datos');
        }

        //Almacenamos en una variable la consulta SQL
        const query = `
            SELECT 
                mapa
            FROM
                puestos
            WHERE 
                id = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [puesto_id], (error, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que se produzca un error...
            if (error) {
                console.error("> Error: ", error);
                return res.status(500).send('Error en la consulta');
            }

            //En cualquier otro caso...
            console.log("> Resultados: ", results);

            //Enviamos la información
            return res.json(results);
        })
    });
});

/**
 * End point para obtener la información del plano (distancia, número de curvas y coordenadas)
 */
router.get('/obtenerInformacionPlano/:id_etapa', (req, res) => {
    //Almacenamos el ID de la etapa
    const id_etapa = req.params.id_etapa;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que produzca un error...
        if (err) {
            return res.status(400).send("Faltan campos en la solicitud");
        }

        //Almacenamos en una variable la consulta SQL
        const query = `
            SELECT 
                distancia_total,
                numero_curvas,
                puntos,
                numero_cruces,
                numero_puertas
            FROM
                EN_IFM_STANDARD
            WHERE id = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [id_etapa], (error, results) => {
            //En caso de que ocurra un error
            if (error) {
                console.error("> Error: ", error);

                //Enviamos el status
                return res.status(500).send("Error en la consulta");

                //En cualquier otro caso...
            } else {
                console.log("> Results: ", results);

                //Enviamos la información
                res.json(results);
            }
        });
    });
});

/**
 * End point para añadir una unión entre etapas
 */
router.post('/anyadirDesplazamientoZona/:id_puesto/:distancia_total/:numero_curvas/:puntos/:numero_cruces/:numero_puertas/:frecuencia_recorrido/:maquina_usada/:velocidad/:descripcion', (req, res) => {
    /** Almacenamos las variables */
    const { id_puesto, distancia_total, numero_curvas, puntos, numero_cruces, numero_puertas, frecuencia_recorrido, maquina_usada, velocidad, descripcion } = req.params;

    //Creamos una variable para almacenar el ID de la máquina usada
    let maquina_id;

    console.log("> Datos obtenidos: \n", id_puesto, distancia_total, numero_curvas, puntos, numero_cruces, numero_puertas, frecuencia_recorrido)

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca un error...
        if (err) {
            return res.status(501).send('Error al conectar a la base de datos');
        }

        //Almacenamos en una variable la consulta SQL para obtener el ID de la máquina
        const query = `
            SELECT
                id_MTM3
            FROM
                MTM3
            WHERE
                engins = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [maquina_usada], (error, results) => {
            //En caso de que se produzca un error
            if (error) {
                console.log("> Error: ", error);
            }

            //Almacenamos el ID de la máquina usada
            maquina_id = results[0].id_MTM3;

            //Almacenamos en una variable la siguiente consulta
            const query = `
                INSERT INTO
                    EN_IFM_STANDARD (id_puesto, F, machine_used, speed, distancia_total, numero_curvas, puntos, mote, numero_cruces, numero_puertas, frecuencia_recorrido)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            //Ejecutamos la consulta
            connection.query(query, [id_puesto, "X", maquina_id, velocidad, distancia_total, numero_curvas, puntos, descripcion, numero_cruces, numero_puertas, frecuencia_recorrido], (error, results) => {
                //En caso de que se produzca un error
                if (error) {
                    console.log("> Error: ", error)

                    //Enviamos el status
                    return res.status(501).send("Error en la consulta");
                }

                console.log("> Results: ", results);

                //Enviamos el status
                return res.status(201).send('Unión añadido');
            });
        });
    });
});

/**
 * End point para actualizar la información del plano usando el ID del puesto y la informacion
 */
router.post('/actualizarInformacionMapa/:id_etapa/:totalDistanceMeters/:curveCount/:puntosJSON/:numero_cruces/:numero_puertas/', (req, res) => {
    //Almacenamos la informacion en las variables
    let { id_etapa, totalDistanceMeters, curveCount, puntosJSON, numero_cruces, numero_puertas } = req.params;

    let query;

    //Controlamos los valores de los campos necesarios
    if (!id_etapa || !totalDistanceMeters || !curveCount || !numero_cruces || !numero_puertas) {
        return res.status(400).send("Faltan campos en la solicitud");
    }

    /** Convertimos los valores a NULL en caso de que esten vacios */
    totalDistanceMeters = totalDistanceMeters === 'null' ? 0 : totalDistanceMeters;
    curveCount = curveCount === 'null' ? 0 : curveCount;
    puntosJSON = puntosJSON === 'null' ? 0 : puntosJSON;
    numero_cruces = numero_cruces === 'null' ? 0 : numero_cruces;
    numero_puertas = numero_puertas === 'null' ? 0 : numero_puertas;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca un error...
        if (err) {
            res.status(500).send("Error al conectar a la base de datos");
        }

        //Almacenamos en una variable la consulta SQL
        query = `
            UPDATE
                EN_IFM_STANDARD
            SET
                distancia_total = ?,
                numero_curvas = ?,
                puntos = ?,
                numero_cruces = ?,
                numero_puertas = ?
            WHERE
                id = ?
            `;

        //Ejecutamos la consulta
        connection.query(query, [totalDistanceMeters, curveCount, puntosJSON, numero_cruces, numero_puertas, id_etapa], (error, results) => {
            //Liberamos la conexion
            connection.release();

            //En caso de que se produzca un error...
            if (error) {
                console.error("> Error: ", error);

                //Enviamos el estado
                return res.status(501).send("Error en la consulta");

                //En cualquier otro caso...
            } else {
                console.log("> Result: ", results);

                //Enviamos el estado
                return res.status(201).send("Información del mapa actualizada");
            }
        });
    });
});

/**
 * End point para obtener todos los puestos
 */
router.get('/obtenerPuestos', (req, res) => {
    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca un error...
        if (err) {
            return res.status(400).send('Error al conectar con la base de datos');
        }

        //Almacenamos en una variable la consulta SQL para obtener los puestos disponibles
        const query = `
            SELECT
                DISTINCT(p.id), p.numero_puesto, p.numero_operarios, p.nombre_puesto,
                t.turno
            FROM
                puestos p
            INNER JOIN
                turnos t
            ON
                p.id_turno = t.id
            ORDER BY 
                p.numero_puesto ASC
        `;

        //Ejecutamos la consulta
        connection.query(query, [], (err, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que se produzca un error...
            if (err) {
                console.error("> Error: ", err);
                return res.status(500).send('Error en la consulta');
            }

            //En cualquier otro caso...
            console.log("> Resultados PUESTOS: ", results);

            //Enviamos la información y el estado
            return res.status(200).json(results);
        });
    });
});

/**
 * End point para obener el conteo de Fs usando el ID del puesto
 */
router.get('/tiempoTotal/:id_puesto', (req, res) => {
    //Almacenamos el ID del puesto de los parámetros
    const id_puesto = req.params.id_puesto;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra un error
        if (err) {
            return res.status(400).send("Error al conectar con la base de datos");
        }

        //Almacenamos en una variable la consulta SQL
        const query = `
            SELECT
                SUM(actividad_en_minutos + nuevo_picadas)
            FROM 
                EN_IFM_STANDARD
            WHERE
                id_puesto = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [id_puesto], (error, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que se produzca un error
            if (error) {
                console.log("Error: ", error);

                return res.status(500).send('Error en la consulta');
            }

            console.log("> Resultados: ", results);

            //Enviamos la información
            res.json(results);
        })
    });
});

/**
 * End point para obtener los datos de: dinámico - No VA //dinámico - VA //estático - VA
 */
router.get('/graficoChimenea/:id_puesto', (req, res) => {
    //Almacenamos en una variable el ID del puesto
    const id_puesto = req.params.id_puesto;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que falle
        if (err) {
            return res.status(501).send("Error al conectar con la base de datos");
        }

        //Almacenamos en una variable la consulta SQL
        const query = `
            SELECT 
                c.id_puesto,
                SUM(c.dinamico_VA) AS dinamico_VA,
                SUM(c.dinamico_NoVA) AS dinamico_NoVA,
                SUM(c.estatico_VA) AS estatico_VA,
                SUM(c.estatico_NoVA) AS estatico_NoVA,
                (SELECT (SUM(tiempo_distancia_total))/numero_picadas FROM EN_IFM_STANDARD WHERE id_puesto = c.id_puesto) AS tiempo_distancia_total
            FROM chimenea c
            WHERE c.id_puesto = ?
            GROUP BY c.id_puesto;
        `;

        //Ejecutamos la consulta
        connection.query(query, [id_puesto], (error, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso  de que se produzca un error...
            if (error) {
                console.log("> Error: ", error);

                //Enviamos el status
                return res.status(501).send("Error en la consulta");
            }

            console.log("> Resultadossss: ", results);

            //Enviamos la información
            return res.json(results);
        });
    });
});

/**
 * End point para obtener la cantidad de UM a mover usando la referencia del componente
 */
router.get('/conteoUM/:referencia_componente', (req, res) => {
    //Almacenamos la referencia del componente de los parametros
    const referencia_componente = req.params.referencia_componente;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra un error
        if (err) {
            return res.status(400).send("Error al conectar con la base de datos");
        }

        //Almacenamos en una variable la consulta SQL
        const query = `
            SELECT SUM(nb_pieces_par_uc) AS total_pieces
            FROM POE
            WHERE reference = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [referencia_componente], (error, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que se produzca un error...
            if (err) {
                console.error("> Error: ", err);
                return res.status(500).send('Error en la consulta');
            }

            console.log("> Resultados: ", results);

            //Enviamos la información
            res.json(results);
        });
    });
});

/**
 * End point para obtener la cantidad de veces que tienen que mover un componente
 */
router.get('/getPackingQuantity/:referencia_componente/:linea', (req, res) => {
    //Almacenamos las variables necesarias por parámetros
    const { referencia_componente, linea } = req.params;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra un error
        if (err) {
            return res.status(400).send("Error al conectar con la base de datos");
        }

        //Primera consulta SQL para obtener datos
        const query1 = `
            SELECT 
                Film.numero_of,
                Film.referencia, 
                Film.fecha_of_lanzado,
                Film.fecha_of_acabado, 
                Film.linea,
                Coefficient_allComponents.reference_motor, 
                Coefficient_allComponents.reference_composant, 
                Coefficient_allComponents.coefficient_montage_BE, 
                Coefficient_allComponents.designation_longue
            FROM 
                Film
            INNER JOIN 
                Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
            WHERE 
                Coefficient_allComponents.reference_composant = ?
                AND Film.linea = ?
            ORDER BY 
                Film.fecha_of_lanzado DESC
        `;

        //Ejecutamos la primera consulta
        connection.query(query1, [referencia_componente, linea], (err1, result1) => {
            if (err1) {
                console.error("> Error al obtener los datos: ", err1);
                connection.release();
                return res.status(500).json({ error: 'Error al obtener los datos' });
            }

            //Segunda consulta SQL para contar los resultados
            const query2 = `
                SELECT COUNT(Coefficient_allComponents.id) AS total_resultados
                FROM 
                    Film
                INNER JOIN 
                    Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
                WHERE 
                    Coefficient_allComponents.reference_composant = ?
                    AND Film.linea = ?
            `;

            //Ejecutamos la segunda consulta
            connection.query(query2, [referencia_componente, linea], (err2, result2) => {
                if (err2) {
                    console.error("> Error al obtener el contador: ", err2);
                    connection.release();
                    return res.status(500).json({ error: 'Error al obtener el conteo' });
                }

                //Tercera consulta SQL para obtener referencias adicionales
                const query3 = `
                    SELECT
                        Film.referencia,
                        Film.linea,
                        Coefficient_allComponents.*
                    FROM
                        Film
                    INNER JOIN 
                        Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
                    WHERE
                        Film.linea = ?
                        AND Coefficient_allComponents.reference_motor = ? 
                `;

                //Ejecutamos la tercera consulta
                connection.query(query3, [linea, referencia_componente], (err3, result3) => {
                    //Liberamos la conexión
                    connection.release();

                    if (err3) {
                        console.error("> Error al obtener las referencias: ", err3);
                        return res.status(500).json({ error: 'Error al obtener referencias' });
                    }

                    //Almacenamos en una variable los resultados obtenidos
                    const total_resultados = result2[0]?.total_resultados || 0;

                    //Creamos la respuesta con los datos obtenidos
                    const response = {
                        total_resultados,
                        data: result3
                    };

                    console.log("> Resultados obtenidos: ", response);

                    //Enviamos la información
                    res.json(response);
                });
            });
        });
    });
});

/**
 * End point para obtener los componentes de una línea
 */
router.get('/getComponents/:linea', (req, res) => {
    //Almacenamos en variables la línea
    const linea = req.params.linea;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca un error
        if (err) {
            return res.status(500).send('Error al conectar con la base de datos');
        }

        //Almacenamos en una variable la primera consulta para obtener las referencias
        const query_references = `
            SELECT
                DISTINCT(Coefficient_allComponents.reference_motor)
            FROM
                Film
            INNER JOIN 
                Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
            WHERE
                Film.linea = ?
        `;

        //Ejecutamos la primera consulta SQL
        connection.query(query_references, [linea], (err1, result1) => {
            //En caso de que se produzca un error
            if (err1) {
                console.error("> Error al obtener las referencias: ", err1);

                //Liberamos la conexión
                connection.release();

                //Enviamos el status
                return res.status(500).send("Error al obtener las referencias");
            }

            //Almacenamos en una nueva variable la segunda consulta SQL para obtener los componentes
            const query_components = `
                SELECT
                    DISTINCT(Coefficient_allComponents.reference_composant)
                FROM
                    Film
                INNER JOIN 
                    Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
                WHERE
                    Film.linea = ?
            `;

            //Ejecutamos la segunda consulta SQL
            connection.query(query_components, [linea], (err2, result2) => {
                //En caso de que se produzca un error
                if (err2) {
                    console.error("> Error al obtener los componentes: ", err2);

                    //Liberamos la conexión
                    connection.release();

                    //Enviamos el status
                    return res.status(500).send("Error al obtener los componentes");
                }

                //Liberamos la conexión
                connection.release();

                //Almacenamos en una variable los datos obtenidos
                const response = {
                    data_reference: result1,
                    data_components: result2
                };

                //Enviamos la información obtenida
                res.json(response);
            });
        });
    });
});

/**
 * End point para obtener el conteo de los componentes
 */
router.get('/getCountComponents/:reference_motor/:reference_composant', (req, res) => {
    //Obtenemos las variables de los parametros
    const { reference_motor, reference_composant } = req.params;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra un error
        if (err) {
            return res.status(400).send("No se ha podido conectarse a la base de datos");
        }

        //Almacenamoos en una variable la consulta SQL
        const query = `
            SELECT COUNT(id) AS count
            FROM Coefficient_allComponents
            WHERE reference_motor = ? AND reference_composant = ?
        `;

        //Ejecutamos la consulta SQL
        connection.query(query, [reference_motor, reference_composant], (err, results) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que se produzca un error
            if (err) {
                console.error("> Error al obtener los datos: ", err);
            }

            //Enviamos la información
            res.json({ count: results[0].count });
        });
    });
});

/**
 * End point para actualizar la etapa F14
 */
router.post('/actualizarEtapa-F14/:id_etapa/:distancia_tren/:distancia_zona_entrega/:distancia_almacenamiento/:numero_bases_rodantes/:maquina_usada/:velocidad', (req, res) => {
    //Almacenamos las variables de los parámetros
    const { id_etapa, distancia_tren, distancia_zona_entrega, distancia_almacenamiento, numero_bases_rodantes, maquina_usada, velocidad } = req.params;

    //Creamos una variable para almacenar el ID de la máquina usada
    let id_maquina;

    //Creamos la query para actualizar la F14
    let query = `
        UPDATE
            EN_IFM_STANDARD
        SET
            distancia_tren = ?,
            distance_empty_zone = ?,
            distancia_almacenamiento = ?,
            numero_bases_rodantes = ?,
            machine_used = ?,
            speed = ?
        WHERE 
            id = ?
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error
        if (err) {
            //Enviamos el status
            res.status(501).send('Error en la conexión a la base de datos');
            console.error("> Error en la conexión a la base de datos: ", err);
        }

        //Ejecutamos la consulta para obtener el ID de la máquina usada
        connection.query('SELECT id_MTM3 FROM MTM3 WHERE engins = ?', [maquina_usada], (error1, result1) => {
            //En caso de que ocurra algun error
            if (error1) {
                //Enviamos el status
                res.status(501).send('Error al obtener el ID de la máquina a usar');
                console.error("> Error en la consulta para obtener el ID de la máquina: ", error1);
            }

            //Almacenamos el ID de la máquina
            id_maquina = result1[0].id_MTM3;

            //Ejecutamos la consulta la consulta para actualizar la etapa
            connection.query(query, [distancia_tren, distancia_zona_entrega, distancia_almacenamiento, numero_bases_rodantes, id_maquina, velocidad, id_etapa], (error, result) => {
                //Liberamos la conexión
                connection.release();

                //En caso de que ocurra algun error
                if (error) {
                    //Enviamos el status
                    res.status(501).send('Error a la hora de actializar la F14');
                    console.error("> Error al actualizar la etapa: ", error);
                }

                //Enviamos el status
                res.status(201).send('Etapa F14 actualizada con exito');
            });
        });
    });
});

/**
 * End point para actualizar la etapa F29
 */
router.post('/actualizarEtapa-F29/:id_etapa/:distancia/:numero_paquetes_cargados/:tipo_carga/:maquina_usada/:velocidad', (req, res) => {
    //Almacenamos en variables los datos de los parámetros
    const { id_etapa, distancia, numero_paquetes_cargados, tipo_carga, maquina_usada, velocidad } = req.params;

    //Creamos una variaable para almacenar el ID de la máquina usada
    let id_maquina;

    //Creamos la query para actualizar la F29
    let query = `
        UPDATE 
            EN_IFM_STANDARD
        SET
            distance_empty_zone = ?,
            number_of_packages_loaded_at_once = ?,
            loading_type = ?,
            machine_used = ?,
            speed = ?
        WHERE
            id = ?
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error en la conexión a la base de datos...
        if (err) {
            //Enviamos el status
            res.status(501).send('Error en la conexión a la base de datos');
            console.error("> Error en la conexión a la base de datos: ", err);
        }

        //Ejecutamos la consulta para obtener el ID de la máquina usada
        connection.query("SELECT id_MTM3 FROM MTM3 where engins = ?", [maquina_usada], (error1, result1) => {
            //En caso de que ocurra algun error a la hora de obtener el ID de la máquina usada...
            if (error1) {
                //Enviamos el status
                res.status(501).send('Error a la hora de obtener el ID de la máquina usada');
                console.error("> Error en la obtención del ID de la máquina usada");
            }

            console.log("> Result1: ", result1);

            //Almacenamos el ID de la máquina usada
            id_maquina = result1[0].id_MTM3;

            //Ejecutamos la query para actualizar la etapa F29
            connection.query(query, [distancia, numero_paquetes_cargados, tipo_carga, id_maquina, velocidad, id_etapa], (error, result) => {
                //Liberamos la conexión
                connection.release();

                //En caso de que ocurra algún error...
                if (error) {
                    //Enviamos el status
                    res.status(501).send('Error a la hora de actualizar la etapa F29');
                    console.error("> Error a la hora de actualizar la etapa F29: ", error);
                }

                //Enviamos el status
                res.status(201).send('Etapa F29 actualizada');
                console.log("> Result: ", result);
            })
        });
    });
});

/**
 * End point para actualizar la etapa F5
 */
router.post('/actualizarEtapa-F5/:id_etapa/:distancia/:acceso_camion/:empaque_descargado/:maquina_usada/:velocidad', (req, res) => {
    //Almacenamos en variables los parámetros
    const { id_etapa, distancia, acceso_camion, empaque_descargado, maquina_usada, velocidad } = req.params;

    //Creamos una variable donde almacenará el ID de la máquina uasada 
    let id_maquina;

    //Creamos una variable que contenga la sentencia SQL para actualizar la etapa F5
    let query = `
        UPDATE
            EN_IFM_STANDARD
        SET
            distancia_F5 = ?,
            acceso_al_camion_F5 = ?,
            embalaje_descargado_F5 = ?,
            speed = ?,
            machine_used = ?
        WHERE
            id = ?
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algún error...
        if (err) {
            //Enviamos el status
            res.status(501).send('Error en la conexión a la base de datos');
            console.error("> Error en la conexión a la base de datos: ", err);
        }

        //Ejecutamos la consulta para obtener el ID de la máquina usada usando el valor de la misma
        connection.query("SELECT id_MTM3 FROM MTM3 WHERE engins = ?", [maquina_usada], (error1, result1) => {
            //En caso de que ocurra algun error...
            if (error1) {
                //Enviamos el status
                res.status(501).send('Error en la consulta para obtener el ID de la máquina usada')
                console.error("> Error en la consulta para obtener el ID de la máquina usada: ", error1);
            }

            console.log("> Result1: ", result1);

            //Guardamos el ID de la maquina usada
            id_maquina = result1[0].id_MTM3;

            //Ejecutamos la query para a actualizar la etapa
            connection.query(query, [distancia, acceso_camion, empaque_descargado, velocidad, id_maquina, id_etapa], (error, result) => {
                //Liberamos la conexión
                connection.release();

                //En caso de que ocurra algun error en la consulta...
                if (error) {
                    //Enviamos el status
                    res.status(501).send('Error en la actualización de la etapa');
                    console.error("> Error en la actualización de la etapa: ", error);
                }

                console.log("> Resultado: ", result);

                //Enviamos el status
                res.status(201).send('Etapa actualizada');
            })
        });
    });
});

/**
 * End point para actualizar la etapa F10
 */
router.post('/actualizarEtapa-F10/:id_etapa/:distancia/:numero_bultos/:altura_embalajes/:almacenamiento_embalaje/:maquina_usada/:velocidad/:en_pila_de/:soporte_embalaje', (req, res) => {
    //Almacenamos las variables de los parámetros
    const { id_etapa, distancia, numero_bultos, altura_embalajes, almacenamiento_embalajes, maquina_usada, velocidad, en_pila_de, soporte_embalaje } = req.params;

    //Creamos una variable para almacenar el ID de la máquina usada
    let id_maquina;

    //Almacenamos en una variable la consulta SQL para actualizar la etaa F10
    let query = `
        UPDATE
            EN_IFM_STANDARD
        SET
            distancia = ?,
            numero_bultos_por_pila = ?,
            altura_embalaje = ?,
            almacenamiento_emlabajes_mediante = ?,
            speed = ?,
            en_la_tienda_pila = ?,
            soporte_embalaje = ?,
            machine_used = ?
        WHERE
            id = ?
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error en la conexión
        if (err) {
            //Enviamos el status
            res.status(501).send('Error en la conexión a la base de datos');
            console.error("> Error en la conexión a la base de datos");
        }

        //Ejecutamos la consulta para obtener el ID de la máquina usada
        connection.query("SELECT id_MTM3  FROM MTM3 WHERE engins = ?", [maquina_usada], (error1, result1) => {
            //En caso de que ocurra algun error
            if (error1) {
                //Enviamos el status
                res.status(501).send('Error a la hora de obtener el ID de la máquina usada');
                console.error("> Error a la hora de obtener el ID de la máquina usada: ", error1);
            }

            console.log("> Result1: ", result1);

            //Almacenamos el ID de la máquina usada
            id_maquina = result1[0].id_MTM3;

            //Ejecutamos la sentencia SQL para actualizar la etapa
            connection.query(query, [distancia, numero_bultos, altura_embalajes, almacenamiento_embalajes, velocidad, en_pila_de, soporte_embalaje, id_maquina, id_etapa], (error, result) => {
                //En caso de que ocurra algun error a la hora de actualizar la etapa
                if (error) {
                    //Enviamos el status
                    res.status(501).send('Error a la hora de actualizar la etapa F10');
                    console.error("> Error en la consulta de actualizar la F10: ", error);
                }

                console.log("> Resultado: ", result);

                //Enviamos el status
                res.status(201).send('Etapa actualizada');
            })
        });
    });
});

/**
 * End point para actualizar la etapa F12
 */
router.post('/actualizarEtapa-F12/:id_etapa/:distancia/:numero_bultos/:altura_embalaje/:maquina_usada/:velocidad/:en_pila_de/:soporte_embalaje', (req, res) => {
    //Almacenamos las variables de los parámetros
    let { id_etapa, distancia, numero_bultos, altura_embalaje, maquina_usada, velocidad, en_pila_de, soporte_embalaje } = req.params;

    //Creamos una variable para almacenar el ID de la máquina
    let id_maquina;

    //Creamos una variable que contenga la sentencia SQL para actualizar la etapa F12
    let query = `
        UPDATE
            EN_IFM_STANDARD
        SET
            distancia = ?,
            numero_bultos_por_pila = ?,
            altura_embalaje = ?,
            machine_used = ?,
            speed = ?,
            en_la_tienda_pila = ?,
            soporte_embalaje = ?
        WHERE
            id = ?
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error
        if (err) {
            //Enviamos el status
            res.status(501).send('Error en la conexión a la base de datos');
            console.error("> Error en la conexión a la base de datos: ", err);
        }

        //Ejecutamos la consulta para obtener el ID de la máquina
        connection.query("SELECT id_MTM3 FROM MTM3 WHERE engins = ?", [maquina_usada], (error1, result1) => {
            //En caso de que ocurra algun error en la obtención del ID de la máquina
            if (error1) {
                //Enviamos el status
                res.status(501).send('Error en la obtención del ID de la máquina');
                console.error("> Error en la obtención del ID de la máquina: ", error1);
            }

            //Almacenamos el ID de la máquina
            id_maquina = result1[0].id_MTM3;

            //Ejecutamos la consulta para actualizar la etapa F12
            connection.query(query, [distancia, numero_bultos, altura_embalaje, id_maquina, velocidad, en_pila_de, soporte_embalaje, id_etapa], (error, result) => {
                //Liberamos la conexión
                connection.release();

                //En caso de que ocurra algun error en la actualización de la etapa
                if (error) {
                    //Enviamos el status
                    res.status(501).send('Error en la actualización de la etapa F12');
                    console.error("> Error en la actualización de la etaoa F12: ", error);
                }

                //Enviamos el status
                res.status(201).send('Etapa F12 actualizada');
            });
        });
    })
});

/**
 * End point para actualizar la etapa F27
 */
router.post('/actualizarEtapa-F27/:id_etapa/:distancia_remolque/:altura_embalaje/:numero_paquetes_fila/:maquina_usada/:velocidad/:soporte_embalaje', (req, res) => {
    //Almacenamos las variables de los parámetros
    const { id_etapa, distancia_remolque, altura_embalaje, numero_paquetes_fila, maquina_usada, velocidad, soporte_embalaje } = req.params;

    //Creamos una variable para almacenar el ID de la máquina
    let id_maquina;

    //Creamos una variable que almacene la query para actualizar la etapa F27
    let query = `
        UPDATE 
            EN_IFM_STANDARD
        SET
            distancia = ?,
            altura_embalaje = ?,
            numero_bultos_por_pila = ?,
            machine_used = ?,
            speed = ?,
            soporte_embalaje = ?
        WHERE
            id = ?
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error en la conexión a la base de datos...
        if (err) {
            //Enviamos el status
            res.status(501).send('Error en la conexión a la base de datos');
            console.error("> Error en la conexión a la base de datos: ", err);
        }

        //Ejecutamos la sencuencia para obtener el ID de la máquina usada
        connection.query('SELECT id_MTM3  FROM MTM3 WHERE engins = ?', [maquina_usada], (error1, result1) => {
            //En caso de que ocurra algun error a la hora de obtener el ID de la máquina
            if (error1) {
                //Enviamos el status
                res.status(501).send('Error a la hora de obtener el ID de la máquina usada');
                console.error("> Error a la hora de obtener el ID de la maquina: ", error1);
            }

            //Almacenamos el ID de la máquina
            id_maquina = result1[0].id_MTM3;

            //Ejecutamos la sentencia para actualizar la etapa F27
            connection.query(query, [distancia_remolque, altura_embalaje, numero_paquetes_fila, id_maquina, velocidad, soporte_embalaje, id_etapa], (error, result) => {
                //Liberamos la conexión
                connection.release();

                //En caso de que ocurra algun error a la hora de actualizar la etapa
                if (error) {
                    //Enviamos el status
                    res.status(501).send('Error a la hora de actualizar la etapa');
                    console.error("> Error a la hora de actualizar la etapa: ", error1);
                }

                //Enviamos el status
                res.status(201).send('Etapa F27 actualizada');
            });
        });
    });
});

/**
 * End point para actualizar la etapa usando el ID del puesto, la información obtenida del modal y el F
 */
router.post('/actualizarInformacionEtapa/:puestoID/:distance_empty_zone/:number_packages_at_once/:loading_type/:machine_used/:speed/:fStandard', (req, res) => {
    //Obtenemos las variables de los parametros
    const { puestoID, distance_empty_zone, number_packages_at_once, loading_type, machine_used, speed, fStandard } = req.params;

    console.log(">>>>>>>>> Machine USED: ", machine_used);

    //Creamos una variable donde almacenara el ID de del machine used
    let machineID;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra un error...
        if (err) {
            return res.status(400).send("No se ha podido conectarse a la base de datos");
        }

        //Ejecutamos la query para obtener el ID del machine usando el valor
        connection.query("SELECT id_MTM3 FROM MTM3 WHERE engins = ?", [machine_used], (error, results) => {
            //En caso de que se produzca un error...
            if (error) {
                console.log("> Error: ", error)
            }

            //Almacenamos el ID del machine
            machineID = results[0].id_MTM3;

            //Almacenamos en una variable la consulta SQL
            const query = `
                UPDATE 
                    EN_IFM_STANDARD
                SET
                    distance_empty_zone = ?,
                    number_of_packages_loaded_at_once = ?,
                    loading_type = ?,
                    machine_used = ?,
                    speed = ?
                WHERE
                    F = ? AND id = ?
            `;

            //Ejecutamos la consulta
            connection.query(query, [distance_empty_zone, number_packages_at_once, loading_type, machineID, speed, fStandard, puestoID], (error, results) => {
                //Liberamos la conexión
                connection.release();

                //En caso de que ocurra algun error
                if (error) {
                    console.log("> Error: ", error);

                    //Enviamos el status
                    return res.status(500).send("Error al obtener las referencias");

                    //En cualquier otro caso...
                } else {
                    console.log("> Resultados: ", results);

                    //Enviamos el status
                    return res.status(201).send('Puesto añadido');
                }
            })
        })
    });
});

/**
 * End point para eliminar un registros en especifico
 */
router.delete('/eliminarRegistro/:id_elemento/:tabla/:id_etapa', (req, res) => {
    /** Almacenamos las variables de los parámetros */
    const { id_elemento, tabla, id_puesto } = req.params;

    console.log("> ID elemento: ", id_elemento, "\tTabla: ", tabla, "\tID etapa: ", id_puesto);

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca un error...
        if (err) {
            res.status(500).send()
        }

        //Almacenamos en una variable la consulta SQL
        const query = `
            DELETE 
            FROM
                ${tabla}
            WHERE
                id = ?
        `;

        //Ejecutamos la consulta
        connection.query(query, [id_elemento], (error, results) => {
            //En caso de que falle
            if (error) {
                console.error("> Error: ", error);

                //Enviamos el status
                return res.status(501).send("Error en la consulta");
            }

            console.log("Results: ", results);

            if (tabla === "puestos") {
                //Almacenamos en una variable la consulta SQL
                const query = `
                    DELETE
                    FROM 
                        EN_IFM_STANDARD
                    WHERE
                        id_puesto = ?
                `;

                //Ejecutamos la consulta
                connection.query(query, [id_elemento], (error, results) => {
                    //En caso de que falle
                    if (error) {
                        console.error("> Error: ", error);
                    }
                })
            } else if (tabla === "EN_IFM_STANDARD") {
                const query = `
                    DELETE
                    FROM
                        chimenea
                    WHERE
                        id_puesto = ? AND
                        id_etapa = ?
                `;

                //Ejecutamos la consulta
                connection.query(query, [id_puesto, id_elemento], (error, result) => {
                    //En caso de que falle
                    if (error) {
                        console.error("> Error: ", error);
                    }
                })
            }

            //Liberamos la conexión
            connection.release();

            //Enviamos el status
            return res.status(201).send("Registro eliminado");
        });
    });
});

/**
 * End point para gestionar la etapa
 */
router.post('/gestionarEtapa/:id_etapa/:id_puesto/:gestion', (req, res) => {
    console.log("> Dentro del gestionar etapa");

    /** Almacenamos las variables de los parámetros */
    const { id_etapa, id_puesto, gestion } = req.params;

    console.log("> ID etapa: ", id_etapa, "\tID puesto: ", id_puesto, "\nGestion: ", gestion);

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca un error...
        if (err) {
            console.error("> Error al conectar a la base de datos:", err);
            return res.status(500).send('Error al conectar a la base de datos');
        }

        //Creamos la variable que contendrá la sentencia SQL
        let query;

        //Creamos un switch para la gestión
        switch (gestion) {
            case "copiar":
                //Almacenamos en la variable la consulta
                query = `
                    CREATE TEMPORARY TABLE temp_table
                    SELECT
                        id_puesto,
                        referencia_componente,
                        linea,
                        cantidad_a_mover,
                        F,
                        comments,
                        distance_empty_zone,
                        number_of_packages_loaded_at_once,
                        loading_type,
                        machine_used,
                        speed,
                        distancia_total,
                        numero_curvas,
                        puntos,
                        mote,
                        numero_cruces,
                        numero_puertas,
                        TL_TV,
                        CDVB_CDL,
                        nuevo,
                        NC,
                        NP,
                        frecuencia_recorrido,
                        PS10,
                        PS14,
                        simbolo_especial,
                        valor_simbolo_especial,
                        tipo_operacion,
                        distancia_F5,
                        acceso_al_camion_F5,
                        embalaje_descargado_F5,
                        DC221,
                        TC_TL,
                        DS10,
                        CDL,
                        CCPE,
                        distancia,
                        numero_bultos_por_pila,
                        altura_embalaje,
                        almacenamiento_emlabajes_mediante,
                        en_la_tienda_pila,
                        soporte_embalaje,
                        TC,
                        TL,
                        CT10,
                        PP1,
                        CDC,
                        distancia_tren,
                        distancia_almacenamiento,
                        numero_bases_rodantes,
                        M1,
                        DL,
                        CDV,
                        PDU34,
                        PPU34,
                        TV,
                        PPD32,
                        PDD34,
                        PPU43,
                        PDU44,
                        CHMAN,
                        CHMAN_2,
                        CHMAN_3,
                        PS15,
                        DI21,
                        DC113,
                        numero_picadas,
                        DS14,
                        DS15,
                        DC,
                        D1,
                        W5,
                        TT,
                        AL,
                        P2,
                        L2,
                        G1,
                        P5,
                        G1_1,
                        P2_1,
                        W5_2,
                        nuevo_picadas,
                        actividad_en_minutos,
                        tiempo_distancia_total,
                        orden
                    FROM
                        EN_IFM_STANDARD
                    WHERE
                        id = ?;

                UPDATE
                    temp_table
                SET
                    id_puesto = ?;

                INSERT INTO
                    EN_IFM_STANDARD (
                        id_puesto,
                        referencia_componente,
                        linea,
                        cantidad_a_mover,
                        F,
                        comments,
                        distance_empty_zone,
                        number_of_packages_loaded_at_once,
                        loading_type,
                        machine_used,
                        speed,
                        distancia_total,
                        numero_curvas,
                        puntos,
                        mote,
                        numero_cruces,
                        numero_puertas,
                        TL_TV,
                        CDVB_CDL,
                        nuevo,
                        NC,
                        NP,
                        frecuencia_recorrido,
                        PS10,
                        PS14,
                        simbolo_especial,
                        valor_simbolo_especial,
                        tipo_operacion,
                        distancia_F5,
                        acceso_al_camion_F5,
                        embalaje_descargado_F5,
                        DC221,
                        TC_TL,
                        DS10,
                        CDL,
                        CCPE,
                        distancia,
                        numero_bultos_por_pila,
                        altura_embalaje,
                        almacenamiento_emlabajes_mediante,
                        en_la_tienda_pila,
                        soporte_embalaje,
                        TC,
                        TL,
                        CT10,
                        PP1,
                        CDC,
                        distancia_tren,
                        distancia_almacenamiento,
                        numero_bases_rodantes,
                        M1,
                        DL,
                        CDV,
                        PDU34,
                        PPU34,
                        TV,
                        PPD32,
                        PDD34,
                        PPU43,
                        PDU44,
                        CHMAN,
                        CHMAN_2,
                        CHMAN_3,
                        PS15,
                        DI21,
                        DC113,
                        numero_picadas,
                        DS14,
                        DS15,
                        DC,
                        D1,
                        W5,
                        TT,
                        AL,
                        P2,
                        L2,
                        G1,
                        P5,
                        G1_1,
                        P2_1,
                        W5_2,
                        nuevo_picadas,
                        actividad_en_minutos,
                        tiempo_distancia_total,
                        orden
                    )
                SELECT
                    *
                FROM
                    temp_table;

                DROP TABLE temp_table
                `;

                //Ejecutamos la consulta
                connection.query(query, [id_etapa, id_puesto], (error, results) => {
                    //Liberamos la conexión
                    connection.release();

                    //En caso de que falle
                    if (error) {
                        console.error("> Error en la consulta:", error);

                        //Enviamos el status
                        return res.status(501).send('Error en la consulta');
                    }

                    console.log("> Results: ", results);

                    //Enviamos el status
                    return res.status(201).send('Etapa gestionada');
                });
                break;

            //En caso de que haya que mover la etapa
            case "mover":
                //Almacenamos en una variable la consulta
                query = `
                    CREATE TEMPORARY TABLE temp_table
                    SELECT
                        id_puesto,
                        referencia_componente,
                        linea,
                        cantidad_a_mover,
                        F,
                        comments,
                        distance_empty_zone,
                        number_of_packages_loaded_at_once,
                        loading_type,
                        machine_used,
                        speed,
                        distancia_total,
                        numero_curvas,
                        mote,
                        numero_cruces,
                        numero_puertas,
                        TL_TV,
                        CDVB_CDL,
                        NC,
                        NP,
                        frecuencia_recorrido,
                        PS10,
                        PS14,
                        simbolo_especial,
                        valor_simbolo_especial,
                        tipo_operacion,
                        distancia_F5,
                        acceso_al_camion_F5,
                        embalaje_descargado_F5,
                        DC221,
                        TC_TL,
                        DS10,
                        CDL,
                        CCPE,
                        distancia,
                        numero_bultos_por_pila,
                        altura_embalaje,
                        almacenamiento_emlabajes_mediante,
                        en_la_tienda_pila,
                        soporte_embalaje,
                        TC,
                        TL,
                        CT10,
                        PP1,
                        CDC,
                        distancia_tren,
                        distancia_almacenamiento,
                        numero_bases_rodantes,
                        M1,
                        DL,
                        CDV,
                        PDU34,
                        PPU34,
                        TV,
                        PPD32,
                        PDD34,
                        PPU43,
                        PDU44,
                        CHMAN,
                        CHMAN_2,
                        CHMAN_3,
                        PS15,
                        DI21,
                        DC113,
                        numero_picadas,
                        DS14,
                        DS15,
                        DC,
                        D1,
                        W5,
                        TT,
                        AL,
                        P2,
                        L2,
                        G1,
                        P5,
                        G1_1,
                        P2_1,
                        W5_2,
                        nuevo_picadas,
                        nuevo,
                        actividad_en_minutos,
                        tiempo_distancia_total,
                        orden
                    FROM
                        EN_IFM_STANDARD
                    WHERE
                        id = ?;

                    UPDATE
                        temp_table
                    SET
                        id_puesto = ?;

                    INSERT INTO
                        EN_IFM_STANDARD (
                            id_puesto,
                            referencia_componente,
                            linea,
                            cantidad_a_mover,
                            F,
                            comments,
                            distance_empty_zone,
                            number_of_packages_loaded_at_once,
                            loading_type,
                            machine_used,
                            speed,
                            distancia_total,
                            numero_curvas,
                            mote,
                            numero_cruces,
                            numero_puertas,
                            TL_TV,
                            CDVB_CDL,
                            NC,
                            NP,
                            frecuencia_recorrido,
                            PS10,
                            PS14,
                            simbolo_especial,
                            valor_simbolo_especial,
                            tipo_operacion,
                            distancia_F5,
                            acceso_al_camion_F5,
                            embalaje_descargado_F5,
                            DC221,
                            TC_TL,
                            DS10,
                            CDL,
                            CCPE,
                            distancia,
                            numero_bultos_por_pila,
                            altura_embalaje,
                            almacenamiento_emlabajes_mediante,
                            en_la_tienda_pila,
                            soporte_embalaje,
                            TC,
                            TL,
                            CT10,
                            PP1,
                            CDC,
                            distancia_tren,
                            distancia_almacenamiento,
                            numero_bases_rodantes,
                            M1,
                            DL,
                            CDV,
                            PDU34,
                            PPU34,
                            TV,
                            PPD32,
                            PDD34,
                            PPU43,
                            PDU44,
                            CHMAN,
                            CHMAN_2,
                            CHMAN_3,
                            PS15,
                            DI21,
                            DC113,
                            numero_picadas,
                            DS14,
                            DS15,
                            DC,
                            D1,
                            W5,
                            TT,
                            AL,
                            P2,
                            L2,
                            G1,
                            P5,
                            G1_1,
                            P2_1,
                            W5_2,
                            nuevo_picadas,
                            nuevo,
                            actividad_en_minutos,
                            tiempo_distancia_total,
                            orden
                        )
                    SELECT
                        *
                    FROM
                        temp_table;

                    DROP TABLE temp_table;

                    DELETE FROM
                        EN_IFM_STANDARD
                    WHERE
                        id = ?
                `;

                //Ejecutamos la consulta
                connection.query(query, [id_etapa, id_puesto, id_etapa], (error, results) => {
                    //Liberamos a conexión
                    connection.release();

                    //En caso de que falle
                    if (error) {
                        console.error("> Error en la consulta:", error);

                        //Enviamos el status
                        return res.status(501).send('Error en la consulta');
                    }

                    //Enviamos el status
                    return res.status(201).send('Etapa gestionada');
                })
                break;

            default:
                //Liberamos la conexión si no hay una acción válida
                connection.release();
                return res.status(400).send('Gestión no válida');
        }
    });
});

/**
 * End point para comprobar si las referencias introducidas por el usuario existen
 */
router.get('/comprobarReferencias/:referencias/:tipo_operacion/:planta', (req, res) => {
    //Almacenamos en variables los parámetros
    const { referencias, tipo_operacion, planta } = req.params;

    //Creamos una variable para almacenar la columna de la fábrica
    let columna_fabrica;

    //Almacenamos en un array las referencias obtenidas
    const array_referencias = referencias.split(' ');

    //Creamos un nuevo arrray filtrado por referencias únicas
    const array_referencias_unicas = [...new Set(array_referencias)];

    //Creamos un if para controlar el tipo de columna a la que mirar la fábrica... en caso de que el tipo de operación sea "Programa_Recepcion"
    if (tipo_operacion === 'Programa_Recepcion') {
        //columna_fabrica = 'compte_fournisseur';
        columna_fabrica = 'compte_client';

        //En caso de que el tipo de operación sea "Programa_Expedicion_Forklift"
    } else if (tipo_operacion === 'Programa_Expedicion_Forklift') {
        columna_fabrica = 'compte_fournisseur';
        //columna_fabrica = 'compte_client';

        //En caso de que el tipo de operación sea "Programa_Fabricacion"
    } else if (tipo_operacion === "Programa_Fabricacion") {
        columna_fabrica = "cpte_usine";
    }

    //Almacenamos en una variable la consulta SQL
    let query = `
        SELECT 
            COUNT(*)
        FROM
            ??
        WHERE
            reference = ?
        AND
            ?? = ?
    `;

    //Creamos un array para almacenar las referencias válidas
    let referencias_finales = [];
    let totalConsultas = array_referencias_unicas.length;  //Número total de referencias a comprobar
    let consultasRealizadas = 0;  //Contador de consultas realizadas

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que se produzca algún error...
        if (err) {
            console.error("> Error al conectar a la base de datos: ", err);
            return res.status(500).send('Error al conectar con la base de datos: ', err);
        }

        //Iteramos por las referencias
        array_referencias_unicas.forEach(item => {
            connection.query(query, [tipo_operacion, item, columna_fabrica, planta], (error, result) => {

                console.log(connection.format(query, [tipo_operacion, item, columna_fabrica, planta]));

                //En caso de que se produzca un error en la consulta
                if (error) {
                    console.error("> Error: ", error);
                    return res.status(501).send('Error a la hora de comprobar si la referencia es válida: ', error);
                }

                //Verificamos si el resultado es mayor que 0 (referencia encontrada)
                if (result && result[0]['COUNT(*)'] > 0) {
                    //Si la referencia existe, la agregamos al array de válidas
                    referencias_finales.push(item);
                } else {
                    console.log("> No se encontró la referencia:", item);
                }

                //Incrementamos el contador de consultas realizadas
                consultasRealizadas++;

                //Comprobamos si todas las referencias han sido procesadas
                if (consultasRealizadas === totalConsultas) {
                    //Liberamos la conexión
                    connection.release();

                    //Enviamos la respuesta con las referencias válidas
                    return res.json({ validReferences: referencias_finales });
                }
            });
        });
    });
});

/**
 * End point para obtener las referencias de un puesto
 */
router.get('/obtenerReferencias-puesto/:puesto_id', (req, res) => {
    //Almacenamos el ID del puesto
    const puesto_id = req.params.puesto_id;

    //Almacenamos en una variable la consulta
    const query = `
        SELECT 
            DISTINCT(referencia_componente), tipo_operacion
        FROM 
            EN_IFM_STANDARD
        WHERE
            id_puesto = ? AND tipo_operacion = 'Programa_Recepcion'
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error en la conexión a la base de datos
        if (err) {
            console.error("> Error en la conexión a la base de datos: ", err);
            return res.status(500).send('Error al conectar con la base de datos');
        }

        //Ejecutamos la consutlta
        connection.query(query, [puesto_id], (error, result) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que ocurra algun error
            if (error) {
                console.error("> Error a la hora de obtener las referencias del puesto: ", error);
                return res.status(500).send('Error a la hora de obtener las referencias del puesto');
            }

            console.log("> Resultados: ", result);

            //Enviamos la información
            return res.json(result);
        });
    });
});

/**
 * End point para obtener los datos de las referencias del tipo de operación
 */
router.get('/obtenerDatosDetalladosReferencia-tipoOperacion/:puesto_id/:referencia/:tipo_operacion', (req, res) => {
    //Almacenamos las variables de los parámetros
    const { puesto_id, referencia, tipo_operacion } = req.params;

    //Creamos dos variables globales para almacenar la jornada de inicio y la jornada de finalización
    let jornada_inicio, jornada_finalizacion;

    //Almacenamos en una variable la consulta SQL para obtener la jornada de inicio y la jornada de finalización
    const query = `
        SELECT 
            t.jornada_inicio,
            t.jornada_fin 
        FROM
            puestos p
        INNER JOIN
            turnos t 
        ON 
            p.id_turno = t.id
        WHERE
            p.id = ?
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error
        if (err) {
            console.error("> Error en la conexión a la base de datos: ", err);
            return res.status(500).send('Error al conectar con la base de datos');
        }

        //Ejecutamos la consulta
        connection.query(query, [puesto_id], (error1, result1) => {
            //En caso de que ocurra algun error en la consulta para obtener los turnos...
            if (error1) {
                console.error("> Error en la consulta para obtener la jornada de inicio y la jornad de finalización: ", error1);
                res.status(501).send('Error en la consulta de obtención de horarios');
            }

            console.log("> Result1: ", result1);

            //Almacenamos en las variables la jornada de inicio y la jornada de finalización
            jornada_inicio = result1[0].jornada_inicio;
            jornada_finalizacion = result1[0].jornada_fin;

            //Almacenamos en una nueva variable la nueva consulta SQL para obtener las cantidadades y las fechas por cada referencia
            const query = `
                SELECT
                    date_de_calcul_du_pgm_de_reception
                FROM ??
                WHERE
                    reference = ? AND
                    heure_de_la_periode >= ? AND
                    heure_de_la_periode <= ?
            `;

            //Ejecutamos la consulta SQL
            connection.query(query, [tipo_operacion, referencia, jornada_inicio, jornada_finalizacion], (error, result) => {
                //En caso de que ocurra algun error con la consulta...
                if (error) {
                    console.error("> Error en la consulta final: ", error);
                    res.status(501).send('Error en la consulta final: ', error);
                }

                console.log("> Result: ", result);

                //Enviamos la información
                res.json(result);
            });
        });
    });
});

/**
 * End point para obtener la suma total de la cantidad a expedir
 */
router.get('/cantidadExpedir/:referencia/:tipo_operacion', (req, res) => {
    //Almacenamos las variabes variables de los parámetros
    const { referencia, tipo_operacion } = req.params;

    //Almacenamos en una variable la consulta SQL
    const query = `
        SELECT
            SUM(??)/15 AS cantidad_expedir
        FROM
            ??
        WHERE
            compte_fournisseur  = ?
            AND reference = ?
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error
        if (err) {
            console.error("> Se ha producido un error: ", err);
            res.status(501).send('Error a la hora de obtener la cantidad a expedir ', err);
        }

        //Ejecutamos la consulta
        connection.query(query, [columna, tipo_operacion, planta, referencia], (error, result) => {
            //Liberamos la conexion
            connection.release();

            //En caso de que produzca un error...
            if (error) {
                console.error("> Error a la hora de obtener la cantidad a expedir: ", error);
                return res.status(501).send("Error a la hora de obtener la cantidad a expedir: ", error);
            } else {
                console.log("Resultados: ", result);

                //Verificamos que el resultado contenga datos
                if (result && result[0]) {
                    //Enviamos la respuesta
                    return res.json({ cantidad_expedir: result[0].cantidad_expedir });
                } else {
                    //Si no se encontraron resultados
                    return res.status(404).send('No se encontraron datos para la referencia solicitada.');
                }
            }
        });
    })
});

/**
 * End point para obtener la suma total de la cantidad a expedir
 */
router.get('/cantidadExpedirHoras/:referencia/:tipo_operacion/:planta/:columna/:puesto_id', (req, res) => {
    //Almacenamos las variabes variables de los parámetros
    const { referencia, tipo_operacion, planta, columna, puesto_id } = req.params;

    //Creamos la variable para almacenar la jornada de inicio y la joranada final
    let jornada_inicio, jornada_final;

    //Creamos una variable para almacenar el nombre de la columna de las horas
    let columna_hora;

    //Creamos una variable para almacenar el nombre de la columan de la fabrica
    let columna_fabrica;

    //Variable para almacenar el nombre de la columna de la cantidad
    let columna_2;

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TIPO DE OPERACION: ", tipo_operacion);

    //Almacenamos en una variable la consulta SQL para obtener la hora de inicio y fin dell turno de una planta
    const query_jornada = `
        SELECT
            t.jornada_inicio, t.jornada_fin
        FROM
            puestos p
        INNER JOIN
            turnos t
        ON
            p.id_turno = t.id
        WHERE
            p.id = ?
    `;

    //Asignamos el nombre de la columna dependiendo del tipo de operación... en caso de sea "Programa_Recepcion"
    if (tipo_operacion === 'Programa_Recepcion') {
        columna_hora = 'heure_de_la_periode';
        //columna_fabrica = 'compte_fournisseur';
        columna_fabrica = 'compte_client';
        columna_2 = 'quantite_calculee_par_GPI';

        //En caso de que sea "Programa_Expedicion_Forklift"
    } else if (tipo_operacion === 'Programa_Expedicion_Forklift') {
        columna_hora = 'heure_expedition';
        columna_fabrica = 'compte_fournisseur';
        columna_2 = 'quantitea_a_expedir';

        //En caso de que sea "Programa_Fabricacion"
    } else if (tipo_operacion === 'Programa_Fabricacion') {
        columna_hora = "horodate_debut_periode";
        columna_fabrica = "cpte_usine";
        columna_2 = "besoin";
    }

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error
        if (err) {
            console.error("> Se ha producido un error: ", err);
            res.status(501).send('Error a la hora de obtener la cantidad a expedir ', err);
        }

        //Ejecutamos la consulta
        connection.query(query_jornada, [puesto_id], (errorJornada, resultJornada) => {
            //En caso de ocurra un error...
            if (errorJornada) {
                console.error("> Error al obtener las jornadas: ", errorJornada);

                //Enviamos el status
                return res.status(501).send('Error al obtener las jornadas');
            }

            //Almacenamos la jornada de inicio y la jornada final
            jornada_inicio = resultJornada[0].jornada_inicio;
            jornada_final = resultJornada[0].jornada_fin;

            //Almacenamos en una variable la consulta para obtener la cantidad a expedir
            const query = `
                SELECT
                    SUM(??)/15 AS cantidad_expedir
                FROM
                    ??
                WHERE
                    ?? = ?
                    AND reference = ?
                    AND ?? >= ?
                    AND ?? <= ?
            `;

            //Ejecutamos la query
            connection.query(query, [columna_2, tipo_operacion, columna_fabrica, planta, referencia, columna_hora, jornada_inicio, columna_hora, jornada_final], (error, result) => {
                console.log(">>>>> OBTENER CANTIDAD EXPEDIR\n", connection.format(query, [columna, tipo_operacion, columna_fabrica, planta, referencia, columna_hora, jornada_inicio, columna_hora, jornada_final]));

                //Liberamos la conexión
                connection.release();

                //En caso de que ocurra algun error...
                if (error) {
                    console.error("> Error al obtener la cantidad a expedir: ", error);

                    //Enviamos el status
                    return res.status(501).send('Error al obtener la cantidad a expedir');
                }

                console.log("> Results: ", result);

                //Enviamos la información
                res.json(result);
            });
        });
    })
});

/**
 * End point para obtener el turno del puesto
 */
router.get('/obtenerTurno/:puesto_id', (req, res) => {
    //Almacenamos la variable de los parámetros
    const puesto_id = req.params.puesto_id;

    console.log("> Puesto ID: ", puesto_id);

    //Almacenamos en una variable la consulta SQL
    const query = `
        SELECT 
            t.turno, t.jornada_inicio, t.jornada_fin 
        FROM
            puestos p
        INNER JOIN
            turnos t
        ON
            p.id_turno = t.id
        WHERE 
            p.id = ?
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que falle...
        if (err) {
            console.error("> Error en la conexión a la base de datos: ", err);

            //Enviamos el estado
            return res.status(501).send('Error en la conexión a la base de datos');
        }

        //Ejecutamos la consulta
        connection.query(query, [puesto_id], (error, result) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que ocurra algun error...
            if (error) {
                console.error("> Error a la hora de obtener los datos del turno: ", error);

                //Enviamos el status
                res.status(501).send('No se han podido obtener los datos del turno');
            }

            console.log("> Resultados: ", result);

            //Enviamos la información
            res.json(result);
        })
    });
});

/**
 * End point para obtener las fechas de inicio y fin de la toma de datos usando el programa de 
 */
router.get('/fechaTomaDatos', (req, res) => {
    //Creamos las variables para almacenar las fechas de inicio y fin
    let fecha_inicio, fecha_fin;

    //Creamos la conexión
    getDBConnection((err, connection) => {
        //En caso de que ocurra algún error
        if (err) {
            console.error("> Error en la conexión a la base de datos: ", err);
            res.status(501).send('Error en la conexión a la base de datos');
        }

        //Ejecutamos la query para obtener la fecha de inicio 
        connection.query("SELECT date_de_la_periode AS fecha_inicio FROM Programa_Recepcion pr ORDER BY date_de_la_periode ASC LIMIT 1", [], (error1, result1) => {
            if (error1) {
                console.error("> Error a la hora de obtener la fecha de inicio: ", error1);
                res.status(501).send('Error a la hora de obtener la fecha de inicio');
            }

            console.log("> Resultado1: ", result1);

            //Almacenamos la fecha de inicio
            fecha_inicio = result1[0].fecha_inicio;

            //Ejecutamos la query para obtener la fecha final
            connection.query("SELECT date_de_la_periode AS fecha_fin FROM Programa_Recepcion pr ORDER BY date_de_la_periode DESC LIMIT 1", [], (error2, result2) => {
                //En caso de que ocurra algun error...
                if (error2) {
                    console.error("> Error a la hora de obtener la fecha final: ", error2);
                    res.status(501).send('Error a la hora de obtener la fecha de fin');
                }

                //Liberamos la conexión
                connection.release();

                console.log("> Resultado2: ", result2);

                //Almacenamos la fecha final
                fecha_fin = result2[0].fecha_fin;

                //Enviamos la información
                res.json({ fecha_inicio, fecha_fin });
            });
        });
    });
});

/**
 * End point para obtener el número de embalajes
 */
router.get('/obtenerValorCarga/:tipo_carga/:planta/:referencia/:tipo_operacion', (req, res) => {
    //Almacenamos en variables los parámetros
    const { tipo_carga, planta, referencia, tipo_operacion } = req.params;

    //Creamos una variable para almacenar el nombre de la columna
    let columna = "", columna_fabrica = "";

    //Almacenamos en una variable la consulta SQL
    const query = `
        SELECT
            ?? AS valor_carga
        FROM
            POE
        WHERE
            ?? = ? AND
            reference = ?
        LIMIT 1
    `;

    //Controlamos el valor de la variable "tipo_carga"
    if (tipo_carga === 'UM') {
        columna = 'nb_pieces_par_um';

    } else if (tipo_carga === 'UC') {
        columna = 'nb_pieces_par_uc';
    }

    //Controlamos el valor de la variable del tipo de operación para asignar el nombre de la columna de la fabrica... en caso de de que sea Programa de Expedicion
    if (tipo_operacion === 'Programa_Expedicion_Forklift') {
        columna_fabrica = 'compte_fournisseur';
        //columna_fabrica = 'compte_client';

        //En caso de que sea Programa de Recepcion
    } else if (tipo_operacion === 'Programa_Recepcion') {
        //columna_fabrica = 'compte_fournisseur';
        columna_fabrica = 'compte_client';

        //En caso de que sea "Programa_Fabricacion"
    } else if (tipo_operacion === 'Programa_Fabricacion') {
        columna_fabrica = 'compte_client';
    }

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error...
        if (err) {
            console.error("> Se ha producido un error a la hora de conectarse a la base de datos: ", err);
            res.status(501).send("Error a la hora de establecer la conexión");
        }

        //Ejecutamos la consulta
        connection.query(query, [columna, columna_fabrica, planta, referencia], (error, result) => {
            console.log(">>>>> OBTENER VALOR CARGA\n", connection.format(query, [columna, columna_fabrica, planta, referencia]));

            //Liberamos la conexión
            connection.release();

            //En caso de que se produzca algun error
            if (error) {
                console.error("> Error en la consulta: ", error);

                //Devolvemos el status
                return res.status(501).send('Error a la hora de obtener el valor del tipo de carga: ', error);

            } else {
                //En caso de que no haya valor de carga
                if (result.length === 0 || result[0].valor_carga === undefined) {
                    //Enviamos ek status
                    return res.status(501).send('No se encontró el valor de carga');

                    //En otro caso...
                } else {
                    //Enviamos la información
                    return res.json({ valor_carga: result[0].valor_carga });
                }
            }
        });
    });
});

/**
 * End point para obtener la fecha de una referencia
 */
router.get('/obtenerFechas-Programa-Recepcion/:referencia/:tipo_operacion', (req, res) => {
    //Almacenamos las variables de los parámetros
    const { referencia, tipo_operacion } = req.params;

    //Cremos las variables para almacenar el nombre de la columna que contiene la fecha
    let columna_fecha;

    //Controlamos el tipo de operación para almacenar el nombre de la columna
    if (tipo_operacion === 'Programa_Recepcion') {
        columna_fecha = 'date_de_la_periode';
    }

    //Almacenamos en una variable la consulta SQL
    const query = `
        SELECT 
            ?? AS fecha
        FROM
            ??
        WHERE
            reference = ?
    `;

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algún error...
        if (err) {
            console.error("> Error en la conexión a la base de datos: ", err);
            res.status(501).send('Error en la conexión a la base de datos');
        }

        //Ejecutamos la consulta SQL para obtener las fechas
        connection.query(query, [columna_fecha, tipo_operacion, referencia], (error, result) => {
            //En caso de que ocurra un error en la consulta...
            if (error) {
                console.error("> Error en la consulta: ", error);
                return res.status(501).send('Error a la hora de ejecutar la consulta');
            }

            console.log("> Resultado: ", result);

            //Enviamos los datos
            return res.json(result);
        });
    });
});

router.get('/obtenerCantidad-grafico/:referencia/:fecha/:puesto_id', (req, res) => {
    const { referencia, fecha, puesto_id } = req.params;

    getDBConnection((err, connection) => {
        connection.query("SELECT quantite_de_forcage FROM Programa_Recepcion WHERE reference = ? AND date_de_la_periode = ?", [referencia, fecha], (error, result) => {
            return res.json(result);
        });
    });
})

/**
 * End point para obtener el primer día
 */
router.get(`/obtenerPrimerDia/:tipo_operacion`, (req, res) => {
    //Almacenamos la variable de los parámetros
    const tipo_operacion = req.params.tipo_operacion;

    //Almacenamos en una variable la query
    const query = `
        SELECT 
            date_expedition AS primer_dia
        FROM
            ??
        ORDER BY
            date_expedition ASC LIMIT 1
    `;

    //Obtenemos la conexión
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error en la conexión a la base de datos
        if (err) {
            console.error("> Error en la conexión con la base de datos");
            res.status(501).send("Error en la conexión con la base de datos");
        }

        //Ejecutamos la consulta SQL
        connection.query(query, [tipo_operacion], (error, result) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que ocurrar algún error en la consulta
            if (error) {
                console.error("> Error a la hora de obtener el primer día: ", error);
                return res.status(501).send("Error en la consulta");
            }

            console.log("> Resulltados: ", result);

            //Enviamos la primeora fecha
            return res.json(result);
        });
    })
});

/**
 * End point para obtener las referencias disponibles para disponerlas en el modal de buscador de referencias
 */
router.get('/obtener-referencias/:tipo_operacion/:id_puesto/:planta', (req, res) => {
    //Almacenamos en variables los parámetros
    const { tipo_operacion, id_puesto, planta } = req.params;

    //Variables para almacenar la información básica
    let jornada_inicio, jornada_fin, columna, columna_hora;

    //Almacenamos en una variable la consulta SQL para obtener la jornada de inicio y fin
    let query = `
        SELECT
            t.jornada_inicio,
            t.jornada_fin
        FROM
            puestos p
        INNER JOIN
            turnos t
        ON
            p.id_turno = t.id
        WHERE
            p.id = ?
    `;

    //Creamos un switch para controlar a que columna tiene que mirar dependiendo del tipo de operación
    switch (tipo_operacion) {
        case 'Programa_Recepcion':
            columna = "compte_client";
            columna_hora = "heure_de_la_periode";
            break;

        case "Programa_Expedicion_Forklift":
            columna = "compte_fournisseur";
            columna_hora = "heure_expedition";
            break;

        case "Programa_Fabricacion":
            columna = "cpte_usine";
            columna_hora = "horodate_debut_periode";
            break;

        default:
            break;
    }

    //Creamos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error en la conexión a la base de datos
        if (err) {
            //Enviamos el status
            console.error("> Error en la conexión a la base de datos: ", err);
            return res.status(501).send('Error en la conexión a la base de datos');
        }

        //Ejecutamos la consulta SQL para obtener los turnos del puesto
        connection.query(query, [id_puesto], (erro1, result1) => {
            //En caso de que ocurra algun error en la consulta SQL
            if (erro1) {
                //Enviamos el status
                console.error("> Error en la ejecución de la consulta SQL: ", erro1);
                return res.status(501).send('Error en la consulta SQL');
            }

            //Almacenamos en variables las jornadas de los tiempos
            jornada_inicio = result1[0].jornada_inicio;
            jornada_fin = result1[0].jornada_fin;

            //Almacenamos en una variable la nueva consulta SQL
            query = `
                SELECT
                    DISTINCT(reference)
                FROM
                    ??
                WHERE
                    ?? = ? AND
                    ?? >= ? AND
                    ?? <= ?
            `;

            //Ejecutamos la segunda consula SQL
            connection.query(query, [tipo_operacion, columna, planta, columna_hora, jornada_inicio, columna_hora, jornada_fin], (error, result) => {
                //En caso de de que ocurra algun error
                if (error) {
                    //Enviamos el status
                    console.error("> Error en la última consulta SQL: ", error);
                    return res.status(501).send('Error en la consulta SQL');
                }

                //Enviamos la información
                return res.json(result);
            })
        });
    });
});


/**
 * End point para actualizar el orden de las etapas
 */
router.put('/actualizarOrden/:array_ordenado', (req, res) => {
    //Almacenamos la variable de los parámetros
    let array_ordenado = decodeURIComponent(req.params.array_ordenado);

    console.log("Array recibido en el backend:", array_ordenado); // Verificar el array recibido

    // Convertir el string en un array separando por "-"
    let array = array_ordenado.split(',');

    console.log("Array separado:", array); // Verificar que la separación es correcta

    //Almacenamos en una variable la query
    let query = `
        UPDATE
            EN_IFM_STANDARD
        SET
            orden = ?
        WHERE
            id = ? AND
            id_puesto = ?
    `;

    //let array = array_ordenado.split('-');

    //Obtenemos la conexión
    getDBConnection((err, connection) => {
        //En caso de que se produzaca un error...
        if (err) {
            return res.status(400).send('Error al conectar con la base de datos');
        }

        // Usamos un índice para manejar el orden
        for (let index = 0; index < array.length; index++) {
            let item = array[index];
            let [id, id_puesto] = item.split('-'); // Separar id e id_puesto
            let orden = index + 1; // Asignar el orden basado en el índice

            console.log(`Actualizando: ID=${id}, ID_Puesto=${id_puesto}, Orden=${orden}`); // Verificar los valores a actualizar

            // Ejecutamos la consulta para cada etapa
            connection.query(query, [orden, id, id_puesto], (error, result) => {
                if (error) {
                    console.error("> Error: ", error);
                    connection.release();
                    return res.status(500).send('Error en la consulta');
                }

                console.log(`Consulta exitosa para ID=${id} y ID_Puesto=${id_puesto}, resultado:`, result);

                // Liberamos la conexión después de la última consulta
                if (index === array.length - 1) {
                    connection.release();
                    res.status(200).send('Orden actualizado correctamente');
                }
            });
        }
    });
});

//Exportamos el enrutador
export default router;