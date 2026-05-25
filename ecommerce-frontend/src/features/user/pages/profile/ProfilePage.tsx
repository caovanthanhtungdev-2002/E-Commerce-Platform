import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import styles from "./ProfilePage.module.css";
import { useUserStore } from "../../store/userStore";
import type { Address } from "../../types/userTypes";

import UserAvatar from "../../components/useravatar/UserAvatar";
import UserField from "../../components/userfield/UserField";
import UserButton from "../../components/userbutton/UserButton";
import UserFeedback from "../../components/userfeedback/UserFeedback";

const emptyAddress = {
  receiverName: "",
  receiverPhone: "",
  addressLine: "",
  ward: "",
  district: "",
  province: "",
  postalCode: "",
  country: "Vietnam",
  isDefault: false,
};

// ── Overlay dùng inline style để tránh bị ảnh hưởng bởi transform của ancestor ──
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
  zIndex: 99999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
  animation: "fadeIn 0.2s ease",
};

export default function ProfilePage() {
  const navigate = useNavigate();

  const {
    user, addresses,
    fetchProfile, fetchAddresses,
    updateProfile, uploadAvatar,
    addAddress, updateAddress,
    deleteAddress, setDefaultAddress,
    loading, error, successMessage, clearMessages,
  } = useUserStore();

  const [form, setForm] = useState({ fullName: "", phone: "", bio: "" });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // Khoá scroll body khi modal mở
  useEffect(() => {
    if (showAddressModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showAddressModal]);

  const handleSubmit = async () => {
    await updateProfile(form);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddress);
    setShowAddressModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      receiverName: addr.receiverName,
      receiverPhone: addr.receiverPhone,
      addressLine: addr.addressLine,
      ward: addr.ward,
      district: addr.district,
      province: addr.province,
      postalCode: addr.postalCode || "",
      country: addr.country || "Vietnam",
      isDefault: addr.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleAddressSubmit = async () => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, addressForm);
    } else {
      await addAddress(addressForm);
    }
    setShowAddressModal(false);
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

          {/* PROFILE FORM */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Profile</h2>
                <p className={styles.cardSubtitle}>Cập nhật thông tin cá nhân</p>
              </div>
            </div>

            {error && (
              <UserFeedback type="error" message={error} onClose={clearMessages} />
            )}
            {successMessage && (
              <UserFeedback type="success" message={successMessage} onClose={clearMessages} />
            )}

            <div className={styles.formGrid}>
              <UserField label="Email" value={user?.email || ""} disabled />
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
                label="Bio"
                value={form.bio}
                onChange={(v) => setForm({ ...form, bio: v })}
              />
            </div>

            <div className={styles.actions}>
              <UserButton variant="secondary" onClick={() => navigate("/change-password")}>
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

          {/* ADDRESS LIST */}
          <div className={styles.card} style={{ marginTop: "24px" }}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Địa chỉ nhận hàng</h2>
                <p className={styles.cardSubtitle}>Quản lý địa chỉ giao hàng</p>
              </div>
              <UserButton onClick={openAddModal}>+ Thêm địa chỉ</UserButton>
            </div>

            {addresses.length === 0 ? (
              <p style={{ color: "#475569", padding: "16px 0", fontSize: "0.875rem" }}>
                Chưa có địa chỉ nào
              </p>
            ) : (
              <div className={styles.addressList}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`${styles.addressCard} ${addr.isDefault ? styles.defaultCard : ""}`}
                  >
                    <div className={styles.addressInfo}>
                      <div className={styles.addressName}>
                        {addr.receiverName}
                        <span className={styles.addressPhone}>· {addr.receiverPhone}</span>
                        {addr.isDefault && (
                          <span className={styles.badgeDefault}>Mặc định</span>
                        )}
                      </div>
                      <div className={styles.addressText}>
                        {addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}
                      </div>
                    </div>

                    <div className={styles.addressActions}>
                      {!addr.isDefault && (
                        <button
                          className={styles.btnSetDefault}
                          onClick={() => setDefaultAddress(addr.id)}
                        >
                          Đặt mặc định
                        </button>
                      )}
                      <button
                        className={styles.btnEdit}
                        onClick={() => openEditModal(addr)}
                      >
                        Sửa
                      </button>
                      <button
                        className={styles.btnDelete}
                        disabled={addr.isDefault}
                        onClick={() => deleteAddress(addr.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ADDRESS MODAL */}
      {showAddressModal && createPortal(
        <div style={overlayStyle} onClick={() => setShowAddressModal(false)}>
          <div className={styles.modalInner} onClick={(e) => e.stopPropagation()}>

            <h3>{editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h3>

            <div className={styles.modalGrid}>
              <div className={styles.modalField}>
                <label>Tên người nhận</label>
                <input
                  value={addressForm.receiverName}
                  placeholder="Nguyễn Văn A"
                  onChange={(e) => setAddressForm({ ...addressForm, receiverName: e.target.value })}
                />
              </div>

              <div className={styles.modalField}>
                <label>Số điện thoại</label>
                <input
                  value={addressForm.receiverPhone}
                  placeholder="0912345678"
                  onChange={(e) => setAddressForm({ ...addressForm, receiverPhone: e.target.value })}
                />
              </div>

              <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                <label>Địa chỉ (số nhà, tên đường)</label>
                <input
                  value={addressForm.addressLine}
                  placeholder="123 Đường Lê Lợi"
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                />
              </div>

              <div className={styles.modalField}>
                <label>Phường / Xã</label>
                <input
                  value={addressForm.ward}
                  placeholder="Phường Bến Nghé"
                  onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                />
              </div>

              <div className={styles.modalField}>
                <label>Quận / Huyện</label>
                <input
                  value={addressForm.district}
                  placeholder="Quận 1"
                  onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                />
              </div>

              <div className={styles.modalField}>
                <label>Tỉnh / Thành phố</label>
                <input
                  value={addressForm.province}
                  placeholder="TP. Hồ Chí Minh"
                  onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                />
              </div>

              <div className={styles.modalField}>
                <label>Mã bưu chính</label>
                <input
                  value={addressForm.postalCode}
                  placeholder="700000"
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                />
              </div>
            </div>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              />
              Đặt làm địa chỉ mặc định
            </label>

            <div className={styles.modalActions}>
              <UserButton variant="secondary" onClick={() => setShowAddressModal(false)}>
                Hủy
              </UserButton>
              <UserButton onClick={handleAddressSubmit} loading={loading}>
                {editingAddress ? "Cập nhật" : "Thêm địa chỉ"}
              </UserButton>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}