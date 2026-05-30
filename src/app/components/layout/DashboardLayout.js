'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({
  user,
  activeSection,
  setActiveSection,
  collections,
  selectedCollection,
  setSelectedCollection,
  vpsStatus,
  vpsLoading,
  onLogout,
  onAddNewDocument,
  children
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 font-sans">
      {/* Top Bar */}
      <Topbar
        user={user}
        vpsStatus={vpsStatus}
        vpsLoading={vpsLoading}
        onLogout={onLogout}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          collections={collections}
          selectedCollection={selectedCollection}
          setSelectedCollection={setSelectedCollection}
          onAddNewDocument={onAddNewDocument}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto relative bg-zinc-950/40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="flex-1 p-8 md:p-10 relative z-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
