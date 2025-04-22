'use client';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Cobia to start tracking whale wallets"
    >
      <RegisterForm />
    </AuthLayout>
  );
} 