'use client';

import { useState } from 'react';
import { PasswordRequest } from '@/services/passwordRequestService';
import { X, Loader2 } from 'lucide-react';

interface PasswordResolveFormProps {
  isOpen: boolean;
  onClose: () => void;
  request: PasswordRequest | null;
  onSubmit: (id: number, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

export default function PasswordResolveForm({ isOpen, onClose, request, onSubmit, isLoading }: PasswordResolveFormProps) {
  const [password, setPassword] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    await onSubmit(request.id, password);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Resolve Password</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New Password for <span className="text-blue-600 font-bold">{request.username}</span>
            </label>
            <input 
              type="text" 
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter at least 6 characters" 
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Saving...' : 'Confirm Reset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}