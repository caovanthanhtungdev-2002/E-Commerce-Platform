import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import styles from "./ProfilePage.module.css";
import { useUserStore } from "../store/userStore";

import UserAvatar from "../components/useravatar/UserAvatar";
import UserField from "../components/userfield/UserField";
import UserButton from "../components/userbutton/UserButton";
import UserFeedback from "../components/userfeedback/UserFeedback";

export default function ProfilePage() {
  const navigate = useNavigate(); 

  const {
    user,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    loading,
    error,
    successMessage,
    clearMessages,
  } = useUserStore();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    await updateProfile(form);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sideCard}>
            <div className={styles.avatarSection}>
              <UserAvatar
                src={user?.avatar}
                name={user?.fullName || "User"}
                editable
                loading={loading}
                onUpload={uploadAvatar}
              />

              <div className={styles.userMeta}>
                <h3 className={styles.userName}>{user?.fullName}</h3>
                <span className={styles.userEmail}>{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className={styles.main}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Profile</h2>
                <p className={styles.cardSubtitle}>
                  Update your personal info
                </p>
              </div>
            </div>

            {error && (
              <UserFeedback
                type="error"
                message={error}
                onClose={clearMessages}
              />
            )}
            {successMessage && (
              <UserFeedback
                type="success"
                message={successMessage}
                onClose={clearMessages}
              />
            )}

            <div className={styles.formGrid}>
  <UserField
    label="Email"
    value={user?.email || ""}
    disabled
  />

  <UserField
    label="Full Name"
    value={form.fullName}
    onChange={(v) => setForm({ ...form, fullName: v })}
  />

  <UserField
    label="Phone"
    value={form.phone}
    onChange={(v) => setForm({ ...form, phone: v })}
  />

  <UserField
    label="Address"
    value={form.address}
    onChange={(v) => setForm({ ...form, address: v })}
  />

  <UserField
    label="Bio"
    value={form.bio}
    onChange={(v) => setForm({ ...form, bio: v })}
  />
</div>

            <div className={styles.actions}>
  <UserButton
    variant="secondary"
    onClick={() => navigate("/change-password")}
  >
    Change Password
  </UserButton>

  <UserButton variant="danger" onClick={handleLogout}>
    Logout
  </UserButton>

  <UserButton onClick={handleSubmit} loading={loading}>
    Save Changes
  </UserButton>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}