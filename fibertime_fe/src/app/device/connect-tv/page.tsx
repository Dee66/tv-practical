'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { validatePairingCode } from "../../services/pairingService";

export default function ConnectPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const deviceCode = searchParams.get('code');
    const hasValidated = useRef(false);

    useEffect(() => {
        const validateCode = async () => {
            if (!deviceCode) {
                throw new Error('Device code is missing.');
            }

            if (hasValidated.current) {
                return;
            }
            hasValidated.current = true;

            await validatePairingCode(deviceCode);
            router.push(`/device/connecting?code=${encodeURIComponent(deviceCode)}`);
        };

        validateCode().catch((err) => {
            console.error(err);
            throw err;
        });
    }, [deviceCode, router]);

    return null; // No UI is needed since this page only redirects.
}