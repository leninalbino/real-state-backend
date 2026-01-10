import prisma from '../../utils/prisma';

export const getPropertyTypes = () => {
  return prisma.propertyType.findMany();
};

export const getPropertyTypeById = (id: string) => {
  return prisma.propertyType.findUnique({ where: { id } });
};

export const createPropertyType = (data: { name: string; key: string }) => {
  return prisma.propertyType.create({ data });
};

export const updatePropertyType = (id: string, data: { name?: string; key?: string }) => {
  return prisma.propertyType.update({ where: { id }, data });
};

export const deletePropertyType = (id: string) => {
  return prisma.propertyType.delete({ where: { id } });
};
