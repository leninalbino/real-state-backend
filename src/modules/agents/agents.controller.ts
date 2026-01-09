import { Request, Response } from 'express';
import * as AgentService from './agents.service';

export const getAgents = async (req: Request, res: Response) => {
  try {
    const agents = await AgentService.getAgents();
    res.json(agents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching agents' });
  }
};

export const getAgentById = async (req: Request, res: Response) => {
  try {
    const agent = await AgentService.getAgentById(req.params.id);
    if (agent) {
      res.json(agent);
    } else {
      res.status(404).json({ message: 'Agent not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching agent' });
  }
};
