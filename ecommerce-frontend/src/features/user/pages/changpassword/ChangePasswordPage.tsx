import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ChangePasswordPage.module.css";
import { useUserStore } from "../../store/userStore";

import UserField from "../../components/userfield/UserField";
import UserButton from "../../components/userbutton/UserButton";
import UserFeedback from "../../components/userfeedback/UserFeedback";

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const {
    changePassword,
    loading,
    error,
    successMessage,
    clearMessages,
  } = useUserStore();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [localError, setLocalError] = useState("");

  //Redirect sau khi thành công
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate("/profile");
      }, 1200); // delay cho user thấy thông báo

      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  //Validate frontend
  const validate = () => {
    if (!form.currentPassword) {
      return "Current password is required";
    }

    if (!form.newPassword) {
      return "New password is required";
    }

    if (form.newPassword.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (form.newPassword !== form.confirmPassword) {
      return "Passwords do not match";
    }

    if (form.currentPassword === form.newPassword) {
      return "New password must be different from current password";
    }

    return "";
  };

  const handleSubmit = async () => {
    setLocalError("");
    clearMessages();

    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    await changePassword(form);

    // reset form (optional)
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Password strength 
  const getStrength = () => {
    const pwd = form.newPassword;
    if (!pwd) return "";

    if (pwd.length < 6) return "Weak";
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return "Strong";
    return "Medium";
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2 className={styles.title}>Change Password</h2>

        {/*lỗi frontend */}
        {localError && (
          <UserFeedback
            type="error"
            message={localError}
            onClose={() => setLocalError("")}
          />
        )}

        {/*lỗi backend */}
        {error && (
          <UserFeedback
            type="error"
            message={error}
            onClose={clearMessages}
          />
        )}

        {/*success */}
        {successMessage && (
          <UserFeedback
            type="success"
            message={successMessage}
            onClose={clearMessages}
          />
        )}

        {/* Form */}
        <div className={styles.fields}>
          <UserField
            label="Current Password"
            type="password"
            value={form.currentPassword}
            onChange={(v) =>
              setForm({ ...form, currentPassword: v })
            }
          />

          <UserField
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={(v) =>
              setForm({ ...form, newPassword: v })
            }
          />

          {/* Strength */}
          {form.newPassword && (
            <div className={styles.strength}>
              Strength: <span>{getStrength()}</span>
            </div>
          )}

          <UserField
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(v) =>
              setForm({ ...form, confirmPassword: v })
            }
          />
        </div>

        {/* Button */}
        <UserButton
          fullWidth
          onClick={handleSubmit}
          loading={loading}
        >
          Change Password
        </UserButton>
      </div>
    </div>
  );
}