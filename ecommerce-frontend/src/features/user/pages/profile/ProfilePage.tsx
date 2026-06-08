import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useUserStore } from "../../store/userStore";
import { useOrderStore } from "@/features/order/store/orderStore";
import { useAddressSelector } from "@/hooks/useAddressSelector";
import LocationSelect from "@/features/location/components/LocationSelect";
import { getImageSrc } from "@/utils/getImage";
import { formatCurrencyVND } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/dateUtils";
import type { Address } from "../../types/userTypes";
import type { OrderStatus } from "@/features/order/types/orderTypes";
import styles from "./ProfilePage.module.css";

// ── CONSTANTS ──────────────────────────────────────────────────────────────────

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

type OrderFilterTab = "ALL" | OrderStatus;

const ORDER_TABS: { key: OrderFilterTab; label: string }[] = [
  { key: "ALL",        label: "Tất cả" },
  { key: "PENDING",    label: "Chờ xử lý" },
  { key: "CONFIRMED",  label: "Đã xác nhận" },
  { key: "SHIPPED",    label: "Đang chuyển hàng" },
  { key: "DELIVERED",  label: "Đang giao hàng" },
  { key: "CANCELLED",  label: "Đã hủy" },
  { key: "COMPLETED",  label: "Thành công" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Chờ xác nhận",          color: "#ea580c" },
  CONFIRMED:  { label: "Đã xác nhận",           color: "#2563eb" },
  PROCESSING: { label: "Đang đóng gói",         color: "#7c3aed" },
  SHIPPED:    { label: "Đang giao hàng",         color: "#0891b2" },
  DELIVERED:  { label: "Đã giao đến tay khách", color: "#16a34a" },
  PAID:       { label: "Đã thanh toán",          color: "#16a34a" },
  CANCELLED:  { label: "Đã huỷ",                color: "#dc2626" },
  REFUNDED:   { label: "Đã hoàn tiền",           color: "#7c3aed" },
  COMPLETED:  { label: "Hoàn tất",              color: "#16a34a" },
  RETURNED:   { label: "Yêu cầu trả hàng",      color: "#d97706" },
};

// ── COMPONENT ──────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    user, addresses,
    fetchProfile, fetchAddresses,
    updateProfile, uploadAvatar,
    addAddress, updateAddress,
    deleteAddress, setDefaultAddress,
    loading, error, successMessage, clearMessages,
  } = useUserStore();

  const { orders, fetchOrders, loading: orderLoading } = useOrderStore();

  const [activeTab, setActiveTab] = useState<"profile" | "address" | "password" | "orders">("profile");
  const [form, setForm] = useState({ fullName: "", phone: "", bio: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [orderFilterTab, setOrderFilterTab] = useState<OrderFilterTab>("ALL");

  // ── LOCATION HOOK ─────────────────────────────────────────────────────────────
  const loc = useAddressSelector();

  // ── EFFECTS ──────────────────────────────────────────────────────────────────

  useEffect(() => { fetchProfile(); fetchAddresses(); }, []);

  useEffect(() => {
    if (user) setForm({ fullName: user.fullName || "", phone: user.phone || "", bio: user.bio || "" });
  }, [user]);

  useEffect(() => {
    if (successMessage) { showToast("success", successMessage); clearMessages(); }
    if (error)          { showToast("error", error);           clearMessages(); }
  }, [successMessage, error]);

  useEffect(() => {
    document.body.style.overflow = showAddressModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showAddressModal]);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  // Sync loc → addressForm
  useEffect(() => { setAddressForm(f => ({ ...f, province: loc.province })); }, [loc.province]);
  useEffect(() => { setAddressForm(f => ({ ...f, district: loc.district })); }, [loc.district]);
  useEffect(() => { setAddressForm(f => ({ ...f, ward:     loc.ward     })); }, [loc.ward]);

  // ── HELPERS ───────────────────────────────────────────────────────────────────

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = async () => { await updateProfile(form); };
  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };

  const openAddModal = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddress);
    loc.setProvince("");
    loc.setDistrict("");
    loc.setWard("");
    setShowAddressModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      receiverName:  addr.receiverName,
      receiverPhone: addr.receiverPhone,
      addressLine:   addr.addressLine,
      ward:          addr.ward,
      district:      addr.district,
      province:      addr.province,
      postalCode:    addr.postalCode || "",
      country:       addr.country || "Vietnam",
      isDefault:     addr.isDefault,
    });
    loc.setProvince(addr.province);
    loc.setDistrict(addr.district);
    loc.setWard(addr.ward);
    setShowAddressModal(true);
  };

  const handleAddressSubmit = async () => {
    if (editingAddress) await updateAddress(editingAddress.id, addressForm);
    else                await addAddress(addressForm);
    setShowAddressModal(false);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase();

  const filteredOrders = orderFilterTab === "ALL"
    ? orders
    : orders.filter((o) => o.status === orderFilterTab);

  // ── RENDER ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === "success" ? (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
              <path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path d="M12 8v4m0 4h.01" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      <div className={styles.wrap}>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatarWrap} onClick={() => fileInputRef.current?.click()}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.fullName} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarInit}>{getInitials(user?.fullName || "U")}</div>
              )}
              <div className={styles.avatarOverlay}>
                <svg viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeWidth="1.5"/>
                  <circle cx="12" cy="13" r="4" strokeWidth="1.5"/>
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }}
            />
            <div className={styles.userName}>{user?.fullName || "Loading..."}</div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>

          <nav className={styles.nav}>
            <div
              className={`${styles.navItem} ${activeTab === "profile" ? styles.active : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="1.5"/><circle cx="12" cy="7" r="4" strokeWidth="1.5"/></svg>
              Hồ sơ của tôi
            </div>
            <div className={styles.navDivider}/>

            <div
              className={`${styles.navItem} ${activeTab === "orders" ? styles.active : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="9" y="3" width="6" height="4" rx="1" strokeWidth="1.5"/>
                <path d="M9 12h6M9 16h4" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Đơn hàng đã mua
            </div>
            <div className={styles.navDivider}/>

            <div
              className={`${styles.navItem} ${activeTab === "address" ? styles.active : ""}`}
              onClick={() => setActiveTab("address")}
            >
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" strokeWidth="1.5"/><circle cx="12" cy="10" r="3" strokeWidth="1.5"/></svg>
              Địa chỉ
            </div>
            <div className={styles.navDivider}/>

            <div
              className={`${styles.navItem} ${activeTab === "password" ? styles.active : ""}`}
              onClick={() => setActiveTab("password")}
            >
              <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="1.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="1.5"/></svg>
              Đổi mật khẩu
            </div>
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main className={styles.main}>

          {/* ─ PROFILE TAB ─ */}
          {activeTab === "profile" && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Hồ sơ của tôi</div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Tên đăng nhập</label>
                <div>
                  <input className={styles.input} value={user?.username || ""} disabled />
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Email</label>
                <div>
                  <input className={styles.input} value={user?.email || ""} disabled />
                  <div className={styles.formHint}>Email không thể thay đổi</div>
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Họ và tên</label>
                <input className={styles.input} value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Nhập họ và tên" />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Số điện thoại</label>
                <input className={styles.input} value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Nhập số điện thoại" />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Bio</label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Giới thiệu ngắn về bản thân..."
                />
              </div>

              <div className={styles.formRow}>
                <div />
                <div className={styles.btnRow}>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleLogout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Đăng xuất
                  </button>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveProfile} disabled={loading}>
                    {loading ? <span className={styles.spinner}/> : null}
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─ ORDERS TAB ─ */}
          {activeTab === "orders" && (
            <div className={styles.ordersWrap}>
              <div className={styles.orderFilterScroll}>
                <div className={styles.orderFilterBar}>
                  {ORDER_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      className={`${styles.orderFilterBtn} ${orderFilterTab === tab.key ? styles.orderFilterActive : ""}`}
                      onClick={() => setOrderFilterTab(tab.key)}
                    >
                      {tab.label}
                      {tab.key !== "ALL" && orders.filter((o) => o.status === tab.key).length > 0 && (
                        <span className={styles.orderFilterCount}>
                          {orders.filter((o) => o.status === tab.key).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {orderLoading ? (
                <div className={styles.orderLoading}>
                  <span className={styles.spinner} style={{ borderTopColor: "#ee4d2d", borderColor: "rgba(238,77,45,.2)" }} />
                  Đang tải đơn hàng...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className={styles.orderEmpty}>
                  <svg width="64" height="64" viewBox="0 0 24 24" stroke="#ddd" fill="none" strokeWidth="1">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  <p>Rất tiếc, không tìm thấy đơn hàng nào phù hợp</p>
                  <span>Vẫn còn rất nhiều sản phẩm đang chờ bạn</span>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    style={{ marginTop: 12 }}
                    onClick={() => navigate("/")}
                  >
                    Mua sắm ngay
                  </button>
                </div>
              ) : (
                <div className={styles.orderList}>
                  {filteredOrders.map((order) => {
                    const s = statusConfig[order.status];
                    const firstItem = order.items?.[0];
                    const extraCount = (order.items?.length ?? 1) - 1;

                    return (
                      <div
                        key={order.id}
                        className={styles.orderCard}
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <div className={styles.orderCardHeader}>
                          <div className={styles.orderCardId}>
                            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                              <rect x="9" y="3" width="6" height="4" rx="1"/>
                            </svg>
                            Đơn hàng #{order.id}
                          </div>
                          <span
                            className={styles.orderStatusBadge}
                            style={{ color: s?.color, background: s?.color + "18" }}
                          >
                            {s?.label ?? order.status}
                          </span>
                        </div>

                        {firstItem && (
                          <div className={styles.orderPreview}>
                            <div className={styles.orderImgWrap}>
                              <img
                                src={getImageSrc(firstItem.imageUrl)}
                                alt={firstItem.productName}
                                className={styles.orderImg}
                                onError={(e) => { e.currentTarget.src = "https://picsum.photos/64"; }}
                              />
                            </div>
                            <div className={styles.orderItemInfo}>
                              <div className={styles.orderItemName}>{firstItem.productName}</div>
                              <div className={styles.orderItemQty}>x{firstItem.quantity}</div>
                            </div>
                            {extraCount > 0 && (
                              <span className={styles.orderExtraCount}>+{extraCount} sản phẩm</span>
                            )}
                          </div>
                        )}

                        <div className={styles.orderCardFooter}>
                          {order.createdAt && (
                            <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                          )}
                          <div className={styles.orderCardRight}>
                            <span className={styles.orderTotalLabel}>Thành tiền:</span>
                            <span className={styles.orderTotalPrice}>{formatCurrencyVND(order.finalPrice)}</span>
                            <span className={styles.orderViewDetail}>
                              Xem chi tiết
                              <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6"/>
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─ ADDRESS TAB ─ */}
          {activeTab === "address" && (
            <div className={styles.card}>
              <div className={styles.addrHeader}>
                <div className={styles.cardTitle} style={{ margin: 0, padding: 0, border: "none" }}>
                  Địa chỉ của tôi
                </div>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={openAddModal}>
                  <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Thêm địa chỉ mới
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className={styles.empty}>
                  <svg width="48" height="48" viewBox="0 0 24 24" stroke="#ccc" fill="none" strokeWidth="1"
                    style={{ display: "block", margin: "0 auto 12px" }}>
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Chưa có địa chỉ nào. Hãy thêm địa chỉ giao hàng!
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className={`${styles.addrCard} ${addr.isDefault ? styles.default : ""}`}>
                    <div style={{ flex: 1 }}>
                      <div className={styles.addrName}>
                        {addr.receiverName}
                        <span className={styles.addrPhone}>· {addr.receiverPhone}</span>
                        {addr.isDefault && <span className={styles.badgeDefault}>Mặc định</span>}
                      </div>
                      <div className={styles.addrText}>
                        {addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}
                      </div>
                    </div>
                    <div className={styles.addrActions}>
                      {!addr.isDefault && (
                        <>
                          <button className={styles.addrSet} onClick={() => setDefaultAddress(addr.id)}>
                            Thiết lập mặc định
                          </button>
                          <div className={styles.addrDivider} />
                        </>
                      )}
                      <button className={`${styles.addrBtn} ${styles.edit}`} onClick={() => openEditModal(addr)}>
                        Cập nhật
                      </button>
                      <div className={styles.addrDivider} />
                      <button
                        className={`${styles.addrBtn} ${styles.del}`}
                        disabled={addr.isDefault}
                        onClick={() => deleteAddress(addr.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─ PASSWORD TAB ─ */}
          {activeTab === "password" && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Đổi mật khẩu</div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Mật khẩu hiện tại</label>
                <input className={styles.input} type="password" value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại" />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Mật khẩu mới</label>
                <input className={styles.input} type="password" value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  placeholder="Nhập mật khẩu mới" />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Xác nhận</label>
                <input className={styles.input} type="password" value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới" />
              </div>
              <div className={styles.formRow}>
                <div />
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={loading}
                  onClick={async () => {
                    const { changePassword } = useUserStore.getState();
                    await changePassword(pwForm);
                    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                >
                  {loading ? <span className={styles.spinner} /> : null}
                  Xác nhận
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── ADDRESS MODAL ── */}
      {showAddressModal && createPortal(
        <div className={styles.overlay} onClick={() => setShowAddressModal(false)}>
          {/* key đảm bảo hook loc reset mỗi lần mở địa chỉ khác */}
          <div
            className={styles.modal}
            key={editingAddress?.id ?? "new"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalTitle}>
              {editingAddress ? "Cập nhật địa chỉ" : "Địa chỉ mới"}
            </div>

            <div className={styles.modalGrid}>
              {/* Họ tên */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Họ tên người nhận</label>
                <input
                  className={styles.modalInput}
                  value={addressForm.receiverName}
                  placeholder="Nguyễn Văn A"
                  onChange={(e) => setAddressForm({ ...addressForm, receiverName: e.target.value })}
                />
              </div>

              {/* SĐT */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Số điện thoại</label>
                <input
                  className={styles.modalInput}
                  value={addressForm.receiverPhone}
                  placeholder="0912 345 678"
                  onChange={(e) => setAddressForm({ ...addressForm, receiverPhone: e.target.value })}
                />
              </div>

              {/* Số nhà / đường — full width */}
              <div className={`${styles.modalField} ${styles.full}`}>
                <label className={styles.modalLabel}>Địa chỉ (số nhà, tên đường)</label>
                <input
                  className={styles.modalInput}
                  value={addressForm.addressLine}
                  placeholder="123 Đường Lê Lợi"
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                />
              </div>

              {/* Tỉnh / Thành phố — chọn trước để load huyện */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Tỉnh / Thành phố</label>
                <LocationSelect
                  placeholder="Chọn Tỉnh / Thành phố"
                  value={loc.province}
                  options={loc.provinces}
                  onChange={loc.setProvince}
                />
              </div>

              {/* Quận / Huyện */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Quận / Huyện</label>
                <LocationSelect
                  placeholder="Chọn Quận / Huyện"
                  value={loc.district}
                  options={loc.districts}
                  onChange={loc.setDistrict}
                  disabled={!loc.province}
                />
              </div>

              {/* Phường / Xã */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Phường / Xã</label>
                <LocationSelect
                  placeholder="Chọn Phường / Xã"
                  value={loc.ward}
                  options={loc.wards}
                  onChange={loc.setWard}
                  disabled={!loc.district}
                />
              </div>

              {/* Mã bưu chính */}
              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Mã bưu chính</label>
                <input
                  className={styles.modalInput}
                  value={addressForm.postalCode}
                  placeholder="700000"
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                />
              </div>
            </div>

            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              />
              Đặt làm địa chỉ mặc định
            </label>

            <div className={styles.modalActions}>
              <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setShowAddressModal(false)}>
                Hủy
              </button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddressSubmit} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : null}
                {editingAddress ? "Cập nhật" : "Hoàn thành"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
