"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation"; 
import { useAuthStore } from "@/services/store/authStore"; 
import Navbar from "@/components/Navbar";
// 🌐 ဘယ်ဖိုင်ကိုမှ အမှီအခိုမပြုသော ဆောက်ခဲ့သည့် profileService ကို Relative Path ဖြင့် Import ဆွဲယူခြင်း
import { profileService, ProfileUpdatePayload } from "../../../services/profileService"; 

export default function AgentProfile() {
const router = useRouter(); 
const token = useAuthStore((state) => (state as any).token); 
const logout = useAuthStore((state) => (state as any).logout); 

// 🔑 Zustand store ထဲမှ ဖြစ်နိုင်ခြေရှိသော User ID Key များအား အရင်စစ်ဆေးခြင်း
const storeUserId = useAuthStore((state) => 
  (state as any).user_id || (state as any).id || (state as any).userId || (state as any).agent_id
); 

// User ID State (Zustand တွင်မရှိပါက Cookie မှ ရှာဖွေရန်)
const [userId, setUserId] = useState<string | null>(null);

// Form input state
const [formData, setFormData] = useState({
    username: 'Agent 10#',
    email: 'agent10#@gmail.com', // Default fallback
    phone_no: '000000000', 
});

const [message, setMessage] = useState({ type: '', text: '' });

// Dashboard Stats State
const [ticketStats, setTicketStats] = useState({
    total: 100,
    issued: 70,
    pending: 15,
    refund: 15,
});

// 🔄 Component Mount ချိန်တွင် Cookie ထဲမှ Name နှင့် Email ကို ပေါင်းစပ်ပြီး တပြိုင်နက်တည်း ဆွဲထုတ်ခြင်း
useEffect(() => {
    const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
    };

    // ၁။ Saved Profile Name နှင့် Email အား Cookie မှ တစ်ခါတည်း ဆွဲယူပြီး Form ထဲ ထည့်သွင်းခြင်း
    const savedName = getCookie('name');
    const savedEmail = getCookie('email'); // 📧 Email Cookie ကိုပါ ရှာဖွေဖတ်ရှုခြင်း

    // ✅ အဓိကပြင်ဆင်ချက် - Name ရော Email ပါရှိလျှင် ပြိုင်တူ Dynamic အစားထိုးလဲလှယ်ပေးရန် ရေးသားထားပါသည်
    setFormData((prev) => ({
        ...prev,
        username: savedName ? decodeURIComponent(savedName) : 'Agent 10#',
        email: savedEmail ? decodeURIComponent(savedEmail) : 'agent10#@gmail.com',
    }));

    // ၂။ User ID အား ရှာဖွေသတ်မှတ်ခြင်း (Zustand သို့မဟုတ် Cookie)
    if (storeUserId) {
    setUserId(String(storeUserId));
    } else {
    const savedId = getCookie('id') || getCookie('user_id') || getCookie('agent_id');
    if (savedId) setUserId(savedId);
    }
}, [storeUserId]);

// --- Handlers ---
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
};

// 🚪 Logout ပြုလုပ်ချိန်တွင် သိမ်းဆည်းထားသော Email Cookie ပါ တစ်ခါတည်း သန့်ရှင်းရေးလုပ်ခြင်း
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

// 🔄 Profile Update ပြုလုပ်သည့် အပိုင်း
const submitProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!token) {
    setMessage({ type: 'error', text: 'Authentication missing. Please log in again.' });
    return;
    }

    if (!userId) {
    setMessage({ type: 'error', text: 'User identification missing. Cannot update profile.' });
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
        setMessage({ type: 'success', text: result.message || 'Profile edited successfully' });
        
        // 💾 အောင်မြင်ပါက Cookie ထဲသို့ Name ရော Email အသစ်ပါ တစ်ခါတည်း သက်တမ်းသတ်မှတ်ပြီး သိမ်းဆည်းပေးခြင်း
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
    setMessage({ type: 'error', text: 'An unexpected communication error occurred.' });
    }
};

return (
    <div className="w-full min-h-screen bg-gray-50 text-gray-900">
    <Navbar/>
    <div className="max-w-6xl mx-auto pt-5">
        
        {/* Top Header Bar */}
        <div className="flex justify-between items-center pb-4 mb-2">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
            <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Agent Profile
        </div>
        <button 
            onClick={handleLogout}
            className="text-red-600 font-bold hover:text-red-800 transition"
        >
            Logout
        </button>
        </div>

        {/* Alert Notification banner */}
        {message.text && (
        <div className={`p-4 mb-6 rounded text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.type === 'success' ? '✓' : '⚠️'} {message.text}
        </div>
        )}

        {/* Main Layout Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Change Information Form */}
        <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm h-fit">
            <h2 className="text-gray-700 font-semibold mb-6">Change Information</h2>
            <form onSubmit={submitProfileUpdate} className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name</label>
                <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full border border-gray-300 bg-white rounded px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                />
            </div>
            
            <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
                <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 bg-white rounded px-4 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

        {/* RIGHT COLUMN: Tickets Sold Dashboard */}
        <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm flex flex-col">
            <h2 className="text-gray-700 font-semibold mb-6">Tickets Sold</h2>
            
            <div className="grid grid-cols-2 gap-4 flex-grow">
            <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-gray-800 mb-1">Total Ticket Sale</span>
                <span className="text-3xl font-black text-indigo-900 mb-1">{ticketStats.total}</span>
                <span className="text-xs font-semibold text-gray-500">Tickets</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-gray-800 mb-1">Issued Tickets</span>
                <span className="text-3xl font-black text-green-600 mb-1">{ticketStats.issued}</span>
                <span className="text-xs font-semibold text-gray-500">Tickets</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-gray-800 mb-1">Pending Tickets</span>
                <span className="text-3xl font-black text-yellow-500 mb-1">{ticketStats.pending}</span>
                <span className="text-xs font-semibold text-gray-500">Tickets</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-gray-800 mb-1">Refund Tickets</span>
                <span className="text-3xl font-black text-red-600 mb-1">{ticketStats.refund}</span>
                <span className="text-xs font-semibold text-gray-500">Tickets</span>
            </div>
            </div>

            <div className="mt-6 flex justify-end">
            <button className="bg-[#1e1a9d] text-white font-semibold py-2 px-8 rounded hover:bg-blue-900 transition duration-200">
                View Details
            </button>
            </div>
        </div>

        </div>
    </div>
    </div>
);
}