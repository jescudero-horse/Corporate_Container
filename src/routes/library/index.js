//Import express and all the necessary modules
import express, { json, response } from "express";
import morgan from "morgan";
import { join, dirname } from "path";
import { extname, basename } from 'path';
import { fileURLToPath } from "url";
import mysql from "mysql";
import session from "express-session";
import multer from "multer";
import { exec } from 'child_process';
import { expressCspHeader, SELF, NONE, INLINE, UNSAFE_INLINE } from 'express-csp-header';

//Import the files modules
import * as fs from 'fs';

//Import LDAP class
import ldapAuth from './auth/ldapAuth.js';

//Imports the necessary tools for the Chatbot
import http from 'http';
import { Server } from 'socket.io';

//Initialize express
const app = express();

//Correct __dirname initialization
const __dirname = dirname(fileURLToPath(import.meta.url));

//Middleware to serve static files from 'public' folder
app.use('/uploads', express.static(join(__dirname, 'src', 'routes', 'library', 'public', 'uploads')));

app.use(express.urlencoded({ extended: true }));

//Creamos una instancia de router
const router = express.Router();

//Instance the Chatbot 
const server = http.createServer(app);
const io = new Server(server);

//Configure the connection to the base data
let db;

//Create global variables to store some information for the best practise
let titleBestPractise = '';
let factory = '';
let category = '';
let idBestPractise;

//Create global variable to store some information for the 3D model
let titleBlueprint = '';
let idBlueprint;

/**Varibale global para la categoria del Data Driven */
let idDataDriven;

/**
 * Function to connect the web page to te base data
 */
function connectDB() {
    //Create an object that contains the conecctions to the data base
    db = mysql.createConnection({
        host: 'portal-motores.vll.renault.es',
        user: 'corporatecentral',
        password: '1GJYbSrM_Oxv@PSF',
        database: 'corporate_central_re7',
        port: 31009,
        keepAlive: true
    });

    //Use the object to connect
    db.connect((err) => {
        //If an error ocurre
        if (err) {
            console.error('Error de conexión:', err);
            //Reconnect with the base data
            setTimeout(reconnect, 2000);
        } else {
            console.log('Conexión exitosa');
        }
    });

    //Control the connection lost error
    db.on('error', (err) => {
        console.error('Error de conexión:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connectDB();
        } else {
            throw err;
        }
    });
}

/**
 * Function to reconnect to the base data
 */
function reconnect() {
    db = mysql.createConnection({
        host: 'portal-motores.vll.renault.es',
        user: 'corporatecentral',
        password: '1GJYbSrM_Oxv@PSF',
        database: 'corporate_central_re7',
        port: 31009,
        keepAlive: true
    });

    db.connect((err) => {
        if (err) {
            console.error('Error de conexión:', err);
            setTimeout(reconnect, 2000);
        } else {
            console.log('Conexión exitosa');
        }
    });

    db.on('error', (err) => {
        console.error('Error de conexión:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            reconnect();
        } else {
            throw err;
        }
    });
}

//Initialize the firts connection
connectDB();

//Configure the CSP protocol
app.use(expressCspHeader({
    directives: {
        'default-src': [SELF],
        'script-src': [
            SELF,
            'https://cdn.jsdelivr.net',
            'https://cdn.datatables.net',
            'https://cdnjs.cloudflare.com',
            'https://code.jquery.com',
            'https://translate.googleapis.com',
            'https://translate-pa.googleapis.com',
            UNSAFE_INLINE
        ],
        'style-src': [
            SELF,
            'https://cdn.jsdelivr.net',
            'https://cdn.datatables.net',
            'https://cdnjs.cloudflare.com',
            'https://www.gstatic.com',
            UNSAFE_INLINE
        ],
        'img-src': [
            SELF,
            'data:',
            'https://www.gstatic.com',
            'https://fonts.gstatic.com'
        ],
        'font-src': [SELF, 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
        'connect-src': [
            SELF,
            'https://portalhorse.vll.renault.es:8082',
            'https://portal-motores.vll.renault.es/libreoffice',
            'https://translate.googleapis.com',
            'https://translate-pa.googleapis.com',
            'https://portalhorse.vll.renault.es:8082'
        ],
        'object-src': [NONE],
        'media-src': [SELF],
        'worker-src': [SELF],
        'block-all-mixed-content': true
    }
}));

//Create an array to store the variables
let categories = [];

//Create a function to read the information from the JSON information
const loadCategories = () => {
    //Create an instance of the JSON file
    const jsonFile = join(__dirname, 'public/chatBot/chatBot.json');

    //Read the file
    fs.readFile(jsonFile, 'utf-8', (error, data) => {
        //If an error ocurred...
        if (error) {
            console.error("Error al leer el archivo JSON: ", error);
            return;
        }

        //Parse the information
        try {
            const jsonData = JSON.parse(data);
            categories = jsonData.categorias;
        } catch (parseError) {
            console.error("Error al parsear JSON: ", parseError);
        }
    });
}

//Call the method to load the information
loadCategories();

//Configure the socket
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    //Apply the funcionality
    socket.on('preguntar', (pregunta) => {
        //Create a boolean to control the answer
        let respuestaEncontrada = false;

        //Iterate throw the categories
        for (const categoria of categories) {
            const index = categoria.preguntas.findIndex(p => p.toLowerCase() === pregunta.toLowerCase());
            if (index !== -1) {
                const respuesta = categoria.respuestas[index];
                socket.emit('respuesta', respuesta);
                respuestaEncontrada = true;
                break;
            }
        }

        if (!respuestaEncontrada) {
            socket.emit('respuesta', 'I dont have an answer for that. Please send an email to jesus.escudero-extern@horse.tech');
        }
    });
});

router.get('/test-image', (req, res) => {
    const filePath = join(__dirname, 'public', 'uploads', 'buenasPracticas', '874', 'NULL IMAGE.png');
    console.log('Archivo está en:', filePath);
    res.sendFile(filePath); //Esto servirá la imagen directamente
});

/**
 * End point to get the user ID (IPN)
 */
router.get('/user-id', (req, res) => {
    console.log('req.session:', req.session);
    if (req.session && req.session.userId) {
        res.json({ userId: req.session.userId });
    } else {
        res.status(401).json({ error: 'User not authenticated' });
    }
});


/**
 * End point to initialize the global variable of the best practise
 */
router.post('/initializeBestPractise/:factory/:title/:category', (req, res) => {
    req.session.factory = req.params.factory;
    req.session.titleBestPractise = req.params.title;
    req.session.category = req.params.category;

    console.log("> Factory: ", req.session.factory, "\t Title: ", req.session.titleBestPractise, "\tCategory: ", req.session.category);

    res.json({
        factory: req.session.factory,
        titleBestPractise: req.session.titleBestPractise,
        category: req.session.category
    });
});

/**
 * End point to login the user on the LDAP server
 */
router.post('/login-ldap', (req, res) => {
    //Store the IPN of the input valeS
    const ipn = req.body.ipn;

    //Store the password of the input value
    const password = req.body.password;

    //Call the method to start with the authentication
    ldapAuth(ipn, password, (err, userEmail, success) => {
        //If an error ocurred
        if (err || !success) {
            console.error("Autenticación fallida para el usuario:", ipn);
            res.redirect("/library/failLogin");

            //If the authentication was succesfull
        } else {
            console.log("Autenticación exitosa para el usuario:", ipn);
            //Store the IPN of the log in user
            req.session.userId = ipn;

            //Store the email of the user
            req.session.userEmail = userEmail;

            //Turn true the loggIn boolean
            req.session.loggedIn = true;

            console.log("> USERID dentro de login-ldap: ", req.session.userId, "\tEmail del usuario: ", userEmail);

            //Rediecto to the admin select categories
            res.redirect("/library/selectCategories");
        }
    });
});

/**
 * End point to select the information using the ID of the best practise
 */
router.get('/getBestPractise/:id', (req, res) => {
    //Store the id of the best practise
    const idBestPractise = req.params.id;

    //Execute the query
    db.query("SELECT * FROM best_practise WHERE id = ?", [idBestPractise], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error al obtener los datos de la buena practica: ", err);
            res.status(500).send('Error to obtein the information from the best practise');
            return;
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select the count of the reason of the not applicable best practise
 */
router.get('/countReason/:factory', (req, res) => {
    //Store the factory from the argument
    const factory = req.params.factory;

    //Store the query
    const query = `
        SELECT
            COUNT(CASE
                WHEN status = 'Not applicable'
                AND reason = 'End of life'
                AND factory_applied = ? THEN id_bestPractiseApplied
            END) AS endOfLife,
            COUNT(CASE
                WHEN status = 'Not applicable'
                AND reason = 'Different technology'
                AND factory_applied = ? THEN id_bestPractiseApplied
            END) AS differentTechnology,
            COUNT(CASE
                WHEN status = 'Not applicable'
                AND reason = 'Different process'
                AND factory_applied = ? THEN id_bestPractiseApplied
            END) AS differentProcess
        FROM
            bestPractiseApplied
    `;

    //Execute the query
    db.query(query, [factory, factory, factory], (err, result) => {
        if (err) {
            console.error("> Se ha producido un error al obtener el count de los distintas razones:", err);
            return res.status(500).json({ error: 'Error retrieving data' });
        }

        //Send the information
        res.json(result[0]);
    });
});


/**
 * End point to retrieve the count of the datable "bestPractiseApplied"
 */
router.get('/countBestPractiseApplied', (req, res) => {
    //Execute the query
    db.query("SELECT COUNT(id_bestPractiseApplied) AS count FROM bestPractiseApplied WHERE status != 'Not applicable'", [], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Se ha producido un error a la hora de obtener el conteo de las buenas prácticas aplicadas ", err);
        }

        //Send the information
        res.json({ count: result[0].count });
    });
});

/**
 * End point to retrieve the count of a table
 */
router.get('/count/:table', (req, res) => {
    //Store the name of the table into a variable
    const table = db.escapeId(req.params.table);

    //Create the query
    const query = `SELECT COUNT(id) AS count FROM ${table}`;

    //Execute the query
    db.query(query, (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error a la hora de obtener el conteo: ", err);
            return res.status(500).json({ error: 'Error en la consulta' });
        }

        //Send the information
        res.json({ count: result[0].count });
    });
});

/**
 * End point to count the rows from a table
 */
router.get('/count/:table/:input/:value', (req, res) => {
    /**Store arguments of the endpoint */
    const table = db.escapeId(req.params.table);
    const input = db.escapeId(req.params.input);
    const value = req.params.value;

    //Store the query
    const query = `SELECT COUNT(id_bestPractiseApplied) AS count FROM ${table} WHERE ${input} = ? AND status != 'Not applicable'`;

    //Execute the query
    db.query(query, [value], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se ha podido obtener el número de elementos: ", err);
            return res.status(500).json({ error: "Error en la consulta" });
        }

        console.log("> Número de elementos: ", result);

        //Send the information
        res.json({ count: result[0].count });
    });
});

/**
 * End point to select the best practise from the entitie Transmission --> Machining (Aveiro, Bursa, CMC, Mioveni, Sevilla)
 */
router.get('/getTransmission_machining', (req, res) => {
    //Execte the query
    db.query("SELECT * FROM best_practise WHERE factory = 'Aveiro' OR factory = 'Bursa' OR factory = 'CMC' OR factory = 'Mioveni' OR factory = 'Sevilla'", [], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error('> No se pudierón obtener la información de las buenas prácticas de Transmission-Machining: ', err);
        }

        console.log("> Resultado: ", result);

        //Send the information
        res.json(result);
    })
});

/**
 * End point to select the best practise from the entitie Transmission --> Assembly (Aveiro, Bursa, CMC, Mioveni, Sevilla)
 */
