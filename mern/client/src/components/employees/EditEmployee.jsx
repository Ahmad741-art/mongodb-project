import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditEmployee() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`);
      const data = await res.json();
      setEmployee(data);
      setName(data.name);
      setEmail(data.email);
      setPhone(data.phone);
      setJob(data.job);
    };
    fetchEmployee();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:5000/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, job }),
    });
    navigate("/employees");
  };

  if (!employee) return <h2>Loading...</h2>;

  return (
    <div className="form-card">
      <h2>Edit Employee</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Phone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} required />
        <label>Job</label>
        <input value={job} onChange={e => setJob(e.target.value)} required />
        <button type="submit" className="success">Update</button>
      </form>
    </div>
  );
}
