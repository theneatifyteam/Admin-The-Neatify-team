import { useState } from "react";
import { supabase } from "../supabase";

function AddService({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    price: "",
    image: "",
    gallery_images: "",
    service_type: "",
    description: "",
  });

  const [showAlert, setShowAlert] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 👉 ONLY open alert, do NOT save yet
  const saveService = () => {
    const payload = {
      title: formData.title,
      duration: formData.duration,
      price: formData.price,
      image: formData.image,
      service_type: formData.service_type,
      description: formData.description,
      gallery_images: formData.gallery_images
        ? formData.gallery_images.split(",").map((img) => img.trim())
        : [],
    };

    setPendingPayload(payload);
    setShowAlert(true);
  };

  // ❌ X → cancel, do nothing
  const closeAlertOnly = () => {
    setShowAlert(false);
    setPendingPayload(null);
  };

  // ✅ OK → NOW insert service
  const confirmAlert = async () => {
    if (!pendingPayload) return;

    const { error } = await supabase
      .from("services")
      .insert([pendingPayload]);

    setShowAlert(false);
    setPendingPayload(null);

    if (!error) {
      onSuccess();
    } else {
      console.error(error);
    }
  };

  return (
    <div className="auth-page services-add-page">
      <div className="auth-card">
        <h2 className="auth-title">Add Service</h2>

        <input
          className="auth-input"
          name="title"
          placeholder="Service Title"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="duration"
          placeholder="Duration (e.g. 1 hr)"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="price"
          placeholder="Price (₹)"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="image"
          placeholder="Main Image URL"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="gallery_images"
          placeholder="Gallery Image URLs (comma separated)"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="service_type"
          placeholder="Service Type (KITCHEN / HOUSE / BATHROOM)"
          onChange={handleChange}
        />

        <input
          className="auth-input"
          name="description"
          placeholder="Service Description"
          onChange={handleChange}
        />

        <button className="auth-button" onClick={saveService}>
          Save
        </button>
      </div>

      {/* ✅ Custom Confirmation Alert */}
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
            {/* ❌ Cancel */}
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

            <h3>Confirm</h3>
            <p>Do you want to add this service?</p>

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

export default AddService;
