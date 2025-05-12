import { api } from '../../../lib/api';
import * as bundleService from '../bundleService';

jest.mock('../../../lib/api');

describe('bundleService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchAllBundles', () => {
        it('returns bundles on success', async () => {
            const mockBundles = [{ _id: '1', name: 'Test', description: '', duration_days: 30, price: 10 }];
            (api.get as jest.Mock).mockResolvedValue({ bundles: mockBundles });

            const result = await bundleService.fetchAllBundles();
            expect(result.bundles).toEqual(mockBundles);
        });

        it('throws or handles error on API failure', async () => {
            (api.get as jest.Mock).mockRejectedValue({
                errorCode: 'INTERNAL_ERROR',
                message: 'Something went wrong',
            });

            await expect(bundleService.fetchAllBundles()).rejects.toMatchObject({
                errorCode: 'INTERNAL_ERROR',
                message: 'Something went wrong',
            });
        });
    });

    describe('fetchUserBundle', () => {
        it('returns user bundle and data balance', async () => {
            const mockBundle = { _id: '1', name: 'UserBundle', description: '', duration_days: 30, price: 20 };
            (api.authGet as jest.Mock).mockResolvedValue({ bundle: mockBundle, dataBalance: 100 });

            const result = await bundleService.fetchUserBundle();
            expect(result.bundles).toEqual([mockBundle]);
            expect(result.dataBalance).toBe(100);
        });

        it('returns empty array if user has no bundle', async () => {
            (api.authGet as jest.Mock).mockResolvedValue({ bundle: null, dataBalance: null });
            const result = await bundleService.fetchUserBundle();
            expect(result.bundles).toEqual([]);
            expect(result.dataBalance).toBeNull();
        });
    });

    describe('connectDevice', () => {
        it('calls api.authPost with correct params', async () => {
            const mockResponse = { success: true };
            (api.authPost as jest.Mock).mockResolvedValue(mockResponse);

            const deviceId = 'device123';
            const bundleId = 'bundle456';
            const result = await bundleService.connectDevice(deviceId, bundleId);

            expect(api.authPost).toHaveBeenCalledWith('/api/device/connect-device', {
                deviceId,
                bundleId,
            });
            expect(result).toBe(mockResponse);
        });

        it('throws or handles error on API failure', async () => {
            (api.authPost as jest.Mock).mockRejectedValue({
                errorCode: 'INTERNAL_ERROR',
                message: 'Failed to connect device',
            });

            await expect(bundleService.connectDevice('device123', 'bundle456')).rejects.toMatchObject({
                errorCode: 'INTERNAL_ERROR',
                message: 'Failed to connect device',
            });
        });
    });
});

