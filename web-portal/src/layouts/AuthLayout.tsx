import { ReactNode } from 'react';
import { Heart } from 'lucide-react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-navy p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Heart className="h-6 w-6 text-white" fill="white" />
          </div>
          <div>
            <span className="text-lg font-bold">AparaiTech</span>
            <span className="block text-xs text-white/60">Baby & Pregnancy Wellness</span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Admin Console
          </h2>
          <p className="max-w-md text-white/70">
            Manage users, content, subscriptions, and support operations for the AparaiTech Baby & Pregnancy Wellness platform.
          </p>
          <div className="flex gap-8">
            <div>
              <div className="text-2xl font-bold text-primary">12K+</div>
              <div className="text-sm text-white/60">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">4K+</div>
              <div className="text-sm text-white/60">Subscriptions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">186</div>
              <div className="text-sm text-white/60">Articles</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/40">
          (C) 2026 AparaiTech. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-navy">AparaiTech Admin</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