router.get('/getTransmission_assembly', (req, res) => {
    console.log("Dentro del end point para los Transmission - assembly");
    //Execute the query
    db.query("SELECT * FROM best_practise WHERE factory = 'Aveiro' OR factory = 'Bursa' OR factory = 'CMC' OR factory = 'Mioveni' OR factory = 'Sevilla'", [], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se pudierón obtener la información de las buenas prácticas de Trasmission-Assembly: ", err);
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select the best practise from the entitie Transmission --> Flow (Aveiro, Bursa, CMC, Mioveni, Sevilla)
 */
router.get('/getTransmission_flow', (req, res) => {
    //Execute the query
    db.query("SELECT * FROM best_practise WHERE factory = 'Aveiro' OR factory = 'Bursa' OR factory = 'CMC' OR factory = 'Mioveni' OR factory = 'Sevilla'", [], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se pudierón obtener la información de las buenas prácticas de Trasmission-Assembly: ", err);
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select the best practise from the entitie Engine --> Machining (Curitiba, Mioveni, Motores)
 */
router.get('/getEngine_machining', (req, res) => {
    //Execute the query
    db.query("SELECT * FROM best_practise WHERE factory = 'Curitiba' OR factory = 'Mioveni' OR factory = 'Motores'", [], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se pudierón obtener la información de las buenas prácticas de Engine-Machining: ", err);
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select the best practise from the entitie Engine --> Assembly (Curitiba, Mioveni, Motores)
 */
router.get('/getEngine_assembly', (req, res) => {
    //Execute the query
    db.query("SELECT * FROM best_practise WHERE factory = 'Curitiba' OR factory = 'Mioveni' OR factory = 'Motores'", [], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se pudierón obtener la información de las buenas prácticas de Engine-Machining: ", err);
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select the best practise from the entitie Engine --> Flow (Curitiba, Mioveni, Motores)
 */
router.get('/getEngine_Flow', (req, res) => {
    //Execute the query
    db.query("SELECT * FROM best_practise WHERE factory = 'Curitiba' OR factory = 'Mioveni' OR factory = 'Motores'", [], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se pudierón obtener la información de las buenas prácticas de Engine-Machining: ", err);
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select the best practise from the entitie Casting --> HPDC (Bursa, PFA, Curitiba, Mioveni, Motores)
 */
router.get('/getCasting_hpdc', (req, res) => {
    //Execute the query
    db.query("SELECT * FROM best_practise WHERE factory = 'Bursa' OR factory = 'PFA' OR factory = 'Curitiba' OR factory = 'Mioveni' OR factory = 'Motores'", [], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se pudierón obtener la información de las buenas prácticas de Casting-HPDC: ", err);
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select the best practise from the entitie Casting - LPDC (Curitiba)
 */
router.get('/getCasting_lpdc', (req, res) => {
    //Execute the query
    db.query("SELECT * FROM best_practise WHERE factory = 'Curitiba'", [], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se pudierón obtener la información de las buenas prácticas de Casting-HPDC: ", err);
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select the best practise from the entitie Casting - Flow (Bursa, Curitiba, Mioveni, Motores)
 */
router.get('/getCasting_flow', (req, res) => {
    //Execite the query
    db.query("SELECT * FROM best_practise WHERE factory = 'Bursa'OR factory = 'Curitiba' OR factory = 'Mioveni' OR factory = 'Motores'", [], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se pudierón obtener la información de las buenas prácticas de Casting-Flow: ", err);
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to obteing all the PowerAutomate
 */
router.get('/getPowerAutomate', (req, res) => {
    //Execute the query
    db.query("SELECT * FROM powerAutomate", (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Se ha producido un error a la hora de obtener las PowerAutomate: ", err);
            res.status(500).send("Error a la hora de obtener la información de las PowerAutomate");
            return;
        }

        //Send the information data
        res.json(result);
    });
});

/**
 * End point to insert the PowerAutomate
 */
router.post('/insert-data-powerAutomate', (req, res) => {
    //Store the value from the form
    const { flowName, flowID, owner, state, description, url, factory } = req.body;

    //Execute the query
    db.query("INSERT INTO powerAutomate (flowName, flowID, owner, state, description, url, userID, factory) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [flowName, flowID, owner, state, description, url, req.session.userId, factory], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error a la hora de añadir los datos del PowerAutomate: ", err);
            res.status(500).send("Error a la hora de añadir la información");
            return;
        }

        console.log("> Datos de la PowerAutomate añadidos con exito: ", result);
        res.redirect('/library/successPowerAutomate');
    });
});

/**
 * End point to edit the PowerAutomate
 */
router.post('/updatePowerAutomate', (req, res) => {
    //Store the values from the form
    const { id, flowName, flowID, owner, state, description, url, factory } = req.body;

    //Execute the query
    db.query("UPDATE powerAutomate SET flowName = ?, flowID = ?, owner = ?, state = ?, description = ?, url = ?, factory = ? WHERE id = ?", [flowName, flowID, owner, state, description, url, factory, id], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Ocurrio un problema a la hora de actualizar el PowerAutomate: ", err);
            res.status(500).send("Error a la hora de actualizar la PowerAutomate");
            return;
        }

        console.log("> Datos actualizados de forma exitosa: ", result);

        //Redirect to the success edit of the Power Automate
        res.redirect('/library/successEditPowerAutomate');
    });
});

/**
 * End point to obtein the information using the userId (IPN) and the table
 */
router.get('/getPersonalList/:ipn/:table', (req, res) => {
    //Store the IPN of the user
    const ipn = req.params.ipn;

    //Store the table to do the query
    const table = req.params.table;

    //Validate for the name of the available tables
    const allowedTables = ['app', 'spotfire', 'powerApps', 'best_practise', 'associatedSites'];

    //Check if is a validate table
    if (!allowedTables.includes(table)) {
        return res.status(400).send('Nombre de tabla no permitido');
    }

    //Store a variable the select query
    let query = `SELECT * FROM ${table} WHERE userID = ?`;

    //If the table is "spotfire"... create a custom query
    if (table === 'spotfire') {
        query = 'SELECT s.id, s.title, s.factory, s.type_report, s.platform, s.location, s.description, s.contact, s.video_tutorial, s.data_source, s.sent_elementals, s.comments, s.userID, f.function_name, sf.subfunction_name FROM spotfire s LEFT JOIN spotfire_functions_subfunctions sfs ON s.id = sfs.spotfire_id LEFT JOIN function f ON sfs.function_id = f.id LEFT JOIN subfunctions sf ON sfs.subfunction_id = sf.id WHERE s.userId = ?'
    }

    //Execute the query
    db.query(query, [ipn], (err, result) => {
        if (err) {
            console.error('No se han podido obtener los datos de la persona')
            res.status(500).send('Error al obtener los datos de la persona: ', err);
            return
        }

        res.json(result);
    });
});

/**
 * End point to log out and destroy the session
 */
router.post('/logOut', (req, res) => {
    //Turn false the loggIn value
    req.session.loggedIn = false;

    //Destroy the value of the userID (IPN)
    req.session.userId = "";

    //Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.log("> Error en la destrucción de la session");
        } else {
            console.log("> Session destruida");
            res.redirect("/library");
        }
    })
});

/**
 * End point to insert data to the "app" table
 */
router.post('/insert-data-app', (req, res) => {
    //Store the value from the app form
    const { ciNumber, shortName, KMLongName, KMShortName, longName, type, sia, installStatus, criticality, supportGroups, bussinesLine, groupLevelUsage, ownedBy, managedByOrgType, ledBy, developedBy, hostingProvider, executionPlatform, domainIRN, subDomain, cmdbDescription, created, createdBy, updated, updatedBy } = req.body;

    //Store the IPN of the user
    const userId = req.session.userId;

    //Store the query insert of the app
    const query = "INSERT INTO app (ciNumber, shortName, KMLongName, KMShortName, longName, type, sia, installStatus, criticality, supportGroups, bussinesLine, groupLevelUsage, ownedBy, managedbyOrgType, ledBy, developedBy, hostingProvider,  executionPlatform, domainIRN, subDomain, cmdbDescription, created, createdBy, updated, updatedBy, userID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"

    //Make the query insert
    db.query(query, [ciNumber, shortName, KMLongName, KMShortName, longName, type, sia, installStatus, criticality, supportGroups, bussinesLine, groupLevelUsage, ownedBy, managedByOrgType, ledBy, developedBy, hostingProvider, executionPlatform, domainIRN, subDomain, cmdbDescription, created, createdBy, updated, updatedBy, userId], (err, result) => {
        if (err) {
            console.error('Error al insertar datos en la base de datos:', err);
            res.status(500).send('Error al insertar datos');
            return;
        }
        console.log('Datos insertados correctamente');
        res.redirect('/library/successApp');
    });
});

/**
 * End pount to select all the data from the "app" table
 */
router.get('/getApps', (req, res) => {
    //Make the query to select all the apps
    db.query('SELECT * FROM app', (err, result) => {
        if (err) {
            console.error('Error al obtener los datos de la base de datos:', err);
            res.status(500).send('Error al obtener los datos');
            return;
        }
        res.json(result);
    });
});

/**
 * End point to select all the data from the "powerApps" table
 */
router.get('/getPowerApps', (req, res) => {
    //Make the query to select all the powerApps
    db.query('SELECT p.*, GROUP_CONCAT(fp.factory SEPARATOR " - ") AS factories FROM powerApps p JOIN factories_powerApp fp ON p.id = fp.idPowerApp GROUP BY p.id;', (err, result) => {
        if (err) {
            console.error('Error al obtener los datos de la base de datos:', err);
            res.status(500).send('Error al obtener los datos');
            return;
        }

        //Send the data
        res.json(result);
    });
});

/**
 * End point to select all the associated sites using the ID of the powerApps
 */
router.get('/getAssociatedSites/:id', (req, res) => {
    //Store the ID of the PowerApp source
    const id = req.params.id;

    //Execute the query to select the associated sites
    db.query('SELECT urlSite FROM associatedSites WHERE idPowerApp = ?', [id], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.err('No se han podido obtener los sitios asociados');
            res.status(500).send('Error al obtener los sitios asociados a ', id);
            return;
        }

        //Return the result
        res.json(result);
    })
});

/**
 * End point to select all the factories associated using the ID of the powerApp
 */
router.get('/getFactories/:id', (req, res) => {
    //Store the ID of the PowerApp source
    const id = req.params.id;
    console.log("ID del elemento: ", id);

    //Execute the query to select the factories
    db.query('SELECT DISTINCT (factory) FROM factories_powerApp WHERE idPowerApp = ?', [id], (err, result) => {
        //If an error courred...
        if (err) {
            console.error('No se han podido obtener las factories asociadas al powerApp');
            res.status(500).send('Error al obtener las factorias');
            return
        }

        //Return the result
        res.json(result);
    });
});

/**
 * End point to select the PowerAutomates using the ID of the PowerApp
 */
router.get('/getPowerAutomate_PowerApp/:id', (req, res) => {
    //Execute the query
    db.query("SELECT * FROM powerAutomate WHERE idPowerApp = ?", [req.params.id], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Se ha producido un error al obtener los Flows de la PowerApps");
        }

        console.log("> Resultado: ", result);

        //Send the information
        res.json(result);
    })
});

/**
 * End point to insert data to the "powerApps" table
 */
router.post('/insert-data-powerApps', (req, res) => {
    //Store the values from the powerApps form
    const { title, owner, type, description, created, url, sharepoint, powerAutomate, urlJoined, factoriesJoined } = req.body;

    //Store the array with the information of the Power Automate
    const powerAutomateArray = JSON.parse(req.body.powerAutomateArray);

    console.log("> POWER AUTOMATE ARRAY: ", powerAutomateArray);

    //Create the insert query
    const query = 'INSERT INTO powerApps (title, owner, type, description, created, urlToProject, sharePoint, powerAutomate, userID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    //Make the query to insert the data of the powerApp
    db.query(query, [title, owner, type, description, created, url, sharepoint, powerAutomate, req.session.userId], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("No se han podido añadir los datos a la tabla de Power Apps\n", err);
            res.status(500).send("Error a la hora de insertar los datos");
            return

            //In other case...
        } else {
            console.log("> Datos añadidos a la tabla de PowerApps", result)

            //Store the ID of the last insert powerAp
            const idPowerApp = result.insertId;

            //Store the URLs split by ";""
            var urls = urlJoined.split(';');

            //Iterate throw the URLs
            urls.forEach(url => {
                //Create a query to insert the associate sites using the id of the powerApp and the URL
                const query = "INSERT INTO associatedSites (idPowerApp, urlSite) VALUES (?, ?)";

                //Make the query
                db.query(query, [idPowerApp, url], (err, result) => {
                    if (err) {
                        console.log("> Se produjo un error a la hora de insertar las URL asociadas a ", idPowerApp);
                        res.status(500).send("Error a la hora de insertar los datos de los sitios asociados");
                        return;
                    }

                    //Store the factories split by (";")
                    var factories = factoriesJoined.split(';');

                    //Iterate throws the factories
                    factories.forEach(factory => {
                        //Create a query to insert the factories using the ID of the powerApp and the factory
                        const queryFactory = "INSERT INTO factories_powerApp (idPowerApp, factory) VALUES (?, ?)";

                        console.log("> Factoria: ", factory);

                        //Execute the query
                        db.query(queryFactory, [idPowerApp, factory], (err, result) => {
                            if (err) {
                                console.error('Ocurrio un problema a la hora de añadir las factoias ', err);
                                res.status().send('Error a la hora de insertar los datos de las factorias');
                                return;
                            }

                            //If there is Power Automates...
                            if (powerAutomateArray.length !== 0) {
                                //Iterate throw the array
                                powerAutomateArray.forEach(item => {
                                    //Execiute the query
                                    db.query("INSERT INTO powerAutomate (flowName, owner, state, description, url, userID, idPowerApp) VALUES (?, ?, ?, ?, ?, ?, ?)", [item[0], item[2], item[3], item[4], item[5], req.session.userId, idPowerApp], (err, result) => {
                                        if (err) {
                                            console.error("> Se ha producido un error: ", err)
                                        }
                                    });
                                });
                            }

                            console.log("Datos añadidos");
                        });
                    });
                });
            });

            res.redirect('/library/successPowerApps');
        }
    });
});

//Configure the destination and the name of the files to be stored for the best practise
const storage = multer.diskStorage({
    //Destination
    destination: function (req, file, cb) {
        //const folderPath = join(__dirname, `/public/uploads/buenasPracticas/${req.session.factory}/${req.session.userId}/${req.session.titleBestPractise}_${req.session.category}`);
        const folderPath = join(__dirname, `/public/uploads/buenasPracticas/${idBestPractise}`);
        console.log("> FOLDER PATH FINAL => ", folderPath, "\n>> Dirname: ", __dirname);

        //Call the method to check if folder exist
        checkFolder(folderPath);

        cb(null, folderPath);
    },

    //Name of the files
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

//Configure the destination and the name of the files to be stored for the blueprint
const storageBlueprints = multer.diskStorage({
    //Destination
    destination: function (req, file, cb) {
        console.log("> BLUEPRINT TITLE: ", titleBlueprint)
        const folderPath = join(__dirname, `/public/uploads/planos/${titleBlueprint}`);

        //Call the method to check if the folder exist
        checkFolder(folderPath);
        cb(null, folderPath);
    },

    //Name of the files
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

//Configuramos el destino para los ficheros del DataDriven
const storageDataDriven = multer.diskStorage({
    //Destino
    destination: function (req, file, cb) {
        //Almacenamos en una variable la carpeta padre
        const folderPath = join(__dirname, `/public/uploads/dataDriven/${idDataDriven}`);

        //Llamamos a la función para comprobar si la carpeta existe
        checkFolder(folderPath);

        cb(null, folderPath);
    },

    //Nombre de los ficheros
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

/**
 * Function to check if the folder exists... if doest exist will be created
 * @param {string} path Represent the path of the folder
 */
function checkFolder(path) {
    console.log("> Dentro del metdo checkFolders() --> ", path)
    if (!fs.existsSync(path)) {
        console.log("> La carpeta NO existe --> creando la carpeta: ", path);
        fs.mkdirSync(path, { recursive: true });
    } else {
        console.log("> La carpeta existe");
    }
}

/**
 * Function to convert the files into a PDF
 * @param {string} path Variable that contains the path of the best practise folder
 */
async function convertFiles(folderPath) {
    //Create a a variable to store the real path using the __dirname
    const realPath = join(__dirname, "public", folderPath);

    console.log("> Dentro del método para convertir los ficheros a PDF\n> PATH: ", folderPath, "\nReal path: ", realPath);

    //Create a variable to store off extensions files
    const exludeExtensions = [".png", ".img", ".gif", ".jpg", ".jpeg", ".pdf", ".mp3", ".mp4", ".MP4", ".MP3"];

    //Call the method to read the files
    fs.readdir(realPath, async (err, files) => {
        //If an error ocurred...
        if (err) {
            return console.error("> Error a la hora de obtener los ficheros de un directorio --> ", err);
        }

        //Store the files using the exclude extensions
        const filesToConvert = files.filter(file => {
            console.log("> Ficheros detectados: ", file);

            //Store the extension of the actual file
            const ext = extname(file).toLowerCase();

            if (ext === '.mp4' || ext === '.mp3' || ext === '.MP4' || ext === '.MP3') {
                const timeout = setTimeout(() => {
                    console.log("> Dentro del end point de los videos");
                }, 10000);
            }

            //Return the files that not match with the array of the exclude extensions
            return !exludeExtensions.includes(ext);
        });

        //Iterate throw the files
        for (const file of filesToConvert) {
            //Store in a variable the LibreOffice command to export the file into a PDF
            const command = `soffice --headless --convert-to pdf "${file}"`;

            //Store in a variable the final command
            const finalCommand = `cd "${realPath}" && ${command}`;

            //Create a try-catch to control mthe fails
            try {
                //Create a await Promise to execute the command
                await new Promise((resolve, reject) => {
                    //Execute the commando
                    exec(finalCommand, (error, stdout, stderr) => {
                        //If an error ocurred...
                        if (error) {
                            //Call the method to try again
                            reject(error);

                            //In other case...
                        } else {
                            //Call the method to try again
                            resolve(stdout);
                        }
                    });
                });
                //Add a delay for each conversions
                await delay(1000);
            } catch (error) {
                console.error("> Error durante la conversión: ", error);
            }

            //Create a variable to store the old files of the best practise
            const filePath = join(realPath, file);

            //Call the method to delete the file
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("> Error al eliminar el archivo: ", err);
                } else {
                    console.log("> Archivo eliminado correctamente: ", filePath);
                }
            });
        }
    });
}

/**
 * Function to make a delay
 * @param {int} ms Argument that contain the miliseconds
 * @returns A promise to make a delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Initialize multer for the best practise
const upload = multer({ storage: storage })

//Initialize multer for the blueprints
const uploadBlueprints = multer({ storage: storageBlueprints })

//Inicializamos el multer para el Data Driven
const uploadDataDriven = multer({ storage: storageDataDriven });

/**
 * End point para establecer el ID del Data Driven
 */
router.post('/setId-DataDriven/:id', (req, res) => {
    //Establecemos el ID en la variable global
    idDataDriven = req.params.id;
});

/**
 * End point to apply the best practise
 */
router.post('/applyBestPractise', (req, res) => {
    //Store the information into variables
    const { idBestPractise, factoryInput, statusInput, reasonInput, budgetForTheYear, estimatedDateInput } = req.body;

    console.log("> ID de la buena practica: ", idBestPractise, "\t Factory: ", factoryInput, "\t Status: ", statusInput, "\t Estimated date: ", estimatedDateInput, "\tReason: ", reasonInput);

    //Execute the query
    db.query("INSERT INTO bestPractiseApplied (idBestPractise, factory_applied, status, reason, budgetForYear, estimatedDate, userID) VALUES (?, ?, ?, ?, ?, ?, ?)", [idBestPractise, factoryInput, statusInput, reasonInput, budgetForTheYear, estimatedDateInput, req.session.userId], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error a la hora de aplicar la buena practica --> ", err);
            res.status(500).send("Error to apply the best practise");
            return
        }

        console.log("> Datos insertados de forma correcta\n", result);
    });

});

/**
 * Function to change the name of the file with the new extension
 * @param {string} fileName Argument that contains the file name
 * @param {string} replacement Argument that contains the extension of the new name file
 * @returns The new file name with the new extension
 */
function replaceExtension(fileName, replacement) {
    /*Variables to store the infromation of the file name */
    let finalFileName;
    let baseFileName;

    //If the extension of the file is a video or audio
    if (extname(fileName) === '.mp4' || extname(fileName) === '.mp3' || extname(fileName) === '.MP4' || extname(fileName) === '.MP3') {
        //Store the actual name of the file with the actual extension
        finalFileName = fileName;

        //In other case...
    } else {
        //Store the name of the tile without the extension
        baseFileName = basename(fileName, extname(fileName));

        //Store the name of the file with the new extension
        finalFileName = baseFileName + "." + replacement;
    }

    //Return the new name file
    return finalFileName;
}

/**
 * End point to add a new blue print
 */
app.post('/insert-data-blueprints', uploadBlueprints.fields([{ name: 'blueprintImage' }, { name: 'blueprintFile' }]), function (req, res) {
    //Store the data from the form
    const { title, description } = req.body;

    //Assign the title value into the global title of the blueprint
    titleBlueprint = title;

    //Store the image input
    const image = req.files.blueprintImage ? req.files.blueprintImage[0] : null;

    //Store the file input
    const file = req.files.blueprintFile ? req.files.blueprintFile[0] : null;

    //Store the userID (IPN)
    const userID = req.session.userId;

    //Store the image path
    const imagePath = image ? image.path : null;

    //Store the image name
    const imageName = image ? image.originalname : null;

    //Store the file path
    const filePath = file ? file.path : null;

    //Store the name of the file
    const nameFile = file ? file.originalname : null;

    //Store the query to insert the new blueprint
    const query = "INSERT INTO blueprints (title, description, userID) VALUES (?, ?, ?)";

    //Execute the query
    db.query(query, [title, description, userID], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error('No se han podido añadir ñlos datos del plano 3D, ', err);
            res.status(500).send('Error al insertar los datos');
            return;
        }

        idBlueprint = result.insertId;

        //Store the real path of the file
        const realFilePath = join(__dirname, `/public/uploads/planos/${idBlueprint}/${nameFile}`);

        //Store the insert path of the image
        const insertImagePath = `/uploads/planos/${idBlueprint}/${imageName}`;

        //Store the real path of the image
        const realImagePath = join(__dirname, `/public/uploads/planos/${idBlueprint}/${imageName}`);

        //Store the insert path of the file
        const insertFilePath = `/uploads/planos/${idBlueprint}/${nameFile}`;

        //Store the root path of the bluprint
        const path = join(__dirname, `/public/uploads/planos/${idBlueprint}`);

        console.log("ID blueprint: ", idBlueprint);

        //Call the method to check if the folder exist
        checkFolder(path);

        console.log("\nIMAGE PATH: ", imagePath, "\tREAL IMAGE PATH: ", realImagePath);

        //Move the image file
        fs.rename(imagePath, realImagePath, function (err) {
            if (err) {
                console.error('No se ha podido mover el fichero de la imagen');
            } else {
                console.log("Se ha movido la imagen");
            }
        });

        //Move the .stl file
        fs.rename(filePath, realFilePath, function (err) {
            if (err) {
                console.error('No se ha podido mover el fichero');
            }
        });

        //Insert the paths
        db.query("UPDATE blueprints SET image = ?, pathSTL = ? WHERE id = ?", [insertImagePath, insertFilePath, idBlueprint], (err, result) => {
            //If an error ocurred...
            if (err) {
                console.error("> Error a la hora de añadir los path al elemento de la base de datos: ", err);
            }
        });

        console.log("> TITLE BLUEPRINT: ", titleBlueprint);

        //Initialize void variable of the global blueprint title
        titleBlueprint = '';

        //Redirect to the success add adding
        res.redirect('/library/success3dModel');
    });
});

/**
 * End point to add the new comments to one best practise
 */
router.post('/insert-data-commentBestPractise/:id/:comment', (req, res) => {
    console.log("> ENTRANDO EN EL END POINT PARA AÑADIR LOS COMENTATIOS");
    //Store the ID of the best practise
    const id = req.params.id;

    //Store the comment
    const comment = req.params.comment;

    //Store the IPN of the user
    const userId = req.session.userId;

    console.log("\n> ID BEST PRACTISE: ", id, "\t COMMENT: ", comment, "\t USER ID: ", userId, "\tUSERR EMAIL: ", req.session.userEmail);

    //Store the query to insert the best practise
    const query = "INSERT INTO bestPractiseComments (idBestPractise, comment, userID, userEmail) VALUES (?, ?, ?, ?)";

    //Execute the query
    db.query(query, [id, comment, userId, req.session.userEmail], (err, result) => {
        if (err) {
            console.error('No se ha podido añadir el nuevo comentario, ', err);
            res.status(500).send('Error al insertar los datos');
            return
        }

        res.status(200).json({ message: 'Comment inserted successfully' });
    });
});

/**
 * End point to initialize the id of the best practise for Multer
 */
router.post('/setIdBestPractise/:idBestPractise', (req, res) => {
    //Store the ID of the best practise from the params
    idBestPractise = req.params.idBestPractise;

    //Send the status
    res.status(200).json({ message: "idBestPractise asignado correctamente" });
});

/**
 * End point to select all the comments using the ID of the best practise
 */
router.get('/getCommentsBestPractise/:id', (req, res) => {
    //Store the ID of the best practise
    const idBestPractise = req.params.id;

    //Store the query
    const query = "SELECT * FROM bestPractiseComments WHERE idBestPractise = ? ORDER BY date DESC";

    //Execute te query
    db.query(query, [idBestPractise], (err, result) => {
        if (err) {
            console.error('Error a la hora de obtener los comentarios de la buenas práctise: ', err);
            res.status(500).send('Error al obtener los datos');
            return;
        }

        //Send the data
        res.json(result);
    })
});

/**
 * End point to delete a comment from the best practise
 */
router.delete('/deleteComment/:idComment', (req, res) => {
    //Store the ID of the comment from the params
    const idComment = req.params.idComment;

    console.log("> ID del comentario: ", idComment);

    //Execute the query
    db.query("DELETE FROM bestPractiseComments WHERE id = ?", [idComment], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Se ha producido un error a la hora de eliminar el comentario: ", err);
        }

        //Send the status
        res.status(200).send("Comentario eliminado con exito");
    });
});

/**
 * End point to upload the comment
 */
router.post('/updateComment/:idComment/:comment', (req, res) => {
    //Store the ID and the comment
    const idComment = req.params.idComment;
    const comment = req.params.comment;

    //Execute the query
    db.query("UPDATE bestPractiseComments SET comment = ? WHERE id = ?", [comment, idComment], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Se ha producido un error a la hora de actualizar el comentario: ", err);
        }

        //Send the status
        res.status(200).send("Comentario actualizado con exito");
    })
});

/**
 * End point to obteing the tags using the ID of the best practise
 */
router.get('/getTags/:id', (req, res) => {
    //Store the ID of the best practise
    const idBestPractise = req.params.id;

    //Execute the query
    db.query("SELECT keyword FROM best_practise WHERE id = ?", [idBestPractise], (err, result) => {
        //If an error ocurred..
        if (err) {
            console.error('Error a la hora de obtener los tags de la buena práctica con ID ', id, ' --> ', err);
            res.status(500).send('Error al obtener los datos');
            return;
        }

        //Send the data
        res.json(result);
    })
});

/**
 * End point to insert the data on the "bestPractise" table
 */
router.post('/insert-data-bestPractise', (req, res) => {
    //Store the values from the best practise form
    let { title, factory, metier, line, technology, category, categorization, tags, owner } = req.body;

    //Create an array to store the categories
    let finalCategory = [];

    //Check if the category variable isnt an array
    if (!Array.isArray(category)) {
        category = [category]
    }

    //Iterate throw the categories
    category.forEach(item => {
        finalCategory.push(item);
    });

    //Create an array with the values from the array
    const finalCategoryString = finalCategory.join(";");

    //Create and store the tags parse into JSON
    let finalTags = JSON.parse(tags);

    //Store the userID (IPN)
    const userId = req.session.userId;

    //Store the values from the tags using map
    const result = finalTags.map(item => item.value).join(';');

    //Create a query to insert the best practise
    const query = 'INSERT INTO best_practise (title, factory, metier, line, technology, category, categorization, keyword, userID, owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    //Execute the query
    db.query(query, [title, factory, metier, line, technology, finalCategoryString, categorization, result, userId, owner], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("No se ha podido añadir los datos a la tabla best practise, ", err);
            res.status(500).send("Error al insertar los datos");
        }

        /*Initialize the global variables to control de upload folders */
        req.session.titleBestPractise = title;
        req.session.category = category;
        req.session.factory = factory;
        req.session.bestPractiseId = result.insertId;

        idBestPractise = result.insertId;

        //Save the sessions
        req.session.save((err) => {
            if (err) {
                console.error("Error saving session:", err);
                return res.status(500).send("Internal session error.");
            }
            res.status(200)
        });
    });
});

/**
 * End point to select the ID and the title from the last best practise using the IPN
 */
router.get('/lastBestpractise', (req, res) => {
    //Execute the query
    db.query("SELECT id, title FROM best_practise WHERE userID = ? ORDER BY id DESC LIMIT 1", (req.session.userId), (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Se ha producido un error al obtener los ultimos datos de última practica añadida: ", err);
        }

        console.log("> Resultado: ", result);

        //Send the information
        res.json(result);
    })
});

/**
 * Get the path files using the ID of the best practise
 */
router.get('/getFiles-bestPractise/:id', (req, res) => {
    //Store the ID of the best practise
    const id = req.params.id;

    //Create a query to select the paths of the files using the id of the best practise
    const query = 'SELECT path, before_file, id FROM files_best_practise WHERE id_best_practise = ?';

    //Make the query to select the paths
    db.query(query, [id], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error('No se ha podido obtener los path de los ficheros del best practise: ', err);
            res.status(500).send('Error al obtener los datos');
            return;
        }

        console.log(result);
        res.json(result);
    });
})

