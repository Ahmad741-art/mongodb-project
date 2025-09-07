import React, { useState } from "react";
import CreateEmployee from "./components/CreateEmployee";
import EmployeeTable from "./components/EmployeeTable";
import "./app.css";

function App() {
  const [employees, setEmployees] = useState([
    { name: "Jesse Hall", position: "Developer Advocate", level: "Senior" },
    { name: "Kushagra Kesav", position: "Community Triage Engineer", level: "Junior" },
    { name: "Stanimira Vlaeva", position: "Developer Advocate", level: "Senior" },
  ]);

  const [editingEmployee, setEditingEmployee] = useState(null);

  const handleSave = (emp) => {
    if (editingEmployee) {
      setEmployees(employees.map((e) =>
        e === editingEmployee ? emp : e
      ));
      setEditingEmployee(null);
    } else {
      setEmployees([...employees, emp]);
    }
  };

  const handleDelete = (index) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
  };

  const handleCancel = () => {
    setEditingEmployee(null);
  };

  return (
    <>
      <header>
        <img src="/mongodb-logo.png" alt="MongoDB" />
        <button>Create Employee</button>
      </header>

      <EmployeeTable
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateEmployee
        onSave={handleSave}
        editingEmployee={editingEmployee}
        onCancel={handleCancel}
      />
    </>
  );
}

export default App;
