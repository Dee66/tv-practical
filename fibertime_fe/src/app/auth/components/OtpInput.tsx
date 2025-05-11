'use client';

import React, {useEffect, useRef} from 'react';
import Typography from '@mui/material/Typography';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from '@mui/material/CircularProgress';

interface OtpInputProps {
    otp: string;
    setOtp: (value: string) => void;
    onSubmit: () => void;
    loading: boolean;
    error: string | null;
    setError: (value: string | null) => void;
    otpSent: boolean;
}

export default function OtpInput({
                                     otp,
                                     setOtp,
                                     onSubmit,
                                     loading,
                                     error,
                                     setError,
                                     otpSent,
                                 }: OtpInputProps) {
    const otpInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (otpInputRef.current && !otpSent) {
            otpInputRef.current.focus();
        }
    }, [otpSent]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!/^\d{6}$/.test(otp)) {
            setError("OTP must be a 6-digit numeric code");
            return;
        }
        onSubmit();
    };

    if (otpSent) {
        return (
            <div style={{width: '60%', textAlign: 'center'}}>
                <Typography variant="h6" color="text.secondary" sx={{mb: 2}}>
                    OTP sent to your phone. Please enter it in the simulator.
                </Typography>
                <Typography variant="body1" color="primary" sx={{fontWeight: 'bold'}}>
                    OTP: {otp || 'Loading...'}
                </Typography>
                {loading && <CircularProgress size={24} color="inherit" sx={{mt: 2}}/>}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{width: '60%'}}>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading || otp.length !== 6}
                sx={{
                    borderRadius: 2,
                    px: 5,
                    mt: 1,
                    opacity: otp.length !== 6 ? 0.9 : 1,
                    pointerEvents: otp.length !== 6 ? 'none' : 'auto',
                }}
            >
                {loading ? <CircularProgress size={24} color="inherit"/> : 'Verify OTP'}
            </Button>
        </form>
    );
}