/**
 * End point to insert data to the "spotfire" table and the "spotfire_functions_subfunctions" table
 */
router.post('/insert-data-spotfire', (req, res) => {
    //Store the values from the data souce form
    const { title, factory, typeReport, platform, location, description, contact, videoTutorial, dataSource, sentElementals, renault, comments } = req.body;

    //Store the IPN of the loggin user
    const userId = req.session.userId;

    //Temp variable to store the same information has the typeReport
    let searchReport = typeReport;

    //Check the value from the variables
    if (searchReport === 'Performance') {
        //Reassign "Costs" value if the value was "Performance"
        searchReport = 'Costs';
    }

    //Make the query
    db.query('SELECT title FROM spotfire WHERE title LIKE ?', [searchReport[0] + '%'], (err, result) => {
        if (err) {
            console.error('Ocurrio un problema a la hora de recuperar los titulos por tipo de reporte');
            res.status(500).send('Error al obtener los titulos por tipo de reporte');
            return
        }

        //Define an array to store all the numbers of the title
        const numbers = [];

        //Iterate throw the loop with the data
        result.forEach(row => {
            //Create a regex pattern
            const findNumbers = row.title.match(/\d+/g);

            //If the regex was successfull
            if (findNumbers) {
                //Convert the string numbers into int number to delete the "0"
                const formatNumber = findNumbers.map(num => parseInt(num, 10));

                console.log('> Format Number: \n', formatNumber);

                //Add the number to the numbers array
                numbers.push(formatNumber[0]);
            }
        });

        //Order the array with the numbers by type report
        numbers.sort((a, b) => a - b);

        console.log('Array de numeros encontrados y ordenados:\n', numbers);

        //Create a variable to store the last number
        let lastNumber = 1;

        //Iterate throw the array with th nunbers
        for (let i = 0; i < numbers.length - 1; i++) {
            //If the intermediate number of the sequence dosest exist
            if (numbers[i + 1] !== numbers[i] + 1) {
                //Assign the last number of the intermidiate sequence and +1
                lastNumber = numbers[i] + 1;
                break;

                //If doest have any intermediate number, take the lenght of the array numbers and +1
            } else {
                lastNumber = numbers[numbers.length - 1] + 1;
            }
        }

        console.log(">> ULTIMO NUMERO: ", lastNumber);

        //Format the last number with 3 caracters with 0
        const lastNumberFormat = lastNumber.toString().padStart(3, '0');

        //Create the final title with the firts caracter, the number, the dot and the title value
        const finalTitle = searchReport[0] + lastNumberFormat + ". " + title;

        //Insert into the "spotfire" table
        const spotfireQuery = 'INSERT INTO spotfire (title, factory, type_report, platform, location, description, contact, video_tutorial, data_source, sent_elementals, renault, comments, userID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(spotfireQuery, [finalTitle, factory, typeReport, platform, location, description, contact, videoTutorial, dataSource, sentElementals, renault, comments, userId], (err, result) => {
            if (err) {
                console.error('Error al insertar datos en la tabla "spotfire":', err);
                res.status(500).send('Error al insertar datos en la tabla "spotfire"');
                return;
            }

            //Get the ID of the newly inserted row in the "spotfire" table
            const spotfireId = result.insertId;

            //Insert into the "spotfire_function_subfunction" table

            //HTL
            const functionHLT = ['function1'];
            const subfunctionHLT = ['function-1-subfunction-1', 'function-1-subfunction-2', 'function-1-subfunction-3', 'function-1-subfunction-4'];

            //Motores
            const functionMotores = ['function2']
            const subfunctionMotores = ['function-2-subfunction-5', 'function-2-subfunction-6', 'function-2-subfunction-7']

            //Sevilla
            const functionSevilla = ['function3']
            const subfunctionSevilla = ['function-3-subfunction-8', 'function-3-subfunction-9', 'function-3-subfunction-10']

            //Aveiro
            const functionAveiro = ['function4']
            const subfunctionAveiro = ['function-4-subfunction-11', 'function-4-subfunction-12', 'function-4-subfunction-13']

            //Oyak
            const functionOyak = ['function5']

            //Rumania
            const functionRumania = ['function6']

            //Curitiba
            const functionCuritiba = ['function7']

            //Los Andes
            const functionLosAndes = ['function8']

            //Argentina
            const functionArgentina = ['function9']

            //Query to INSERT the data to functions/subfunctions
            const spotfireFunctionSubfunctionQuery = 'INSERT INTO spotfire_functions_subfunctions (spotfire_id, function_id, subfunction_id) VALUES (?, ?, ?)';

            //Iterate over selected functions and subfunctions and insert into the table -> HLT
            functionHLT.forEach(functionId => {
                if (req.body[functionId] === 'on') {
                    functionId = functionId.match(/.$/)[0];
                    let subID = null;

                    //Check if any subfunction is checked
                    let subfunctionSelected = false;

                    subfunctionHLT.forEach(subfunctionId => {
                        if (req.body[subfunctionId] === 'on') {
                            subID = subfunctionId.match(/.$/)[0];
                            subfunctionSelected = true;
                            db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, subID], (err, result) => {
                                if (err) {
                                    console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                                    res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                                    return;
                                }
                                console.log("Datos añadidos a la tabla funciones");
                            });
                        }
                    });

                    if (!subfunctionSelected) {
                        db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, subID], (err, result) => {
                            if (err) {
                                console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                                res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                                return;
                            }
                            console.log("Datos añadidos a la tabla funciones");
                        });
                    }
                }
            });

            //Iterate over selected functions and subfunctions and insert into the table -> Motores
            functionMotores.forEach(functionId => {
                if (req.body[functionId] === 'on') {
                    functionId = functionId.match(/.$/)[0];
                    let subID = null;

                    //Check if any subfunction is checked
                    let subfunctionSelected = false;

                    subfunctionMotores.forEach(subfunctionId => {
                        if (req.body[subfunctionId] === 'on') {
                            subID = subfunctionId.match(/.$/)[0];
                            subfunctionSelected = true;
                            db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, subID], (err, result) => {
                                if (err) {
                                    console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                                    res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                                    return;
                                }
                                console.log("Datos añadidos a la tabla funciones");
                            });
                        }
                    });

                    if (!subfunctionSelected) {
                        db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, subID], (err, result) => {
                            if (err) {
                                console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                                res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                                return;
                            }
                            console.log("Datos añadidos a la tabla funciones");
                        });
                    }
                }
            });

            //Iterate over selected functions and subfunctions and insert into the table -> Sevilla
            functionSevilla.forEach(functionId => {
                if (req.body[functionId] === 'on') {
                    functionId = functionId.match(/.$/)[0];
                    let subID = null;

                    //Check if any subfunction is checked
                    let subfunctionSelected = false;

                    subfunctionSevilla.forEach(subfunctionId => {
                        if (req.body[subfunctionId] === 'on') {
                            //Check if the subfunctionId ends with one or two digits
                            const regexResult = subfunctionId.match(/\d{1,2}$/);
                            if (regexResult) {
                                subID = regexResult[0];
                            }
                            subfunctionSelected = true;
                            db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, subID], (err, result) => {
                                if (err) {
                                    console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                                    res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                                    return;
                                }
                                console.log("Datos añadidos a la tabla funciones");
                            });
                        }
                    });

                    //Si no hay subfunciones seleccionadas, subID se mantiene como null
                    if (!subfunctionSelected) {
                        db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, subID], (err, result) => {
                            if (err) {
                                console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                                res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                                return;
                            }
                            console.log("Datos añadidos a la tabla funciones");
                        });
                    }
                }
            });

            //Iterate over selected functions and subfunctions and insert into the table -> Aveiro
            functionAveiro.forEach(functionId => {
                if (req.body[functionId] === 'on') {
                    functionId = functionId.match(/.$/)[0];
                    let subID = null;

                    //Check if any subfunction is checked
                    let subfunctionSelected = false;

                    subfunctionAveiro.forEach(subfunctionId => {
                        if (req.body[subfunctionId] === 'on') {
                            subID = subfunctionId.match(/.{2}$/)[0];
                            subfunctionSelected = true;
                            db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, subID], (err, result) => {
                                if (err) {
                                    console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                                    res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                                    return;
                                }
                                console.log("Datos añadidos a la tabla funciones");
                            });
                        }
                    });

                    if (!subfunctionSelected) {
                        db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, subID], (err, result) => {
                            if (err) {
                                console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                                res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                                return;
                            }
                            console.log("Datos añadidos a la tabla funciones");
                        });
                    }
                }
            });

            //Insert Oyak into the table
            functionOyak.forEach(functionId => {
                if (req.body[functionId] === 'on') {
                    functionId = functionId.match(/.$/)[0];
                    db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, null], (err, result) => {
                        if (err) {
                            console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                            res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                            return;
                        }

                        console.log("Datos añadidos a la tabla funciones")
                    });
                }
            })

            //Insert Rumania into the table
            functionRumania.forEach(functionId => {
                if (req.body[functionId] === 'on') {
                    functionId = functionId.match(/.$/)[0];
                    db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, null], (err, result) => {
                        if (err) {
                            console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                            res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                            return;
                        }

                        console.log("Datos añadidos a la tabla funciones")
                    });
                }
            })

            //Insert Rumania into the table
            functionCuritiba.forEach(functionId => {
                if (req.body[functionId] === 'on') {
                    functionId = functionId.match(/.$/)[0];
                    db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, null], (err, result) => {
                        if (err) {
                            console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                            res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                            return;
                        }

                        console.log("Datos añadidos a la tabla funciones")
                    });
                }
            })

            //Insert Los Andes into the table
            functionLosAndes.forEach(functionId => {
                if (req.body[functionId] === 'on') {
                    functionId = functionId.match(/.$/)[0];
                    db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, null], (err, result) => {
                        if (err) {
                            console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                            res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                            return;
                        }

                        console.log("Datos añadidos a la tabla funciones")
                    });
                }
            })

            //Insert Argentina into the table
            functionArgentina.forEach(functionId => {
                if (req.body[functionId] === 'on') {
                    functionId = functionId.match(/.$/)[0];
                    db.query(spotfireFunctionSubfunctionQuery, [spotfireId, functionId, null], (err, result) => {
                        if (err) {
                            console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                            res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                            return;
                        }

                        console.log("Datos añadidos a la tabla funciones")
                    });
                }
            })

            console.log("> DATOS AÑADIDOS: ", result);

            res.redirect('/library/successDataReport');
        });
    })
});

