'use client';

import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('./Dashboard'), { ssr: false });

export default function DashboardWrapper({ user }) {
  return <Dashboard user={user} />;
}
