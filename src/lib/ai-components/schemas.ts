// Runtime schemas for each AI-emittable component's props.
//
// Replaces the hand-rolled sanitization in stream-parser.ts. Each
// schema is the source of truth for what props a component accepts;
// the AI's output is validated against the matching schema and
// rejected if it doesn't conform. Inferred TS types kept in sync
// via z.infer<>.

import { z } from 'zod';

const httpUrl = z.string().url().refine((u) => /^https?:\/\//i.test(u), {
  message: 'Must be http(s) URL',
});

export const askAgainSchema = z.object({
  suggestions: z.array(z.string().min(1).max(120)).min(1).max(4),
});

export const availabilityChipSchema = z.object({
  status: z.enum(['open', 'limited', 'closed']),
  label: z.string().max(120).optional(),
});

export const bookCallSlotSchema = z.object({
  url: httpUrl,
  label: z.string().max(80).optional(),
  duration: z.string().max(40).optional(),
});

export const essayLinkSchema = z.object({
  title: z.string().min(1).max(160),
  url: httpUrl,
  excerpt: z.string().max(400).optional(),
  year: z.string().max(16).optional(),
});

export const hiringStatusSchema = z.object({
  status: z.enum(['open', 'fractional-only', 'advising-only', 'closed']),
  label: z.string().max(120).optional(),
});

export const locationCardSchema = z.object({
  city: z.string().min(1).max(120),
  timezone: z.string().max(40).optional(),
  travelStatus: z.string().max(200).optional(),
});

export const metricCardSchema = z.object({
  value: z.string().min(1).max(40),
  label: z.string().min(1).max(120),
  context: z.string().max(140).optional(),
});

export const projectMiniSchema = z.object({
  title: z.string().min(1).max(120),
  url: httpUrl.optional(),
  description: z.string().max(280).optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const quoteBlockSchema = z.object({
  quote: z.string().min(1).max(400),
  attribution: z.string().max(120).optional(),
});

export const rateCardSchema = z.object({
  tier: z.string().min(1).max(80),
  price: z.string().min(1).max(40),
  slots: z.string().max(160).optional(),
  cta: z.string().max(80).optional(),
  url: httpUrl.optional(),
});

export const stackListSchema = z.object({
  items: z.array(z.string().min(1).max(40)).min(1).max(20),
  label: z.string().max(60).optional(),
});

export const timelineSliceSchema = z.object({
  events: z
    .array(
      z.object({
        when: z.string().min(1).max(40),
        title: z.string().min(1).max(160),
        where: z.string().max(120).optional(),
      }),
    )
    .min(1)
    .max(8),
  heading: z.string().max(80).optional(),
});

// Discriminated union — pass any { type, props } and Zod validates
// against the matching schema. Unknown types fail; bad props for a
// known type fail; valid props pass through with .data populated.
export const renderableComponentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('AskAgain'), props: askAgainSchema }),
  z.object({ type: z.literal('AvailabilityChip'), props: availabilityChipSchema }),
  z.object({ type: z.literal('BookCallSlot'), props: bookCallSlotSchema }),
  z.object({ type: z.literal('EssayLink'), props: essayLinkSchema }),
  z.object({ type: z.literal('HiringStatus'), props: hiringStatusSchema }),
  z.object({ type: z.literal('LocationCard'), props: locationCardSchema }),
  z.object({ type: z.literal('MetricCard'), props: metricCardSchema }),
  z.object({ type: z.literal('ProjectMini'), props: projectMiniSchema }),
  z.object({ type: z.literal('QuoteBlock'), props: quoteBlockSchema }),
  z.object({ type: z.literal('RateCard'), props: rateCardSchema }),
  z.object({ type: z.literal('StackList'), props: stackListSchema }),
  z.object({ type: z.literal('TimelineSlice'), props: timelineSliceSchema }),
]);

export type ValidatedRenderableComponent = z.infer<typeof renderableComponentSchema>;
