'use client';

import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppException } from "../../../lib/AppException";
import OtpSimulator from '../../components/OtpSimulator';
import { useSimulator } from "../../context/simulatorContext";
import { requestOtp } from '../../services/authService';
import PhoneInput from '../components/PhoneInput';
import styles from '../../Home.module.css';

export default function LoginPage() {
    const [cellNumber, setCellNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { openOtpSimulator, otpSimulatorOpen } = useSimulator();
    const router = useRouter();

    useEffect(() => {
        openOtpSimulator();
    }, [openOtpSimulator]);

    const handlePhoneSubmit = async () => {
        setSubmitted(true);
        setLoading(true);
        setError(null);

        try {
            openOtpSimulator();
            await requestOtp(cellNumber);
        } catch (err) {
            const appErr = AppException.from(err);
            if (appErr.message.includes('Too many requests')) {
                router.push('/errors/too-many-requests');
                return;
            }
            setError(appErr.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['landing-container']}>
            <Paper elevation={8} className={styles['hero-paper']}>
                <Typography variant="h4" className={styles['hero-title']} gutterBottom>
                    Log in to your Account
                </Typography>
                <Typography variant="subtitle1" className={styles['hero-subtitle']}>
                    Enter your cellphone number to receive a one-time password (OTP).
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <div className={styles['phone-input-wrapper']}>
                    <div className={styles['phone-input-inner']}>
                        <PhoneInput
                            cellNumber={cellNumber}
                            setCellNumber={setCellNumber}
                            onSubmit={handlePhoneSubmit}
                            loading={loading}
                            submitted={submitted}
                            setSubmitted={setSubmitted}
                        />
                    </div>
                </div>
            </Paper>
            {otpSimulatorOpen && <OtpSimulator cellNumber={cellNumber} />}
        </div>
    );
}