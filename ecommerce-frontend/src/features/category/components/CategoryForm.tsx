import React, { useState } from "react";
import "./CategoryForm.module.css";

interface Props {
  onSubmit: (data: any) => void;
}

export const CategoryForm: React.FC<Props> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="form-container">
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={() => onSubmit({ name, description })}>Save</button>
    </div>
  );
};
