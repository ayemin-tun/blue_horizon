import { ReactNode } from 'react';

export default function PasswordRequestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-slate-50/50">
      {children}
    </div>
  );
}