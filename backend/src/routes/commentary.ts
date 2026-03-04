import { Router } from 'express';
import type { Request, Response } from 'express';
import { createCommentarySchema } from '../validation/commentary';
import { db } from '../db/db';
import { commentary } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { listCommentaryQuery } from '../validation/commentary';
import { matchIdParamSchema } from '../validation/matches';

export const commentaryRouter = Router({ mergeParams: true });
const MAX_LIMIT = 100;

commentaryRouter.get('/', async (req: Request, res: Response) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      error: 'Invalid Parameter',
      details: paramsResult.error.issues,
    });
  }

  const queryResult = listCommentaryQuery.safeParse(req.query);

  if (!queryResult.success) {
    return res.status(400).json({
      error: 'Invalid Query',
      details: queryResult.error.issues,
    });
  }

  try {
    const { id: matchId } = paramsResult.data;
    const { limit = MAX_LIMIT } = queryResult.data;

    const safeLimit = Math.min(limit, MAX_LIMIT);

    const results = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt)) // new ones appear at top
      .limit(safeLimit);

    res.status(200).json({ results });
  } catch (e) {
    res.status(500).json({
      error: 'Failed to list commentaries',
      details: JSON.stringify(e),
    });
  }
});

commentaryRouter.post('/', async (req: Request, res: Response) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      error: 'Invalid Match ID',
      details: paramsResult.error.issues,
    });
  }

  const bodyResult = createCommentarySchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      error: 'Invalid Commentary Payload',
      details: bodyResult.error.issues,
    });
  }

  try {
    const { ...rest } = bodyResult.data;
    const [result] = await db
      .insert(commentary)
      .values({
        matchId: paramsResult.data.id,
        ...rest,
      })
      .returning();

    if (res.app.locals.broadcastCommentary && result) { 
      res.app.locals.broadcastCommentary(result?.matchId, result);
    }

    res.status(201).json({ data: result });
  } catch (e) {
    console.error('Failed to create commentary', e);
    res.status(500).json({ error: 'Failed to create commentary' });
  }
});
