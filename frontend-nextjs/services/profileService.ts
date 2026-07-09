import { api } from "./apiClient"; // ✅ apiClient ကို ပုံစံမှန်အတိုင်း ချိတ်ဆက်လိုက်ပါပြီ
import { ApiResponse } from "./apiClient"; // အကယ်၍ ApiResponse ကလည်း apiClient ထဲမှာ ရှိလျှင်

// 1. Profile Update ပြုလုပ်ရန် လှမ်းပို့ရမည့် Data Interface
export interface ProfileUpdatePayload {
  username: string;
  email: string;
  phone_no?: string | null;
  current_password?: string | null; // Admin များအတွက် Password အဟောင်း (Optional)
  new_password?: string | null;     // Admin များအတွက် Password အသစ် (Optional)
}

// 2. API အောင်မြင်ပါက ပြန်လည်ရရှိမည့် Data Structure Interface
export interface ProfileResponseData {
  user_id: number;
  role: string;
  username: string;
  email: string;
  phone_no: string;
}

// 3. Profile Management Service Object
export const profileService = {
  /**
   * User ID ကို အသုံးပြု၍ Profile အချက်အလက်များကို Update ပြုလုပ်ရန်
   */
  updateProfile: async (
    userId: number,
    payload: ProfileUpdatePayload,
    token: string
  ): Promise<ApiResponse<ProfileResponseData>> => {
    return api.put<ProfileResponseData>(
      `/api/profile/${userId}`, 
      payload, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};