import React, { useEffect, useState } from "react";
import { useCategoryStore } from "../store/categoryStore";
import { CategoryModal } from "../components/CategoryModal";
import "./CategoryPage.css";

export const CategoryPage: React.FC = () => {
  const { pageData, fetch, remove, add, update } = useCategoryStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    fetch(0, 10);
  }, []);

  const handleSubmit = async (data: any) => {
    if (editing) await update(editing.id, data);
    else await add(data);
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="page">
      <div className="header">
        <h1>Category Management</h1>
        <button onClick={() => setOpen(true)}>+ Add</button>
      </div>

      <div className="table">
        {pageData?.content.map((c) => (
          <div key={c.id} className="row">
            <div>
              <strong>{c.name}</strong>
              <p>{c.description}</p>
            </div>
            <div className="actions">
              <button onClick={() => { setEditing(c); setOpen(true); }}>Edit</button>
              <button className="danger" onClick={() => remove(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <CategoryModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </div>
  );
};