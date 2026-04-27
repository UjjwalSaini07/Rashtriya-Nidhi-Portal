'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../../lib/api';
import { Eye, EyeOff, Lock, Shield, AlertCircle } from 'lucide-react';

// Temporary admin credentials for testing - NIC ID + Passkey only
const TEMP_LOGIN = {
  nicId: 'TEMP-ADMIN-001',
  passkey: 'ADMIN123'
};

export default function LoginPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [tempToken, setTempToken] = useState('');
  const [otpMsg, setOtpMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

   const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: regOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm();
  const [isTempLogin, setIsTempLogin] = useState(false);

  async function onLogin(data) {
    setError(''); setLoading(true);

    // Temporary login check - NIC ID + Passkey only (no password)
    if (data.nicId.toUpperCase() === TEMP_LOGIN.nicId && data.password === TEMP_LOGIN.passkey) {
      setIsTempLogin(true);
      // Simulate successful login with dummy user data
      const dummyUser = {
        nicId: TEMP_LOGIN.nicId,
        name: 'Temporary Admin',
        role: 'ADMIN',
        department: 'Testing',
        isTemp: true
      };
      const dummyToken = 'temp-jwt-token-for-testing-only';
      localStorage.setItem('accessToken', dummyToken);
      localStorage.setItem('user', JSON.stringify(dummyUser));
      router.push('/dashboard');
      setLoading(false);
      return;
    }

    // Normal API login flow
    try {
      const res = await authAPI.login(data.nicId.toUpperCase(), data.password);
      if (res.data.requireOTP) {
        setTempToken(res.data.tempToken);
        setOtpMsg(res.data.message);
        setStep('otp');
      } else {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  }

  async function onVerifyOTP(data) {
    setError(''); setLoading(true);
    try {
      const res = await authAPI.verifyOTP(tempToken, data.otp);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flag-stripe" />
      <div className="bg-[#0A2540] text-white py-4 px-6 flex items-center gap-4">
        <span className="text-3xl">🇮🇳</span>
        <div>
          <div className="text-lg font-semibold">राष्ट्रीय निधि पोर्टल</div>
          <div className="text-sm text-blue-200">Rashtriya Nidhi Portal — Government of India</div>
        </div>
        <span className="ml-auto bg-[#138808] text-white text-xs font-medium px-3 py-1 rounded">MHA VERIFIED SECURE</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex gap-2">
            <Shield className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
            <p className="text-xs text-blue-700">
              <strong>Authorised Access Only.</strong> This system is for registered Government officials. All access is logged and monitored. Unauthorised access is a criminal offence under IT Act 2000.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-[#0A2540] px-6 py-5 flex items-center gap-3">
              <div className="bg-white/10 rounded-lg p-2"><Lock className="text-white" size={20} /></div>
              <div>
                <div className="text-white font-semibold">Secure Login</div>
                <div className="text-blue-200 text-sm">{step === 'login' ? 'Enter your NIC credentials' : 'OTP Verification Required'}</div>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex gap-2">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {step === 'login' ? (
                <form onSubmit={handleSubmit(onLogin)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">NIC Government ID *</label>
                    <input
                      {...register('nicId', { required: 'NIC ID is required' })}
                      placeholder="e.g. CENTRAL-IAS-2001-07"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                    {errors.nicId && <p className="text-red-500 text-xs mt-1">{errors.nicId.message}</p>}
                  </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1.5">Password / Passkey *</label>
                     <div className="relative">
                       <input
                         {...register('password', { required: 'Password is required', minLength: { value: 4, message: 'Min 4 characters' } })}
                         type={showPwd ? 'text' : 'password'}
                         placeholder="For testing: use TEMP-ADMIN-001 / ADMIN123"
                         className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                       />
                       <button type="button" onClick={() => setShowPwd(!showPwd)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                         {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                       </button>
                     </div>
                     {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                   </div>
                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 flex gap-2">
                     <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={16} />
                     <span className="text-xs text-yellow-700"><strong>Test Login:</strong> Use NIC <code className="font-mono">TEMP-ADMIN-001</code> / Passkey <code className="font-mono">ADMIN123</code> for temporary access</span>
                   </div>
                   <button type="submit" disabled={loading}
                     className="w-full bg-[#0A2540] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#0D3063] transition-colors disabled:opacity-60">
                     {loading ? 'Authenticating...' : (isTempLogin ? 'Temporary Login →' : 'Login →')}
                   </button>
                   <div className="text-center">
                     <span className="text-xs text-gray-400">{isTempLogin ? '✓ Using temporary login' : 'Normal authentication flow'}</span>
                   </div>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit(onVerifyOTP)} className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">{otpMsg}</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter 6-digit OTP</label>
                    <input
                      {...regOtp('otp', { required: 'OTP required', minLength: { value: 6, message: 'Must be 6 digits' }, maxLength: { value: 6, message: 'Must be 6 digits' } })}
                      type="text" inputMode="numeric" maxLength={6} placeholder="• • • • • •"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-center tracking-[0.5em] font-mono text-xl focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                    />
                    {otpErrors.otp && <p className="text-red-500 text-xs mt-1">{otpErrors.otp.message}</p>}
                    <p className="text-xs text-gray-500 mt-1">OTP valid for 5 minutes only</p>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#138808] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-60">
                    {loading ? 'Verifying...' : 'Verify & Login →'}
                  </button>
                  <button type="button" onClick={() => setStep('login')} className="w-full text-sm text-gray-500 hover:text-gray-700">
                    ← Back to login
                  </button>
                </form>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">© Government of India — Ministry of Finance</p>
        </div>
      </div>
    </div>
  );
}
