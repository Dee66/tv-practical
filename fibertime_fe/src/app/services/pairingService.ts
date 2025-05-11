import {api} from "../../lib/api";
import {AppException} from "../../lib/AppException";
import { Bundle } from "./bundleService";

interface Device {
    deviceId: string;
    pairingCode: string;
    expiresAt: string;
    status: string;
}

type PairDeviceResponse = {
    deviceId: string;
    macAddress: string;
    status: string;
    expiresAt: string | Date;
    bundle?: Bundle;
};

export async function createPairingCode(macAddress: string): Promise<Device> {
    try {
        return await api.post<Device>(`/api/device/create-device-code`, {mac_address: macAddress});
    } catch (err) {
        throw AppException.from(err);
    }
}

export async function validatePairingCode(pairingCode: string): Promise<PairDeviceResponse> {
    try {
        return await api.post<PairDeviceResponse>(`/api/device/connect-tv`, {pairingCode});
    } catch (err) {
        throw AppException.from(err);
    }
}