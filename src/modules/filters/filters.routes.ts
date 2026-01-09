import { Router } from 'express';
import * as FiltersController from './filters.controller';

const router = Router();

router.get('/property-types', FiltersController.getPropertyTypes);
router.get('/property-characteristics', FiltersController.getPropertyCharacteristics);

export default router;
