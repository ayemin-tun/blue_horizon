import { api } from "./apiClient";
import { ApiResponse } from "./apiClient"; 

export interface ProfileUpdatePayload {
  username: string;
  email: string;
  phone_no?: string | null;
  current_password?: string | null; 
  new_password?: string | null;     
}

export interface ProfileResponseData {
  user_id: number;
  role: string;
  username: string;
  email: string;
  phone_no: string;
  is_email_verified: number;
}

// 3. Profile Management Service Object
export const profileService = {
  
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