import { useState, useEffect } from "react";
import axios from "axios";
import "./CollegesTab.css";

interface College {
  id: number;
  code: string;
  name: string;
}

function CollegesTab() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/colleges/");
      setColleges(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch colleges");
    }
  };

  const clearForm = () => {
    setEditingCollege(null);
    setCode("");
    setName("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!code || !name) {
      setError("Both code and name are required");
      return;
    }

    try {
      if (editingCollege) {
        // Update
        await axios.put(`http://localhost:8000/api/colleges/${editingCollege.id}`, {
          code,
          name,
        });
        setSuccess("College updated successfully!");
      } else {
        // Create
        await axios.post("http://localhost:8000/api/colleges/", { code, name });
        setSuccess("College added successfully!");
      }

      clearForm();
      fetchColleges();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  const handleEdit = (college: College) => {
    setEditingCollege(college);
    setCode(college.code);
    setName(college.name);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this college?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/colleges/${id}`);
      setSuccess("College deleted successfully");
      fetchColleges();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete college");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{editingCollege ? "Edit College" : "Add College"}</h3>

      {/* Add / Edit Form */}
      <div className="colleges-form">
        <input
          type="text"
          placeholder="Code (e.g., CCS)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="College Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />

        <button className="btn-green" onClick={handleSubmit}>
          {editingCollege ? "Update" : "Add"}
        </button>
        {editingCollege && (
          <button className="btn-cancel" onClick={clearForm}>
            Cancel
          </button>
        )}
      </div>

      {/* Colleges Table */}
      <h2 className="text-lg font-semibold mb-4">Existing Colleges</h2>
      <div className="colleges-table-container">
        <table className="colleges-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.name}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(c)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(c.id)}>
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

export default CollegesTab;
