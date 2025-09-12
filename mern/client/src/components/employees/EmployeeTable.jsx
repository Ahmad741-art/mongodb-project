import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("");

  const fetchEmployees = async () => {
    const res = await fetch("http://localhost:5000/api/employees");
    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    await fetch(`http://localhost:5000/api/employees/${id}`, { method: "DELETE" });
    fetchEmployees();
  };

  const filtered = employees
    .filter(emp =>
      Object.values(emp).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      return String(a[sortKey]).localeCompare(String(b[sortKey]));
    });

  return (
    <div className="table-container">
      <h2>Employees</h2>
      <Link to="/create-employee"><button className="success">Add Employee</button></Link>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ margin: "1rem 0", padding: "0.5rem", width: "100%" }}
      />
      <table>
        <thead>
          <tr>
            <th onClick={() => setSortKey("name")}>Name</th>
            <th onClick={() => setSortKey("email")}>Email</th>
            <th onClick={() => setSortKey("phone")}>Phone</th>
            <th onClick={() => setSortKey("job")}>Job</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(emp => (
            <tr key={emp._id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.job}</td>
              <td className="action-buttons">
                <Link to={`/edit-employee/${emp._id}`}><button className="success">Edit</button></Link>
                <button className="danger" onClick={() => handleDelete(emp._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
