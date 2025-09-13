import { useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";

export default function FacultyForm({ onRegistered }: { onRegistered: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    username: "",
    employment_type: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/register-faculty", form);
      if (res.data.success) {
        setForm({ full_name: "", email: "", username: "", employment_type: "", password: "" });
        onRegistered();
      } else {
        console.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md border rounded-lg shadow">
      <input
        type="text"
        placeholder="Full Name"
        value={form.full_name}
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        className="w-full border rounded p-2"
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full border rounded p-2"
      />
      <input
        type="text"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        className="w-full border rounded p-2"
      />
      <input
        type="text"
        placeholder="Employment Type"
        value={form.employment_type}
        onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
        className="w-full border rounded p-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="w-full border rounded p-2"
      />
      <Button type="submit" className="w-full">Register Faculty</Button>
    </form>
  );
}
