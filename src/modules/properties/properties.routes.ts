import { Router } from 'express';
import * as PropertyController from './properties.controller';
import {
  optionalAuth,
  requireAuth,
  requireAdmin,
  requireAgentOrAdmin,
} from '../../middleware/authMiddleware';

const router = Router();
export const adminPropertiesRouter = Router();

router.get('/', PropertyController.getProperties);
router.get('/me/properties', requireAuth, PropertyController.getMyProperties);
router.put('/me/properties/:id', requireAuth, PropertyController.updateMyProperty);
router.get('/:id', optionalAuth, PropertyController.getPropertyById);
router.post('/', requireAuth, requireAgentOrAdmin, PropertyController.createProperty);
router.put('/:id', requireAuth, requireAdmin, PropertyController.updateProperty);
router.put('/:id/approve', requireAuth, requireAdmin, PropertyController.approveProperty);
router.put('/:id/reject', requireAuth, requireAdmin, PropertyController.rejectProperty);
router.delete('/:id', requireAuth, requireAdmin, PropertyController.deleteProperty);

adminPropertiesRouter.get('/', requireAuth, requireAdmin, PropertyController.getAdminProperties);

export default router;
