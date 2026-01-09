import prisma from '../../utils/prisma';

type PropertyTypeResponse = { key: string; name: string };
type OptionResponse = { label: string; value: string };
type CharacteristicResponse = {
  key: string;
  label: string;
  type: string;
  options: OptionResponse[];
};

export const getPropertyTypes = async () => {
  const types = (await prisma.propertyType.findMany({
    orderBy: { name: 'asc' },
  })) as PropertyTypeResponse[];
  return types.map((type) => ({
    id: type.key,
    name: type.name,
  }));
};

export const getPropertyCharacteristics = async () => {
  const characteristics = (await prisma.propertyCharacteristic.findMany({
    include: { options: true },
    orderBy: { label: 'asc' },
  })) as CharacteristicResponse[];

  return characteristics.map((char) => ({
    id: char.key,
    label: char.label,
    type: char.type as 'select' | 'number_range' | 'boolean',
    options: char.options.map((option: OptionResponse) => ({
      label: option.label,
      value: option.value,
    })),
  }));
};
