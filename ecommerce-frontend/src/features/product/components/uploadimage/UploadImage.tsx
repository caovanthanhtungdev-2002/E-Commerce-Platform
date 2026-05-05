import axios from "axios";
import { useState } from "react";

export default function UploadImage({ onUpload }: any) {
  const [preview, setPreview] = useState("");

  const handleFile = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // preview
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

   const res = await axios.post(
  "http://localhost:8080/api/files/upload/product",
  formData
   
);

    onUpload(res.data.data);
  };

  return (
    <div>
      <input type="file" onChange={handleFile} />

      {preview && (
        <img
          src={preview}
          style={{ width: 120, marginTop: 10 }}
        />
      )}
    </div>
  );
}