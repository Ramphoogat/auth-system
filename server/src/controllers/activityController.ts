import { Request, Response } from 'express';
import { ActivityLog } from '../models/ActivityLog.js';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'username email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

export const createLog = async (req: Request, res: Response) => {
  try {
    const { action, module, description } = req.body;
    const user = (req as any).user;
    
    const log = new ActivityLog({
      user: user ? user._id : undefined,
      action,
      module,
      description
    });
    
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ message: 'Error creating log' });
  }
};
