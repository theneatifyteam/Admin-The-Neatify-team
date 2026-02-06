import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import logo from "../neatifylogo.png";
import Loader from "./Loader";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
      setLoading(false);
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage("Invalid email or password");
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  //   const handleGoogleLogin = async () => {
  //   await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: { redirectTo: window.location.origin + "/dashboard" },
  //   });
  // };

  if (loading) return <Loader />;

  return (
    <div className="auth-page">
      {/* 🔹 WRAPPER */}
      <div
        style={{
          position: "relative",
          transform: "translateY(-30px)",
        }}
      >
        {/* ✅ LOGO */}
        <img
          src={logo}
          alt="Neatify Logo"
          style={{
            position: "absolute",
            top: "-95px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            background: "transparent",
            padding: 0,
            borderRadius: 0,
            boxShadow: "none",
            zIndex: 10,
          }}
        />

        {/* ✅ CARD */}
        <div className="auth-card">
          <h2 className="auth-title">Admin Login</h2>

          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMessage && <p className="auth-error">{errorMessage}</p>}

          <button className="auth-button" onClick={handleLogin}>
            Login
          </button>

          {/* <button
            className="auth-button google-button"
            onClick={handleGoogleLogin}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
            />
            Sign in with Google
          </button> */}

          <p className="auth-link" onClick={() => navigate("/signup")}>
            New account? <span>Signup</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
