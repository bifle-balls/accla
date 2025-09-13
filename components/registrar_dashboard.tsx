import { useState, useEffect } from "react";
import axios from "axios";
import LogoutButton from "../components/LogoutButton";

interface Faculty {
  id: number;
  full_name: string;
  username: string;
  email: string;
  employment_type: string;
}

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

function RegistrarDashboard() {
  // ---------- Faculty States ----------
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [employmentType, setEmploymentType] = useState<string>("");
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  // ---------- Student States ----------
  const [studentNumber, setStudentNumber] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [middleName, setMiddleName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [studentEmail, setStudentEmail] = useState<string>("");
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ---------- Feedback ----------
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    fetchFaculty();
    fetchSections();
    fetchStudents();
  }, []);

  // ---------- Fetch Functions ----------
  const fetchFaculty = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/registrar/faculty-list");
      setFacultyList(response.data.faculty);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/sections");
      setSections(response.data);
      if (!sectionId && response.data.length > 0) setSectionId(response.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/students");
      setStudents(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- Faculty Handlers ----------
  const clearFacultyForm = () => {
    setEditingFaculty(null);
    setUsername("");
    setFullName("");
    setEmail("");
    setPassword("");
    setEmploymentType("");
  };

  const handleRegisterFaculty = async () => {
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
          { username, full_name: fullName, email, employment_type: employmentType },
        );
      } else {
        response = await axios.post(
          "http://localhost:8000/api/registrar/register-faculty",
          { username, full_name: fullName, email, password, employment_type: employmentType },
        );
      }

      if (response.data.success) {
        setSuccess(editingFaculty ? "Faculty updated successfully!" : "Faculty registered successfully!");
        clearFacultyForm();
        fetchFaculty();
      } else {
        setError(response.data.message || "Operation failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Server not reachable");
    }
  };

  const handleEditFaculty = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setUsername(faculty.username);
    setFullName(faculty.full_name);
    setEmail(faculty.email);
    setEmploymentType(faculty.employment_type);
  };

  const handleDeleteFaculty = async (facultyId: number) => {
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

  // ---------- Student Handlers ----------
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

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
      setError(uniqueErrors.studentNumber || uniqueErrors.studentEmail);
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/students/",
        { student_number: studentNumber, first_name: firstName, middle_name: middleName, last_name: lastName, email: studentEmail, section_id: sectionId }
      );
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
      setError(uniqueErrors.studentNumber || uniqueErrors.studentEmail);
      return;
    }

    try {
      await axios.put(
        `http://localhost:8000/api/students/${editingStudent.id}`,
        { student_number: studentNumber, first_name: firstName, middle_name: middleName, last_name: lastName, email: studentEmail, section_id: sectionId }
      );
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

  // ---------- Search & Filter ----------
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
    <div style={{ padding: "20px" }}>
      <h1>Registrar Dashboard</h1>
      <LogoutButton />

      {/* Faculty Registration */}
      <div style={{ marginBottom: "30px" }}>
        <h2>{editingFaculty ? "Edit Faculty" : "Register Faculty"}</h2>
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        {!editingFaculty && <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />}
        <select value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
          <option value="" disabled>Select Employment Type</option>
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
        </select>
        <button onClick={handleRegisterFaculty}>{editingFaculty ? "Update" : "Register"}</button>
        {editingFaculty && <button onClick={clearFacultyForm}>Cancel</button>}
      </div>

      {/* Existing Faculty */}
      <div style={{ marginBottom: "30px" }}>
        <h2>Existing Faculty</h2>
        <table border={1} cellPadding={5}>
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
            {facultyList.map(f => (
              <tr key={f.id}>
                <td>{f.full_name}</td>
                <td>{f.username}</td>
                <td>{f.email}</td>
                <td>{f.employment_type}</td>
                <td>
                  <button onClick={() => handleEditFaculty(f)}>Edit</button>
                  <button onClick={() => handleDeleteFaculty(f.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student Registration / Edit */}
      <div style={{ marginBottom: "30px" }}>
        <h2>{editingStudent ? "Edit Student" : "Register Student"}</h2>
        <input type="text" placeholder="Student Number" value={studentNumber} onChange={e => setStudentNumber(e.target.value)} />
        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
        <input type="text" placeholder="Middle Name" value={middleName} onChange={e => setMiddleName(e.target.value)} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
        <input type="email" placeholder="Email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} />
        <select value={sectionId} onChange={e => setSectionId(Number(e.target.value))}>
          {sections.map(section => (
            <option key={section.id} value={section.id}>{section.section_code}</option>
          ))}
        </select>
        {editingStudent ? (
          <>
            <button onClick={handleUpdateStudent}>Update</button>
            <button onClick={clearStudentForm}>Cancel</button>
          </>
        ) : (
          <button onClick={handleRegisterStudent}>Register</button>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <input type="text" placeholder="Search students by number, name, or section..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: "300px", padding: "5px" }} />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Existing Students */}
      <div>
        <h2>Existing Students</h2>
        <table border={1} cellPadding={5}>
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
                  <button onClick={() => handleEditStudent(s)}>Edit</button>
                  <button onClick={() => handleDeleteStudent(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RegistrarDashboard;
