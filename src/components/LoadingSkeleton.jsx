import React from 'react';

export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />
  );
}

export function LoadingCard() {
  return (
    <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function LoadingDashboard() {
  return (
    <div className="space-y-6">
      {/* Top Header Loading */}
      <div className="flex justify-between items-center">
        <div className="space-y-2 w-1/3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="glass-panel p-6 rounded-2xl space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>

      {/* Visual Chart Area loading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingChat() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-start">
        <div className="glass-panel p-4 rounded-2xl rounded-bl-none max-w-sm space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="bg-indigo-100 dark:bg-indigo-950/40 p-4 rounded-2xl rounded-br-none max-w-sm space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="glass-panel p-4 rounded-2xl rounded-bl-none max-w-sm space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
    </div>
  );
}
