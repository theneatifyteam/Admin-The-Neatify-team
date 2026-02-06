import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import Loader from "./Loader";

function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    price: "",
    image: "",
  });

  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setFormData({
          title: data.title,
          duration: data.duration,
          price: data.price,
          image: data.image,
        });
      }
      setLoading(false);
    };

    fetchService();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateService = async () => {
    await supabase.from("services").update(formData).eq("id", id);
    setShowAlert(true); // ✅ show custom alert instead of green msg
  };

  // ❌ X → just close alert
  const closeAlertOnly = () => {
    setShowAlert(false);
  };

  // OK → close alert + go back
  const confirmAlert = () => {
    setShowAlert(false);
    navigate(-1);
  };

  if (loading) return <Loader />;

  return (
    <div className="auth-page services-edit-page">
      <div className="auth-card">
        <h2 className="auth-title">Edit Service</h2>

        <input
          className="auth-input"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="price"
          value={formData.price}
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="image"
          value={formData.image}
          onChange={handleChange}
        />

        <button className="auth-button" onClick={updateService}>
          Update Service
        </button>

        <button className="auth-button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {/* ✅ Custom Alert (same as Add / Delete) */}
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
            {/* ❌ Close */}
            <span
              onClick={closeAlertOnly}
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

            <h3>Success</h3>
            <p>Service updated successfully</p>

            <button
              onClick={confirmAlert}
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

export default EditService;
