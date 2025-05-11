import {api} from "../../lib/api";

export interface DeviceFoundResponse {
    deviceId: string;
    macAddress: string;
    status: string;
    expiresAt: string;
    bundle?: string;
}

export interface DeviceNotFoundResponse {
    message: string;
    device: null;
}

export type Device = {
    deviceId: string;
    macAddress: string;
    status: string;
    expiresAt: number;
    code: number;
};

export type GetDeviceByCodeResponse = DeviceFoundResponse | DeviceNotFoundResponse;

// Get Device By Code
export async function fetchDeviceByCode(deviceCode: string): Promise<Device> {
    return await api.get<Device>(`/api/device/${deviceCode}`);
}
