'use client';

interface ErrorProps {
    error: Error;
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    return (
        <div>
            <h1>Oh dear, something went wrong</h1>
            <p>{error?.message}</p>
            <button onClick={() => reset()}>Try Again</button>
        </div>
    );
}