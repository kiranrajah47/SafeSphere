import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AlertBanner from '../components/ui/AlertBanner';
import { KeyRound, Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otpCode, setOtpCode] = useState(searchParams.get('devOtp') || '');
  const [devOtp] = useState(searchParams.get('devOtp') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, otpCode, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-600/30">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-500 font-medium">Enter your reset OTP code and choose a new secure password</p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 sm:p-8 space-y-5">
            
            {devOtp && (
              <AlertBanner type="info" title="Development Reset OTP">
                Your Reset Code is: <strong className="font-bold text-indigo-700 text-sm tracking-widest">{devOtp}</strong>
              </AlertBanner>
            )}

            {error && (
              <AlertBanner type="danger" onDismiss={() => setError('')}>
                {error}
              </AlertBanner>
            )}

            {success && (
              <AlertBanner type="success">
                {success}
              </AlertBanner>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />

              <Input
                label="6-Digit Reset OTP Code"
                type="text"
                required
                maxLength="6"
                icon={KeyRound}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="tracking-widest font-mono text-center font-bold"
              />

              <Input
                label="New Password"
                type="password"
                required
                icon={Lock}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={CheckCircle2}
                className="w-full mt-2"
              >
                Reset Password
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Back to{' '}
                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
