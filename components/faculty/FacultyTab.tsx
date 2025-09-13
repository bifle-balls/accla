// src/components/faculty/FacultyTab.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./FacultyTab.css";

interface Faculty {
  id: number;
  full_name: string;
  username: string;
  email: string;
  employment_type: string;
}

function FacultyTab() {
  // ---------- States ----------
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [employmentType, setEmploymentType] = useState<string>("");

  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // ---------- Fetch Faculty ----------
  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/registrar/faculty-list");
      setFacultyList(response.data.faculty);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- Handlers ----------
  const clearForm = () => {
    setEditingFaculty(null);
    setUsername("");
    setFullName("");
    setEmail("");
    setPassword("");
    setEmploymentType("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!username || !fullName || !email || (!editingFaculty && !password) || !employmentType) {
      setError("All fields are required");
      return;
    }

    try {
      let response;
      if (editingFaculty) {
        response = await axios.put(
          `http://localhost:8000/api/registrar/faculty/${editingFaculty.id}`,
          { username, full_name: fullName, email, employment_type: employmentType }
        );
      } else {
        response = await axios.post(
          "http://localhost:8000/api/registrar/register-faculty",
          { username, full_name: fullName, email, password, employment_type: employmentType }
        );
      }

      if (response.data.success) {
        setSuccess(editingFaculty ? "Faculty updated successfully!" : "Faculty registered successfully!");
        clearForm();
        fetchFaculty();
      } else {
        setError(response.data.message || "Operation failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Server not reachable");
    }
  };

  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setUsername(faculty.username);
    setFullName(faculty.full_name);
    setEmail(faculty.email);
    setEmploymentType(faculty.employment_type);
  };

  const handleDelete = async (facultyId: number) => {
    if (!confirm("Are you sure you want to delete this faculty?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/registrar/faculty/${facultyId}`);
      setSuccess("Faculty deleted successfully");
      fetchFaculty();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete faculty");
    }
  };

  // ---------- JSX ----------
  return (
    <div>
      <h2>{editingFaculty ? "Edit Faculty" : "Register Faculty"}</h2>

      {/* Faculty Form */}
      <div className="faculty-form">
        <div style={{ marginBottom: "20px" }}>
          <input type="text" placeholder="Username" value={username} className="search-box" onChange={e => setUsername(e.target.value)} />
          <input type="text" placeholder="Full Name" value={fullName} className="search-box" onChange={e => setFullName(e.target.value)} />
          <input type="email" placeholder="Email" value={email} className="search-box" onChange={e => setEmail(e.target.value)} />
          {!editingFaculty && (
            <input type="password" placeholder="Password" value={password} className="search-box" onChange={e => setPassword(e.target.value)} />
          )}
          <select value={employmentType} className="search-box" onChange={e => setEmploymentType(e.target.value)}>
            <option value="" disabled>Select Employment Type</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
          </select>

          <button className="register-button" onClick={handleSubmit}>{editingFaculty ? "Update" : "Register"}</button>
          {editingFaculty && <button className="btn-cancel" onClick={clearForm}>Cancel</button>}
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Faculty Table */}
      <h2 className="text-lg font-semibold mb-4">Existing Faculty</h2>
      <div className="table-container">
        <table className="faculty-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Employment Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facultyList.map((f) => (
              <tr key={f.id}>
                <td>{f.full_name}</td>
                <td>{f.username}</td>
                <td>{f.email}</td>
                <td>{f.employment_type}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(f)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(f.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FacultyTab;
