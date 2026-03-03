import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from '../validation/matches';
import { db } from '../db/db';
import { matches } from '../db/schema';
import { getMatchStatus } from '../utils/match-status';
import { desc } from 'drizzle-orm';

export const matchRouter = Router();
const MAX_LIMIT = 100;

matchRouter.get('/', async (req: Request, res: Response) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid Query',
      details: parsed.error.issues,
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt)) // new ones appear at top
      .limit(limit);

    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list matches' });
  }
});

matchRouter.post('/', async (req: Request, res: Response) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid Payload',
      details: parsed.error.issues,
    });
  }

  try {
    const startTime = new Date(parsed.data.startTime);
    const endTime = new Date(parsed.data.endTime);
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime,
        endTime,
        homeScore: parsed.data.homeScore ?? 0,
        awayScore: parsed.data.awayScore ?? 0,
        status: getMatchStatus(startTime, endTime) ?? 'scheduled',
      })
      .returning();

    res.status(201).json({ data: event });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create match' });
  }
});
