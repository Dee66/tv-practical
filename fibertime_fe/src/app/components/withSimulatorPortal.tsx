import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function withSimulatorPortal<P>(
    Wrapped: React.ComponentType<P>,
    portalId = "simulator-root"
) {
    return (props: P) => {
        const [mounted, setMounted] = useState(false);

        useEffect(() => {
            setMounted(true);
            return () => setMounted(false);
        }, []);

        if (typeof window === "undefined" || !mounted) return null;

        return createPortal(<Wrapped {...props} />, document.getElementById(portalId)!);
    };
}