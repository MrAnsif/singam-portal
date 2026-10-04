// app/(dashboard)/dashboard/loading.tsx
// Shown automatically by Next.js App Router while dashboard data loads
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div>
        <div className="skeleton h-7 w-64 mb-2" />
        <div className="skeleton h-4 w-40" />
      </div>

      {/* Period selector skeleton */}
      <div className="skeleton h-10 w-96" />

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="skeleton h-4 w-28 mb-3" />
            <div className="skeleton h-8 w-32 mb-2" />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="skeleton h-5 w-40 mb-4" />
          <div className="skeleton h-48 w-full" />
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="skeleton h-5 w-40 mb-4" />
          <div className="skeleton h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
