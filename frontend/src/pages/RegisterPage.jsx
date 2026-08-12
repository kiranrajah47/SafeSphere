import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import Button from '../components/ui/Button';
import AlertBanner from '../components/ui/AlertBanner';
import { Shield, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const resData = await register(
        formData.name,
        formData.email,
        formData.phone,
        formData.password,
        formData.role
      );

      // Redirect to OTP Verification page with email prefilled
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}&devOtp=${encodeURIComponent(resData.devOtp || '')}`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-600/30">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create SafeSphere Account</h1>
          <p className="text-xs text-slate-500 font-medium">Personal safety & 24/7 emergency alert protection</p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 sm:p-8 space-y-5">
            
            {error && (
              <AlertBanner type="danger" onDismiss={() => setError('')}>
                {error}
              </AlertBanner>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                required
                icon={User}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />

              <Input
                label="Email Address"
                type="email"
                required
                icon={Mail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />

              <Input
                label="Phone Number (SMS Alert Notifications)"
                type="tel"
                required
                icon={Phone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555 019 2834"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type="password"
                  required
                  icon={Lock}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  icon={Lock}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <Select
                label="Account Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: 'user', label: 'Standard User (Personal Safety)' },
                  { value: 'admin', label: 'System Administrator' }
                ]}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full mt-2"
              >
                Register & Verify OTP
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
