import React, { ReactNode, useRef, useState } from "react";
import styles from "./SimulatorContainer.module.css";

export type SimulatorType = "cellphone" | "tv";

export interface SimulatorContainerProps {
    deviceType: SimulatorType;
    title?: string;
    icon?: ReactNode;
    children: ReactNode;
    initialPosition?: { x: number; y: number };
    style?: React.CSSProperties;
}

const defaultPositions = {
    cellphone: { x: 60, y: 60 },
    tv: { x: 360, y: 60 },
};

const SimulatorContainer: React.FC<SimulatorContainerProps> = ({
    deviceType,
    title,
    icon,
    children,
    initialPosition,
    style,
}) => {
    const [position, setPosition] = useState<{ x: number; y: number }>(
        initialPosition ?? defaultPositions[deviceType]
    );
    const dragging = useRef(false);
    const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        dragging.current = true;
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseUp = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragging.current) return;
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
        });
    };

    return (
        <div
            className={styles['sim-container']}
            style={{
                left: position.x,
                top: position.y,
                ...style,
            }}
            data-device={deviceType}
            tabIndex={-1}
            aria-label={title || deviceType}
        >
            <div
                className={`${styles['simulator-header']} ${deviceType === "cellphone"
                    ? styles['simulator-header-cellphone']
                    : styles['simulator-header-tv']
                    }`}
                onMouseDown={handleMouseDown}
            >
                <span style={{ marginRight: 8 }}>{icon}</span>
                <span>{title || (deviceType === "cellphone" ? "Cellphone" : "TV")}</span>
            </div>
            <div
                className={`${styles['device-frame']} ${deviceType === "cellphone" ? styles['device-cellphone'] : styles['device-tv']
                    }`}
                tabIndex={0}
            >
                {children}
            </div>
        </div>
    );
};

export default SimulatorContainer;