import { and, eq, sql } from 'drizzle-orm';

import { db } from '@/db';
import { dailyResourceStats, dailyStats, dailyVisitorEvents } from '@/db/schema';

export type TrackEventParams = {
  pageId: string;
  visitorId: string | null;
  eventType: string;
  resourceType?: string | null;
  resourceId?: string | null;
  resourceLabel?: string | null;
  createdAt?: Date;
};

/**
 * Updates daily aggregates based on a raw event.
 * This is duplicate-tolerant: it only increments the 'visitors' count once per visitor per day.
 */
export async function recordAggregate(params: TrackEventParams) {
  const {
    pageId,
    visitorId,
    eventType,
    resourceType,
    resourceId,
    resourceLabel,
    createdAt = new Date(),
  } = params;

  // Normalize date to YYYY-MM-DD
  const date = createdAt.toISOString().split('T')[0];

  // 1. Check for duplicate visitor today
  let isNewVisitor = false;
  if (visitorId) {
    try {
      // We use a separate table to track visitor-event-day uniqueness.
      // In a real high-scale app, this might be a Bloom filter or Redis.
      await db.insert(dailyVisitorEvents).values({
        pageId,
        visitorId,
        date,
        eventType,
        resourceId: resourceId ?? null,
      });
      isNewVisitor = true;
    } catch {
      // Conflict means we've already seen this visitor for this event today.
      isNewVisitor = false;
    }
  }

  // 2. Map raw event to aggregate type if necessary
  // Specifically, 'contact_submit' without a sectionId is a 'dm_conversion'.
  let effectiveEventType = eventType;
  if (eventType === 'contact_submit' && !resourceId) {
    effectiveEventType = 'dm_conversion';
  }

  // 3. Upsert into appropriate aggregate table
  if (resourceId && resourceType) {
    await db
      .insert(dailyResourceStats)
      .values({
        pageId,
        date,
        eventType: effectiveEventType,
        resourceType,
        resourceId,
        resourceLabel,
        count: 1,
        visitors: isNewVisitor ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [
          dailyResourceStats.pageId,
          dailyResourceStats.date,
          dailyResourceStats.eventType,
          dailyResourceStats.resourceId,
        ],
        set: {
          count: sql`${dailyResourceStats.count} + 1`,
          visitors: isNewVisitor
            ? sql`${dailyResourceStats.visitors} + 1`
            : dailyResourceStats.visitors,
          resourceLabel: resourceLabel ?? dailyResourceStats.resourceLabel,
        },
      });
  } else {
    await db
      .insert(dailyStats)
      .values({
        pageId,
        date,
        eventType: effectiveEventType,
        count: 1,
        visitors: isNewVisitor ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [dailyStats.pageId, dailyStats.date, dailyStats.eventType],
        set: {
          count: sql`${dailyStats.count} + 1`,
          visitors: isNewVisitor
            ? sql`${dailyStats.visitors} + 1`
            : dailyStats.visitors,
        },
      });
  }

  // Special case: if it was a DM conversion, we ALSO want to increment 'contact_submit' total views
  // if we want to keep raw totals. But usually dm_conversion is enough.
}
