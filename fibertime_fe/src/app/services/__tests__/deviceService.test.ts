import { api } from '../../../lib/api';
import * as deviceService from '../deviceService';

jest.mock('../../../lib/api');

describe('deviceService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchDeviceByCode', () => {
        it('returns device on success', async () => {
            const mockDevice = {
                deviceId: 'dev123',
                macAddress: 'AA:BB:CC:DD:EE:FF',
                status: 'active',
                expiresAt: 1234567890,
                code: 1234,
            };
            (api.get as jest.Mock).mockResolvedValue(mockDevice);

            const result = await deviceService.fetchDeviceByCode('1234');
            expect(result).toEqual(mockDevice);
            expect(api.get).toHaveBeenCalledWith('/api/device/1234');
        });

        it('throws or handles error on API failure', async () => {
            const error = { errorCode: 'DEVICE_NOT_FOUND', message: 'Device not found' };
            (api.get as jest.Mock).mockRejectedValue(error);

            await expect(deviceService.fetchDeviceByCode('9999')).rejects.toMatchObject(error);
        });
    });
});