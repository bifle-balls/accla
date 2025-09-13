import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("faculty"); // default role
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Please enter username, password, and select role");
      return;
    }

    // Normalize role to lowercase before sending to backend
    const normalizedRole = role.toLowerCase();

    try {
      const response = await axios.post(
        "http://localhost:8000/api/login",
        {
          username,
          password,
          role: normalizedRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", normalizedRole);
        // Redirect based on normalized role
        if (normalizedRole === "faculty") navigate("/faculty-dashboard");
        else if (normalizedRole === "admin") navigate("/admin-dashboard");
        else if (normalizedRole === "registrar") navigate("/registrar-dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Server not reachable");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ padding: "20px", border: "1px solid gray", borderRadius: "8px" }}>
        <h1>Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "5px", width: "200px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "5px", width: "200px" }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "5px", width: "210px" }}
        >
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
          <option value="registrar">Registrar</option>
        </select>
        <button onClick={handleLogin} style={{ padding: "5px 10px" }}>
          Login
        </button>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </div>
    </div>
  );
}

export default Login;
