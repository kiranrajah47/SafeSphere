import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AlertBanner from '../components/ui/AlertBanner';
import { Shield, Mail, KeyRound, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      const resData = await forgotPassword(email);
      navigate(`/reset-password?email=${encodeURIComponent(email)}&devOtp=${encodeURIComponent(resData?.devOtp || '')}`);
    } catch (err) {
      setError(err.message || 'Forgot password request failed.');
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-500 font-medium">Enter your email to receive a password reset OTP code</p>
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
                label="Registered Email Address"
                type="email"
                required
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
                Send Reset Code
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Remember your password?{' '}
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
