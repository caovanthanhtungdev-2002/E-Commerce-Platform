import { useState } from "react";
import axios from "axios";
import UploadImage from "../components/UploadImage";

export default function ProductForm() {
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async () => {
    await axios.post("http://localhost:8080/api/products", {
      name: "Test Product",
      price: 100000,
      imageUrl,
      categoryId: 1,
    });

    alert("Created!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Product</h2>

      <UploadImage onUpload={setImageUrl} />

      <button onClick={handleSubmit}>
        Create Product
      </button>
    </div>
  );
}