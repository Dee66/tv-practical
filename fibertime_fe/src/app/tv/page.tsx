'use client';

import React, {useState} from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {createPairingCode} from "../services/pairingService";
import {AppException} from "../../lib/AppException";
import { useProtectedRoute } from '../config/useProtectedRoute';

export default function PairDevicePage() {
    useProtectedRoute();
    
    const [macAddress, setMacAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [device, setDevice] = useState<{
        deviceId: string;
        pairingCode: string;
        expiresAt: string;
        status: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setDevice(null);

        try {
            const res = await createPairingCode(macAddress);
            setDevice(res);
        } catch (err) {
            const appErr = AppException.from(err);
            setError(appErr.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <></>
    );
}