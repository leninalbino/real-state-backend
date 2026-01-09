import prisma from '../src/utils/prisma';

async function main() {
  console.log('Seeding database...');

  // DATA MIGRATION: Rename 'status' to 'moderationStatus' and add 'listingType'
  console.log('Running data migration for Property model...');
  try {
    const result = await prisma.$runCommandRaw({
      update: 'Property',
      updates: [
        {
          q: { status: { $exists: true } }, // Find documents with the old 'status' field
          u: [
            {
              $set: {
                moderationStatus: '$status',
                listingType: 'SALE' // Default all existing properties to SALE
              }
            },
            {
              $unset: 'status'
            }
          ],
          multi: true,
        },
      ],
    });
    console.log(`Property migration result: ${JSON.stringify(result)}`);
  } catch (e) {
    console.error("Could not run property migration, maybe it was already applied.", e);
  }


  const user1 = await prisma.user.upsert({
    where: { email: 'agent1@example.com' },
    update: {},
    create: {
      email: 'agent1@example.com',
      passwordHash: '$2a$10$6aYl3p6Y3gI0fE7J2pT4QeXcDpk6xPH2bA2T8xVxO1a7x3dpk/5ne',
      fullName: 'Alice Smith',
      phone: '+1-555-1234',
      role: 'agent',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'agent2@example.com' },
    update: {},
    create: {
      email: 'agent2@example.com',
      passwordHash: '$2a$10$6aYl3p6Y3gI0fE7J2pT4QeXcDpk6xPH2bA2T8xVxO1a7x3dpk/5ne',
      fullName: 'Bob Johnson',
      phone: '+1-555-5678',
      role: 'agent',
    },
  });

  const agent1 = await prisma.agentProfile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      displayName: 'Alice Smith',
      avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      contactEmail: 'agent1@example.com',
      contactPhone: '+1-555-1234',
      verified: true,
    },
  });

  const agent2 = await prisma.agentProfile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      displayName: 'Bob Johnson',
      avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      contactEmail: 'agent2@example.com',
      contactPhone: '+1-555-5678',
      verified: true,
    },
  });

  const propertyTypes = [
    { key: 'apartment', name: 'Apartamento' },
    { key: 'house', name: 'Casa' },
    { key: 'villa', name: 'Villa' },
    { key: 'penthouse', name: 'Penthouse' },
    { key: 'lot', name: 'Terreno' },
    { key: 'commercial', name: 'Local Comercial' },
  ];

  for (const type of propertyTypes) {
    await prisma.propertyType.upsert({
      where: { key: type.key },
      update: { name: type.name },
      create: type,
    });
  }

  const propertyCharacteristics = [
    { key: 'furnished', label: 'Amueblado', type: 'select' },
    { key: 'area_m2', label: 'Mts²', type: 'number_range' },
    { key: 'bedrooms', label: 'Habitaciones', type: 'select' },
    { key: 'bathrooms', label: 'Baños', type: 'select' },
    { key: 'laundry_area', label: 'Área lavado', type: 'boolean' },
    { key: 'assigned_parking', label: 'Parqueo asignado', type: 'boolean' },
    { key: 'elevator', label: 'Ascensor', type: 'boolean' },
    { key: 'pool', label: 'Piscina', type: 'boolean' },
    { key: 'unassigned_parking', label: 'Parqueo no asignado', type: 'boolean' },
    { key: 'recreation_area', label: 'Área recreación', type: 'boolean' },
  ];

  for (const characteristic of propertyCharacteristics) {
    await prisma.propertyCharacteristic.upsert({
      where: { key: characteristic.key },
      update: { label: characteristic.label, type: characteristic.type },
      create: characteristic,
    });
  }

  const characteristics = await prisma.propertyCharacteristic.findMany();
  const findCharacteristic = (key: string) =>
    characteristics.find((item) => item.key === key);

  const selectOptions = [
    {
      key: 'furnished',
      options: [
        { label: 'Sí', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Parcialmente amueblado', value: 'partial' },
      ],
    },
    {
      key: 'bedrooms',
      options: [
        { label: '1 habitación', value: '1' },
        { label: '2 habitaciones', value: '2' },
        { label: '3 habitaciones', value: '3' },
        { label: '4+ habitaciones', value: '4+' },
      ],
    },
    {
      key: 'bathrooms',
      options: [
        { label: '1 baño', value: '1' },
        { label: '2 baños', value: '2' },
        { label: '3 baños', value: '3' },
        { label: '4+ baños', value: '4+' },
      ],
    },
  ];

  for (const group of selectOptions) {
    const characteristic = findCharacteristic(group.key);
    if (!characteristic) continue;
    for (const option of group.options) {
      await prisma.characteristicOption.upsert({
        where: {
          characteristicId_value: {
            characteristicId: characteristic.id,
            value: option.value,
          },
        },
        update: { label: option.label },
        create: {
          label: option.label,
          value: option.value,
          characteristicId: characteristic.id,
        },
      });
    }
  }

  const heroSlides = [
    {
      title: 'Villas exclusivas en Cap Cana',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920',
      isLocal: false,
      order: 1,
    },
    {
      title: 'Apartamentos de lujo en Piantini',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920',
      isLocal: false,
      order: 2,
    },
    {
      title: 'Residencial en Las Terrenas',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920',
      isLocal: false,
      order: 3,
    },
    {
      title: 'Nuestra Identidad',
      image: 'http://localhost:5173/assets/arco.png',
      isLocal: true,
      order: 4,
    },
  ];

  for (const slide of heroSlides) {
    await prisma.heroSlide.upsert({
      where: { title: slide.title },
      update: slide,
      create: slide,
    });
  }

  // Create properties
  await prisma.property.upsert({
    where: { id: '65c6a1b2c3d4e5f6a7b8c9d0' }, // Example ID, replace with a real one if needed
    update: {},
    create: {
      title: 'Modern Apartment in City Center',
      price: 250000,
      currency: 'USD',
      location: 'Downtown, New York',
      bedrooms: 2,
      bathrooms: 2.5,
      area: 1200,
      type: 'apartment',
      listingType: 'SALE',
      moderationStatus: 'APPROVED',
      description: 'A beautiful modern apartment with stunning city views.',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5OTJ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhYXJ0bWVudHxlbnwwfHx8fDE3MDc1MjY0MDB8MA&ixlib=rb-4.0.3&q=80&w=1080',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5OTJ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhYXJ0bWVudHxlbnwwfHx8fDE3MDc1MjY0MDB8MA&ixlib=rb-4.0.3&q=80&w=1080',
      ],
      amenities: ['Gym', 'Pool', 'Balcony'],
      agentProfileId: agent1.id,
    },
  });

  await prisma.property.upsert({
    where: { id: '65c6a1b2c3d4e5f6a7b8c9d1' }, // Example ID, replace with a real one if needed
    update: {},
    create: {
      title: 'Spacious Family House with Garden',
      price: 4500,
      currency: 'USD',
      location: 'Suburbia, Los Angeles',
      bedrooms: 4,
      bathrooms: 3,
      area: 2500,
      type: 'house',
      listingType: 'RENT',
      moderationStatus: 'APPROVED',
      description: 'Perfect family home with a large garden and quiet neighborhood.',
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba38a72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5OTJ8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBob3VzZXxlbnwwfHx8fDE3MDc1MjY0MDF8MA&ixlib=rb-4.0.3&q=80&w=1080',
        'https://images.unsplash.com/photo-1580587771525-78b9dba38a72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzQ5OTJ8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBob3VzZXxlbnwwfHx8fDE3MDc1MjY0MDF8MA&ixlib=rb-4.0.3&q=80&w=1080',
      ],
      amenities: ['Garden', 'Garage', 'Pet-friendly'],
      agentProfileId: agent2.id,
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
