import { useState, useEffect } from "react";
import axios from "axios";
import "./ProgramsTab.css";

interface College {
  id: number;
  code: string;
  name: string;
}

interface Program {
  id: number;
  college_id: number;
  name: string;
}

export default function ProgramsTab() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [collegeId, setCollegeId] = useState<number | undefined>(undefined);
  const [programName, setProgramName] = useState<string>("");
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Fetch colleges and programs
  useEffect(() => {
    fetchColleges();
    fetchPrograms();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/colleges/");
      setColleges(res.data);
      if (!collegeId && res.data.length > 0) setCollegeId(res.data[0].id);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch colleges");
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/programs/");
      setPrograms(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch programs");
    }
  };

  const clearForm = () => {
    setEditingProgram(null);
    setProgramName("");
    if (colleges.length > 0) setCollegeId(colleges[0].id);
  };

  const handleRegisterProgram = async () => {
    setError("");
    setSuccess("");

    if (!collegeId || !programName) {
      setError("College and program name are required");
      return;
    }

    try {
      if (editingProgram) {
        await axios.put(`http://localhost:8000/api/programs/${editingProgram.id}`, {
          college_id: collegeId,
          name: programName,
        });
        setSuccess("Program updated successfully");
      } else {
        await axios.post("http://localhost:8000/api/programs/", {
          college_id: collegeId,
          name: programName,
        });
        setSuccess("Program created successfully");
      }
      clearForm();
      fetchPrograms();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setProgramName(program.name);
    setCollegeId(program.college_id);
  };

  const handleDeleteProgram = async (programId: number) => {
    if (!confirm("Are you sure you want to delete this program?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/programs/${programId}`);
      setSuccess("Program deleted successfully");
      fetchPrograms();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete program");
    }
  };

  return (
    <div>
  <h2 className="text-lg font-semibold mb-4">
    {editingProgram ? "Edit Program" : "Add Program"}
  </h2>

  {/* Add/Edit Form */}
  <div className="programs-form">
    <select
      value={collegeId}
      onChange={(e) => setCollegeId(Number(e.target.value))}
      className="select-field"
    >
      {colleges.map((col) => (
        <option key={col.id} value={col.id}>
          {col.name}
        </option>
      ))}
    </select>

    <input
      type="text"
      placeholder="Program Name"
      value={programName}
      onChange={(e) => setProgramName(e.target.value)}
      className="input-field"
    />

    {editingProgram ? (
      <>
        <button className="btn-green" onClick={handleRegisterProgram}>
          Update
        </button>
        <button className="btn-cancel" onClick={clearForm}>
          Cancel
        </button>
      </>
    ) : (
      <button className="btn-green" onClick={handleRegisterProgram}>
        Add
      </button>
    )}
  </div>

  {/* Success / Error Messages */}
  {error && <p style={{ color: "red" }}>{error}</p>}
  {success && <p style={{ color: "green" }}>{success}</p>}

  {/* Programs Table */}
  <h2 className="text-lg font-semibold mb-4">Existing Programs</h2>
  <div className="programs-table-container">
    <table className="programs-table">
      <thead>
        <tr>
          <th>College</th>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {programs.map((p) => (
          <tr key={p.id}>
            <td>{colleges.find((c) => c.id === p.college_id)?.name || "-"}</td>
            <td>{p.name}</td>
            <td>
              <button className="btn-edit" onClick={() => handleEditProgram(p)}>
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDeleteProgram(p.id)}
              >
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
