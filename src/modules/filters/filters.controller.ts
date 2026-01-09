import { Request, Response, NextFunction } from 'express';
import * as FiltersService from './filters.service';

export const getPropertyTypes = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const types = await FiltersService.getPropertyTypes();
    res.json(types);
  } catch (error) {
    next(error);
  }
};

export const getPropertyCharacteristics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const characteristics = await FiltersService.getPropertyCharacteristics();
    res.json(characteristics);
  } catch (error) {
    next(error);
  }
};
