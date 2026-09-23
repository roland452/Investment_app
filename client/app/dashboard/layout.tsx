export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-black text-white px-4 md:px-8 py-8">{children}</div>;
}