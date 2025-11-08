'use client';
import useAdminAuth from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useAdminAuth(); // client-side auth protection

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f8f8' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
