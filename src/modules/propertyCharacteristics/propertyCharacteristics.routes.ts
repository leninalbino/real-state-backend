import { Router } from 'express';
import * as PropertyCharacteristicController from './propertyCharacteristics.controller';
import { requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', PropertyCharacteristicController.getPropertyCharacteristics);
router.get('/:id', PropertyCharacteristicController.getPropertyCharacteristicById);
router.post('/', requireAdmin, PropertyCharacteristicController.createPropertyCharacteristic);
router.put('/:id', requireAdmin, PropertyCharacteristicController.updatePropertyCharacteristic);
router.delete('/:id', requireAdmin, PropertyCharacteristicController.deletePropertyCharacteristic);

router.post('/:id/options', requireAdmin, PropertyCharacteristicController.addCharacteristicOption);
router.put('/options/:optionId', requireAdmin, PropertyCharacteristicController.updateCharacteristicOption);
router.delete('/options/:optionId', requireAdmin, PropertyCharacteristicController.deleteCharacteristicOption);

export default router;
