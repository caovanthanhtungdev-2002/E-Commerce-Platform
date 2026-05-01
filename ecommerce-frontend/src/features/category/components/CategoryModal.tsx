import React, { useState, useEffect } from "react";
import "./CategoryModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initial?: any;
}

export const CategoryModal: React.FC<Props> = ({ open, onClose, onSubmit, initial }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description || "");
    }
  }, [initial]);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{initial ? "Edit" : "Create"} Category</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <div className="actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onSubmit({ name, description })}>Save</button>
        </div>
      </div>
    </div>
  );
};
