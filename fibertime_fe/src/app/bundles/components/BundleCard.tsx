import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { connectDevice as connectBundle } from "../../services/bundleService";

export interface BundleCardProps {
    name: string;
    description: string;
    duration_days: number;
    price: number;
    bundleId: string;
    deviceId: string;
    onSuccess?: () => void;
    isUserOwned: boolean;
    dataBalance?: number | null;
    subscriptionData?: number; 
}

const BundleCard: React.FC<BundleCardProps> = ({
    name,
    description,
    duration_days,
    price,
    bundleId,
    deviceId,
    isUserOwned,
    onSuccess,
    dataBalance,
    subscriptionData,
}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);

        try {
            await connectBundle(deviceId, bundleId);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError("Failed to connect the device to the bundle.");
        } finally {
            setLoading(false);
            handleClose();
        }
    };

    return (
        <Paper elevation={6} className="bundle-card">
            <Typography variant="h6" className="bundleCard-title" gutterBottom>
                {name}
            </Typography>
            <Typography variant="body1" className="bundleCard-description">
                {description}
            </Typography>
            <Box className="bundleCard-details" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Duration: <strong>{duration_days} day{duration_days !== 1 ? "s" : ""}</strong>
                </Typography>
                <Typography variant="body2" className="bundleCard-price">
                    R {price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Includes: <strong>{subscriptionData !== undefined ? `${subscriptionData} MB` : "N/A"}</strong> of data
                </Typography>
                {isUserOwned && (
                    <Typography variant="body2" color="primary">
                        Data Balance: <strong>
                            {(dataBalance !== null && dataBalance !== undefined)
                                ? `${dataBalance} MB`
                                : (subscriptionData !== undefined
                                    ? `${subscriptionData} MB`
                                    : "N/A")}
                        </strong>
                    </Typography>
                )}
            </Box>
            {!isUserOwned && (
                <Button onClick={handleOpen} variant="contained" color="primary" fullWidth>
                    Select Bundle
                </Button>
            )}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Confirm Bundle Selection</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to link the bundle &quot;{name}&quot; to your device?
                    </DialogContentText>
                    {error && (
                        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary" disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} color="primary" disabled={loading}>
                        {loading ? "Processing..." : "Confirm"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default BundleCard;