import { Router } from 'express';
import * as HeroController from './hero.controller';

const router = Router();

router.get('/', HeroController.getHeroSlides);

export default router;
