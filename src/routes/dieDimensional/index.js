//Importamos Express y los módulos necesarios
import express from "express";
import morgan from "morgan";
import mysql from "mysql";

//Importamos los archivos JSON con los idiomas
import rm from "./lang/rm.json" assert { type: "json" };
import pg from "./lang/pg.json" assert { type: "json" };

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
    database: 'corporate_central',
    port: 31009,
    multipleStatements: true
});

/**
 * Función para obtener una conexión del pool
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

/**CONFIGURACIÓN DE IDIOMAS */
/**
 * Rumania
 */
router.get('/rumania-translation', (req, res) => {
    //Enviamos el archivo de idioma correspondiente
    res.json(rm);
});

/**
 * Curitiba
 */
router.get('/curitiba-translation', (req, res) => {
    //Enviamos el arcbivo de idioma correspondiente
    res.json(pg);
})

/**END POINT GENERALES */
/**
 * End point para actualizar para el comentario de la medida
 */
router.post('/actualizar-comentario-medida/:id/:comentario/:tabla', (req, res) => {
    //Almacenamos las variables de los parámeros
    const { id, comentario, tabla } = req.params;

    //Almacenamos en una variable la consulta para actualizar el comentario
    let query = `
        UPDATE 
            ??
        SET
            comentario = ?
        WHERE
            id = ?
    `;

    //Obtenemos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error
        if (err) {
            //Enviamos el status
            console.error("> Error en la conexión a la base de datos: ", err);
            return res.status().send('Error en la conexión a la base de datos');
        }

        //Ejecutamos la consulta para actualizar el comentario de la medida
        connection.query(query, [tabla, comentario, id], (error, result) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que ocurra algun error
            if (error) {
                //Enviamos el status
                console.error("> Error a la hora de actualizar el comentario de la etapa: ", error);
                return res.status(501).send('Error a la hora de actualizar el comentario de la medida');
            }

            //Enviamos el status
            return res.status(201).send('Comentario actualizado');
        });
    })
});

/**
 * End point para obtener los status de las no conformidades del premecanizado
 */
router.get('/obtener-status-premecanizado/:id', (req, res) => {
    //Almacenamos el ID de no conformidad de los parámtros
    const id = req.params.id;

    //Almacenamos en una variable la sentencia SQL para obtener la información de las alertas
    let query = `
        SELECT 
            ancplnc.caracteristica,
            ancplnc.descripcion,
            ancprnc.valor_exceed,
            ancprnc.id_listado_caracteristica
        FROM 
            aa_no_confomidades_premeca_registro_no_conformidades ancprnc 
        INNER JOIN aa_no_confomidades_premeca_listado_no_conformidades ancplnc 
        ON 
            ancprnc.id_listado_caracteristica  = ancplnc.id 
        WHERE 
            ancprnc.id_sala_3d = ?
    `;

    //Obtenemos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error en la conexión a la base de datos
        if (err) {
            //Enviamos el status
            console.error("> Error en la conexión a la base de datos: ", err);
            return res.status(501).send('Error en la conexión a la base de datos');
        }

        //Ejecutamos la consulta SQL para obtener los valores excedidos
        connection.query(query, [id], (error, result) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que ocurra algun error en la consulta
            if (error) {
                //Enviamos el status
                console.error("> Error en la consulta: ", error);
                return res.status(501).send('Error en la ejecución de la consulta');
            }

            //Enviamos la información
            return res.json(result);
        });
    });
});

/**
 * End point para obtener la información de las no conformidades - PREMECANIZADO
 */
router.get('/obtener-informacion-detallada-premecanizado/:id/:id_caracteristica', (req, res) => {
    //Almacenamos los datos de los parámetros
    const { id, id_caracteristica } = req.params;

    //Almacenamos en una variable la consulta
    let query = `
        SELECT 
            *
        FROM 
            aa_no_confomidades_premeca_registro_no_conformidades ancprnc 
        INNER JOIN
            aa_no_confomidades_premeca_listado_no_conformidades ancplnc 
        ON
            ancprnc.id_listado_caracteristica = ancplnc.id 
        WHERE 
            ancprnc.id_sala_3d = ? AND 
            ancprnc.id_listado_caracteristica = ?
    `;

    //Obtenemos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error
        if (err) {
            //Enviamos el status
            console.error("> Error a la hora de obtener la conexión a la base de datos: ", err);
            return res.status(501).send('Error en la conexión a la base de datos');
        }

        //Ejecutamos la consulta
        connection.query(query, [id, id_caracteristica], (error, result) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que ocurra algun error en la ejecución de la consulta
            if (error) {
                //Enviamos el status
                console.error("> Error en la ejecución de la consulta: ", error);
                return res.status(501).send('Error en la ejecución de la consulta');
            }

            //Enviamos la información obtenida
            return res.json(result);
        });
    });
});

/**
 * End point para obtener la correspondencia entre taladros
 */
