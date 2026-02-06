import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Services from "./Services";
import Bookings from "./Bookings";
import neatifyLogo from "../neatifylogo.png";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("services");
  const [serviceType, setServiceType] = useState("ALL");
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setShowMenu(false);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setShowMenu(false);
  };

  return (
    <div className="dashboard">
      {/* ===== TOP HEADER ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div />

        {/* CENTER LOGO + TITLE */}
        <div style={{ textAlign: "center" }}>
          <img
            src={neatifyLogo}
            alt="Neatify Logo"
            style={{ width: "200px", marginBottom: "4px" }}
          />
          <p style={{ fontSize: "18px", fontWeight: 600 }}>
            ADMIN DASHBOARD
          </p>
        </div>

        {/* RIGHT ACCOUNT MENU */}
        <div style={{ textAlign: "right", position: "relative", paddingLeft: "80%" }}>
          <button
            className="allot-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            👤
          </button>

          {showMenu && (
            <div className="account-dropdown">
              <div onClick={handleProfile}>Profile</div>
              <div onClick={handleLogoutClick}>Logout</div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MAIN TABS ===== */}
      <div className="dashboard-tabs" style={{ justifyContent: "center" }}>
        <button
          className={activeTab === "services" ? "active" : ""}
          onClick={() => setActiveTab("services")}
        >
          Services
        </button>

        <button
          className={activeTab === "bookings" ? "active" : ""}
          onClick={() => setActiveTab("bookings")}
        >
          Bookings
        </button>
      </div>

      {/* ===== TAB CONTENT ===== */}
      {activeTab === "services" && (
        <Services
          selectedType={serviceType}
          onTypeChange={setServiceType}
        />
      )}

      {activeTab === "bookings" && <Bookings />}

      {/* ✅ CUSTOM LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px 40px",
              borderRadius: "12px",
              textAlign: "center",
              minWidth: "350px",
              position: "relative",
            }}
          >
            {/* ❌ Close icon */}
            <span
              onClick={cancelLogout}
              style={{
                position: "absolute",
                top: "12px",
                right: "15px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              ✕
            </span>

            <h3 style={{ margin: "0 0 10px", fontSize: "20px" }}>Confirm</h3>
            <p style={{ margin: "0 0 20px", color: "#666" }}>Are you sure you want to logout?</p>

            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <button
                onClick={confirmLogout}
                style={{
                  padding: "8px 25px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#facc15",
                  color: "#000",
                  fontWeight: "600",
                }}
              >
                Logout
              </button>
              <button
                onClick={cancelLogout}
                style={{
                  padding: "8px 25px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;