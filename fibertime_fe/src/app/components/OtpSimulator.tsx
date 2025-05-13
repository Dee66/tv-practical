'use client';

import SmartphoneIcon from "@mui/icons-material/Smartphone";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { AppException } from "../../lib/AppException";
import { webSocketService } from "../../lib/WebSocketService";
import { useAuth } from "../context/authContext";
import { useSimulator } from "../context/simulatorContext";
import { verifyOtpAndLogin } from "../services/authService";
import SimulatorContainer from "./SimulatorContainer";
import { withSimulatorPortal } from "./withSimulatorPortal";

interface OtpSimulatorProps {
    cellNumber: string;
}

const OtpSimulator: React.FC<OtpSimulatorProps> = ({ cellNumber }) => {
    const [otp, setOtp] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otpDelayDone, setOtpDelayDone] = useState(false);
    const pendingOtpRef = useRef<string | null>(null);
    const { closeOtpSimulator } = useSimulator();
    const { login } = useAuth();
    const router = useRouter();

    const handleOtpResponse = (data: { cellNumber: string; otp: string }) => {
        if (data.cellNumber === cellNumber) {
            if (!otpDelayDone) {
                pendingOtpRef.current = data.otp;
            } else {
                setOtp(data.otp);
            }
        }
    };

    const handleOtpError = (data: { message: string; error: string }) => {
        setError(data.message || "An error occurred while generating the OTP.");
    };

    const subscribeToOtpEvents = async () => {
        await webSocketService.connect();
        webSocketService.on("otp-response", handleOtpResponse);
        webSocketService.on("otp-error", handleOtpError);
        webSocketService.emit("otp-request", { cellNumber });
    };

    const unsubscribeFromOtpEvents = () => {
        webSocketService.off("otp-response");
        webSocketService.off("otp-error");
    };

    useEffect(() => {
        subscribeToOtpEvents();
        setOtpDelayDone(false);
        pendingOtpRef.current = null;
        const timer = setTimeout(() => {
            setOtpDelayDone(true);
            if (pendingOtpRef.current) {
                setOtp(pendingOtpRef.current);
            }
        }, 2200);

        return () => {
            unsubscribeFromOtpEvents();
            clearTimeout(timer);
        };
    }, [cellNumber]);

    const handleOtpSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await verifyOtpAndLogin(cellNumber, otp);
            if (!res.success) {
                throw new Error('Login failed');
            }

            login(res.accessToken);
            router.push(`/tv/pair`);
            closeOtpSimulator();
        } catch (err) {
            const appErr = AppException.from(err);
            setError(appErr.message || "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SimulatorContainer
            deviceType="cellphone"
            title="Simulator"
            initialPosition={{ x: 300, y: 160 }}
            icon={<SmartphoneIcon />}
        >
            <div className="cellphone-bezel">
                <div className="cellphone-notch">
                    <div className="cellphone-notch-indicator"></div>
                </div>
                <div className="cellphone-screen">
                    <Typography align="center" className="cellphone-prompt">
                        Enter OTP
                    </Typography>
                    <TextField
                        fullWidth
                        label="OTP"
                        variant="outlined"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={loading}
                        margin="normal"
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        onClick={handleOtpSubmit}
                        disabled={loading || otp.length === 0}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </Button>
                    {error && (
                        <Typography color="error" align="center" className="cellphone-error">
                            {error}
                        </Typography>
                    )}
                </div>
                <div className="cellphone-footer">
                    <div className="cellphone-home-indicator"></div>
                </div>
            </div>
        </SimulatorContainer>
    );
};

export default withSimulatorPortal(OtpSimulator);