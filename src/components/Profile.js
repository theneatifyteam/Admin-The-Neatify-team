import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Loader from "./Loader";

function MyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
  });

  const fetchProfile = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Fetch signup data
    const { data: signupData } = await supabase
      .from("admin_signup")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .single();

    // Fetch profile data
    const { data: profileData } = await supabase
      .from("admin_profile")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile({
      full_name: profileData?.full_name ?? signupData?.full_name ?? "",
      email: signupData?.email ?? "",
      phone: profileData?.phone ?? signupData?.phone ?? "",
      address: profileData?.address ?? "",
      pincode: profileData?.pincode ?? "",
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("admin_profile").upsert({
      id: user.id,
      full_name: profile.full_name || null,
      phone: profile.phone || null,
      address: profile.address || null,
      pincode: profile.pincode || null,
    });

    if (error) {
      console.error("Update failed:", error.message);
      alert("Profile update failed");
      return;
    }

    alert("Profile updated successfully");
    setIsEdit(false);
  };

  if (loading) return <Loader />;

  return (
    <div
      className="auth-page"

    >
      <div className="auth-card" style={{ width: "360px" }}>
        <h2 className="auth-title">My Profile</h2>

        <input
          className="auth-input"
          value={profile.full_name}
          disabled={!isEdit}
          placeholder="Full Name"
          onChange={(e) =>
            setProfile({ ...profile, full_name: e.target.value })
          }
        />

        <input
          className="auth-input"
          value={profile.phone}
          disabled={!isEdit}
          placeholder="Phone"
          onChange={(e) =>
            setProfile({ ...profile, phone: e.target.value })
          }
        />

        <input
          className="auth-input"
          value={profile.address}
          disabled={!isEdit}
          placeholder="Address"
          onChange={(e) =>
            setProfile({ ...profile, address: e.target.value })
          }
        />

        <input
          className="auth-input"
          value={profile.pincode}
          disabled={!isEdit}
          placeholder="Pincode"
          onChange={(e) =>
            setProfile({ ...profile, pincode: e.target.value })
          }
        />

        {!isEdit ? (
          <button className="auth-button" onClick={() => setIsEdit(true)}>
            Edit Profile
          </button>
        ) : (
          <button className="auth-button" onClick={handleUpdate}>
            Update Profile
          </button>
        )}

        <p
          className="auth-link"
          onClick={() => navigate("/dashboard")}
        >
          <b>Back to Dashboard</b>
        </p>
      </div>
    </div>
  );
}

export default MyProfile;
