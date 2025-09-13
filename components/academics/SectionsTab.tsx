import { useState, useEffect } from "react";
import axios from "axios";
import "./SectionsTab.css";

interface College {
  id: number;
  name: string;
}

interface Program {
  id: number;
  college_id: number;
  name: string;
}

interface Section {
  id: number;
  program_id: number;
  section_code: string;
  program_name: string;
  college_id: number;
  college_name: string;
}

export default function SectionsTab() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [collegeId, setCollegeId] = useState<number | undefined>(undefined);
  const [programId, setProgramId] = useState<number | undefined>(undefined);
  const [sectionCode, setSectionCode] = useState<string>("");
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Fetch colleges and programs on load
  useEffect(() => {
    fetchColleges();
    fetchPrograms();
  }, []);

  // Update programs and sections when college changes
  useEffect(() => {
    const filteredPrograms = programs.filter(p => p.college_id === collegeId);
    if (filteredPrograms.length > 0) {
      setProgramId(filteredPrograms[0].id);
    } else {
      setProgramId(undefined);
    }
    fetchSections(); // update sections when college changes
  }, [collegeId, programs]);

  // Fetch sections whenever the program changes
  useEffect(() => {
    fetchSections();
  }, [programId]);

  const fetchColleges = async () => {
    try {
      const res = await axios.get<College[]>("http://localhost:8000/api/colleges/");
      setColleges(res.data);
      if (!collegeId && res.data.length > 0) setCollegeId(res.data[0].id);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch colleges");
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get<Program[]>("http://localhost:8000/api/programs/");
      setPrograms(res.data);
      const firstProgram = res.data.find(p => p.college_id === collegeId);
      if (firstProgram) setProgramId(firstProgram.id);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch programs");
    }
  };

  const fetchSections = async () => {
    if (!programId) {
      setSections([]);
      return;
    }
    try {
      const res = await axios.get<Section[]>("http://localhost:8000/api/sections/", {
        params: { program_id: programId, college_id: collegeId },
      });
      setSections([...res.data].sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch sections");
    }
  };

  const clearForm = () => {
    setEditingSection(null);
    setSectionCode("");
    const firstProgram = programs.find(p => p.college_id === collegeId);
    if (firstProgram) setProgramId(firstProgram.id);
  };

  const handleRegisterSection = async () => {
    setError("");
    setSuccess("");

    if (!programId || !sectionCode.trim()) {
      setError("Program and section code are required");
      return;
    }

    try {
      if (editingSection) {
        const res = await axios.put(
          `http://localhost:8000/api/sections/${editingSection.id}`,
          { program_id: programId, section_code: sectionCode }
        );
        if (res.status === 200) {
          setSuccess("Section updated successfully");
          clearForm();
          fetchSections();
        }
      } else {
        const res = await axios.post("http://localhost:8000/api/sections/", {
          program_id: programId,
          section_code: sectionCode,
        });
        if (res.status === 201) {
          setSuccess("Section created successfully");
          clearForm();
          fetchSections();
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setSectionCode(section.section_code);
    setProgramId(section.program_id);
    setCollegeId(section.college_id);
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      const res = await axios.delete(`http://localhost:8000/api/sections/${sectionId}`);
      if (res.status === 200) {
        setSuccess("Section deleted successfully");
        fetchSections();
      } else {
        setError("Failed to delete section");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete section");
    }
  };

  // Programs filtered by selected college
  const filteredPrograms = programs.filter(p => p.college_id === collegeId);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        {editingSection ? "Edit Section" : "Add Section"}
      </h2>

      {/* Add/Edit Form */}
      <div className="sections-form">
        <select
          value={collegeId}
          onChange={(e) => setCollegeId(Number(e.target.value))}
          className="select-field"
        >
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={programId}
          onChange={(e) => setProgramId(Number(e.target.value))}
          className="select-field"
        >
          {filteredPrograms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Section Code"
          value={sectionCode}
          onChange={(e) => setSectionCode(e.target.value)}
          className="input-field"
        />

        {editingSection ? (
          <>
            <button className="btn-green" onClick={handleRegisterSection}>
              Update
            </button>
            <button className="btn-cancel" onClick={clearForm}>
              Cancel
            </button>
          </>
        ) : (
          <button className="btn-green" onClick={handleRegisterSection}>
            Add
          </button>
        )}
      </div>

      {/* Messages */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Sections Table */}
      <h2 className="text-lg font-semibold mb-4">Existing Sections</h2>
      <div className="sections-table-container">
        <table className="sections-table">
          <thead>
            <tr>
              <th>College</th>
              <th>Program</th>
              <th>Section Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s.id}>
                <td>{s.college_name}</td>
                <td>{s.program_name}</td>
                <td>{s.section_code}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEditSection(s)}>
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteSection(s.id)}
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
