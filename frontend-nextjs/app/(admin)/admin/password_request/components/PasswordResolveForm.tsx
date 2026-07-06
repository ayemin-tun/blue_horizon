'use client';

import { useState } from 'react';
import { PasswordRequest } from '@/services/passwordRequestService';
import { User, Mail, X } from 'lucide-react';
import { toast } from '@/services/store/alertStore';
import Modal from '@/components/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: PasswordRequest | null;
  onSubmit: (id: number, newPassword: string) => void;
  isLoading: boolean;
}

export default function PasswordResolveForm({ isOpen, onClose, request, onSubmit, isLoading }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    onSubmit(request.id, newPassword);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset Agent Password" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Agent Info Preview */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-slate-700">
            <User className="w-4 h-4" />
            <span className="text-sm font-semibold">{request.username}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Mail className="w-4 h-4" />
            <span>{request.email}</span>
          </div>
        </div>

        {/* Password Fields */}
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">New Password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm border-slate-200 text-black focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm text-black border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-900 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}