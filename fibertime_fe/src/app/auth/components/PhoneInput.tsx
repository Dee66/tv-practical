'use client';

import React, { useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface Props {
    cellNumber: string;
    setCellNumber: (value: string) => void;
    onSubmit: () => void;
    loading: boolean;
    submitted: boolean;
    setSubmitted: (value: boolean) => void;
}

export default function PhoneInputComponent({
    cellNumber,
    setCellNumber,
    onSubmit,
    loading,
    submitted,
    setSubmitted,
}: Props) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (wrapperRef.current) {
            const input = wrapperRef.current.querySelector('input.PhoneInputInput') as HTMLInputElement | null;
            if (input) input.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (!cellNumber || cellNumber.length < 8) return;
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div ref={wrapperRef}>
                <PhoneInput
                    international
                    defaultCountry="ZA"
                    value={cellNumber}
                    onChange={setCellNumber}
                    numberInputProps={{
                        maxLength: 15,
                        autoFocus: true,
                    }}
                    disabled={loading}
                    className="phone-input"
                />
            </div>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading || !cellNumber || cellNumber.length < 8}
                sx={{
                    borderRadius: 2,
                    px: 5,
                    mt: 1,
                }}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
            </Button>
        </form>
    );
}