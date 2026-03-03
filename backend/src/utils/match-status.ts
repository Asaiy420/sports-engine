import { MATCH_STATUS } from '../validation/matches';
import { matches } from '../db/schema';
import type { InferSelectModel } from 'drizzle-orm';

type MatchStatus = MatchInput['status'];
type MatchInput = Pick<
  InferSelectModel<typeof matches>,
  'startTime' | 'endTime' | 'status'
>;

export function getMatchStauts(
  startTime: Date | null,
  endTIme: Date | null,
  now = new Date()
): MatchStatus | null {
  if (startTime === null || endTIme === null) {
    return null;
  }

  const start = new Date(startTime);
  const end = new Date(endTIme);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED as MatchStatus;
  }
  if (now >= end) {
    return MATCH_STATUS.FINISHED as MatchStatus;
  }

  return MATCH_STATUS.LIVE as MatchStatus;
}

export async function syncMatchStatus(
  match: MatchInput,
  updateStauts: (status: MatchStatus) => Promise<void> | void
) {
  const nextStatus = getMatchStauts(match.startTime, match.endTime);

  if (!nextStatus) {
    return match.status;
  }

  if (match.status !== nextStatus) {
    await updateStauts(nextStatus);
    match.status = nextStatus;
  }

  return match.status;
}
