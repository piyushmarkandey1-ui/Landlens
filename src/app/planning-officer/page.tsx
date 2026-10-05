'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanningOfficerRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/planning');
  }, [router]);
  return null;
}
