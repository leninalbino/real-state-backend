import { Request, Response } from 'express';
import * as PropertyCharacteristicService from './propertyCharacteristics.service';

export const getPropertyCharacteristics = async (_req: Request, res: Response) => {
  const propertyCharacteristics = await PropertyCharacteristicService.getPropertyCharacteristics();
  res.json(propertyCharacteristics);
};

export const getPropertyCharacteristicById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const propertyCharacteristic = await PropertyCharacteristicService.getPropertyCharacteristicById(id);
  if (!propertyCharacteristic) {
    return res.status(404).json({ message: 'Property characteristic not found' });
  }
  res.json(propertyCharacteristic);
};

export const createPropertyCharacteristic = async (req: Request, res: Response) => {
  const { label, key, type, options } = req.body;
  if (!label || !key || !type) {
    return res.status(400).json({ message: 'Label, key and type are required' });
  }
  const propertyCharacteristic = await PropertyCharacteristicService.createPropertyCharacteristic({
    label,
    key,
    type,
    options,
  });
  res.status(201).json(propertyCharacteristic);
};

export const updatePropertyCharacteristic = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { label, key, type } = req.body;
  const propertyCharacteristic = await PropertyCharacteristicService.updatePropertyCharacteristic(id, {
    label,
    key,
    type,
  });
  res.json(propertyCharacteristic);
};

export const deletePropertyCharacteristic = async (req: Request, res: Response) => {
  const { id } = req.params;
  await PropertyCharacteristicService.deletePropertyCharacteristic(id);
  res.status(204).send();
};

export const addCharacteristicOption = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { label, value } = req.body;
  if (!label || !value) {
    return res.status(400).json({ message: 'Label and value are required' });
  }
  const option = await PropertyCharacteristicService.addCharacteristicOption(id, { label, value });
  res.status(201).json(option);
};

export const updateCharacteristicOption = async (req: Request, res: Response) => {
  const { optionId } = req.params;
  const { label, value } = req.body;
  const option = await PropertyCharacteristicService.updateCharacteristicOption(optionId, { label, value });
  res.json(option);
};

export const deleteCharacteristicOption = async (req: Request, res: Response) => {
  const { optionId } = req.params;
  await PropertyCharacteristicService.deleteCharacteristicOption(optionId);
  res.status(204).send();
};
