import {MdAddLink, MdDevicesOther, MdWifiTethering} from "react-icons/md";
import Link from "next/link";

export default function DevicePage() {
    return (
        <div className="hero-wrapper">
            <h1>Device Management</h1>
            <p style={{marginBottom: 32, color: "#444", textAlign: "center"}}>
                Add, connect, or view your devices.
            </p>
            <div style={{display: "flex", flexDirection: "column", gap: 32, width: "100%", alignItems: "center"}}>
                <Link href="/device/pair" legacyBehavior>
                    <a style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textDecoration: "none"
                    }}>
              <span style={{
                  width: 64, height: 64,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  backgroundColor: "#9b9fb1",
                  color: "#234",
                  marginBottom: 8
              }}>
                <MdAddLink/>
              </span>
                        <span style={{fontWeight: 500}}>Pair a device</span>
                        <span style={{fontSize: "0.95em", color: "#666"}}>Connect a new device</span>
                    </a>
                </Link>
                <Link href="/device/connecting" legacyBehavior>
                    <a style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textDecoration: "none"
                    }}>
              <span style={{
                  width: 64, height: 64,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  backgroundColor: "#9b9fb1",
                  color: "#234",
                  marginBottom: 8
              }}>
                <MdWifiTethering/>
              </span>
                        <span style={{fontWeight: 500}}>Check status</span>
                        <span style={{fontSize: "0.95em", color: "#666"}}>See a device connection</span>
                    </a>
                </Link>
                <Link href="/device/connected" legacyBehavior>
                    <a style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textDecoration: "none"
                    }}>
              <span style={{
                  width: 64, height: 64,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  backgroundColor: "#9b9fb1",
                  color: "#234",
                  marginBottom: 8
              }}>
                <MdDevicesOther/>
              </span>
                        <span style={{fontWeight: 500}}>Your devices</span>
                        <span style={{fontSize: "0.95em", color: "#666"}}>View all connected devices</span>
                    </a>
                </Link>
            </div>
        </div>
    );
}