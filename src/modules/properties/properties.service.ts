import prisma from '../../utils/prisma';
import type { Prisma, ListingType, ModerationStatus } from '@prisma/client';

type PropertyFilters = {
  listingType?: ListingType[];
  type?: string[];
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaMin?: number;
  areaMax?: number;
  amenities?: string[];
  page?: number;
  pageSize?: number;
  moderationStatus?: ModerationStatus[]; // For admin use
};

const buildWhereClause = (filters: PropertyFilters): Prisma.PropertyWhereInput => {
  const where: Prisma.PropertyWhereInput = {};

  // Default to only APPROVED properties for public queries
  where.moderationStatus = filters.moderationStatus ? { in: filters.moderationStatus } : { equals: 'APPROVED' };

  if (filters.listingType?.length) {
    where.listingType = { in: filters.listingType };
  }

  if (filters.type?.length) {
    where.type = { in: filters.type };
  }

  if (typeof filters.minPrice === 'number' || typeof filters.maxPrice === 'number') {
    where.price = {
      ...(typeof filters.minPrice === 'number' ? { gte: filters.minPrice } : {}),
      ...(typeof filters.maxPrice === 'number' ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.location) {
    const normalizedLocation = filters.location.trim();
    if (normalizedLocation) {
      where.location = { contains: normalizedLocation, mode: 'insensitive' };
    }
  }

  if (typeof filters.bedrooms === 'number') {
    where.bedrooms = { gte: filters.bedrooms };
  }

  if (typeof filters.bathrooms === 'number') {
    where.bathrooms = { gte: filters.bathrooms };
  }

  if (typeof filters.areaMin === 'number' || typeof filters.areaMax === 'number') {
    where.area = {
      ...(typeof filters.areaMin === 'number' ? { gte: filters.areaMin } : {}),
      ...(typeof filters.areaMax === 'number' ? { lte: filters.areaMax } : {}),
    };
  }

  if (filters.amenities?.length) {
    where.amenities = { hasSome: filters.amenities };
  }

  return where;
};

export const getProperties = async (filters: PropertyFilters) => {
  const where = buildWhereClause(filters);
  const maxPageSize = 50;
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0
    ? Math.min(filters.pageSize, maxPageSize)
    : 15;
  const skip = (page - 1) * pageSize;

  const total = await prisma.property.count({ where });
  const properties = await prisma.property.findMany({
    where,
    skip,
    take: pageSize,
    include: {
      agentProfile: {
        include: {
          user: true,
        },
      },
    },
  });
  return {
    data: properties,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      agentProfile: {
        include: {
          user: true,
        },
      },
    },
  });
  return property;
};

type CreatePropertyInput = {
  title: string;
  price: number;
  currency: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  listingType: ListingType;
  description: string;
  images?: string[];
  amenities?: string[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAvatar?: string;
};

const ensureAgentProfile = async (
  userId: string,
  input: CreatePropertyInput
) => {
  const existingProfile = await prisma.agentProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    return existingProfile;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  return prisma.agentProfile.create({
    data: {
      userId: user.id,
      displayName: input.contactName || user.fullName,
      avatarUrl: input.contactAvatar,
      contactEmail: input.contactEmail || user.email,
      contactPhone: input.contactPhone || user.phone,
      verified: false,
    },
  });
};

export const createProperty = async (
  userId: string,
  input: CreatePropertyInput
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }
  if (user.status !== 'active') {
    throw new Error('User suspended');
  }

  const agentProfile = await ensureAgentProfile(userId, input);

  const property = await prisma.property.create({
    data: {
      title: input.title,
      price: input.price,
      currency: input.currency,
      location: input.location,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area: input.area,
      type: input.type,
      listingType: input.listingType,
      moderationStatus: 'PENDING',
      description: input.description,
      images: input.images || [],
      amenities: input.amenities || [],
      agentProfileId: agentProfile.id,
    },
    include: {
      agentProfile: {
        include: {
          user: true,
        },
      },
    },
  });

  return property;
};

export const getPropertiesByAgentId = async (userId: string) => {
  const agentProfile = await prisma.agentProfile.findUnique({
    where: { userId },
  });

  if (!agentProfile) {
    return [];
  }

  const properties = await prisma.property.findMany({
    where: { agentProfileId: agentProfile.id },
    include: {
      agentProfile: {
        include: {
          user: true,
        },
      },
    },
  });

  return properties;
};

type UpdatePropertyInput = Partial<CreatePropertyInput>;

export const updateMyProperty = async (
  id: string,
  userId: string,
  input: UpdatePropertyInput
) => {
  const agentProfile = await prisma.agentProfile.findUnique({
    where: { userId },
  });

  if (!agentProfile) {
    throw new Error('Forbidden');
  }

  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property || property.agentProfileId !== agentProfile.id) {
    throw new Error('Forbidden');
  }

  const updatedProperty = await prisma.property.update({
    where: { id },
    data: {
      ...input,
      moderationStatus: 'PENDING', // Re-submit for approval on edit
      images: input.images || undefined,
      amenities: input.amenities || undefined,
    },
    include: {
      agentProfile: {
        include: {
          user: true,
        },
      },
    },
  });
  return updatedProperty;
};

export const updateProperty = async (
  id: string,
  input: UpdatePropertyInput
) => {
  const property = await prisma.property.update({
    where: { id },
    data: {
      ...input,
      images: input.images || undefined,
      amenities: input.amenities || undefined,
    },
    include: {
      agentProfile: {
        include: {
          user: true,
        },
      },
    },
  });
  return property;
};

export const deleteProperty = async (id: string) => {
  await prisma.property.delete({
    where: { id },
  });
};

export const approveProperty = async (id: string) => {
  const property = await prisma.property.update({
    where: { id },
    data: { moderationStatus: 'APPROVED' },
    include: {
      agentProfile: {
        include: {
          user: true,
        },
      },
    },
  });
  return property;
};

export const rejectProperty = async (id: string) => {
  const property = await prisma.property.update({
    where: { id },
    data: { moderationStatus: 'REJECTED' },
    include: {
      agentProfile: {
        include: {
          user: true,
        },
      },
    },
  });
  return property;
};

