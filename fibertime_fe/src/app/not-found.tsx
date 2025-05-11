'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="error-wrapper">
            <h1 className="error-code">400</h1>
            <h2 className="error-title">Bad Request</h2>
            <p className="error-message">
                Sorry, the request could not be understood by the server.<br/>
                Please check the URL or try again.
            </p>
            <Link href="/" className="error-home-link">
                Return to Home
            </Link>
        </div>
    );
}