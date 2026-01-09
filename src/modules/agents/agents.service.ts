import prisma from '../../utils/prisma';

export const getAgents = async () => {
  const agents = await prisma.agentProfile.findMany({
    include: {
      user: true,
      _count: {
        select: { properties: true },
      },
    },
  });
  return agents;
};

export const getAgentById = async (id: string) => {
  const agent = await prisma.agentProfile.findUnique({
    where: { id },
    include: {
      user: true,
      properties: true,
    },
  });
  return agent;
};
