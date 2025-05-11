import Link from 'next/link';
import React from "react";
import ClientProviders from './ClientProviders';
import './global-styles.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <ClientProviders>
                    <svg
                        className="background-svg"
                        viewBox="0 0 1440 600"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <circle cx="1200" cy="100" r="300" fill="#1976d2" fillOpacity="0.13" />
                        <ellipse cx="300" cy="500" rx="320" ry="120" fill="#ffd600" fillOpacity="0.18" />
                        <ellipse cx="900" cy="400" rx="200" ry="80" fill="#1976d2" fillOpacity="0.09" />
                        <ellipse cx="200" cy="100" rx="120" ry="60" fill="#1976d2" fillOpacity="0.12" />
                    </svg>
                    <header className="app-header">
                        <div className="header-left">
                            <Link href="/" className="logo" aria-label="Home" legacyBehavior>
                                <span className="app-title">
                                    FiberTime
                                </span>
                            </Link>
                        </div>
                    </header>
                    <div className="centered-content">
                        {children}
                    </div>
                </ClientProviders>
                <div id="simulator-root" />
            </body>
        </html>
    );
}