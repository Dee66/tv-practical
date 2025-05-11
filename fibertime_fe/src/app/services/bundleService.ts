import { api } from "../../lib/api";

export type Bundle = {
    _id: string;
    name: string;
    description: string;
    duration_days: number;
    price: number;
};

export interface BundlesResponse {
    bundles: Bundle[];
    dataBalance?: number | null;
}

// todo DP --> url feels dodge
// improve
export async function fetchUserBundle(): Promise<BundlesResponse> {
    const res = await api.authGet<{ bundle: Bundle | null; dataBalance?: number | null }>('/api/user/user-bundle');
    return {
        bundles: res.bundle ? [res.bundle] : [],
        dataBalance: res.dataBalance ?? null,
    };
}

export async function fetchAllBundles(): Promise<BundlesResponse> {
    return api.get<BundlesResponse>(
        '/api/bundles'
    );
}

export async function connectDevice(deviceId: string, bundleId: string) {
    return api.authPost('/api/device/connect-device', {
        deviceId,
        bundleId,
    });
}