/**
 * Query to update the PowerApps source
 */
router.post('/updatePowerApps', (req, res) => {
    //Store the values from the powerApps form
    const { id, title, owner, type, description, created, url, sharepoint, powerAutomate, powerAutomateName, urlJoined, factoriesJoined } = req.body;

    //Store the array with the information of the Power Automate
    const powerAutomateArray = JSON.parse(req.body.powerAutomateArray);

    console.log("> URL SITES: ", urlJoined, "\n> FACTORIESJOINED -------> ", factoriesJoined);

    //Store the update query
    const query = 'UPDATE powerApps SET title = ?, owner = ?, type = ?, description = ?, created = ?, urlToProject = ?, sharePoint = ?, powerAutomate = ?, powerAutomateName = ? WHERE id = ?';

    //Make the update query
    db.query(query, [title, owner, type, description, created, url, sharepoint, powerAutomate, powerAutomateName, id], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("No se han podido actualizar los datos", err)
            res.status(500).send("Error al actualizar los elementos");
            return;

            //In other case... we will delete the associated sites 
        } else {
            //Create the delete query using the ID of the updated powerApp
            const deleteQuery = 'DELETE FROM associatedSites WHERE idPowerApp = ?';

            //Make the query to delete the associated sites 
            db.query(deleteQuery, [id], (err, result) => {
                //If an error ocurred...
                if (err) {
                    console.error('> No se han podido eliminar las listas asociadas con el ID de powerApp ', id, "\n> Error: ", err);
                    res.status(500).send('Error al eliminar los elementos');
                    return;
                }

                //Store the URLs splited by ";"
                var urls = urlJoined.split(';');

                //Iterate throw the URLs
                urls.forEach(url => {
                    console.log("> URLS: ", url);
                    //Create a query to insert the associated sites 
                    const query = "INSERT INTO associatedSites (idPowerApp, urlSite) VALUES (?, ?)";

                    //Make the query to insert the associated sites
                    db.query(query, [id, url], (err, result) => {
                        if (err) {
                            console.log("> Se produjo un error a la hora de insertar las URL asociadas a ", idPowerApp);
                            res.status(500).send("Error a a hora de insertar los datos de los sitios asociados");
                            return;
                        }
                    });
                });

                //Execute the query to delete the factories using the ID of the powerApp
                db.query('DELETE FROM factories_powerApp WHERE idPowerApp = ?', [id], (err, result) => {
                    //If an error ocurred...
                    if (err) {
                        console.error('Error al eliminar las factories de la powerApp', err);
                        res.status().send('Error a la hora de eliminar las factories de la PowerApp');
                        return;
                    }

                    //Store the factories splited by ";"
                    var factory = factoriesJoined.split(';');

                    //Iterate throw the factories
                    factory.forEach(item => {
                        //Execute the query to isnert the factories
                        db.query('INSERT INTO factories_powerApp (idPowerApp, factory) VALUES (?, ?)', [id, item], (err, result) => {
                            //If an error ocurred...
                            if (err) {
                                console.error('Error a la hora de insertar las factories');
                                res.status(500).send('No se han podido insertar las factories');
                                return;
                            }
                        });
                    });
                });

                //Check if there is Power Automates...
                if (powerAutomateArray.length !== 0) {
                    //Execute the query to delete the PowerAutomate using the ID of the PowerApps
                    db.query("DELETE FROM powerAutomate WHERE idPowerApp = ?", [id], (err, result) => {
                        //If an error ocurred...
                        if (err) {
                            console.log("> Se ha producido un error a la hora de eliminar los PowerAutomates de las PowerApps: ", err);
                        }

                        //Iterate throw the array
                        powerAutomateArray.forEach(item => {
                            //Execute the query to insert the information
                            db.query("INSERT INTO powerAutomate (flowName, owner, state, description, url, userID, idPowerApp) VALUES (?, ?, ?, ?, ?, ?, ?)", [item[0], item[2], item[3], item[4], item[5], req.session.userId, id], (err, result) => {
                                if (err) {
                                    console.error("> Se ha producido un error: ", err)
                                }
                            });

                            console.log("> Nuevos datos de los PowerAutomate insertados: ", result);
                        })
                    })
                }
            });

            //Redirect to the success edit PowerApp
            res.redirect('/library/successEditPowerApps');
        }
    });
});

/**
 * End point to update the Blueprint
 */
app.post('/editBlueprint', (req, res) => {
    //Store the values from the blueprint form
    const title = req.body.title, description = req.body.description, idBlueprint = req.body.idBlueprint;

    console.log("Title: ", title, "\tDescription: ", description);

    //Execute the query
    db.query("UPDATE blueprints SET title = ?, description = ? WHERE id = ?", [title, description, idBlueprint], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.log('No se han podido actualizar los elementos del plano 3D');
            res.status(500).send('Error al insertar los datos');
            return;
        }

        //Redirect to the success edit model
        res.redirect('/library/successEditModel');
    });
});

/**
 * End point to update the App
 */
router.post('/updateApp', (req, res) => {
    //Store the values from the app form
    const { ciNumber, shortName, KMLongName, KMShortName, longName, type, sia, installStatus, criticality, supportGroups, bussinesLine, groupLevelUsage, ownedBy, managedByOrgType, ledBy, developedBy, hostingProvider, executionPlatform, domainIRN, subDomain, cmdbDescription, created, createdBy, updated, updatedBy, id } = req.body;

    //Create a query to update the apps
    const query = "UPDATE app SET ciNumber = ?, shortName = ?, KMLongname = ?, KMShortName = ?, longName = ?, type = ?, sia = ?, installStatus = ?, criticality = ?, supportGroups = ?, bussinesLine = ?, groupLevelUsage = ?, ownedBy = ?, managedByOrgType = ?, ledBy = ?, developedBy = ?, hostingProvider = ?, executionPlatform = ?, domainIRN = ?, subDomain = ?, cmdbDescription = ?, created = ?, createdBy = ?, updated = ?, updatedBy = ? WHERE id = ?"

    //Make the query to update the apps
    db.query(query, [ciNumber, shortName, KMLongName, KMShortName, longName, type, sia, installStatus, criticality, supportGroups, bussinesLine, groupLevelUsage, ownedBy, managedByOrgType, ledBy, developedBy, hostingProvider, executionPlatform, domainIRN, subDomain, cmdbDescription, created, createdBy, updated, updatedBy, id], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error('Error al actualizar los datos', err);
            res.status(500).send('Error al actualizar los elementos', err);
            return;

            //In other case...
        } else {
            console.log('> Información actualizada: ', result);

            //Redirect to the success edit app
            res.redirect('/library/successEditApp');
        }
    });
});

