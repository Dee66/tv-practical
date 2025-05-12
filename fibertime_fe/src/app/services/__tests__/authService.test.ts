import { api } from '../../../lib/api';
import { AppException } from '../../../lib/AppException';
import * as authService from '../authService';

jest.mock('../../../lib/api');

describe('authService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('requestOtp', () => {
        it('returns otp on success', async () => {
            (api.post as jest.Mock).mockResolvedValue({ otp: '123456' });
            const result = await authService.requestOtp('0123456789');
            expect(result).toEqual({ otp: '123456' });
            expect(api.post).toHaveBeenCalledWith('/api/auth/request-otp', { cellNumber: '0123456789' });
        });

        it('throws AppException on error', async () => {
            const error = { errorCode: 'INTERNAL_ERROR', message: 'Failed' };
            (api.post as jest.Mock).mockRejectedValue(error);

            await expect(authService.requestOtp('0123456789')).rejects.toBeInstanceOf(AppException);
        });
    });

    describe('verifyOtpAndLogin', () => {
        it('returns login response on success', async () => {
            const mockResponse = {
                success: true,
                accessToken: 'token',
                deviceCode: 'device',
                user: { id: '1', cell_number: '0123456789' }
            };
            (api.post as jest.Mock).mockResolvedValue(mockResponse);

            const result = await authService.verifyOtpAndLogin('0123456789', '123456');
            expect(result).toEqual(mockResponse);
            expect(api.post).toHaveBeenCalledWith('/api/auth/login', { cellNumber: '0123456789', otp: '123456' });
        });

        it('throws AppException on error', async () => {
            const error = { errorCode: 'INVALID_OTP', message: 'OTP is invalid' };
            (api.post as jest.Mock).mockRejectedValue(error);

            await expect(authService.verifyOtpAndLogin('0123456789', '123456')).rejects.toBeInstanceOf(AppException);
        });
    });
});