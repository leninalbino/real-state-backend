import { Request, Response } from 'express';
import { z } from 'zod';
import * as PropertyService from './properties.service';
import type { ListingType, ModerationStatus } from '@prisma/client';

type AgentProfileResponse = {
  id: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  user?: {
    fullName?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
};

type PropertyResponse = {
  agentProfile?: AgentProfileResponse | null;
} & Record<string, unknown>;

const mapAgent = (agentProfile?: AgentProfileResponse | null) => {
  if (!agentProfile) return null;
  const user = agentProfile.user;
  return {
    id: agentProfile.id,
    name: agentProfile.displayName || user?.fullName || '',
    phone: agentProfile.contactPhone || user?.phone || '',
    email: agentProfile.contactEmail || user?.email || '',
    avatar: agentProfile.avatarUrl || '',
  };
};

const mapProperty = (property: PropertyResponse | null) => {
  if (!property) return property;
  const { agentProfile, ...rest } = property;
  return {
    ...rest,
    agent: mapAgent(agentProfile),
  };
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    const listingType = req.query.listingType
      ? String(req.query.listingType).toUpperCase().split(',').filter(Boolean)
      : undefined;
    const type = req.query.type
      ? String(req.query.type).split(',').filter(Boolean)
      : undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const location = req.query.location ? String(req.query.location).trim() : undefined;
    const bedrooms = req.query.bedrooms ? Number(req.query.bedrooms) : undefined;
    const bathrooms = req.query.bathrooms ? Number(req.query.bathrooms) : undefined;
    const areaMin = req.query.areaMin ? Number(req.query.areaMin) : undefined;
    const areaMax = req.query.areaMax ? Number(req.query.areaMax) : undefined;
    const amenities = req.query.amenities
      ? String(req.query.amenities).split(',').filter(Boolean)
      : undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;

    const result = await PropertyService.getProperties({
      listingType: listingType as ListingType[],
      type,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      location: location || undefined,
      bedrooms: Number.isFinite(bedrooms) ? bedrooms : undefined,
      bathrooms: Number.isFinite(bathrooms) ? bathrooms : undefined,
      areaMin: Number.isFinite(areaMin) ? areaMin : undefined,
      areaMax: Number.isFinite(areaMax) ? areaMax : undefined,
      amenities,
      page: Number.isFinite(page) ? page : undefined,
      pageSize: Number.isFinite(pageSize) ? pageSize : undefined,
    });
    res.json({
      data: result.data.map(mapProperty),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
};

export const getAdminProperties = async (req: Request, res: Response) => {
  try {
    const listingType = req.query.listingType
      ? String(req.query.listingType).toUpperCase().split(',').filter(Boolean)
      : undefined;
    const type = req.query.type
      ? String(req.query.type).split(',').filter(Boolean)
      : undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const location = req.query.location ? String(req.query.location).trim() : undefined;
    const bedrooms = req.query.bedrooms ? Number(req.query.bedrooms) : undefined;
    const bathrooms = req.query.bathrooms ? Number(req.query.bathrooms) : undefined;
    const areaMin = req.query.areaMin ? Number(req.query.areaMin) : undefined;
    const areaMax = req.query.areaMax ? Number(req.query.areaMax) : undefined;
    const amenities = req.query.amenities
      ? String(req.query.amenities).split(',').filter(Boolean)
      : undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
    const moderationStatus = req.query.moderationStatus
      ? (String(req.query.moderationStatus)
          .toUpperCase()
          .split(',')
          .filter(Boolean) as ModerationStatus[])
      : (['PENDING', 'APPROVED', 'REJECTED'] as ModerationStatus[]);

    const result = await PropertyService.getProperties({
      listingType: listingType as ListingType[],
      type,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      location: location || undefined,
      bedrooms: Number.isFinite(bedrooms) ? bedrooms : undefined,
      bathrooms: Number.isFinite(bathrooms) ? bathrooms : undefined,
      areaMin: Number.isFinite(areaMin) ? areaMin : undefined,
      areaMax: Number.isFinite(areaMax) ? areaMax : undefined,
      amenities,
      page: Number.isFinite(page) ? page : undefined,
      pageSize: Number.isFinite(pageSize) ? pageSize : undefined,
      moderationStatus,
    });
    res.json({
      data: result.data.map(mapProperty),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const property = await PropertyService.getPropertyById(req.params.id);
    if (property) {
      const moderationStatus = (property as { moderationStatus?: string })
        .moderationStatus;
      const isApproved = moderationStatus === 'APPROVED';
      const isAdmin = req.user?.role === 'admin';
      const isAgentOwner =
        req.user?.role === 'agent' &&
        (property as { agentProfile?: { user?: { id?: string } | null } | null })
          .agentProfile?.user?.id === req.user?.userId;

      if (!isApproved && !isAdmin && !isAgentOwner) {
        return res.status(404).json({ message: 'Property not found' });
      }

      res.json(mapProperty(property));
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching property' });
  }
};

export const createProperty = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const parsed = createPropertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const property = await PropertyService.createProperty(
      req.user.userId,
      parsed.data
    );
    return res.status(201).json(mapProperty(property));
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating property' });
  }
};

export const getMyProperties = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const properties = await PropertyService.getPropertiesByAgentId(req.user.userId);
    res.json(properties.map(mapProperty));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
};

export const updateMyProperty = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const parsed = updatePropertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const property = await PropertyService.updateMyProperty(
      req.params.id,
      req.user.userId,
      parsed.data
    );
    return res.json(mapProperty(property));
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Error updating property' });
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const parsed = updatePropertySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const property = await PropertyService.updateProperty(
      req.params.id,
      parsed.data
    );
    return res.json(mapProperty(property));
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating property' });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    await PropertyService.deleteProperty(req.params.id);
    return res.status(204).send();
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting property' });
  }
};

export const approveProperty = async (req: Request, res: Response) => {
  try {
    const property = await PropertyService.approveProperty(req.params.id);
    return res.json(mapProperty(property));
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({ message: 'Error approving property' });
  }
};

export const rejectProperty = async (req: Request, res: Response) => {
  try {
    const property = await PropertyService.rejectProperty(req.params.id);
    return res.json(mapProperty(property));
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({ message: 'Error rejecting property' });
  }
};

const createPropertySchema = z.object({
  title: z.string().min(2),
  price: z.number().positive(),
  currency: z.enum(['USD', 'RD']),
  location: z.string().min(2),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().nonnegative(),
  area: z.number().nonnegative(),
  type: z.string().min(2),
  listingType: z.enum(['SALE', 'RENT']),
  description: z.string().min(10),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactAvatar: z.string().optional(),
});

const updatePropertySchema = createPropertySchema.partial();
