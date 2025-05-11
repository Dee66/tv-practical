'use client';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';

export default function TooManyRequestsPage() {
    const router = useRouter();

    const handleGoBack = () => {
        router.push('/auth/login');
    };

    return (
        <main className="centered-content">
            <Paper elevation={6} className="hero-wrapper" sx={{ padding: 4, textAlign: 'center' }}>
                <Typography variant="h4" color="error" fontWeight={700} gutterBottom>
                    Too Many Requests
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    You have exceeded the maximum number of OTP requests. Please wait a few minutes before trying again.
                </Typography>
                <Button variant="contained" color="primary" onClick={handleGoBack}>
                    Go Back to Log in
                </Button>
            </Paper>
        </main>
    );
}