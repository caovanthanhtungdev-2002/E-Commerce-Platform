import { useState } from "react";
import axios from "axios";
import UploadImage from "../../components/uploadimage/UploadImage";
import styles from "./ProductForm.module.css";

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
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create Product</h2>

        <UploadImage onUpload={setImageUrl} />

        <button
          className={styles.button}
          onClick={handleSubmit}
        >
          Create Product
        </button>
      </div>
    </div>
  );
}