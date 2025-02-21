//Importamos los módulos necesarios
import express from "express";
import session from "express-session";
import { join, dirname, resolve } from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import bodyParser from 'body-parser';
import filmRoutes from './src/routes/engagement/routerFilm.js'; //Enrutador para el FILM
import libraryRoutes from './src/routes/library/routerLibrary.js'; //Enrutador para la LIBRARY
import dieDimensionalRouter from './src/routes/dieDimensional/routerDieDimensional.js' //Enrutador para la DIE DIMENSIONAL

//Inicializamos Express
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 80;

//Configuramos Express-Session
app.use(session({
    secret: 'Tyf7P20W',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

//Configuramos el envio de datos por medio de los formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Configuramos el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'src', 'views'));

//Configuramos Express para servir los archivos estáticos
app.use(express.static(join(__dirname, 'src', 'public')));

//Configuramos la ruta estática para los ficheros de la DIGITAL LIBRARY
app.use('/uploads', express.static(join(__dirname, 'src', 'routes', 'library', 'public', 'uploads')));

//Configuramos las rutas para el FILM, DIGITAL LIBRARY y DIE DIMENSIONAL
app.use('/film', filmRoutes);
app.use('/library', libraryRoutes);
app.use('/dieDimensional', dieDimensionalRouter);

//Configuramos la página de redirección
app.get("/", (req, res) => {
    //Redirigimos a la página de inicio de selección de herramienta
    res.render('index');
});

//Configuramos el puerto
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});