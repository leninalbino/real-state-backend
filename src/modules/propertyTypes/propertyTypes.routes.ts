import { Router } from 'express';
import * as PropertyTypeController from './propertyTypes.controller';
import { requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', PropertyTypeController.getPropertyTypes);
router.get('/:id', PropertyTypeController.getPropertyTypeById);
router.post('/', requireAdmin, PropertyTypeController.createPropertyType);
router.put('/:id', requireAdmin, PropertyTypeController.updatePropertyType);
router.delete('/:id', requireAdmin, PropertyTypeController.deletePropertyType);

export default router;
