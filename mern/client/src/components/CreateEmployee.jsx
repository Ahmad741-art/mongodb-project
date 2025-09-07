import React, { useState, useEffect } from "react";

function CreateEmployee({ onSave, editingEmployee, onCancel }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [level, setLevel] = useState("");

  // When editing, load employee data into form
  useEffect(() => {
    if (editingEmployee) {
      setName(editingEmployee.name);
      setPosition(editingEmployee.position);
      setLevel(editingEmployee.level);
    }
  }, [editingEmployee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const employeeData = { name, position, level };

    if (editingEmployee) {
      onSave({ ...employeeData, _id: editingEmployee._id }); // update
    } else {
      onSave(employeeData); // create
    }

    setName("");
    setPosition("");
    setLevel("");
  };

  return (
    <div className="form-card">
      <h2>{editingEmployee ? "Update Employee Record" : "Create Employee Record"}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="First Last"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label htmlFor="position">Position</label>
          <input
            type="text"
            id="position"
            placeholder="Developer Advocate"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label>Level</label>
          <div className="radio-group">
            {["Intern", "Junior", "Senior"].map((lvl) => (
              <label key={lvl}>
                <input
                  type="radio"
                  name="level"
                  value={lvl}
                  checked={level === lvl}
                  onChange={(e) => setLevel(e.target.value)}
                />{" "}
                {lvl}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          {editingEmployee ? "Update Employee" : "Save Employee"}
        </button>
        {editingEmployee && (
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export default CreateEmployee;
