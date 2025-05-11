'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { webSocketService } from '../../../lib/WebSocketService';

export default function DeviceConnectingPage() {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const deviceCode = searchParams.get('code');

    const handleDeviceConnected = (data: { deviceCode: string; status: string }) => {
        if (data.deviceCode === deviceCode && data.status === 'CONNECTED') {
            setStatus('connected');
            router.push(`/bundles?deviceCode=${deviceCode}`);
        }
    };

    const subscribeToPairEvents = async () => {
        webSocketService.connect();
        webSocketService.on('connected', handleDeviceConnected);
    };

    useEffect(() => {
        if (!deviceCode) {
            setStatus('failed');
            setError("Device code is missing");
            return;
        }

        subscribeToPairEvents();
    }, [deviceCode, router]);

    const renderContent = () => {
        if (status === 'failed') {
            return (
                <>
                    <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
                        Failed to Connect
                    </Typography>
                    <Typography align="center" color="error" sx={{ mb: 3 }}>
                        {error || 'An unknown error occurred.'}
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => router.push('/')}
                    >
                        Return to Home
                    </Button>
                </>
            );
        }

        return (
            <>
                <Typography
                    variant="h5"
                    fontWeight={700}
                    align="center"
                    gutterBottom
                >
                    {status === 'connected' ? 'Device Connected!' : 'Connecting Device...'}
                </Typography>
                <Typography align="center">
                    {status === 'connected'
                        ? 'Your device is now paired and ready to use.'
                        : 'Please wait while we connect your device.\nThis may take a few seconds.'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    {status === 'connected' ? null : <CircularProgress color="primary" />}
                </Box>
                {status === 'connected' && (
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3 }}
                        onClick={() => router.push('/')}
                    >
                        Return to Home
                    </Button>
                )}
            </>
        );
    };

    return (
        <main className="centered-content">
            <Paper elevation={6} className="hero-wrapper">
                {renderContent()}
            </Paper>
        </main>
    );
}