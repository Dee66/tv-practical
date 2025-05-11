import {api} from "../../lib/api";
import {AppException} from "../../lib/AppException";

export interface LoginResponse {
    success: boolean;
    accessToken: string;
    deviceCode: string;
    user: {
        id: string;
        cell_number: string;
    };
}

// Request OTP
export async function requestOtp(cellNumber: string): Promise<{ otp?: string }> {
    try {
        return await api.post<{ otp?: string }>
        (`/api/auth/request-otp`, {cellNumber});
    } catch (err) {
        throw AppException.from(err);
    }
}

// Verify OTP and login
export async function verifyOtpAndLogin(cellNumber: string, otp: string): Promise<LoginResponse> {
    try {
        return await api.post<LoginResponse>(
            `/api/auth/login`, // not verify-otp as per spec
            {cellNumber, otp}
        );
    } catch (err) {
        throw AppException.from(err);
    }
}

// todo DP --> unused
export async function getConnectionStatus(deviceCode: string): Promise<{ isConnected: boolean }> {
    try {
        return await api.get<{ isConnected: boolean }>(`/api/device/connection-status/${deviceCode}`);
    } catch (err) {
        throw AppException.from(err);
    }
}