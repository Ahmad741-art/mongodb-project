import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      const data = await res.json();
      console.log("Fetched employees data:", data); // ✅ Debugging log

      // ✅ Safely set employees only if data is an array or contains an array
      if (Array.isArray(data)) {
        setEmployees(data);
      } else if (Array.isArray(data.employees)) {
        setEmployees(data.employees);
      } else {
        console.error("Unexpected employee data format:", data);
        setEmployees([]); // fallback to empty array
      }

    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]); // avoid crash on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ SYSTEM ALERT: Confirm employee data deletion?")) return;
    setLoading(true);
    try {
      await fetch(`http://localhost:5000/api/employees/${id}`, { method: "DELETE" });
      await fetchEmployees();
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  // ✅ Safely filter even if `employees` is not an array
  const filtered = Array.isArray(employees)
    ? employees
        .filter(emp =>
          Object.values(emp).some(val =>
            String(val).toLowerCase().includes(search.toLowerCase())
          )
        )
        .sort((a, b) => {
          if (!sortKey) return 0;
          return String(a[sortKey]).localeCompare(String(b[sortKey]));
        })
    : [];

  return (
    <div className="table-container">
      <h2>Employee Database</h2>

      {/* Top bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <Link to="/create-employee">
          <button className="success">
            + Add New Employee
          </button>
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.9rem',
          color: '#94a3b8'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '15px'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              background: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ color: '#10b981', fontWeight: 600 }}>
              {loading ? 'SYNCING...' : `${filtered.length} ACTIVE`}
            </span>
          </div>
          {loading && <div className="loading" />}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="🔍 SEARCH DATABASE..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            paddingLeft: '2.5rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        />
        <div style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#3b82f6',
          fontSize: '1.1rem'
        }}>
          🔍
        </div>
      </div>

      {/* Table */}
      <div style={{ 
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}>
        <table>
          <thead>
            <tr>
              <th onClick={() => setSortKey("name")} style={{ cursor: 'pointer' }}>
                👤 Name {sortKey === 'name' && '↕'}
              </th>
              <th onClick={() => setSortKey("email")} style={{ cursor: 'pointer' }}>
                📧 Email {sortKey === 'email' && '↕'}
              </th>
              <th onClick={() => setSortKey("phone")} style={{ cursor: 'pointer' }}>
                📱 Phone {sortKey === 'phone' && '↕'}
              </th>
              <th onClick={() => setSortKey("job")} style={{ cursor: 'pointer' }}>
                💼 Position {sortKey === 'job' && '↕'}
              </th>
              <th style={{ textAlign: 'center' }}>⚡ Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#94a3b8',
                  fontStyle: 'italic'
                }}>
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                      <div className="loading" />
                      <span>SYNCHRONIZING DATA...</span>
                    </div>
                  ) : search ? (
                    `🔍 NO MATCHES FOUND FOR "${search.toUpperCase()}"`
                  ) : (
                    '📊 NO EMPLOYEE DATA AVAILABLE'
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((emp, index) => (
                <tr key={emp._id} style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                }}>
                  <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{emp.name}</td>
                  <td style={{ color: '#3b82f6', fontFamily: 'monospace' }}>{emp.email}</td>
                  <td style={{ color: '#10b981', fontFamily: 'monospace' }}>{emp.phone}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      color: '#8b5cf6',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {emp.job}
                    </span>
                  </td>
                  <td className="action-buttons" style={{ textAlign: 'center' }}>
                    <Link to={`/edit-employee/${emp._id}`}>
                      <button className="success" title="Modify Employee Data">
                        ✏️ Edit
                      </button>
                    </Link>
                    <button 
                      className="danger" 
                      onClick={() => handleDelete(emp._id)}
                      title="Delete Employee Record"
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(31, 41, 55, 0.5)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem',
          color: '#94a3b8'
        }}>
          <span>
            📊 DISPLAYING {filtered.length} OF {employees.length} RECORDS
          </span>
          <span style={{ 
            color: '#3b82f6',
            fontFamily: 'monospace',
            fontWeight: 600
          }}>
            LAST SYNC: {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
