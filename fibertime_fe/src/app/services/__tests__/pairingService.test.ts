import { api } from '../../../lib/api';
import { AppException } from '../../../lib/AppException';
import * as pairingService from '../pairingService';

jest.mock('../../../lib/api');

describe('pairingService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPairingCode', () => {
        it('returns device on success', async () => {
            const mockDevice = {
                deviceId: 'dev123',
                pairingCode: 'PAIR123',
                expiresAt: '2025-01-01T00:00:00Z',
                status: 'pending',
            };
            (api.post as jest.Mock).mockResolvedValue(mockDevice);

            const result = await pairingService.createPairingCode('AA:BB:CC:DD:EE:FF');
            expect(result).toEqual(mockDevice);
            expect(api.post).toHaveBeenCalledWith('/api/device/create-device-code', { mac_address: 'AA:BB:CC:DD:EE:FF' });
        });

        it('throws AppException on error', async () => {
            const error = { errorCode: 'INTERNAL_ERROR', message: 'Failed to create code' };
            (api.post as jest.Mock).mockRejectedValue(error);

            await expect(pairingService.createPairingCode('AA:BB:CC:DD:EE:FF')).rejects.toBeInstanceOf(AppException);
        });
    });

    describe('validatePairingCode', () => {
        it('returns pair device response on success', async () => {
            const mockResponse = {
                deviceId: 'dev123',
                macAddress: 'AA:BB:CC:DD:EE:FF',
                status: 'active',
                expiresAt: '2025-01-01T00:00:00Z',
                bundle: { _id: '1', name: 'Bundle', description: '', duration_days: 30, price: 10 },
            };
            (api.authPost as jest.Mock).mockResolvedValue(mockResponse);

            const result = await pairingService.validatePairingCode('PAIR123');
            expect(result).toEqual(mockResponse);
            expect(api.authPost).toHaveBeenCalledWith('/api/device/connect-tv', { pairingCode: 'PAIR123' });
        });

        it('throws AppException on error', async () => {
            const error = { errorCode: 'INVALID_CODE', message: 'Invalid pairing code' };
            (api.authPost as jest.Mock).mockRejectedValue(error);

            await expect(pairingService.validatePairingCode('BADCODE')).rejects.toBeInstanceOf(AppException);
        });
    });
});