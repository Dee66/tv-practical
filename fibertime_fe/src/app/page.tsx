'use client';

import React from 'react';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import WifiIcon from '@mui/icons-material/Wifi';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import PeopleIcon from '@mui/icons-material/People';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Home.module.css';

export default function HomePage() {
    const router = useRouter();

    const handleCellphoneRoute = () => {
        router.push('/auth/login');
    };

    return (
        <div className={styles['landing-container']}>
            <Paper elevation={8} className={styles['hero-paper']}>
                <Typography variant="h3" className={styles['hero-title']} gutterBottom>
                    Welcome to FiberTime!
                </Typography>
                <Typography variant="h6" className={styles['hero-subtitle']} gutterBottom>
                    Connect. Share. Thrive. <br />
                    Enjoy seamless internet with a splash of color and community.
                </Typography>
                <div>
                    <Link href="/auth/login" passHref legacyBehavior>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<PhoneIphoneIcon />}
                            onClick={handleCellphoneRoute}
                            className={styles['login-btn']}
                        >
                            Log In with Cellphone
                        </Button>
                    </Link>
                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                        Quick, secure access with a one-time code.
                    </Typography>
                </div>
            </Paper>

            <div className={styles['feature-cards']}>
                <div className={styles['feature-card']}>
                    <WifiIcon sx={{ color: '#1976d2', fontSize: 48, mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Effortless Connection
                    </Typography>
                    <Typography color="text.secondary">
                        Stay online with reliable, high-speed access—no fuss, just flow.
                    </Typography>
                </div>
                <div className={`${styles['feature-card']} ${styles['yellow']}`}>
                    <FlashOnIcon sx={{ color: '#ffd600', fontSize: 48, mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Instant Activation
                    </Typography>
                    <Typography color="text.secondary">
                        Get started in moments—no paperwork, no waiting, just instant joy.
                    </Typography>
                </div>
                <div className={styles['feature-card']}>
                    <PeopleIcon sx={{ color: '#1976d2', fontSize: 48, mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Friendly Community
                    </Typography>
                    <Typography color="text.secondary">
                        Support and smiles from real people—your neighbors, not robots.
                    </Typography>
                </div>
            </div>

            <footer className={styles.footer}>
                <Typography variant="body2">
                    &copy; {new Date().getFullYear()} FiberTime Demo &mdash; Bringing color to connectivity.
                </Typography>
            </footer>
        </div>
    );
}