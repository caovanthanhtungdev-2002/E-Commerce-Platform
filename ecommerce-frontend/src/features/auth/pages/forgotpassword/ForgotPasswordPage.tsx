import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNavigate } from 'react-router-dom'; 

import AuthCard from '../../components/AuthCard';
import AuthInput from '../../components/AuthInput';
import AuthButton from '../../components/AuthButton';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore();
  const navigate = useNavigate(); 

  const [email, setEmail] = useState('');

  const handle = async (e: any) => {
    e.preventDefault();

    await forgotPassword({ email });

    alert('OTP sent');

    //chuyển trang + truyền email oke
    navigate('/reset-password', { state: { email } });
  };

  return (
    <AuthCard>
      <h2>Forgot Password</h2>

      <form onSubmit={handle}>
        <AuthInput
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthButton text="Send OTP" />
      </form>
    </AuthCard>
  );
}