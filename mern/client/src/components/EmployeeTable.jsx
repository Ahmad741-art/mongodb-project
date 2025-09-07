import React from "react";

function EmployeeTable({ employees, onEdit, onDelete }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Level</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, i) => (
            <tr key={i}>
              <td>{emp.name}</td>
              <td>{emp.position}</td>
              <td>{emp.level}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => onEdit(emp, i)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(i)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
