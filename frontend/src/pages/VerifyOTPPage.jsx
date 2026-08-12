import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AlertBanner from '../components/ui/AlertBanner';
import Badge from '../components/ui/Badge';
import { Shield, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

export default function VerifyOTPPage() {
  const [searchParams] = useSearchParams();
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otpCode, setOtpCode] = useState(searchParams.get('devOtp') || '');
  const [devOtp, setDevOtp] = useState(searchParams.get('devOtp') || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !otpCode) {
      setError('Please enter your email and 6-digit OTP code.');
      return;
    }

    setLoading(true);

    try {
      await verifyOTP(email, otpCode);
      setSuccess('Account verified successfully! Redirecting to dashboard...');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
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
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verify Your Account</h1>
          <p className="text-xs text-slate-500 font-medium">Enter the 6-digit OTP verification code sent to your email</p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 sm:p-8 space-y-5">
            
            {/* Dev OTP Helper Alert */}
            {devOtp && (
              <AlertBanner type="info" title="Development Testing OTP">
                Your OTP code is: <strong className="font-bold text-indigo-700 text-sm tracking-widest">{devOtp}</strong>
                <p className="text-[11px] text-blue-700 mt-0.5">Check terminal console or use prefilled code above.</p>
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

            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />

              <Input
                label="6-Digit OTP Verification Code"
                type="text"
                required
                maxLength="6"
                icon={KeyRound}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="tracking-widest font-mono text-base font-bold text-center"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={CheckCircle2}
                className="w-full mt-2"
              >
                Verify OTP & Activate
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
