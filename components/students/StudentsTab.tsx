import { useState, useEffect } from "react";
import axios from "axios";
import "./StudentsTab.css";

interface Section {
  id: number;
  section_code: string;
}

interface Student {
  id: number;
  student_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string | null;
  section_code: string | null;
  section_id: number;
  created_at: string | null;
}

export default function StudentsTab() {
  // ---------- States ----------
  const [studentNumber, setStudentNumber] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [middleName, setMiddleName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [studentEmail, setStudentEmail] = useState<string>("");
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ---------- Feedback ----------
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    fetchSections();
    fetchStudents();
  }, []);

  // ---------- Fetch ----------
  const fetchSections = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/sections");
      setSections(res.data);
      if (!sectionId && res.data.length > 0) setSectionId(res.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- Handlers ----------
  const clearStudentForm = () => {
    setEditingStudent(null);
    setStudentNumber("");
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setStudentEmail("");
    if (sections.length > 0) setSectionId(sections[0].id);
  };

  const checkStudentUniqueness = () => {
    const uniqueErrors: { studentNumber?: string; studentEmail?: string } = {};
    const duplicateNumber = students.find(
      s => s.student_number === studentNumber && (!editingStudent || s.id !== editingStudent.id)
    );
    const duplicateEmail = studentEmail
      ? students.find(s => s.email === studentEmail && (!editingStudent || s.id !== editingStudent.id))
      : null;

    if (duplicateNumber) uniqueErrors.studentNumber = "Student number already exists";
    if (duplicateEmail) uniqueErrors.studentEmail = "Email already exists";

    return uniqueErrors;
  };

  const handleRegisterStudent = async () => {
    setError("");
    setSuccess("");

    if (!studentNumber || !firstName || !lastName || !sectionId) {
      setError("Student Number, First Name, Last Name, and Section are required");
      return;
    }

    const uniqueErrors = checkStudentUniqueness();
    if (uniqueErrors.studentNumber || uniqueErrors.studentEmail) {
      setError(uniqueErrors.studentNumber || uniqueErrors.studentEmail || "");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/students/", {
        student_number: studentNumber,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email: studentEmail,
        section_id: sectionId,
      });
      setSuccess(`Student ${firstName} ${lastName} registered successfully!`);
      clearStudentForm();
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to register student");
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentNumber(student.student_number);
    setFirstName(student.first_name);
    setMiddleName(student.middle_name || "");
    setLastName(student.last_name);
    setStudentEmail(student.email || "");
    setSectionId(student.section_id);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    if (!studentNumber || !firstName || !lastName || !sectionId) {
      setError("Student Number, First Name, Last Name, and Section are required");
      return;
    }

    const uniqueErrors = checkStudentUniqueness();
    if (uniqueErrors.studentNumber || uniqueErrors.studentEmail) {
      setError(uniqueErrors.studentNumber || uniqueErrors.studentEmail || "");
      return;
    }

    try {
      await axios.put(`http://localhost:8000/api/students/${editingStudent.id}`, {
        student_number: studentNumber,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email: studentEmail,
        section_id: sectionId,
      });
      setSuccess(`Student ${firstName} ${lastName} updated successfully!`);
      clearStudentForm();
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to update student");
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/students/${studentId}`);
      setSuccess("Student deleted successfully");
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete student");
    }
  };

  // ---------- Search ----------
  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.student_number.toLowerCase().includes(q) ||
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      (s.section_code || "").toLowerCase().includes(q)
    );
  });

  // ---------- JSX ----------
  return (
    <div>
      <h2 className="font-semibold text-lg">{editingStudent ? "Edit Student" : "Register Student"}</h2>
      <div className="students-form">
        <div className="p-4 space-y-6">
          {/* Student Registration */}
          <div className="space-y-2">
            
            <input type="text" placeholder="Student Number" className="input-field" value={studentNumber} onChange={e => setStudentNumber(e.target.value)} />
            <input type="text" placeholder="First Name" className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <input type="text" placeholder="Middle Name" className="input-field" value={middleName} onChange={e => setMiddleName(e.target.value)} />
            <input type="text" placeholder="Last Name" className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} />
            <input type="email" placeholder="Email" className="input-field" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} />
            <select className="select-field" value={sectionId} onChange={e => setSectionId(Number(e.target.value))}>
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.section_code}
                </option>
              ))}
            </select>
            {editingStudent ? (
              <>
                <button className="btn-green" onClick={handleUpdateStudent}>Update</button>
                <button className="btn-cancel" onClick={clearStudentForm}>Cancel</button>
              </>
            ) : (
              <button className="btn-green" onClick={handleRegisterStudent}>Register</button>
            )}
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              className="input-field"
              placeholder="Search students by number, name, or section..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}

          {/* Existing Students */}
          <div className="students-table-container">
            <h2 className="font-semibold text-lg">Existing Students</h2>
            <table className="students-table" border={1} cellPadding={5}>
              <thead>
                <tr>
                  <th>Student Number</th>
                  <th>First Name</th>
                  <th>Middle Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Section</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id}>
                    <td>{s.student_number}</td>
                    <td>{s.first_name}</td>
                    <td>{s.middle_name || "-"}</td>
                    <td>{s.last_name}</td>
                    <td>{s.email || "-"}</td>
                    <td>{s.section_code || "-"}</td>
                    <td>
                      <button className="btn-edit" onClick={() => handleEditStudent(s)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDeleteStudent(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