router.get('/obtener-correspondencia-entre-taladros/:id/:tipo_caracteristica', (req, res) => {
    //Almacenamos la información de los parámetros de la URL
    const { id, tipo_caracteristica } = req.params;

    //Alcenamos en una variable la sentencia SQL para obtener la correspondencia entre taladros
    const query = `
        SELECT 
            *
        FROM 
            aa_no_confomidades_premeca_registro_no_conformidades ancprnc 
        INNER JOIN
            aa_no_confomidades_premeca_listado_no_conformidades ancplnc 
        ON 
            ancprnc.id_listado_caracteristica = ancplnc.id 
        WHERE 
            ancprnc.id = ? AND 
            ancprnc.id_listado_caracteristica = ?
    `;

    //Obtenemos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error durante la conexión a la base de datos
        if (err) {
            //Enviamos el status
            console.error("> Error en la conexión a la base de datos: ", err);
            return res.status(501).send('Error en la conxión a la base de datos');
        }

        //Ejecutamos la consulta SQL
        connection.query(query, [id, tipo_caracteristica], (error, result) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que ocurra algun error en la consulta
            if (error) {
                //Enviamos el status
                console.error("> Error en la ejecución de la consulta: ", error);
                return res.status(501).send('Error en la ejecución de la consulta');
            }

            //Enviamos la información
            return res.json(result);
        });
    })
});

/**END POINTS PARA CURITIBA */

/**
 * End point para obtener las no conformidades de premecanizado
 */
router.get('/no-conformidades-premecanizado_Curitiba', (req, res) => {
    //Establecemos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error durante la conexión a la base de datos
        if (err) {
            //Enviamos el status
            console.error("> Error en la conexión a la base de datos: ", err);
            return res.status(501).send('Error en la conexion a la base de datos');
        }

        //Ejecutamos la consulta SQL para obtener las no conformidades de premecanizado de Curitiba
        connection.query("SELECT * FROM dieDimensional_Curitiba_no_conformidades", [], (error, result) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que ocurra algun error en la consulta
            if (error) {
                //Enviamos el status
                console.error("> Error en la ejecución de la consulta: ", error);
                return res.status(501).send('Error en la ejecución de la consulta');
            }

            //Enviamos los datos
            return res.json(result);
        });
    });
});

/**
 * End point para obtener las no conformidades para disponerlas en el modal
 */
router.get('/obtener-no-conformidades/:id', (req, res) => {
    //Almacenamos el ID del parámetro
    const id = req.params.id;

    //Almacenamos en una variable la query
    let query = `
        SELECT
            ancplnc.caracteristica,
            ancplnc.descripcion
        FROM
            dieDimensional_Curitiba_no_conformidades ddcnc
        INNER JOIN
            aa_no_confomidades_premeca_listado_no_conformidades_curitiba ancplnc
        ON
            ddcnc.vista_sala3d = ancplnc.id
        WHERE
            ddcnc.vista_sala3d = ?
    `;

    //Obtener la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error en la conexión a la base de datos
        if (err) {
            //Enviamos el status
            console.error("> Error en la conexión a la base de datos: ", err);
            return res.status(501).send('Error en la conexión a la base de datos');
        }

        //Ejecutamos la sentencia
        connection.query(query, [id], (error, result) => {
            //En caso de que la consulta haya fallado
            if (error) {
                //Enviamos el status
                console.error("> Error en la ejecución de la consulta: ", error);
                return res.status(501).send('Error en la ejecución de la consulta');
            }

            //Enviamos los datos obtenidos
            return res.json(result);
        });
    });
})

/**
 * End point para obtener la información básica de premecanizado
 */
router.get('/obtenerInformacionBasica-premecanizado-curitiba/:id', (req, res) => {
    //Almacenamos el ID de la no conformidad de los parámetros
    let id = req.params.id;

    //Obtenemos la conexión a la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algun error en la conexión a la base de datos
        if (err) {
            //Enviamos el status
            console.error("> Error en la conexión a la base de datos: ", error);
            return res.status(501).send('Error en la conexión a la base de datos');
        }

        //Ejecutamos la consulta para obtener los datos básicos
        connection.query("SELECT fecha_registro, datamatrix, tipo_pieza, molde, comentario FROM dieDimensional_Curitiba_no_conformidades WHERE id = ?", [id], (error, result) => {
            //Liberamos la conexión
            connection.release();

            //En caso de que ocurra algun error en la ejecución de la consulta
            if (error) {
                //Enviamos el status
                console.error("> Error en la ejecución de la consulta: ", error);
                return res.status(501).send('Error en la ejecución de la consulta');
            }

            //Enviamos los datos obtenidos
            return res.json(result);
        });
    });
});

/**END POINTS PARA RUMANIA */
router.get('/rumania-no-conformidades', (req, res) => {
    //Obtenemos la conexióna la base de datos
    getDBConnection((err, connection) => {
        //En caso de que ocurra algún error en la conexión a la base de datos...
        if (err) {
            //Enviamos el status
            console.error("> Error en la conexión a la base de datos: ", err);
            return res.status(501).send('Error en la conexión a la base de datos');
        }

        //Ejecutamos la consulta SQL
        connection.query("SELECT ddrnc.id, ddrnc.fecha_registro, ddrnc.datamatrix, ddrnc.description, ddrnc.AX, ddrnc.mold_type FROM dieDimensional_Rumania_no_conformidades ddrnc", [], (error, result) => {
            //En caso de que ocurra algun problema con la consulta SQL
            if (error) {
                //Enviamos el status
                console.error("> Error en la ejecución de la consulta: ", error);
                return res.status(501).send('Error en la ejecución de la consulta');
            }

            //Enviamos la información obtenida
            return res.json(result);
        });
    });
});

//Exportamos el enrutador
export default router;