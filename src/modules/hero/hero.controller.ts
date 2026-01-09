import { Request, Response, NextFunction } from 'express';
import * as HeroService from './hero.service';

export const getHeroSlides = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slides = await HeroService.getHeroSlides();
    res.json(slides);
  } catch (error) {
    next(error);
  }
};
