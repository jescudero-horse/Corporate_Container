
//Importamos los módulos necesarios
import { Router } from 'express';
import { default as dieDimensionalBackendRoutes } from './index.js';  //Importamos el backend para la DIE DIMENSIONAL

//Creamos una instancia del router
const router = Router();

//Router para la página principal
router.get('/', (req, res) => {
  res.render('dieDimensional/index');
});

/**CURITIBA */
//Premecanizado
router.get("/curitiba_premachining", (req, res) => res.render("dieDimensional/curitiba/premecanizado/premecanizado_curitiba", { title: "NON-CONFORMITIES MENU - PREMECHANIZED (AUTO)" }));

//Ver informe
router.get("/viewReport_premachining", (req, res) => res.render("dieDimensional/curitiba/premecanizado/ver_informe_curitiba"));

//Router para los end points
router.use('/api', dieDimensionalBackendRoutes);

/**RUMANIA */
//Página de inicio
router.get("/rumania", (req, res) => res.render("dieDimensional/rumania/index", { title: "Ejemplo" }));

//Ver informe
router.get("/viewReport-premachining-rumania", (req, res) => res.render("dieDimensional/rumania/viewReport-premachining"));

//Exportamos el enrutador
export default router;