/**
 * End point to update the data source and update the function/subfunction
 */
router.post('/updateSpotfire', (req, res) => {
    //Store the values from the data source form
    const { title, factory, typeReport, platform, location, description, contact, videoTutorial, dataSource, sentElementals, renault, comments, id } = req.body;

    //Create a query to update the data source
    const spotfireUpdateQuery = "UPDATE spotfire SET title = ?, factory = ?, type_report = ?, platform = ?, location = ?, description = ?, contact = ?, video_tutorial = ?, data_source = ?, sent_elementals = ?, renault = ?, comments = ? WHERE id = ?"

    //Function to update the data anylise
    db.query(spotfireUpdateQuery, [title, factory, typeReport, platform, location, description, contact, videoTutorial, dataSource, sentElementals, renault, comments, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar los datos', err);
            res.status(500).send('Error al actualizar los elementos', err);
            return;
        }

        //Create a query to delete the function/subfunctions using the ID of the data source
        const functionSufunctionQueryDelete = "DELETE FROM spotfire_functions_subfunctions WHERE spotfire_id = ?";

        //Function to delete the function/subfunction using the data source ID
        db.query(functionSufunctionQueryDelete, [id], (err, result) => {
            if (err) {
                console.error('Error al actualizar los datos', err);
                res.status(500).send('Error al actualizar los elementos', err);
                return;
            }

            //Call the method to insert the functions and the subfunctions
            insertFunctionsAndSubfunctions(id, req.body);

            //Redirect to the success edoto data source
            res.redirect("/library/successEdit")
        });
    });
});

/**
 * Function to insert the functions/subfunctions by the ID of the element into the "spotfire_functions_subfunctions"
 * @param {int} id Variable that represents the ID of the element
 * @param {*} body Represent the elements
 */
function insertFunctionsAndSubfunctions(id, body) {
    //Insert into the "spotfire_function_subfunction" table

    //HTL
    const functionHLT = ['function1'];
    const subfunctionHLT = ['function-1-subfunction-1', 'function-1-subfunction-2', 'function-1-subfunction-3', 'function-1-subfunction-4'];

    //Motores
    const functionMotores = ['function2']
    const subfunctionMotores = ['function-2-subfunction-5', 'function-2-subfunction-6', 'function-2-subfunction-7']

    //Sevilla
    const functionSevilla = ['function3']
    const subfunctionSevilla = ['function-3-subfunction-8', 'function-3-subfunction-9', 'function-3-subfunction-10']

    //Aveiro
    const functionAveiro = ['function4']
    const subfunctionAveiro = ['function-4-subfunction-11', 'function-4-subfunction-12', 'function-4-subfunction-13']

    //Oyak
    const functionOyak = ['function5']

    //Rumania
    const functionRumania = ['function6']

    //Curitiba
    const functionCuritiba = ['function7']

    //Los Andes
    const functionLosAndes = ['function8']

    //Argentina
    const functionArgentina = ['function9']

    //Query to INSERT the data to functions/subfunctions
    const spotfireFunctionSubfunctionQuery = 'INSERT INTO spotfire_functions_subfunctions (spotfire_id, function_id, subfunction_id) VALUES (?, ?, ?)';

    //Iterate over selected functions and subfunctions and insert into the table -> HLT
    functionHLT.forEach(functionId => {
        if (body[functionId] === 'on') {
            functionId = functionId.match(/.$/)[0];
            let subID = null;

            //Check if any subfunction is checked
            let subfunctionSelected = false;

            subfunctionHLT.forEach(subfunctionId => {
                if (body[subfunctionId] === 'on') {
                    subID = subfunctionId.match(/.$/)[0];
                    subfunctionSelected = true;
                    db.query(spotfireFunctionSubfunctionQuery, [id, functionId, subID], (err, result) => {
                        if (err) {
                            console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                            res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                            return;
                        }
                        console.log("Datos añadidos a la tabla funciones");
                    });
                }
            });

            if (!subfunctionSelected) {
                db.query(spotfireFunctionSubfunctionQuery, [id, functionId, subID], (err, result) => {
                    if (err) {
                        console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                        res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                        return;
                    }
                    console.log("Datos añadidos a la tabla funciones");
                });
            }
        }
    });

    //Iterate over selected functions and subfunctions and insert into the table -> Motores
    functionMotores.forEach(functionId => {
        if (body[functionId] === 'on') {
            functionId = functionId.match(/.$/)[0];
            let subID = null;

            //Check if any subfunction is checked
            let subfunctionSelected = false;

            subfunctionMotores.forEach(subfunctionId => {
                if (body[subfunctionId] === 'on') {
                    subID = subfunctionId.match(/.$/)[0];
                    subfunctionSelected = true;
                    db.query(spotfireFunctionSubfunctionQuery, [id, functionId, subID], (err, result) => {
                        if (err) {
                            console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                            res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                            return;
                        }
                        console.log("Datos añadidos a la tabla funciones");
                    });
                }
            });

            if (!subfunctionSelected) {
                db.query(spotfireFunctionSubfunctionQuery, [id, functionId, subID], (err, result) => {
                    if (err) {
                        console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                        res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                        return;
                    }
                    console.log("Datos añadidos a la tabla funciones");
                });
            }
        }
    });

    //Iterate over selected functions and subfunctions and insert into the table -> Sevilla
    functionSevilla.forEach(functionId => {
        if (body[functionId] === 'on') {
            functionId = functionId.match(/.$/)[0];
            let subID = null;

            //Check if any subfunction is checked
            let subfunctionSelected = false;

            subfunctionSevilla.forEach(subfunctionId => {
                if (body[subfunctionId] === 'on') {
                    //Check if the subfunctionId ends with one or two digits
                    const regexResult = subfunctionId.match(/\d{1,2}$/);
                    if (regexResult) {
                        subID = regexResult[0];
                    }
                    subfunctionSelected = true;
                    db.query(spotfireFunctionSubfunctionQuery, [id, functionId, subID], (err, result) => {
                        if (err) {
                            console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                            res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                            return;
                        }
                        console.log("Datos añadidos a la tabla funciones");
                    });
                }
            });

            //Si no hay subfunciones seleccionadas, subID se mantiene como null
            if (!subfunctionSelected) {
                db.query(spotfireFunctionSubfunctionQuery, [id, functionId, subID], (err, result) => {
                    if (err) {
                        console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                        res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                        return;
                    }
                    console.log("Datos añadidos a la tabla funciones");
                });
            }
        }
    });

    //Iterate over selected functions and subfunctions and insert into the table -> Aveiro
    functionAveiro.forEach(functionId => {
        if (body[functionId] === 'on') {
            functionId = functionId.match(/.$/)[0];
            let subID = null;

            //Check if any subfunction is checked
            let subfunctionSelected = false;

            subfunctionAveiro.forEach(subfunctionId => {
                if (body[subfunctionId] === 'on') {
                    subID = subfunctionId.match(/.{2}$/)[0];
                    subfunctionSelected = true;
                    db.query(spotfireFunctionSubfunctionQuery, [id, functionId, subID], (err, result) => {
                        if (err) {
                            console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                            res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                            return;
                        }
                        console.log("Datos añadidos a la tabla funciones");
                    });
                }
            });

            if (!subfunctionSelected) {
                db.query(spotfireFunctionSubfunctionQuery, [id, functionId, subID], (err, result) => {
                    if (err) {
                        console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                        res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                        return;
                    }
                    console.log("Datos añadidos a la tabla funciones");
                });
            }
        }
    });

    //Insert Oyak into the table
    functionOyak.forEach(functionId => {
        if (body[functionId] === 'on') {
            functionId = functionId.match(/.$/)[0];
            db.query(spotfireFunctionSubfunctionQuery, [id, functionId, null], (err, result) => {
                if (err) {
                    console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                    res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                    return;
                }

                console.log("Datos añadidos a la tabla funciones")
            });
        }
    })

    //Insert Rumania into the table
    functionRumania.forEach(functionId => {
        if (body[functionId] === 'on') {
            functionId = functionId.match(/.$/)[0];
            db.query(spotfireFunctionSubfunctionQuery, [id, functionId, null], (err, result) => {
                if (err) {
                    console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                    res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                    return;
                }

                console.log("Datos añadidos a la tabla funciones")
            });
        }
    })

    //Insert Rumania into the table
    functionCuritiba.forEach(functionId => {
        if (body[functionId] === 'on') {
            functionId = functionId.match(/.$/)[0];
            db.query(spotfireFunctionSubfunctionQuery, [id, functionId, null], (err, result) => {
                if (err) {
                    console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                    res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                    return;
                }

                console.log("Datos añadidos a la tabla funciones")
            });
        }
    })

    //Insert Los Andes into the table
    functionLosAndes.forEach(functionId => {
        if (body[functionId] === 'on') {
            functionId = functionId.match(/.$/)[0];
            db.query(spotfireFunctionSubfunctionQuery, [id, functionId, null], (err, result) => {
                if (err) {
                    console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                    res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                    return;
                }

                console.log("Datos añadidos a la tabla funciones")
            });
        }
    })

    //Insert Argentina into the table
    functionArgentina.forEach(functionId => {
        if (body[functionId] === 'on') {
            functionId = functionId.match(/.$/)[0];
            db.query(spotfireFunctionSubfunctionQuery, [id, functionId, null], (err, result) => {
                if (err) {
                    console.error('Error al insertar datos en la tabla "spotfire_function_subfunction":', err);
                    res.status(500).send('Error al insertar datos en la tabla "spotfire_function_subfunction"');
                    return;
                }

                console.log("Datos añadidos a la tabla funciones");
            });
        }
    });
}

/**
 * End point to select all the data from the "spotfire" table and the "spotfire_functions_subfunctions"
 */
router.get('/getSpotfire', (req, res) => {
    //Make the query to select all the data source and the associated sites
    db.query('SELECT s.id, s.title, s.factory, s.type_report, s.platform, s.location, s.description, s.contact, s.video_tutorial, s.data_source, s.sent_elementals, s.renault, s.comments, s.userID, f.function_name, sf.subfunction_name FROM spotfire s LEFT JOIN spotfire_functions_subfunctions sfs ON s.id = sfs.spotfire_id LEFT JOIN function f ON sfs.function_id = f.id LEFT JOIN subfunctions sf ON sfs.subfunction_id = sf.id', (err, result) => {
        if (err) {
            console.error('Error al obtener los datos de la base de datos:', err);
            res.status(500).send('Error al obtener los datos');
            return;
        }

        res.json(result);
    });
});

/**
 * End point to select all the best practise
 */
router.get('/getBestPractise', (req, res) => {
    //Create a variable to store the query
    const query = `
        SELECT
            bestPractise.*,
            (
                SELECT GROUP_CONCAT(files_best_practise.path SEPARATOR ',')
                FROM files_best_practise
                WHERE files_best_practise.id_best_practise = bestPractise.id
                AND (files_best_practise.before_file = 3)
            ) AS path
        FROM
            best_practise AS bestPractise
        ORDER BY
            bestPractise.id DESC;
    `;

    //Execute the query
    db.query(query, (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("Error a la hora de obtener los datos de la tabla de las buenas prácticas");
            res.status(500).send("Error al obtener los datos de la tabla de las buenas prácticas");
            return;
        }

        //Send the information
        res.json(result);

        console.log("> Resultado de las buenas prácticas: ", result);
    });
});

/**
 * End point to obteing the applied best practise
 */
