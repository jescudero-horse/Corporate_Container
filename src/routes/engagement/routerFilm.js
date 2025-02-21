
//Importamos los módulos necesarios
import { Router } from 'express';
import { default as filmBackendRoutes } from './index.js';  //Importamos el backend para el FILM

//Creamos una instancia del router
const router = Router();

//Router para la página principal del router
router.get('/', (req, res) => {
  res.render('film/film');
});

//Router para la página de visualizar el plano
router.get('/visualizarPlano', (req, res) => {
  res.render('film/plano');
});

//Router para los end points
router.use('/api', filmBackendRoutes);

//Exportamos el enrutador
export default router;