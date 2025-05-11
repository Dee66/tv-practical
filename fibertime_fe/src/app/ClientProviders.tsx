'use client';

import React from 'react';
import {AuthProvider} from './context/authContext';
import {SimulatorProvider} from './context/simulatorContext';

export default function ClientProviders({children}: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SimulatorProvider>
                {children}
            </SimulatorProvider>
        </AuthProvider>
    );
}