router.get('/getAppliedBestPractise', (req, res) => {
    //Execute the query
    db.query("SELECT bpa.*, bp.title FROM bestPractiseApplied bpa JOIN best_practise bp ON bpa.idBestPractise = bp.id WHERE bpa.idBestPractise = bp.id", (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error a la hora de obtener las buenas practicas asociadas, ", err);
            res.status(500).send("Error while taking the information")
            return
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to update the applied best practise
 */
router.post('/updateApplyBestPractise', (req, res) => {
    //Store the information into variables
    let { idAppliedBestPractise, factoryInput, statusInput, reasonInput, estimatedDateInput } = req.body;

    //If the status is different than "Not applicable" option...
    if (statusInput != "Not applicable") {
        //Assign null
        reasonInput = null;
    }

    //Execute the query to update the applied best practise
    db.query("UPDATE bestPractiseApplied SET factory_applied = ?, status = ?, reason = ?, estimatedDate = ? WHERE id_bestPractiseApplied = ?", [factoryInput, statusInput, reasonInput, estimatedDateInput, idAppliedBestPractise], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error a la hora de actualizar la practica aplicada: ", err);
            res.status(500).send('Error a la hora de actualizar la practica aplicada');
            return;
        }
    });
});

//Create a variable to control the upload files
let isUploading = true;

/**
 * End point to add files to a best practise
 */
router.post('/insertBestPractise-file/:option/:factory/:title', upload.array('files'), (req, res) => {
    /**Store the values from the arguments */
    const { option, factory, title } = req.params;

    console.log("Option:", option);
    console.log("Factory:", factory);
    console.log("Title:", title);

    const optionNumber = parseInt(option, 10);

    //Create an array to store the name of the files
    const fileNames = req.files.map(file => file.originalname);

    //Store into a variable the folder path
    const folderPath = `/uploads/buenasPracticas/${idBestPractise}`;

    //Iterate throw the array
    fileNames.forEach(fileName => {
        //Build the path 
        const filePath = `/uploads/buenasPracticas/${idBestPractise}/${fileName}`;

        console.log("> FILE PATH: ", filePath);

        //Check if the file are a before o after file or main image
        if (optionNumber === 1 || optionNumber === 0 || optionNumber === 3) {
            //Execute the query with the before_file column
            db.query('INSERT INTO files_best_practise (id_best_practise, path, before_file) VALUES (?, ?, ?)', [req.session.bestPractiseId, filePath, optionNumber], (err, result) => {
                if (err) {
                    console.error('No se ha podido añadir los datos a la tabla de los ficheros de las buenas prácticas ', err)
                }
            });

            isUploading = false;

            //Check if the file are a other file
        } else {
            //Store in a variable the name of the file with the pdf extension
            const newFileName = replaceExtension(fileName, "pdf");

            //Store in a variable the new fil path of the other file with the pdf extension
            const otherFilePath = `/uploads/buenasPracticas/${idBestPractise}/${newFileName}`;

            //Execute the query with out the other file column
            db.query('INSERT INTO files_best_practise (id_best_practise, path) VALUES (?, ?)', [req.session.bestPractiseId, otherFilePath], (err, result) => {
                if (err) {
                    console.error('No se ha podido añadir los datos a la tabla de los ficheros de las buenas prácticas ', err)
                }
            });

            //Call the method to convert the other files into a PDF
            convertFiles(folderPath);

            isUploading = false;
        }
    });
});

/**
 * End point to replace the file from the 3D models
 */
router.post('/update-file-model/:idBlueprint/:option/:nameOldFile', uploadBlueprints.single('files'), (req, res) => {
    /**Store the values from the arguments */
    const idBlueprint = req.params.idBlueprint,
        option = req.params.option,
        oldPath = join(__dirname, `public/uploads/planos/${idBlueprint}/${req.params.nameOldFile}`),
        newPath = join(__dirname, `public/uploads/planos/${idBlueprint}/${req.file.filename}`);

    console.log("> Old file path: ", oldPath);

    //Use the unlink() to delete the file
    fs.unlink(oldPath, (err) => {
        console.error("> Error a la hora de eliminar el fichero anterior: ", err);
    });

    const path = `/uploads/planos/${idBlueprint}/${req.file.filename}`;
    console.log("> Path final: ", path, "\nOption: ", option);

    //Move the new file
    fs.rename(req.file.path, newPath, function (err) {
        if (err) {
            console.error("> No se ha podido mover la imagen: ", err);
        }
    });

    //Control the option... if the option is image
    if (option === 1) {
        //Execute the query to update the image value
        db.query("UPDATE blueprints SET image = ? WHERE id = ?", [path, idBlueprint], (err, result) => {
            //If an error ocurred...
            if (err) {
                console.error("> No se ha podido actualizar la imagen: ", err);
            }
        });

        //If the option is stl
    } else if (option === 0) {
        //Execute the query to update the stl value
        db.query("UPDATE blueprints SET pathSTL = ? WHERE id = ?", [path, idBlueprint], (err, result) => {
            //If an error ocurred...
            if (err) {
                console.error("> Error a la hora de actualizar la ruta del fichero STL: ", err);
            }
        });
    }
});

/**
 * End point to add files to a best practise
 */
router.post('/update-file/:option/:idBestPractise', upload.array('files'), (req, res) => {
    /**Store the values from the arguments */
    let option = req.params.option, idBestPractise_params = req.params.idBestPractise;

    //Create an array to store the name of the files
    const fileNames = req.files.map(file => file.originalname);

    //Store into a variable the folder path
    const folderPath = `/uploads/buenasPracticas/${idBestPractise_params}`;

    //Iterate throw the array
    fileNames.forEach(fileName => {
        //Build the path 
        const filePath = `/uploads/buenasPracticas/${idBestPractise_params}/${fileName}`;

        //Check if the file are a before o after file
        if (option == 1 || option == 0) {
            //Execute the query with the before_file column
            db.query('INSERT INTO files_best_practise (id_best_practise, path, before_file) VALUES (?, ?, ?)', [idBestPractise_params, filePath, option], (err, result) => {
                if (err) {
                    console.error('No se ha podido añadir los datos a la tabla de los ficheros de las buenas prácticas ', err)
                }
            });

            //Check if the file are a other file
        } else {
            //Store in a variable the name of the file with the pdf extension
            const newFileName = replaceExtension(fileName, "pdf");

            //Store in a variable the new fil path of the other file with the pdf extension
            const otherFilePath = `/uploads/buenasPracticas/${idBestPractise_params}/${newFileName}`;

            console.log("> OTHER FILE PATH: ", otherFilePath);

            //Execute the query with out the other file column
            db.query('INSERT INTO files_best_practise (id_best_practise, path) VALUES (?, ?)', [idBestPractise_params, otherFilePath], (err, result) => {
                if (err) {
                    console.error('No se ha podido añadir los datos a la tabla de los ficheros de las buenas prácticas ', err)
                }
            });

            //Call the method to convert the other files into a PDF
            convertFiles(folderPath);
        }
    });
});

/**
 * End point to select the files information
 */
router.get("/retrieveFiles", (req, res) => {
    //Execute the query
    db.query("SELECT path, before_file FROM files_best_practise WHERE id_best_practise = ? ORDER BY id", [req.session.bestPractiseId], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se ha podido obtener los datos del fichero con ID de la buena práctica: ", req.session.bestPractiseId);
        }

        console.log("> Resultado obtenido de la consulta: ", result);

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select all the data from the "blueprints" table
 */
router.get('/getBlueprints', (req, res) => {
    //Execute the query
    db.query('SELECT * FROM blueprints', (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error('Error al obtener los datos ', err);
            res.status(500).send('Error al obtener los datos de los planos 3D');
            return;
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select all the data from the "spotfire_functions_subfunctions" table using thr data source ID
 */
router.get('/getFunction_Subfunction/:id', (req, res) => {
    //Store the ID the data source
    const dataId = req.params.id;

    //Make and execute the query to select the functions/subfunctions by the data source ID
    db.query('SELECT function_id, subfunction_id FROM spotfire_functions_subfunctions WHERE spotfire_id = ?', dataId, (err, result) => {
        //If an error ocurred....
        if (err) {
            console.error('Error al obtener los datos de la base de datos:', err);
            res.status(500).send('Error al obtener los datos');
            return;
        }

        console.log("Consulta: ", result);
        res.json(result);
    });
});

/**
 * End point to obtein all the source from the "training" table
 */
router.get('/getTraining', (req, res) => {
    //Execute the query
    db.query("SELECT * FROM training", (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("Error al obtener los datos de los procedimientos: ", err);
            res.status(400).send("Error al obtener los procedimientos");
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point to add a training source
 */
router.post('/insert-data-training', (req, res) => {
    //Store the information into a variables
    const { title, description, category, url } = req.body;

    //Execute the query
    db.query("INSERT INTO training (title, description, category, url, userID) VALUES (?, ?, ?, ?, ?)", [title, description, category, url, req.session.userId], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error('> Error a la hora de añadir los datos de training: ', err);
            res.status(500).send('Error to add the training source');
        }
    });
});

/**
 * End point to update the best practise (the information without the files)
 */
router.post("/update-data-bestPractise/:idBestPractise/:title/:factory/:metier/:line/:technology/:category/:tags/:categorization/:owner", (req, res) => {
    console.log(">>>>> Dentro del end point")
    //Store the values from the params
    let idBestPractise = req.params.idBestPractise, title = req.params.title, factory = req.params.factory, metier = req.params.metier, line = req.params.line, technology = req.params.technology, category = req.params.category, tags = req.params.tags, categorization = req.params.categorization, owner = req.params.owner;

    console.log(">>>>> Category de las buena practica: ", category);

    //Create and store the tags parse into JSON
    let finalTags = JSON.parse(tags);

    //Store the values form the tags using map
    const result = finalTags.map(item => item.value).join(';');

    //Execute the query
    db.query("UPDATE best_practise SET title = ?, factory = ?, metier = ?, line = ?, technology = ?, category = ?, keyword = ?, categorization = ?, owner = ? WHERE id = ?", [title, factory, metier, line, technology, category, result, categorization, owner, idBestPractise], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> No se ha podido actualizar la información de la buena práctica: ", err);
            res.status(500).send('Error when updating the best practise');
        }

        res.status(200).send("Información actualizada");
    });
});

/**
 * End point to update de training source
 */
app.post("/update-data-training", (req, res) => {
    //Store the information into variables
    const { id, title, description, category, url } = req.body;

    console.log("> Elementos añadidos: ", id, title, description, category, url);

    //Execute the query
    db.query("UPDATE training SET title = ?, description = ?, category = ?, url = ? WHERE id = ?", [title, description, category, url, id], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Ocurrio un problmea a la hora de actualizar el training source: ", err);
            req.status(500).send("Error a la hora de actualizar el elemento");
        }
    });
});

/**
 * End point to delete rows by the ID and the name of the table
 */
router.delete('/delete-row/:id/:table', (req, res) => {
    //Store the ID of the row
    const id = req.params.id;

    //Store the name of the table
    const table = req.params.table;

    //Validate for the name of the available tables
    const allowedTables = ['app', 'spotfire', 'powerApps', 'best_practise', 'blueprints', 'powerAutomate', 'bestPractiseApplied', 'training', 'files_best_practise', 'dataDriven'];
    if (!allowedTables.includes(table)) {
        return res.status(400).send('Nombre de tabla no permitido');
    }

    //Create a query with the table and the ID using the parameters
    const query = `DELETE FROM ${table} WHERE id = ?`;

    //If the table is "blueprints"
    if (table === 'blueprints') {
        //Create a variable to store the path
        const folderPath = join(__dirname, `/public/uploads/planos/${id}`);

        //Delete the root 3D model that contains the files (image and model file) using the ID
        fs.rm(folderPath, { recursive: true, force: true }, err => {
            //If an error ocurred...
            if (err) {
                console.log("> Error al eliminar el directorio del plano 3D: ", err);
            }
        });

        //Execute the query to delete the blueprint
        db.query(query, [id], (err, result) => {
            //If an error ocurred...
            if (err) {
                console.error("> Se ha producido un error a la hora de eliminar el plano 3D: ", err);
            }
        });

        //Send the status 200
        res.status(200).send('Registro eliminado correctamente');

        //If the table is "best_practise"
    } else if (table == 'best_practise') {
        //Execute the query to select the factory, title and the category
        db.query("SELECT factory, title, category FROM best_practise WHERE id = ?", [id], (err, result) => {
            //If an error ocurred...
            if (err) {
                console.error('Ha ocurrido un problema a la hora de obtener los datos de la buena práctica ', err);

                //In other case...
            } else {
                //Execute the query to delete the comments using the ID for the best practise
                db.query("DELETE FROM bestPractiseComments WHERE idBestPractise = ?", [id], (err, result) => {
                    //If an error ocurred...
                    if (err) {
                        console.error('> Se ha podido un error al eliminar los comentarios de la buena práctica', err);
                        return;
                    }
                });

                //Execute the query to delete the best practise applied
                db.query("DELETE FROM bestPractiseApplied WHERE idBestPractise = ?", [id], (err, result) => {
                    //If an error ocurred...
                    if (err) {
                        console.error('> Se ha producido un error a la hora de eliminar las buenas practicas aplicadas: ', err);
                        return;
                    }
                });

                //Execute the query to delete the the files of the best practise
                db.query("DELETE FROM files_best_practise WHERE id_best_practise = ?", [id], (err, result) => {
                    //If an error ocurred...
                    if (err) {
                        console.error("> Error a la hora de eliminar los ficheros de buena práctica: ", err);
                    }
                });

                //Execute the query to delete the best practise from the favourite best practise
                db.query("DELETE FROM favourite_best_practise WHERE idBestPractise = ?", [id], (err, result) => {
                    //If an error ocurred...
                    if (err) {
                        console.error("> Error a la hora de eliminar la buena práctica de la lista de favoritos: ", err);
                    }
                });

                //Execute the query to delete the best practise
                db.query(query, [id], (err, result) => {
                    //If an error ocurred...
                    if (err) {
                        console.error("> Ha ocurrido un error a la hora de eliminar la buena práctica: ", err);
                    }
                });

                //Store the fatory of the best practise
                const factory = result[0].factory;

                //Store the title of the best practicse
                const title = result[0].title;

                //Store the category of the best practise
                const category = result[0].category;

                //Store the path folder of the old best practise
                const folderPath = join(__dirname, `/public/library/buenasPracticas/${id}`);

                //Delete the root of the best practise that contains the files using the factory and the category
                fs.rm(folderPath, { recursive: true, force: true }, err => {
                    //If an error ocurred...
                    if (err) {
                        console.error("> Error al eliminar el directorio de la buena práctica: ", err);
                    }
                });

                //Send the status
                res.status(200).send('Registro eliminado correctamente');
            }
        });

        //If the table is Best practise applied
    } else if (table === 'bestPractiseApplied') {
        //Execute the query to delete the applied best practise
        db.query("DELETE FROM bestPractiseApplied WHERE id_bestPractiseApplied = ?", [id], (err, result) => {
            //If an error ocurred...
            if (err) {
                console.error("> No se ha podido eliminar la buena práctica aplicada: ", err);
            }

            res.status(200).send('Registro eliminado de forma correcta');
        })

        //If table is Power Apps
    } else if (table == "powerApps") {
        //Execute the query to delete the associated sites
        db.query("DELETE FROM associatedSites WHERE idPowerApp = ?", [id], (err, result) => {
            //If an error ocurred...
            if (err) {
                console.error("> Error a la hora de eliminar los sitios asociados de la powerApp", err);
            }
        });

        //Execute the query to delete the factories of the PowerApp
        db.query("DELETE FROM factories_powerApp WHERE idPowerApp = ?", [id], (err, result) => {
            //If an error ocurred...
            if (err) {
                console.error("> Se ha producido un error a la hora de eliminar las factorias de las fábricas: ", err);
            }
        });

        //Execute the query to delete the PowerApp
        db.query(query, [id], (err, result) => {
            //If an error ocurred...
            if (err) {
                console.error("> Se ha producido un error a la hora de eliminar la PowerApp: ", err);
            }
        });

        //Execute the query to delete de Power Automate
        db.query("DELETE FROM powerAutomate WHERE idPowerApp = ?", [id], (err, result) => {
            //If an error ocurred...
            if (err) {
                console.log("> Se ha producido un error a la hora de eliminar el Power Automate con ID de la PowerApp: ", id);
            }
        });

        //Send the status
        res.status(200).send('Registro eliminado correctamente');


    } else if (table === 'dataDriven') {
        //Ejecutamos la consulta para eliminar el registro usando el ID
        db.query("DELETE FROM dataDriven WHERE id = ?", [id], (error, results) => {
            //En caso de que ocurra algun error...
            if (error) {
                return res.status(501).send("No se pudo eliminar el elemento: " + error);
            }

            //Ejecutamos otra consulta para eliminar los registros de los ficheros
            db.query("DELETE FROM files_data_driven WHERE idDataDriven = ?", [id], (error, result) => {
                //En caso de que falle...
                if (error) {
                    return res.status(501).send('No se pudo eliminar el fichero de la tabla: ' + error);
                }

                //Creamos una variable que contenga la carpeta padre
                const folderPath = join(__dirname, `/public/library/dataDriven/${id}`);

                //Borramos el contenido de la carpeta padre del Data Driven
                fs.rm(folderPath, { recursive: true, force: true }, err => {
                    //En caso de que ocurra algun error...
                    if (err) { res.status(501).send('No se pudo eliminar el fichero'); }
                });
            });
        });

        //If the table is app, spotfire or powerAutomate
    } else {
        //Execute the query to delete the data source / app / training
        db.query(query, [id], (err, result) => {

            console.log("> ID del flow: ", id);
            //If an error ocurred...
            if (err) {
                console.error("> Se ha producido un error a la hora de eliminar la información: ", err);
            }

            //Send the status
            res.status(200).send('Registro eliminado correctamente');
        });
    }
});

/**
 * End point to delet a file
 */
router.delete("/delete-file/:id/:path", (req, res) => {
    //Store the ID of the file row
    const id = req.params.id;

    //Store the path of the file
    const path = req.params.path;

    console.log("> PATH: ", path);

    //Store the final path to delete the file
    const finalPath = join(__dirname, 'public', path);

    console.log("> Dentro del end point\n> ID del elemento: ", id, "\n> Path del fichero: ", path, "\n> Final path del fichero: ", finalPath);

    //Execute the query to delete de row of the file
    db.query("DELETE FROM files_best_practise WHERE id = ?", [id], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error('> Error a la hora de eliminar la fila de los ficheros: ', err);
            res.status().send('Error deleteting the source');
        }

        //Delete the file using the path and the .unlink() method
        fs.unlink(finalPath, (err) => {
            //If an error ocurred...
            if (err) {
                console.log('> Error a la hora de eliminar el fichero: ', path, "\tError --> ", err);
            }
        });

        //Send the status
        res.status(200).send('Registro eliminado correctamente');
    });
});

/**
 * End point para obtener la información detallada de la buena práctica
 */
router.get('/obtenerInformacionDetallada-bestPractica/:id', (req, res) => {
    //Almacenamos el ID de la buena práctica en una variable
    const id = req.params.id;

    //Almacenamos en una variable la consulta SQL
    const query = `
        SELECT 
            bp.*,
            GROUP_CONCAT(CASE WHEN fbp.before_file = 1 THEN fbp.path END) AS before_images,
            GROUP_CONCAT(CASE WHEN fbp.before_file = 0 THEN fbp.path END) AS after_images,
            GROUP_CONCAT(CASE WHEN fbp.before_file = 3 THEN fbp.path END) AS main_images
        FROM
            best_practise bp
        INNER JOIN files_best_practise fbp 
            ON bp.id = fbp.id_best_practise 
        WHERE 
            bp.id = ?
        GROUP BY 
            bp.id, bp.title, bp.factory, bp.metier, bp.line, bp.technology, 
            bp.category, bp.categorization, bp.keyword, bp.userID, bp.owner;
    `;

    //Ejecutamos la consulta
    db.query(query, [id], (error, result) => {
        //En caso de que ocurra algun error
        if (error) {
            console.error('> Error a la hora de ejecutar la consulta: ', error);
        }

        console.log("> Resultados: ", result);

        //Enviamos la información
        return res.json(result);
    });
});

/**
 * End point to count the number of image (before or after) from a best practise
 */
router.get('/get-number-images/:id/:beforeFile', (req, res) => {
    //Store the variables from the arguments
    const id = req.params.id, beforeFile = req.params.beforeFile;

    console.log("> ID best practise: ", id, "\tBefore file: ", beforeFile);

    //Execute the query
    db.query("SELECT COUNT(id) FROM files_best_practise WHERE id_best_practise = ? AND before_file = ?", [id, beforeFile], (err, result) => {
        if (err) {
            console.error("> Error a la hora de obtener el numero de imagenes: ", err);
            return res.status(500).json({ error: "Error en la consulta" });
        }

        console.log("> Resultado: ", result);

        //If there is value...
        if (result && result.length > 0) {
            console.log("> Conteo de imágenes: ", result[0]['COUNT(id)']);

            //Send the information
            res.json({ count: result[0]['COUNT(id)'] });

            //In other case...
        } else {
            //Send zero
            res.json({ count: 0 });
        }
    });
});


/**
 * End point to get the information about the videos
 */
router.get('/getVideos', (req, res) => {
    //Execute the query
    db.query("SELECT fbp.*, bp.* FROM files_best_practise AS fbp JOIN best_practise AS bp ON fbp.id_best_practise = bp.id WHERE fbp.path LIKE '%.mp4'", (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error('> Error a la hora de obtener los videos: ', err)
        }

        //Send the information
        res.json(result);
    });
});

/**
 * End point para añadir el Data Driven
 */
router.post('/insert-data-dataDriven/:title/:context/:pilot/:dataNeeded/:standardsApplied/:solution/:scalability/:plant/:resources/:saving/:nextSteps/:externalScalability/:implementationDate/:status', (req, res) => {
    /**Almacenamos las variables de los parámetros */
    const { title, context, pilot, dataNeeded, standardsApplied, solution, scalability, plant, resources, saving, nextSteps, externalScalability, implementationDate, status } = req.params;

    console.log("> External Scalability: ", externalScalability);

    //Almacenamos en una variable la consulta SQL
    const query = `
        INSERT INTO
            dataDriven (title, context, pilot, dataNeeded, standardsApplied, solution, scalability, plant, resources, saving, nextSteps, userID, status, implemented_date, external_scalability)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    //Ejecutamos la consulta
    db.query(query, [title, context, pilot, dataNeeded, standardsApplied, solution, scalability, plant, resources, saving, nextSteps, req.session.userId, status, implementationDate, externalScalability], (error, result) => {
        //En caso de que se produzca un error...
        if (error) {
            console.log("> Error: ", error);
            return res.status(501).send('Error: ', error);
        }

        //Almacenamos el ID en la variable global
        idDataDriven = result.insertId;

        //Enviamos el status 
        return res.status(201).send('Información añadidida');
    });
});

/**
 * End point para añadir los ficheros a su respectivo directorio y en la tabla de la base de datos
 */
router.post('/insertDataDriven-files/:option', uploadDataDriven.single('file'), (req, res) => {
    //Almacenamos el argumento
    const option = parseInt(req.params.option, 10);

    //Almacenamos en una variable el nombre del fichero
    const fileName = req.file.filename;

    if (!idDataDriven) {
        return res.status(400).json({ message: "El ID de DataDriven es requerido" });
    }

    //Almacenamos en una variable la ruta de acceso (que ira en la tabla de la base de datos)
    const filePath = `/uploads/dataDriven/${idDataDriven}/${fileName}`;

    //Almacenamos en una variable la consulta SQL
    const query = `
        INSERT INTO
            files_data_driven (idDataDriven, path, mainImage)
        VALUES
            (?, ?, ?)
    `;

    //Ejecutamos la consulta
    db.query(query, [idDataDriven, filePath, option], (error, result) => {
        //En caso de que se produzca un error...
        if (error) {
            console.log("> Error: ", error);
        } else {
            console.log("> Results: ", result);
        }
    });
});

/**
 * End point para obtener la información de todos los Data Driven con sus respectivas imagenes
 */
router.get('/getDataDriven', (req, res) => {
    //Almacenamos en una variable la consulta SQL
    const query = `
        SELECT 
            dataDriven.id, dataDriven.title, dataDriven.pilot, dataDriven.plant, dataDriven.userID, dataDriven.status, dataDriven.external_scalability,
            files.path
        FROM
            dataDriven AS dataDriven
        INNER JOIN files_data_driven AS files 
            ON dataDriven.id = files.idDataDriven
        WHERE
            files.mainImage = 1
    `;

    //Ejecutamos la consulta
    db.query(query, [], (error, results) => {
        //En caso de que ocurra un error
        if (error) {
            res.status(501).send('Error a la hora de obtener la informacion: ' + error);
        }

        //Enviamos la información
        res.json(results);
    });
});

/**
 * End point para obtener la información detallada del Data Driven usando el ID del elemento
 */
router.get('/informacionDetallada-DataDriven/:id', (req, res) => {
    //Almacenamos en una variable el ID
    const id = req.params.id;

    //Almacenamos en una variable la consulta SQL
    const query = `
        SELECT
            dataDriven.*, 
            GROUP_CONCAT(CASE WHEN files.mainImage = 1 THEN files.path END) AS main_image_path,
            GROUP_CONCAT(CASE WHEN files.mainImage = 0 THEN files.path END) AS secondary_image_path
        FROM
            dataDriven
        INNER JOIN files_data_driven AS files 
            ON dataDriven.id = files.idDataDriven
        WHERE
            dataDriven.id = ?
        GROUP BY
            dataDriven.id;
    `;

    //Ejecutamos la consulta
    db.query(query, [id], (error, results) => {
        //En caso de que ocurra algun error...
        if (error) {
            //Devolvemos el estado
            return res.status(501).send('No se puedo obtener la información detallada ' + error);
        }

        //Enviamos la información
        return res.json(results);
    });
});

/**
 * End point para actualizar el fichero dentro del Data Driven
 */
router.post('/upload-file-dataDriven/:id/:path/:mainImage', uploadDataDriven.single('files'), (req, res) => {
    //Almacenamos las variables de los parámetros
    const { id, path, mainImage } = req.params;

    //Almacenamos en una variable el nombre del fichero
    const fileName = path.split('/').pop();

    //Almacenamos en una variable la ruta del fichero a actualizar
    const finalPath = join(__dirname, `public/uploads/dataDriven/${id}/${fileName}`);

    //Verificamos que el fichero existe
    fs.access(finalPath, fs.constants.F_OK, (err) => {
        //En caso de que falle...
        if (err) {
            console.error(`El archivo no existe: ${finalPath}`);
            return res.status(404).send("El archivo no se encuentra.");
        }

        //Eliminamos el fichero
        fs.rm(finalPath, { force: true }, (err) => {
            //En caso de que ocurra algun error...
            if (err) {
                console.error("> Error al eliminar el fichero: ", err);
                return res.status(500).send("No se pudo eliminar el archivo.");
            }

            //Almacenamos en una variable el nuevo nombre del fichero
            const newFileName = req.file.originalname;

            //Almacenamos la ruta del nuevo fichero
            const filePath = `/uploads/dataDriven/${id}/${newFileName}`;

            //Almacenamos en una variable la consulta SQL
            const query = `
                UPDATE
                    files_data_driven
                SET
                    path = ?
                WHERE
                    idDataDriven = ? AND mainImage = ? 
            `;

            //Ejecutamos la consulta
            db.query(query, [filePath, id, mainImage], (error, results) => {
                if (error) {
                    console.error("Error al actualizar la base de datos: ", error);
                    return res.status(501).send("No se pudo actualizar la etapa: " + error);
                }
            });
        });
    });
});

/**
 * End point para obtener el número de imágenes que ha adjuntado
 */
router.get('/comprobarFicheros-dataDriven', (req, res) => {
    //Ejecutamos la consulta
    db.query("SELECT COUNT(id) AS count FROM files_data_driven WHERE idDataDriven = ?", [idDataDriven], (error, results) => {
        //En caso de que ocurra algun error...
        if (error) {
            console.error("> Error a la hora de obtener el número de ficheros adjuntos: ", error);

            //Enviamos el estado
            res.status(501).send("No se pudo obtener el núméro de elementos adjuntos");
        }

        //Enviamos la información
        res.json({ count: results[0].count });
    });
});

/**
 * End point para obtener los rutas de los ficheros
 */
router.get('/obtenerFicheros/:id', (req, res) => {
    //Almacenamos el ID del parámetro
    const id = req.params.id;

    //ALmacenamos en una variable la consulta SQL
    const query = `
        SELECT 
            path, before_file
        FROM
            files_best_practise
        WHERE
            id_best_practise = ?
            AND before_file != 3
            AND before_file IS NOT null
    `;

    //Ejecutamos la consulta
    db.query(query, [id], (error, result) => {
        //En caso de que ocurra algun error...
        if (error) {
            console.error("> Se ha producido un error a la hora de obtener las imagenes asociadas: ", error);

            //Enviamos el estado
            return response.status(501).send("Problema en la consulta");
        }

        console.log("> Resultados: ", result);

        //Enviamos la información
        res.json(result);
    });
});

/**
 * End point para añadir la imagen principal a una buena práctica desde una imagen anterior
 */
router.post('/insertarMainImage_imagenAnterior/:id/:path', (req, res) => {
    //Almacenamos en variables los parámetros
    const { id, path } = req.params;

    //Almacenamos en una variable la ruta del fichero
    const filePath = `/uploads/buenasPracticas/${id}/${path}`;

    //Consulta para actualizar si ya existe
    const updateQuery = `
        UPDATE files_best_practise
        SET path = ?
        WHERE id_best_practise = ? AND before_file = 3
    `;

    //Consulta para insertar si no existe
    const insertQuery = `
        INSERT INTO files_best_practise (id_best_practise, path, before_file)
        SELECT ?, ?, 3
        WHERE NOT EXISTS (
            SELECT 1 
            FROM files_best_practise 
            WHERE id_best_practise = ? AND before_file = 3
        )
    `;

    //Ejecutamos la consulta para actualizar
    db.query(updateQuery, [filePath, id], (updateError, updateResult) => {
        if (updateError) {
            console.error("> Error al actualizar la Main Image: ", updateError);
            res.status(501).send('Error al actualizar la Main Image');
        }

        //Si no se actualizó ninguna fila, intentamos insertar
        if (updateResult.affectedRows === 0) {
            //Ejecutamos la consuta para insertar
            db.query(insertQuery, [id, filePath, id], (insertError, insertResult) => {
                if (insertError) {
                    console.error("> Error al insertar la Main Image: ", insertError);
                    res.status(501).send('Error al insertar la Main Image');
                }

                console.log("> Main Image insertada con éxito:", insertResult);
                res.status(201).send('Main Image insertada con éxito');
            });
        } else {
            console.log("> Main Image actualizada con éxito:", updateResult);
            res.status(201).send('');
        }
    });
});

/**
 * End point para añadir la imagen principal
 */
router.post('/anyadir-MainImage/:idBestPractise', upload.single('files'), (req, res) => {
    //Almacenamos en variables el ID de la buena práctica y el nombre del fichero subido
    const id = req.params.idBestPractise;
    const fileName = req.file.filename;
    const filePath = `/uploads/buenasPracticas/${id}/${fileName}`;

    //Almacenamos en una variable la consulta para saber si ya tiene una imagen principal
    const selectQuery = `
        SELECT path 
        FROM files_best_practise 
        WHERE id_best_practise = ? AND before_file = 3
    `;

    //Almacenamos en una variable la consulta para insertar la imagen principal
    const insertQuery = `
        INSERT INTO files_best_practise (id_best_practise, path, before_file)
        VALUES (?, ?, 3)
    `;

    //Almacenamos en una variable la consulta para actualizar la imagen principal en caso de que exista
    const updateQuery = `
        UPDATE files_best_practise
        SET path = ?
        WHERE id_best_practise = ? AND before_file = 3
    `;

    //Ejcutamos la consulta para saber si ya existe una imagen principal
    db.query(selectQuery, [id], (selectError, selectResults) => {
        //En caso de que ocurra algun error...
        if (selectError) {
            console.error("> Error al verificar si existe una Main Image:", selectError);

            //Enviamos el estado
            return res.status(501).send('Error al verificar la Main Image');
        }

        //En caso de que exista...
        if (selectResults.length > 0) {
            //Almacenamos en una variable la ruta del fichero anterior
            const oldFilePath = selectResults[0].path;

            //Ejecutamos la consulta para actualizar la fila
            db.query(updateQuery, [filePath, id], (updateError, updateResult) => {
                //En caso de que ocurra algun error...
                if (updateError) {
                    console.error("> Error al actualizar la Main Image:", updateError);
                    res.status(501).send('Error al actualizar la Main Image');
                }

                //Llamamos al método para eliminar el fichero anterior
                eliminarArchivoAnterior(oldFilePath);

                //Enviamos el status
                res.status(201);
            });

            //En cualquier otro caso
        } else {
            //Ejecutamos la consulta para añadir la iman principal
            db.query(insertQuery, [id, filePath], (insertError, insertResult) => {
                //En caso de que ocurra algun error...
                if (insertError) {
                    console.error("> Error al insertar la Main Image:", insertError);

                    //Enviamos el status
                    return res.status(501).send('Error al insertar la Main Image');
                }

                //Enviamos el status
                res.status(201);
            });
        }
    });
});

/**
 * Método para eliminar el archivo anterior
 * @param {string} oldFilePath - Ruta del archivo anterior a eliminar
 */
function eliminarArchivoAnterior(oldFilePath) {
    //Creamos una variable que contenga la ruta al fichero
    const filePath = join(__dirname, "public", oldFilePath);

    fs.unlink(filePath, (error) => {
        if (error) {
            console.error("> Error al eliminar el archivo anterior:", error);
        } else {
            console.log("> Archivo anterior eliminado con éxito:", filePath);
        }
    });
}


/**
 * End point para saber si una bnuena práctica tiene imagen principal
 */
router.get('/controlMainImage/:id', (req, res) => {
    //Ejecutamos la sentencia
    db.query("SELECT COUNT(id) FROM files_best_practise WHERE id_best_practise = ? AND before_file = 3", [req.params.id], (error, result) => {
        //En caso de que ocurra algun error....
        if (error) {
            console.error("> Error a la hora de obtener el conteo de imagen principal: ", error);

            //Enviamos el status
            res.status(501).send('Error al obtener el control de imagen principal de la buena práctica: ', error);
        }

        console.log("> Resultado: ", result);

        //Enviamos la información
        res.json(result);
    });
});

/**
 * End point to retrieve the information to create the film
 */
router.get('/getFilm', (req, res) => {
    //Store the query to select the information from the tables of the datatable
    const query = `
        SELECT 
            Film.numero_of, Film.referencia, Film.fecha_of_lanzado, Film.fecha_of_acabado, Film.linea,
            Coefficient_allComponents.reference_motor, Coefficient_allComponents.reference_composant, Coefficient_allComponents.coefficient_montage_BE, Coefficient_allComponents.designation_longue,
            POE.*
        FROM 
            Film
        INNER JOIN 
            Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
        INNER JOIN
            POE ON Coefficient_allComponents.reference_composant = POE.reference
        ORDER BY Film.fecha_of_lanzado DESC
    `;

    //Execute the query
    db.query(query, (err, result) => {
        if (err) {
            console.error("> Error a la hora de obtener los valores: ", err);
            return res.status(500).send("Error en la consulta a la base de datos.");
        }

        console.log("\n> Datos obtenidos: ", result);

        //Send the information
        res.json(result);
    });
});

/**
 * End point to retrieve the count of the number of UC using the coefficient
 */
router.get('/getNumberUC/:coefficient', (req, res) => {
    //Store the coefficient from the params
    const coefficient = req.params.coefficient;

    //Store the query
    const query = `
        SELECT SUM(nb_pieces_par_uc) AS total_pieces
            FROM POE
            WHERE reference = ?
    `;

    //Execute the query
    db.query(query, [coefficient], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error al obtener la suma de los UCs: ", err);
        }

        console.log("> Resultados obtenidos: ", result);

        //Send the information
        res.json(result);
    });
});

/**
 * End point to select the information using the F into the "EN_IFM_STANDARD"
 */
router.get('/getEN_IFM/:F', (req, res) => {
    //Store the F standard from the argumentos
    const fStandard = req.params.F;

    //Store in a variable the query
    const query = `
        SELECT
            EI.*,
            MT.*
        FROM
            EN_IFM_STANDARD AS EI
            INNER JOIN MTM3 AS MT ON EI.machine_used = MT.id_MTM3
        WHERE
            EI.F = ?
    `;

    //Execute the query
    db.query(query, [fStandard], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error a la hora de obtener la infromación de la F: ", err);
        }

        //Send the information 
        res.json(result);
    });
});

/**
 * End point to select the information on the table method operation using the standard
 */
router.get('/getMethodOperation/:fStandard', (req, res) => {
    //Store the standard from the params
    const fStandard = req.params.fStandard;

    console.log("> Fstandard: ", fStandard);

    //Execute the query
    db.query("SELECT * FROM table_method_operation WHERE Fstandard = ?", [fStandard], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error a la hora de obtener las operaciones: ", err);
        }

        console.log("> Methoodos obtenidos: \n", result);

        //Sendf the information
        res.json(result);
    })
})

/**
 * End point to select all the count to move (Film)
 */
router.get('/getPackingQuantity/:reference/:line', (req, res) => {
    //Store in a variables the reference and the line from the arguments
    const reference = req.params.reference, line = req.params.line;

    //Store in a variable the query
    const query = `
        SELECT 
            Film.numero_of,
            Film.referencia, 
            Film.fecha_of_lanzado,
            Film.fecha_of_acabado, 
            Film.linea,
            Coefficient_allComponents.reference_motor, 
            Coefficient_allComponents.reference_composant, 
            Coefficient_allComponents.coefficient_montage_BE, 
            Coefficient_allComponents.designation_longue,
            POE.*,
            COUNT(*) OVER () AS total_resultados
        FROM 
            Film
        INNER JOIN 
            Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
        INNER JOIN
            POE ON Coefficient_allComponents.reference_composant = POE.reference
        WHERE 
            Coefficient_allComponents.reference_composant = ?
            AND Film.linea = ?
        ORDER BY 
            Film.fecha_of_lanzado DESC
    `;

    const query2 = `
        SELECT 
            Film.numero_of,
            Film.referencia, 
            Film.fecha_of_lanzado,
            Film.fecha_of_acabado, 
            Film.linea,
            Coefficient_allComponents.reference_motor, 
            Coefficient_allComponents.reference_composant, 
            Coefficient_allComponents.coefficient_montage_BE, 
            Coefficient_allComponents.designation_longue,
            COUNT(DISTINCT Coefficient_allComponents.id) OVER () AS total_resultados
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

    const newQuery = `
        SELECT 
            total_resultados,
            total_resultados / 8 AS movimientos_por_hora
        FROM (
            SELECT 
                COUNT(*) AS total_resultados
            FROM 
                Film
            INNER JOIN 
                Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
            INNER JOIN
                POE ON Coefficient_allComponents.reference_composant = POE.reference
            WHERE 
                Coefficient_allComponents.reference_composant = ?
                AND Film.linea = ?
        ) AS resultado_total
    `;

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

    const query22 = `
        SELECT COUNT(Coefficient_allComponents.id) AS total_resultados
        FROM 
            Film
        INNER JOIN 
            Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
        WHERE 
            Coefficient_allComponents.reference_composant = ?
            AND Film.linea = ?
        `;

    const query3 = `
        SELECT
            Film.referencia,
            Film.linea,
            Coefficient_allComponents.*
        FROM
            Film
            INNER JOIN Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
        WHERE
            Film.linea = ?
            AND Coefficient_allComponents.reference_motor = ? 
    `;

    db.query(query1, [reference, line], (err1, result1) => {
        if (err1) {
            console.error("> Se ha producido un error a la hora de obtener los datos: ", err1);
            return res.status(500).json({ error: 'Error al obtener los datos' });
        }

        db.query(query22, [reference, line], (err2, result2) => {
            if (err2) {
                console.error("> Se ha producido un error a la hora de obtener el contador: ", err2);
                return res.status(500).json({ error: 'Error al obtener el conteo' });
            }

            db.query(query3, [line, reference], (err3, result3) => {
                if (err3) {
                    console.error("> Se ha producido un error a la hora de obtener las referencias: ", err3);
                    return res.status(500).json({ error: 'Error al obtener el conteo' });
                }


                const total_resultados = result2[0]?.total_resultados || 0;

                const response = {
                    //data: result1,
                    total_resultados,
                    data: result3
                };

                console.log("> Resultado de obtener los datos y el contador -->\n", response);

                res.json(response);
            })
        });
    });
});

/**
 * End point to select the components using the SIMPMECA reference
 */
router.get('/getComponents/:line', (req, res) => {
    //Store the line from the params
    const line = req.params.line;

    //Store the query to select the references by the line
    const query_references = `
        SELECT
            DISTINCT(Coefficient_allComponents.reference_motor)
        FROM
            Film
            INNER JOIN Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
        WHERE
            Film.linea = ?
    `;

    //Store the query to select to select all components
    const query_components = `
        SELECT
            DISTINCT(Coefficient_allComponents.reference_composant)
        FROM
            Film
            INNER JOIN Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
        WHERE
            Film.linea = ?
    `;

    //Execute the query to obtein the references
    db.query(query_references, [line], (err_references, result_references) => {
        //If an error ocurred...
        if (err_references) {
            console.error("> Error al obtener las referencias: ", err_references);
        }

        console.log("> Referencias obtenidas: \n", result_references);

        //Execuite the query to select the components
        db.query(query_components, [line], (err_commponent, result_component) => {
            //If an error ocurred...
            if (err_commponent) {
                console.error("> Error al obtener los componentes de la linea: ", err_commponent);
            }

            console.log("> Componentes obtenidos: ", result_component);

            //Store the data
            const response = {
                data_reference: result_references,
                data_components: result_component
            }

            //Send the information
            res.json(response);
        });
    });
});

/**
 * End point to count the components using the reference_motor and the reference_composant
 */
router.get('/getCountComponent/:reference_motor/:reference_composant', (req, res) => {
    //Store the reference and the reference composant
    const reference_motor = req.params.reference_motor, reference_composant = req.params.reference_composant;

    //Store the query
    const query = `
        SELECT COUNT(id) AS count
        FROM Coefficient_allComponents
        WHERE reference_motor = ? AND reference_composant = ?
    `;

    //Execute the query
    db.query(query, [reference_motor, reference_composant], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error al obtener el conteo del componente: ", err);
        }

        console.log("> Conteo de componentes: ", result);

        //Send the information
        res.json({ count: result[0].count });
    });
});

/**
 * End point to select the information into the "Forecast" table
 */
router.get('/getForecast/:reference/:linea', (req, res) => {
    //Store the reference and the line from the arguments
    const reference = req.params.reference, linea = req.params.linea;

    //Store in a variable to store the component using the reference and the line
    const query_components = `
        SELECT
            DISTINCT(Coefficient_allComponents.reference_composant), Coefficient_allComponents.coefficient_montage_BE
        FROM
            Film
            INNER JOIN Coefficient_allComponents ON Film.referencia = Coefficient_allComponents.reference_motor
        WHERE
            Film.linea = ?
            AND Film.referencia = ?
    `;

    //Execute the query
    db.query(query_components, [linea, reference], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Error a la hora de obtener los componentes: ", err);
        }

        console.log("> Componentes obtenidos: ", result);

        //Send the information
        res.json(result);
    });
});

