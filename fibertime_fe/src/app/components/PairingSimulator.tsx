import SmartphoneIcon from "@mui/icons-material/Smartphone";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SimulatorContainer from "./SimulatorContainer";
import { useSimulator } from "../context/simulatorContext";
import { webSocketService } from "../../lib/WebSocketService";
import { validatePairingCode } from "../services/pairingService";
import { withSimulatorPortal } from "./withSimulatorPortal";

const PairingSimulator: React.FC = () => {
    const [pairingCode, setPairingCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [delayDone, setDelayDone] = useState(false);
    const pairedDataRef = useRef<{ deviceId: string } | null>(null);
    const { closePairingSimulator } = useSimulator();
    const router = useRouter();

    useEffect(() => {
        subscribeToPairingEvents();
        return () => {
            cleanupPairingEvents();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [closePairingSimulator, router]);

    const handlePaired = (data: { deviceId: string }) => {
        if (!delayDone) {
            pairedDataRef.current = data;
            return;
        }
        finishPairing(data);
    };

    const finishPairing = (data: { deviceId: string }) => {
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

    const cleanupPairingEvents = () => {
        webSocketService.off("paired");
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target.value.toUpperCase().slice(0, 4);
        setPairingCode(input);
    };

    const handlePairingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!pairingCode || pairingCode.trim() === "") {
            setError("Pairing code is required");
            setLoading(false);
            return;
        }

        setLoading(true);
        setDelayDone(false);
        pairedDataRef.current = null;

        try {
            await validatePairingCode(pairingCode);
            setTimeout(() => {
                setDelayDone(true);
                if (pairedDataRef.current) {
                    finishPairing(pairedDataRef.current);
                }
            }, 3000);
        } catch (err) {
            setError("Failed to pair devices. Please try again.");
            setLoading(false);
        }
    };

    return (
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Pair Devices"}
                        </Button>
                        {error && (
                            <Typography
                                color="error"
                                align="center"
                                className="cellphone-error"
                                sx={{ mt: 2 }}
                            >
                                {error}
                            </Typography>
                        )}
                    </form>
                </div>
                <div className="cellphone-footer">
                    <div className="cellphone-home-indicator" />
                </div>
            </div>
        </SimulatorContainer>
    );
};

export default withSimulatorPortal(PairingSimulator);