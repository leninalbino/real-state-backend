import { Request, Response } from 'express';
import * as PropertyTypeService from './propertyTypes.service';

export const getPropertyTypes = async (_req: Request, res: Response) => {
  const propertyTypes = await PropertyTypeService.getPropertyTypes();
  res.json(propertyTypes);
};

export const getPropertyTypeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const propertyType = await PropertyTypeService.getPropertyTypeById(id);
  if (!propertyType) {
    return res.status(404).json({ message: 'Property type not found' });
  }
  res.json(propertyType);
};

export const createPropertyType = async (req: Request, res: Response) => {
  const { name, key } = req.body;
  if (!name || !key) {
    return res.status(400).json({ message: 'Name and key are required' });
  }
  const propertyType = await PropertyTypeService.createPropertyType({ name, key });
  res.status(201).json(propertyType);
};

export const updatePropertyType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, key } = req.body;
  const propertyType = await PropertyTypeService.updatePropertyType(id, { name, key });
  res.json(propertyType);
};

export const deletePropertyType = async (req: Request, res: Response) => {
  const { id } = req.params;
  await PropertyTypeService.deletePropertyType(id);
  res.status(204).send();
};
