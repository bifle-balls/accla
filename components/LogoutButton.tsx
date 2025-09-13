import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
      Logout
    </button>
  );
};

export default LogoutButton;
