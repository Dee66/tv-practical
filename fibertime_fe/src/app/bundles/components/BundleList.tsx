'use client';

import React from 'react';
import BundleCard from './BundleCard';

export type Bundle = {
    _id: string;
    name: string;
    description: string;
    duration_days: number;
    price: number;
    subscriptionData: number;
};

interface BundlesListProps {
    bundles: Bundle[];
    deviceId: string;
    dataBalance?: number | null;
    onBundleLinked?: () => void;
}

export const BundleList: React.FC<BundlesListProps> = ({
    bundles, deviceId, dataBalance, onBundleLinked
}) => {
    if (!Array.isArray(bundles) || bundles.length === 0) {
        return <div>No bundles found.</div>;
    }

    const isUserOwned = bundles.length === 1;
    return (
        <div>
            <div className={`bundles-grid${bundles.length === 1 ? ' single-bundle' : ''}`}>
                {bundles.map(bundle => (
                    <BundleCard
                        key={bundle._id}
                        name={bundle.name}
                        description={bundle.description}
                        duration_days={bundle.duration_days}
                        price={bundle.price}
                        bundleId={bundle._id}
                        deviceId={deviceId}
                        isUserOwned={isUserOwned}
                        onSuccess={onBundleLinked}
                        dataBalance={isUserOwned ? dataBalance ?? null : null}
                        subscriptionData={bundle.subscriptionData}
                    />
                ))}
            </div>
        </div>
    );
};

export default BundleList;