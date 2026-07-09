"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from "@/services/store/authStore";
import { profileService, ProfileUpdatePayload } from "../../../../services/profileService";
import { toast } from '@/services/store/alertStore';
import { User, Mail, Lock, ShieldCheck, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';

interface MessageState {
  type: 'success' | 'error' | null;
  text: string;
}

export default function AdminEditProfile() {

  // --- Pull current user info from the auth store (set at login) ---
  const { userId, name, email: storedEmail, phone_no: storedPhone, role, setAuth } = useAuthStore((state) => state);
  const getValidToken = useAuthStore((state) => state.getValidToken);

  // --- Profile display block (top banner) ---
  const [profile, setProfile] = useState({
    username: name || "",
    email: storedEmail || "",
    role: role || "admin",
  });

  // --- Personal info form ---
  const [formData, setFormData] = useState({
    username: name || "",
    email: storedEmail || "",
    phone_no: storedPhone || "",
  });

  // --- Password form ---
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Keep local state in sync if the store changes (e.g. after re-login)
  useEffect(() => {
    setProfile({
      username: name || "",
      email: storedEmail || "",
      role: role || "admin",
    });
    setFormData({
      username: name || "",
      email: storedEmail || "",
      phone_no: storedPhone || "",
    });
  }, [name, storedEmail, storedPhone, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  // --- Save name / email / phone_no ---
  const submitProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getValidToken();
    if (!userId || !token) {
      toast.warning("Your session has expired, please login again");
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload: ProfileUpdatePayload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone_no: formData.phone_no?.trim() || null,
      };

      const result = await profileService.updateProfile(userId, payload, token);

      if (result.success && result.data) {
        const updatedData = result.data;
        toast.success("Profile updated successfully!");

        setProfile((prev) => ({
          ...prev,
          username: updatedData.username,
          email: updatedData.email,
        }));

        // Keep the auth store (and cookies used elsewhere) in sync with the new name/email
        setAuth(
          token,
          3600000,
          updatedData.user_id,
          updatedData.username,
          updatedData.role,
          updatedData.phone_no,
          updatedData.email
        );
      } else {
        const errMsg = result.error?.details || result.message || "Failed to update profile";
        toast.error(errMsg);
      }
    } catch (error) {
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Save new password (admin only, per backend rule) ---
  const submitPasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getValidToken();
    if (!userId || !token) {
      toast.warning("Your session has expired, please login again");
      return;
    }

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.warning("Please fill in all password fields");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.warning("New password and confirm password do not match");
      return;
    }

    setIsSavingPassword(true);
    try {
      // Backend requires username/email on every PUT, so we send the current values
      // alongside the password fields.
      const payload: ProfileUpdatePayload = {
        username: profile.username,
        email: profile.email,
        phone_no: formData.phone_no?.trim() || null,
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
      };

      const result = await profileService.updateProfile(userId, payload, token);

      if (result.success) {
        toast.success("Password changed successfully!");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const errMsg = result.error?.details || result.message || "Failed to change password";
        toast.error(errMsg);
      }
    } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">

      {/* Profile Layout Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Side: Avatar Card & Personal Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Premium Top Info Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-600 to-indigo-600"></div>

            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border-2 border-blue-100 shrink-0">
              <User className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-xl font-bold text-slate-800">{profile.username}</h1>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> {profile.role}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                  <Mail className="w-3.5 h-3.5" /> {profile.email}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information Form Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
              <p className="text-xs text-slate-400 mt-0.5">Update your basic professional identity</p>
            </div>

            <form onSubmit={submitProfileUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="phone_no"
                    value={formData.phone_no}
                    onChange={handleInputChange}
                    placeholder="09-xxxxxxxxx"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full sm:w-auto px-6 bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-slate-800 transition active:scale-[0.98] text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Security Settings Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800">Security Settings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage and rotation your access credentials</p>
            </div>

            <form onSubmit={submitPasswordUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition active:scale-[0.98] text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingPassword ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}