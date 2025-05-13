import React from "react";
import { useSimulator } from "../context/simulatorContext";
import SimulatorContainer from "./SimulatorContainer";
import { withSimulatorPortal } from "./withSimulatorPortal";

const TVSimulator: React.FC = () => {
    const { tvPairingCode } = useSimulator();

    return (
        <SimulatorContainer
            deviceType="tv"
            title="TV Simulator"
            icon={<span role="img" aria-label="TV">📺</span>}
            initialPosition={{ x: 40, y: 100 }}
        >
            <div className="tv-bezel">
                <div className="tv-header">
                    <span className="tv-icon" aria-label="TV">📺</span>
                </div>
                <div className="tv-screen">
                    <div className="tv-pairing-label">Pairing Code</div>
                    <div className="tv-pairing-code">{tvPairingCode || "----"}</div>
                </div>
                <div className="tv-footer">
                    <span className="tv-footer-text">Awaiting connection...</span>
                </div>
            </div>
        </SimulatorContainer>
    );
};

export default withSimulatorPortal(TVSimulator);