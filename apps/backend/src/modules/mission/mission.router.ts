import { Router, Request, Response } from 'express';
import {
  detectMission,
  getMissionClusterConfig,
  getMissionRecommendations,
  getMissionCompletion,
} from './mission.service';
import { prisma } from '../../db';

const router = Router();

// GET /api/mission/clusters
router.get('/mission/clusters', async (req: Request, res: Response) => {
  try {
    const { mission } = req.query;
    const clusters = getMissionClusterConfig(mission as string | undefined);
    res.json(clusters);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch mission clusters' });
  }
});

// GET /api/mission/detect
router.get('/mission/detect', async (req: Request, res: Response) => {
  try {
    const { cartId, sessionId } = req.query;
    const result = await detectMission(cartId as string, sessionId as string);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to detect mission' });
  }
});

// GET /api/mission/recommendations
router.get('/mission/recommendations', async (req: Request, res: Response) => {
  try {
    const { mission, cartId, q } = req.query;
    const recommendations = await getMissionRecommendations(mission as string, cartId as string, q as string);
    res.json(recommendations);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch mission recommendations' });
  }
});

// GET /api/mission/completion
router.get('/mission/completion', async (req: Request, res: Response) => {
  try {
    const { cartId, mission } = req.query;
    const completion = await getMissionCompletion(cartId as string, mission as string);
    res.json(completion);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute mission completion' });
  }
});

// POST /api/events/log
router.post('/events/log', async (req: Request, res: Response) => {
  try {
    const { userId, sessionId, eventType, payload } = req.body;
    if (!eventType || !payload) {
      return res.status(400).json({ error: 'eventType and payload are required' });
    }
    const event = await prisma.missionSignalEvent.create({
      data: {
        userId: userId || null,
        sessionId: sessionId || 'default-session',
        eventType,
        payloadJson: payload,
      },
    });
    res.json({ success: true, eventId: event.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to log event' });
  }
});

export default router;
