'use client';

import { useEffect } from 'react';
import { initApiTiming } from '@/lib/api-timing';
import { initVitals } from '@/lib/vitals';

export function VitalsReporter() {
  useEffect(() => {
    initVitals();
    initApiTiming();
  }, []);
  return null;
}
