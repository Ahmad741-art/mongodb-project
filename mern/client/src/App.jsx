import React, { useState } from "react";
import CreateEmployee from "./components/CreateEmployee";
import EmployeeTable from "./components/EmployeeTable";
import "./app.css"; // include the CSS upgrade

function App() {
  const [employees, setEmployees] = useState([
    { name: "Jesse Hall", position: "Developer Advocate", level: "Senior" },
    { name: "Kushagra Kesav", position: "Community Triage Engineer", level: "Junior" },
    { name: "Stanimira Vlaeva", position: "Developer Advocate", level: "Senior" },
  ]);

  const handleSave = (emp) => {
    setEmployees([...employees, emp]);
  };

  const handleDelete = (index) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const handleEdit = (emp, index) => {
    console.log("Edit clicked:", emp, index);
    // you can extend this to load into form for editing
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

      <CreateEmployee onSave={handleSave} />
    </>
  );
}

export default App;
