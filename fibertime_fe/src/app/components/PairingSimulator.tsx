import SmartphoneIcon from "@mui/icons-material/Smartphone";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SimulatorContainer from "./SimulatorContainer";
import { useSimulator } from "../context/simulatorContext";
import { createPortal } from "react-dom";
import { webSocketService } from "../../lib/WebSocketService";
import { validatePairingCode } from "../services/pairingService";

const PairingSimulator: React.FC = () => {
    const [pairingCode, setPairingCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const { closePairingSimulator } = useSimulator();
    const router = useRouter();

    // todo DP --> clean this up
    useEffect(() => {
        setMounted(true);

        const handlePaired = (data: { deviceId: string }) => {
            setLoading(false);
            closePairingSimulator();
            if (data?.deviceId) {
                router.push(`/bundles?deviceId=${data.deviceId}`);
            } else {
                router.push("/bundles");
            }
        };

        const subscribeToPairingEvents = async () => {
            await webSocketService.connect();
            webSocketService.on("paired", handlePaired);
        };

        subscribeToPairingEvents();

        return () => {
            webSocketService.off("paired");
            setMounted(false);
        };
    }, [closePairingSimulator, router]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target.value.toUpperCase().slice(0, 4);
        setPairingCode(input);
    };

    const handlePairingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!pairingCode || pairingCode.trim() === "") {
            setError("Pairing code is required");
            setLoading(false);
            return;
        }

        try {
            await validatePairingCode(pairingCode);
            // Wait for "paired" event from server
        } catch (err) {
            setError("Failed to pair devices. Please try again.");
            setLoading(false);
        }
    };

    if (typeof window === "undefined" || !mounted) return null;

    return createPortal(
        <SimulatorContainer
            deviceType="cellphone"
            title="Cellphone Simulator"
            initialPosition={{ x: 80, y: 500 }}
            icon={<SmartphoneIcon />}
        >
            <div className="cellphone-bezel">
                <div className="cellphone-notch">
                    <div className="cellphone-notch-indicator" />
                </div>
                <div className="cellphone-screen">
                    <Typography align="center" className="cellphone-prompt">
                        Enter the pairing code shown on your TV.
                    </Typography>
                    <form onSubmit={handlePairingSubmit} className="cellphone-form">
                        <TextField
                            fullWidth
                            label="Pairing Code"
                            variant="outlined"
                            value={pairingCode}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            margin="normal"
                            autoFocus
                            size="small"
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? "Connecting..." : "Pair Devices"}
                        </Button>
                    </form>
                    {error && (
                        <Typography color="error" align="center" className="cellphone-error">
                            {error}
                        </Typography>
                    )}
                </div>
                <div className="cellphone-footer">
                    <div className="cellphone-home-indicator" />
                </div>
            </div>
        </SimulatorContainer>,
        document.getElementById("simulator-root")!
    );
};

export default PairingSimulator;