import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import AddService from "./AddService";
import Loader from "./Loader";

function Services({ selectedType, onTypeChange }) {
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const [loading, setLoading] = useState(true);

  const [showAlert, setShowAlert] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("services").select("*");

    if (selectedType !== "ALL") {
      query = query.eq("service_type", selectedType);
    }

    const { data } = await query;
    setServices(data || []);
    setLoading(false);
  }, [selectedType]);

  const fetchServiceTypes = async () => {
    const { data } = await supabase.from("services").select("service_type");

    const unique = [
      "ALL",
      ...new Set((data || []).map((d) => d.service_type)),
    ];

    setServiceTypes(unique);
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  // show alert only
  const deleteService = (id) => {
    setDeleteId(id);
    setShowAlert(true);
  };

  // confirm delete
  const confirmDelete = async () => {
    await supabase.from("services").delete().eq("id", deleteId);
    setShowAlert(false);
    setDeleteId(null);
    fetchServices();
  };

  // cancel / close alert
  const closeAlert = () => {
    setShowAlert(false);
    setDeleteId(null);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2>Services</h2>

      <div className="dashboard-tabs services-header-row">
        <div>
          <button
            className={activeTab === "list" ? "active" : ""}
            onClick={() => setActiveTab("list")}
          >
            Services
          </button>

          <button
            className={activeTab === "add" ? "active" : ""}
            onClick={() => setActiveTab("add")}
          >
            Add Service
          </button>
        </div>

        {activeTab === "list" && (
          <select
            className="service-filter"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            style={{ cursor: "pointer" }}
          >
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        )}
      </div>

      {activeTab === "list" && (
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <img src={service.image} alt={service.title} />

              <div className="service-card-content">
                <h3>{service.title}</h3>
                <p>Category: {service.category}</p>
                <p>Duration: {service.duration}</p>
                <p className="price">{service.price}</p>
              </div>

              <div className="service-card-actions">
                <button
                  className="edit-btn"
                  onClick={() => deleteService(service.id)}
                >
                  Delete
                </button>

                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit-service/${service.id}`)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "add" && (
        <AddService onSuccess={() => setActiveTab("list")} />
      )}

      {/* ✅ Alert with X close */}
      {showAlert && (
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
              onClick={closeAlert}
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

            <h3>Confirm</h3>
            <p>Service deleted successfully</p>

            <button
              onClick={confirmDelete}
              style={{
                marginTop: "15px",
                padding: "8px 25px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                backgroundColor: "#facc15",
                color: "#000",
                fontWeight: "600",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;
