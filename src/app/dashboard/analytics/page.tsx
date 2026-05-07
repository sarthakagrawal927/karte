import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { db, ensureProjectsTable } from '@/db';
import { dailyResourceStats, dailyStats, dailyVisitorEvents, pageEvents, pages } from '@/db/schema';
import { getSession } from '@/lib/auth-server';

function formatNumber(value: number | string | null) {
  const num = typeof value === 'string' ? Number.parseInt(value, 10) : (value as number);
  return new Intl.NumberFormat('en-US').format(num || 0);
}

function relativeTime(value: Date | string | null) {
  if (!value) return 'just now';
  const date = typeof value === 'string' ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {helper && <p className="mt-2 text-sm text-gray-400">{helper}</p>}
    </div>
  );
}

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/login');

  const page = await db.query.pages.findFirst({
    where: eq(pages.userId, session.user.id),
  });

  if (!page) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="rounded-2xl border border-white/20 bg-white/5 p-8 text-center backdrop-blur-xl">
          <p className="text-gray-400">Create a page first to start collecting analytics.</p>
        </div>
      </div>
    );
  }

  await ensureProjectsTable();

  // 1. Fetch Historical Totals from aggregates
  const totals = await db
    .select({
      eventType: dailyStats.eventType,
      count: sql<number>`SUM(${dailyStats.count})`,
    })
    .from(dailyStats)
    .where(eq(dailyStats.pageId, page.id))
    .groupBy(dailyStats.eventType);

  const resourceTotals = await db
    .select({
      eventType: dailyResourceStats.eventType,
      count: sql<number>`SUM(${dailyResourceStats.count})`,
    })
    .from(dailyResourceStats)
    .where(eq(dailyResourceStats.pageId, page.id))
    .groupBy(dailyResourceStats.eventType);

  const getCount = (type: string, source: { eventType: string; count: number }[]) =>
    source.find((s) => s.eventType === type)?.count || 0;

  const pageViews = getCount('page_view', totals);
  const hookOpens = getCount('hook_open', totals);
  const dmConversions = getCount('dm_conversion', totals);

  const outboundClicks = getCount('outbound_click', resourceTotals);
  const chatClicks = getCount('chat_cta_click', resourceTotals);

  // Total unique visitors across all time
  const [visitorRes] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${dailyVisitorEvents.visitorId})` })
    .from(dailyVisitorEvents)
    .where(eq(dailyVisitorEvents.pageId, page.id));
  const uniqueVisitors = visitorRes?.count || 0;

  // 2. Trends (Last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateLimit = sevenDaysAgo.toISOString().split('T')[0];

  const dailyAggs = await db
    .select({
      date: dailyStats.date,
      eventType: dailyStats.eventType,
      count: dailyStats.count,
    })
    .from(dailyStats)
    .where(and(eq(dailyStats.pageId, page.id), gte(dailyStats.date, dateLimit)));

  const dailyResourceAggs = await db
    .select({
      date: dailyResourceStats.date,
      eventType: dailyResourceStats.eventType,
      count: dailyResourceStats.count,
    })
    .from(dailyResourceStats)
    .where(and(eq(dailyResourceStats.pageId, page.id), gte(dailyResourceStats.date, dateLimit)));

  const dailyMap = new Map<string, { views: number; sectionViews: number; clicks: number }>();
  for (const row of dailyAggs) {
    const bucket = dailyMap.get(row.date) || { views: 0, sectionViews: 0, clicks: 0 };
    if (row.eventType === 'page_view') bucket.views += row.count;
    dailyMap.set(row.date, bucket);
  }
  for (const row of dailyResourceAggs) {
    const bucket = dailyMap.get(row.date) || { views: 0, sectionViews: 0, clicks: 0 };
    if (row.eventType === 'section_view') bucket.sectionViews += row.count;
    if (row.eventType === 'outbound_click') bucket.clicks += row.count;
    dailyMap.set(row.date, bucket);
  }

  const dailyRows = [...dailyMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  // 3. Top Rows
  const topDestinations = await db
    .select({
      label: dailyResourceStats.resourceLabel,
      resourceType: dailyResourceStats.resourceType,
      clicks: sql<number>`SUM(${dailyResourceStats.count})`,
    })
    .from(dailyResourceStats)
    .where(and(eq(dailyResourceStats.pageId, page.id), eq(dailyResourceStats.eventType, 'outbound_click')))
    .groupBy(dailyResourceStats.resourceId)
    .orderBy(desc(sql`SUM(${dailyResourceStats.count})`))
    .limit(5);

  const topSections = await db
    .select({
      label: dailyResourceStats.resourceLabel,
      resourceType: dailyResourceStats.resourceType,
      views: sql<number>`SUM(${dailyResourceStats.count})`,
    })
    .from(dailyResourceStats)
    .where(and(eq(dailyResourceStats.pageId, page.id), eq(dailyResourceStats.eventType, 'section_view')))
    .groupBy(dailyResourceStats.resourceId)
    .orderBy(desc(sql`SUM(${dailyResourceStats.count})`))
    .limit(5);

  // 4. Recent Activity (still from pageEvents for real-time feel)
  const recentEvents = await db
    .select()
    .from(pageEvents)
    .where(eq(pageEvents.pageId, page.id))
    .orderBy(desc(pageEvents.createdAt))
    .limit(8);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Beta
        </span>
      </div>
      <p className="text-sm text-gray-400">
        Durable aggregates for views, clicks, and chat interactions.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Page views" value={formatNumber(pageViews)} helper="Total historical views" />
        <MetricCard label="Unique visitors" value={formatNumber(uniqueVisitors)} helper="Across all time" />
        <MetricCard label="Outbound clicks" value={formatNumber(outboundClicks)} helper="Link and project clicks" />
        <MetricCard label="Chat / Hook" value={formatNumber(chatClicks + hookOpens)} helper="CTA clicks and widget opens" />
        <MetricCard label="DM Leads" value={formatNumber(dmConversions)} helper="Messages via DM widget" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-gray-400">No events yet.</p>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {event.eventType === 'page_view'
                          ? 'Page viewed'
                          : event.eventType === 'section_view'
                            ? 'Section viewed'
                            : event.eventType === 'contact_submit'
                              ? 'Lead captured'
                              : event.eventType === 'hook_open'
                                ? 'Chat widget opened'
                                : event.eventType === 'chat_cta_click'
                                  ? 'Chat CTA clicked'
                                  : 'Outbound click'}
                      </p>
                      <p className="mt-1 truncate text-sm text-gray-400">
                        {event.resourceLabel || event.resourceId || 'Public page'}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-500">
                      {relativeTime(event.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Top destinations</h2>
          <div className="mt-4 space-y-3">
            {topDestinations.length === 0 ? (
              <p className="text-sm text-gray-400">No outbound clicks yet.</p>
            ) : (
              topDestinations.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{item.label || 'Unknown'}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.resourceType ?? 'outbound'}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                      {item.clicks}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Top sections</h2>
          <div className="mt-4 space-y-3">
            {topSections.length === 0 ? (
              <p className="text-sm text-gray-400">No section views yet.</p>
            ) : (
              topSections.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{item.label || 'Untitled'}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.resourceType ?? 'section'}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                      {item.views}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white">Last 7 days</h2>
        <div className="mt-4 space-y-3">
          {dailyRows.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            dailyRows.map(([day, metrics]) => (
              <div
                key={day}
                className="rounded-xl border border-white/10 bg-white/5 p-4 sm:grid sm:grid-cols-[120px_1fr_90px_90px_80px] sm:items-center sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0"
              >
                <p className="text-sm text-gray-400">{day}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10 sm:mt-0">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${Math.min(100, metrics.views * 20)}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-white sm:contents sm:text-sm">
                  <p className="text-left sm:text-right">{metrics.views} views</p>
                  <p className="text-left sm:text-right">{metrics.sectionViews} section</p>
                  <p className="text-left sm:text-right">{metrics.clicks} clicks</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
