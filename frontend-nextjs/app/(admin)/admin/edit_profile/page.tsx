"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from "@/services/store/authStore"; 
// 🌐 စာကြောင်းနံပါတ် (၆) လမ်းကြောင်းအမှန် (၄ ဆင့်ဆုတ်) သို့ ပြင်ဆင်ပြီး ဖြစ်ပါသည်
import { profileService, ProfileUpdatePayload } from "../../../../services/profileService"; 

export default function AdminEditProfile() {
const token = useAuthStore((state) => (state as any).token); 
const logout = useAuthStore((state) => (state as any).logout); 
const storeUserId = useAuthStore((state) => 
  (state as any).user_id || (state as any).id || (state as any).userId || (state as any).admin_id
);

const [userId, setUserId] = useState<string | null>(null);

const [profile, setProfile] = useState({
username: 'Loading...',
role: 'Administrator',
email: 'Loading...', 
});

const [formData, setFormData] = useState({
username: '',
email: '', 
phone_no: '093728228', 
});

const [passwords, setPasswords] = useState({
currentPassword: '',
newPassword: '',
confirmPassword: '',
});

const [message, setMessage] = useState({ type: '', text: '' });

// 🔄 Component Mount ချိန်တွင် Cookie ထဲမှ Name နှင့် Email ကို Dynamic ဆွဲထုတ်ခြင်း
useEffect(() => {
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    const savedName = getCookie('name');
    const savedRole = getCookie('role');
    const savedEmail = getCookie('email'); // 📧 Cookie ထဲမှ သိမ်းဆည်းထားသော Email အား ရှာဖွေခြင်း

    const decodedName = savedName ? decodeURIComponent(savedName) : 'admin01';
    const decodedRole = savedRole ? decodeURIComponent(savedRole) : 'Administrator';
    const decodedEmail = savedEmail ? decodeURIComponent(savedEmail) : 'admin@bluehorizon.com';

    setProfile({
        username: decodedName,
        role: decodedRole,
        email: decodedEmail,
    });

    setFormData((prev) => ({
        ...prev,
        username: decodedName,
        email: decodedEmail, // Input Form Box ထဲသို့ပါ Dynamic ထည့်သွင်းပေးခြင်း
    }));

    if (storeUserId) {
        setUserId(String(storeUserId));
    } else {
        const savedId = getCookie('id') || getCookie('user_id') || getCookie('admin_id');
        if (savedId) setUserId(savedId);
    }
}, [storeUserId]);

// --- Handlers ---
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setPasswords({ ...passwords, [e.target.name]: e.target.value });
};

// 🚪 Logout ပြုလုပ်ချိန်တွင် သိမ်းဆည်းထားသော Cookie များအားလုံးကို သန့်ရှင်းရေးလုပ်ခြင်း
const handleLogout = () => {
    logout(); 
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; // Email Cookie အား ဖျက်ခြင်း
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    window.location.href = "/login"; 
};

// 1. Profile Information Update Handler
const submitProfileUpdate = async (e: React.FormEvent) => {
e.preventDefault();
setMessage({ type: '', text: '' });

if (!token || !userId) {
    setMessage({ type: 'error', text: 'Authentication or User ID missing.' });
    return;
}

try {
    const payload: ProfileUpdatePayload = {
        username: formData.username,
        email: formData.email,
        phone_no: formData.phone_no || null,
    };

    const result = await profileService.updateProfile(Number(userId), payload, token);

    if (result.success) {
        // UI Screen ပေါ်ရှိ ပြသမှုများကို ချက်ချင်းပြောင်းလဲစေခြင်း
        setProfile((prev) => ({
            ...prev,
            username: formData.username,
            email: formData.email,
        }));
        setMessage({ type: 'success', text: result.message || 'Profile edited successfully' });
        
        // 💾 Cookie ထဲသို့ Name နှင့် Email အသစ်နှစ်ခုလုံးကို သက်တမ်းသတ်မှတ်ပြီး သိမ်းဆည်းပေးခြင်း
        if (result.data?.username) {
            document.cookie = `name=${encodeURIComponent(result.data.username)}; path=/; max-age=86400`;
        }
        if (result.data?.email) {
            document.cookie = `email=${encodeURIComponent(result.data.email)}; path=/; max-age=86400`;
        }
    } else {
        const errorDetails = result.error?.details || 'Validation error';
        setMessage({ type: 'error', text: `${result.message}: ${errorDetails}` });
    }
} catch (error) {
    console.error('Error updating profile:', error);
    setMessage({ type: 'error', text: 'An unexpected error occurred.' });
}
};

// 2. Password Update Request Handler
const submitPasswordUpdate = async (e: React.FormEvent) => {
e.preventDefault();
setMessage({ type: '', text: '' });

if (passwords.newPassword !== passwords.confirmPassword) {
    setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
    return;
}

if (!token || !userId) {
    setMessage({ type: 'error', text: 'Authentication missing.' });
    return;
}

try {
    const payload: ProfileUpdatePayload = {
        username: formData.username,
        email: formData.email,
        phone_no: formData.phone_no || null,
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword,
    };

    const result = await profileService.updateProfile(Number(userId), payload, token);

    if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully ✓' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
        const errorDetails = result.error?.details || 'Failed to update password';
        setMessage({ type: 'error', text: `${result.message}: ${errorDetails}` });
    }
} catch (error) {
    console.error('Error updating password:', error);
    setMessage({ type: 'error', text: 'An unexpected error occurred.' });
}
};

return (
<div className="w-full">
    
    {/* Alert Notification banner */}
    {message.text && (
    <div className={`p-4 mb-6 rounded text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {message.type === 'success' ? '✓' : '⚠️'} {message.text}
    </div>
    )}

    {/* Profile Layout Split Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    {/* Left Side Content Column */}
    <div className="space-y-6">
        
        <div className="bg-white border border-gray-200 rounded-md p-6 flex items-center gap-6 shadow-sm">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-500">
            <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}&backgroundColor=b6e3f4`} 
            alt="Admin Avatar" 
            className="w-full h-full object-cover"
            />
        </div>
        <div className="space-y-2 text-sm font-semibold text-gray-800">
            <p>Username : {profile.username}</p>
            <p>Role : {profile.role}</p>
            <p>Email : {profile.email}</p>
        </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-700 mb-6">Personal Information</h2>
        <form onSubmit={submitProfileUpdate} className="space-y-5">
            <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
            />
            </div>
            
            <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
            />
            </div>

            <input type="hidden" name="phone_no" value={formData.phone_no} />

            <button
            type="submit"
            className="w-full bg-black text-white font-semibold py-3 rounded hover:bg-gray-800 transition duration-200 mt-4"
            >
            Save Changes
            </button>
        </form>
        </div>
    </div>

    {/* Right Side Content Column (Security Settings Card) */}
    <div>
        <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm h-full">
        <h2 className="text-lg font-bold text-gray-700 mb-6">Security Settings</h2>
        <form onSubmit={submitPasswordUpdate} className="space-y-5">
            <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
            <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
            />
            </div>

            <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
            />
            </div>

            <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded px-4 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
            />
            </div>

            <button
            type="submit"
            className="w-full bg-black text-white font-semibold py-3 rounded hover:bg-gray-800 transition duration-200 mt-4"
            >
            Change Password
            </button>
        </form>
        </div>
    </div>

    </div>
</div>
);
}