import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";


const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("authToken", token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );
};

export default AuthCallback;