/**
 * End point para eliminar el Data Drivenw y los ficheros asociados
 */
router.delete('/delete-row-dataDriven/:id', (req, res) => {
    //Almacenamos en una variable el ID del Data Driven
    const id = req.params.id;

    //Ejecutamos la consulta para eliminar el registro del Data Driven
    db.query("DELETE FROM dataDriven WHERE id = ?", [id], (error, result) => {
        //En caso de que falle...
        if (error) {
            console.error("> Error: ", error);
        }

        console.log("> Result: ", result);

        //Ejecutamos la consulta para eliminar los ficheros
        db.query("DELETE FROM files_data_driven WHERE idDataDriven = ?", [id], (error2, result2) => {
            //En caso de que ocurra algun problema...
            if (error2) {
                console.error("> Error a la hora de eliminar los ficheros de la tabla: ", error);
            }

            //Almacenamos en una variable la ruta a la carpeta padre
            const folderPath = join(__dirname, `/public/uploads/dataDriven/${id}`);

            //Eliminamos la carpeta padre
            fs.rm(folderPath, { recursive: true, force: true }, err => {
                //If an error ocurred...
                if (err) {
                    console.log("> Error al eliminar el directorio del Data Driven: ", err);
                }
            });

            console.log("> Results2: ", result2)

            res.status(200).send("Registro eliminado");
        });
    });
});

