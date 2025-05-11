'use client';

import { Paper, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/authContext';
import { useSimulator } from '../context/simulatorContext';
import { fetchAllBundles, fetchUserBundle } from '../services/bundleService';
import BundleList from './components/BundleList';
import { useProtectedRoute } from '../config/useProtectedRoute';

export default function BundlesPage() {
    useProtectedRoute();

    const { token, isAuthenticated, subscribe } = useAuth();
    const { closeAllSimulators } = useSimulator();
    const [bundles, setBundles] = useState([]);
    const [dataBalance, setDataBalance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const hasFetchedRef = useRef(false);
    const searchParams = useSearchParams();
    const deviceId = searchParams.get('deviceId');

    const fetchBundles = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isAuthenticated && token) {
                const res = await fetchUserBundle();
                if (Array.isArray(res?.bundles) && res.bundles.length > 0) {
                    setBundles([res.bundles[0]]);
                    setDataBalance(res.dataBalance ?? null);
                } else {
                    const allBundlesResult = await fetchAllBundles();
                    setBundles(allBundlesResult?.bundles ?? []);
                    setDataBalance(null);
                }
            } else {
                const allBundlesResult = await fetchAllBundles();
                setBundles(allBundlesResult?.bundles ?? []);
                setDataBalance(null);
            }
            closeAllSimulators();
        } catch (err) {
            setError(err?.message || 'Failed to load bundles.');
            setBundles([]);
            setDataBalance(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        fetchBundles();
    }, [token, isAuthenticated, closeAllSimulators]);

    useEffect(() => {
        return subscribe(() => {
            setBundles([]);
            setDataBalance(null);
            hasFetchedRef.current = false;
        });
    }, [subscribe]);

    const handleBundleLinked = async () => {
        const res = await fetchUserBundle();
        setBundles(res.bundles);
        setDataBalance(res.dataBalance ?? null);
    };

    return (
        <main className="centered-content">
            <div className="bundles-center">
                <Paper elevation={6} className="hero-wrapper bundles-paper">
                    {loading ? (
                        <Typography variant="h6" align="center">Loading bundles...</Typography>
                    ) : error ? (
                        <Typography variant="body2" color="error" align="center">
                            {error}
                        </Typography>
                    ) : (
                        <BundleList
                            bundles={bundles}
                            deviceId={deviceId}
                            dataBalance={dataBalance}
                            onBundleLinked={handleBundleLinked}
                        />
                    )}
                </Paper>
            </div>
        </main>
    );
}