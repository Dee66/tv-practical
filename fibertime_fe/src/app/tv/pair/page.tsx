'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef, useState } from 'react';
import { AppException } from '../../../lib/AppException';
import PairingSimulator from '../../components/PairingSimulator';
import TVSimulator from '../../components/TVSimulator';
import { useSimulator } from '../../context/simulatorContext';
import styles from '../../Home.module.css';
import { createPairingCode } from '../../services/pairingService';

export default function PairTVPage() {
    const [macAddress, setMacAddress] = useState('AA:BB:CC:DD:EE:02');
    const [loading, setLoading] = useState(false);
    const [device, setDevice] = useState<{
        deviceId: string;
        expiresAt: string;
        status: string;
        pairingCode: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const {
        setTVPairingCode,
        tvSimulatorOpen,
        pairingSimulatorOpen,
        openTVSimulator,
        openPairingSimulator,
    } = useSimulator();

    const effectRan = useRef(false);

    useEffect(() => {
        if (device && device.status === 'active' && !effectRan.current) {
            setTVPairingCode(device.pairingCode);
            openTVSimulator();
            openPairingSimulator();
            effectRan.current = true;
        }
    }, [device, setTVPairingCode, openTVSimulator, openPairingSimulator]);

    const handleCreatePairingCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setDevice(null);

        try {
            const data = await createPairingCode(macAddress);
            setDevice({
                deviceId: data.deviceId,
                expiresAt: data.expiresAt,
                status: data.status,
                pairingCode: data.pairingCode,
            });
            effectRan.current = false;
        } catch (err) {
            const appErr = AppException.from(err);
            setError(appErr.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="centered-content">
            <div className="tv-pair-center">
                <div className="hero-wrapper">
                    <Typography variant="h4" className="hero-title" gutterBottom align="center">
                        Pair a new TV
                    </Typography>
                    <Typography variant="subtitle1" className="hero-subtitle" align="center" gutterBottom>
                        Enter your TV's MAC address to generate a pairing code.
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                            {error}
                        </Alert>
                    )}
                    <form onSubmit={handleCreatePairingCode} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', marginTop: 16 }}>
                        <TextField
                            label="TV MAC Address"
                            variant="outlined"
                            value={macAddress}
                            onChange={(e) => setMacAddress(e.target.value.toUpperCase())}
                            disabled={loading}
                            required
                            margin="normal"
                            slotProps={{
                                input: {
                                    inputMode: 'text',
                                    autoComplete: 'off',
                                    style: {
                                        textAlign: 'center',
                                        letterSpacing: 2,
                                        fontVariant: 'tabular-nums',
                                        fontSize: 18,
                                    }
                                }
                            }}
                            className="mac-input"
                            placeholder="AA:BB:CC:DD:EE:FF"
                            helperText="Format: AA:BB:CC:DD:EE:FF"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading || !macAddress.trim()}
                            className="mac-submit-btn"
                        >
                            {loading ? 'Generating...' : 'Generate Pairing Code'}
                        </Button>
                    </form>
                    {device && (
                        <Paper variant="outlined" className="mac-result-paper">
                            <Typography align="center" gutterBottom sx={{ fontSize: 24 }}>
                                <b>
                                    Expires At:{" "}
                                    {device.expiresAt
                                        ? new Date(device.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : "N/A"}
                                </b>
                            </Typography>
                            <Typography align="center" gutterBottom>
                                <b>Status:</b> {device.status}
                            </Typography>
                            <Typography align="center" gutterBottom color="text.secondary">
                                Enter the code shown on your TV into your mobile device to complete pairing.
                            </Typography>
                        </Paper>
                    )}
                    {tvSimulatorOpen && <TVSimulator />}
                    {pairingSimulatorOpen && <PairingSimulator />}
                </div>
            </div>
        </main>
    );
}