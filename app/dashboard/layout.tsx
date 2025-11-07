'use client';
import useAdminAuth from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/AdminSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAdminAuth(); // 🔒 Protects every /dashboard/** route

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f8f8' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
