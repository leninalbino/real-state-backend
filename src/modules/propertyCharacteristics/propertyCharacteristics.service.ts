import prisma from '../../utils/prisma';

export const getPropertyCharacteristics = () => {
  return prisma.propertyCharacteristic.findMany({ include: { options: true } });
};

export const getPropertyCharacteristicById = (id: string) => {
  return prisma.propertyCharacteristic.findUnique({
    where: { id },
    include: { options: true },
  });
};

export const createPropertyCharacteristic = (data: {
  label: string;
  key: string;
  type: string;
  options?: { label: string; value: string }[];
}) => {
  return prisma.propertyCharacteristic.create({
    data: {
      label: data.label,
      key: data.key,
      type: data.type,
      options: {
        create: data.options,
      },
    },
  });
};

export const updatePropertyCharacteristic = (
  id: string,
  data: {
    label?: string;
    key?: string;
    type?: string;
  }
) => {
  return prisma.propertyCharacteristic.update({ where: { id }, data });
};

export const deletePropertyCharacteristic = (id: string) => {
  return prisma.propertyCharacteristic.delete({ where: { id } });
};

export const addCharacteristicOption = (
  characteristicId: string,
  data: { label: string; value: string }
) => {
  return prisma.characteristicOption.create({
    data: {
      characteristicId,
      ...data,
    },
  });
};

export const updateCharacteristicOption = (
  id: string,
  data: { label?: string; value?: string }
) => {
  return prisma.characteristicOption.update({ where: { id }, data });
};

export const deleteCharacteristicOption = (id: string) => {
  return prisma.characteristicOption.delete({ where: { id } });
};
