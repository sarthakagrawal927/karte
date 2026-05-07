'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';

export function DashboardTracker() {
  useEffect(() => {
    posthog.capture('dashboard_activated');
  }, []);

  return null;
}