/**
 * End point para actualizar la información básica del Data Driven
 */
router.post('/actualizarInformacion-DataDriven/:id/:title/:context/:pilot/:dataNeeded/:standardsApplied/:solution/:scalability/:plant/:externalScalability/:implementationDate/:status', (req, res) => {
    //Almacenamos en variable la información de los parámetros
    const { id, title, context, pilot, dataNeeded, standardsApplied, solution, scalability, plant, externalScalability, implementationDate, status } = req.params;

    //Almacenamos en una variable la consulta SQL
    const query = `
        UPDATE
            dataDriven
        SET
            title = ?,
            context = ?,
            pilot = ?,
            dataNeeded = ?,
            standardsApplied = ?,
            solution = ?,
            scalability = ?,
            plant = ?,
            external_scalability = ?,
            implemented_date = ?,
            status = ?
        WHERE
            id = ?
    `;

    //Ejecutamos la consulta
    db.query(query, [title, context, pilot, dataNeeded, standardsApplied, solution, scalability, plant, externalScalability, implementationDate, status, id], (error, result) => {
        //En caso de que ocurra algun error...
        if (error) {
            console.error("> Error: ", error);
            return res.status(501).send("Error a la hora de actualizar el elemento Data Driven: " + error);
        }

        //Enviamos el estado
        res.status(201).send("Información actualizada de forma exitosa");
    });
});

/**
 * End point to select the components abour the forecast
 */
router.get("/getForecast/:reference", (req, res) => {
    //Store the reference from the params
    const reference = req.params.reference;

    //Execute the query
    db.query("SELECT * FROM Coefficient_allComponents WHERE reference_motor = ?", [reference], (err, result) => {
        //If an error ocurred...
        if (err) {
            console.error("> Se ha producido un error a la hora de obtener los componentes del FORECAST: ", err);
        }

        console.log("> Resultados del FORECAST", result);

        //Send the information
        res.json(result);
    });
});

//Exportamos el enrutador
export default router;