import { Router } from 'express';
import * as AgentController from './agents.controller';
import { requireAuth, requireAdmin } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, requireAdmin, AgentController.getAgents);
router.get('/:id', requireAuth, requireAdmin, AgentController.getAgentById);

export default router;
