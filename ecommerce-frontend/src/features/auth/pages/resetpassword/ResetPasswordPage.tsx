import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import AuthCard from '../../components/AuthCard';
import AuthInput from '../../components/AuthInput';
import AuthButton from '../../components/AuthButton';
import { useLocation } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [form, setForm] = useState({
    email: (location.state as any)?.email || '', 
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handle = async (e: any) => {
    e.preventDefault();

    
    if (form.newPassword !== form.confirmPassword) {
      alert('Mật khẩu không khớp');
      return;
    }

    try {
  await resetPassword(form);
  alert('Reset thành công');

  navigate('/login'); 
} catch (err: any) {
  alert(err.response?.data?.message || 'Có lỗi xảy ra');
}
};

  return (
    <AuthCard>
      <h2>Reset Password</h2>

      <form onSubmit={handle}>
        <AuthInput
          label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <AuthInput
          label="OTP"
          value={form.otp}
          onChange={(e) => setForm({ ...form, otp: e.target.value })}
        />

        <AuthInput
          label="New Password"
          type="password"
          value={form.newPassword}
          onChange={(e) =>
            setForm({ ...form, newPassword: e.target.value })
          }
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        <AuthButton text="Reset Password" />
      </form>
    </AuthCard>
  );
}