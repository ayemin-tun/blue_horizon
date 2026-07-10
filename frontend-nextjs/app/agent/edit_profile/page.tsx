"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/services/store/authStore";
import { profileService, ProfileUpdatePayload } from "../../../services/profileService";
import { toast } from "@/services/store/alertStore";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Loader2,
  Settings,
} from "lucide-react";

export default function AgentProfile() {
  // --- Pull current user info from the auth store (set at login) ---
  const { userId, name, email: storedEmail, phone_no: storedPhone, role, setAuth, logout } = useAuthStore((state) => state);
  const getValidToken = useAuthStore((state) => state.getValidToken);

  // --- Profile display block (top banner) ---
  const [profile, setProfile] = useState({
    username: name || "",
    email: storedEmail || "",
    role: role || "agent",
  });

  // --- Personal info form (name / email / phone only) ---
  const [formData, setFormData] = useState({
    username: name || "",
    email: storedEmail || "",
    phone_no: storedPhone || "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Keep local state in sync if the store changes
  useEffect(() => {
    setProfile({
      username: name || "",
      email: storedEmail || "",
      role: role || "agent",
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

  // --- Force logout after an agent changes their email, matching the same
  //     pattern used in ProfileDropdown's handleLogout (store clear + cookie
  //     clear + hard redirect via window.location.href, not router.push) ---
  const forceLogoutAfterEmailChange = () => {
    logout();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // ⚠️ window.location.href, not router.push — forces a full reload so no
    // stale state/components stick around after the session is invalidated.
    window.location.href = "/login?alert_action=email_change";
  };

  // --- Save name / email / phone_no ---
  const submitProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getValidToken();
    if (!userId || !token) {
      toast.warning("Your session has expired, please login again");
      return;
    }

    setIsSaving(true);
    try {
      const payload: ProfileUpdatePayload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone_no: formData.phone_no?.trim() || null,
      };

      // Detect whether the email is actually changing, BEFORE the request
      const emailIsChanging = formData.email.trim().toLowerCase() !== storedEmail?.toLowerCase();

      const result = await profileService.updateProfile(userId, payload, token);

      if (result.success && result.data) {
        const updatedData = result.data;

        // Agent + email changed + backend confirms it's no longer verified
        // -> force logout so they must re-verify before using the app again
        if (role === "agent" && emailIsChanging && updatedData.is_email_verified === 0) {
          toast.success("Profile updated. Please verify your new email address before logging in again.");
          forceLogoutAfterEmailChange();
          return; // stop here — page is navigating away, don't touch local state
        }

        // Normal case (username/phone changed, or admin changed email): just sync state
        toast.success("Profile updated successfully!");

        setProfile((prev) => ({
          ...prev,
          username: updatedData.username,
          email: updatedData.email,
        }));

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
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      {/* Premium Top Info Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xs overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linedar-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        <div className="w-20 h-20 bg-linear-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shrink-0 shadow-inner">
          <User className="w-10 h-10 stroke-[1.5]" />
        </div>

        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{profile.username}</h1>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50/80 text-blue-700 border border-blue-100 shadow-3xs">
              <ShieldCheck className="w-3.5 h-3.5" /> {profile.role}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
              <Mail className="w-3.5 h-3.5" /> {profile.email}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information Form Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage your account profile details</p>
          </div>
          <span className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 shadow-3xs">
            <Settings className="w-4 h-4 animate-[spin_8s_linear_infinite]" />
          </span>
        </div>

        <form onSubmit={submitProfileUpdate} className="p-6 space-y-6">
          {/* Full Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                <User className="w-4 h-4 stroke-[1.8]" />
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full bg-slate-50/40 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/8 shadow-3xs"
                required
              />
            </div>
          </div>

          {/* Email Address Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4 stroke-[1.8]" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-slate-50/40 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/8 shadow-3xs"
                required
              />
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                <Phone className="w-4 h-4 stroke-[1.8]" />
              </span>
              <input
                type="text"
                name="phone_no"
                value={formData.phone_no}
                onChange={handleInputChange}
                placeholder="09-xxxxxxxxx"
                className="w-full bg-slate-50/40 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/8 shadow-3xs"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-slate-800 transition duration-150 active:scale-[0.98] text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}