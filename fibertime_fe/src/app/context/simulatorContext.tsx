'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

type SimulatorContextType = {
    tvSimulatorOpen: boolean;
    openTVSimulator: () => void;
    closeTVSimulator: () => void;

    pairingSimulatorOpen: boolean;
    openPairingSimulator: () => void;
    closePairingSimulator: () => void;

    otpSimulatorOpen: boolean;
    openOtpSimulator: () => void;
    closeOtpSimulator: () => void;

    tvPairingCode: string | null;
    setTVPairingCode: (code: string) => void;

    closeAllSimulators: () => void;
};

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

export function SimulatorProvider({ children }: { children: ReactNode }) {
    const [tvSimulatorOpen, setTVSimulatorOpen] = useState(false);
    const [pairingSimulatorOpen, setPairingSimulatorOpen] = useState(false);
    const [otpSimulatorOpen, setOtpSimulatorOpen] = useState(false);
    const [tvPairingCode, setTVPairingCode] = useState<string | null>(null);

    const openTVSimulator = () => setTVSimulatorOpen(true);
    const closeTVSimulator = () => setTVSimulatorOpen(false);

    const openPairingSimulator = () => setPairingSimulatorOpen(true);
    const closePairingSimulator = () => setPairingSimulatorOpen(false);

    const openOtpSimulator = () => setOtpSimulatorOpen(true);
    const closeOtpSimulator = () => setOtpSimulatorOpen(false);

    const closeAllSimulators = () => {
        setTVSimulatorOpen(false);
        setPairingSimulatorOpen(false);
        setOtpSimulatorOpen(false);
    };

    return (
        <SimulatorContext.Provider
            value={{
                tvSimulatorOpen,
                openTVSimulator,
                closeTVSimulator,
                pairingSimulatorOpen,
                openPairingSimulator,
                closePairingSimulator,
                otpSimulatorOpen,
                openOtpSimulator,
                closeOtpSimulator,
                tvPairingCode,
                setTVPairingCode,
                closeAllSimulators,
            }}
        >
            {children}
        </SimulatorContext.Provider>
    );
}

export function useSimulator() {
    const ctx = useContext(SimulatorContext);
    if (!ctx) throw new Error('useSimulator must be used within a SimulatorProvider');
    return ctx;
}