import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loader from "./components/Loader";

const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Services = lazy(() => import("./components/Services"));
const EditServices = lazy(() => import("./components/EditServices"));
const Profile = lazy(() => import("./components/Profile"));

function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/services" element={<Services />} />
          <Route path="/edit-service/:id" element={<EditServices />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
