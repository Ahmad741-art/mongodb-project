import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateEmployee() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, job }),
    });
    navigate("/employees");
  };

  return (
    <div className="form-card">
      <h2>Create Employee</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Phone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} required />
        <label>Job</label>
        <input value={job} onChange={e => setJob(e.target.value)} required />
        <button type="submit" className="success">Create</button>
      </form>
    </div>
  );
}
