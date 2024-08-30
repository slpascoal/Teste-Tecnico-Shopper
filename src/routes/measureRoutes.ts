/* 
importação das bibliotecas e dependencias necessárias
  - Router: funções para manipular rotas
  - uploadMeasure, confirmMeasure, listMeasures: funções que sserão executadas para cada POST, PATCH ou GET que for consumida em nossa api
*/
import { Router } from 'express';
import { uploadMeasure, confirmMeasure, listMeasures } from '../controllers/measureController';

// variavel recebe funcionalidades de Router
const router : Router = Router();

// declaração das rotas e suas chamadas
router.post('/upload', uploadMeasure);
router.patch('/confirm', confirmMeasure);
router.get('/:customer_code/list', listMeasures);

// esporta a variável
export default router;
