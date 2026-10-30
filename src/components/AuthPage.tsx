import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Package, Users, ArrowLeft, Mail, Lock, User, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { KindKartLogo } from './KindKartLogo';
import { useNavigate, useParams } from 'react-router';
import { API_BASE } from '../lib/api';

type Role = 'donor' | 'ngo';
type VerificationChannel = 'email' | 'phone';

type VerificationState = {
  value: string;
  otp: string;
  sent: boolean;
  verified: boolean;
  sending: boolean;
  verifying: boolean;
  message: string;
};

const createVerificationState = (): VerificationState => ({
  value: '',
  otp: '',
  sent: false,
  verified: false,
  sending: false,
  verifying: false,
  message: '',
});

export function AuthPage() {
  const navigate = useNavigate();
  const { role: urlRole } = useParams();
  const initialRole: Role = urlRole === 'ngo' ? 'ngo' : 'donor';

  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [verificationChannel, setVerificationChannel] = useState<VerificationChannel>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    aadhaarCard: '',
    ngoVerificationDocument: '',
  });
  const [aadhaarFileName, setAadhaarFileName] = useState('');
  const [ngoDocumentFileName, setNgoDocumentFileName] = useState('');
  const [emailVerification, setEmailVerification] = useState<VerificationState>(createVerificationState);
  const [phoneVerification, setPhoneVerification] = useState<VerificationState>(createVerificationState);

  const roles = [
    { id: 'donor', label: 'Donor', icon: Package },
    { id: 'ngo', label: 'NGO / Volunteer', icon: Users },
  ];

  const isRegistration = isLogin === false;
  const requiresOtpVerification = isRegistration && (selectedRole === 'donor' || selectedRole === 'ngo');
  const requiresAadhaar = isRegistration && selectedRole === 'donor';
  const isNgoRegistration = isRegistration && selectedRole === 'ngo';
  const nameLabel = selectedRole === 'ngo' ? 'NGO Name' : 'Full Name';
  const namePlaceholder = selectedRole === 'ngo' ? 'Enter your NGO name' : 'Enter your name';

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetVerificationState = (channel: VerificationChannel) => {
    const setter = channel === 'email' ? setEmailVerification : setPhoneVerification;
    setter(createVerificationState());
  };

  const syncVerificationValue = (channel: VerificationChannel, value: string) => {
    const setter = channel === 'email' ? setEmailVerification : setPhoneVerification;

    setter((prev) => {
      if (prev.value === value) {
        return prev;
      }

      return {
        ...createVerificationState(),
        value,
      };
    });
  };

  useEffect(() => {
    syncVerificationValue('email', formData.email.trim());
  }, [formData.email]);

  useEffect(() => {
    syncVerificationValue('phone', formData.phone.trim());
  }, [formData.phone]);

  const readFileAsDataUrl = (file: File, onComplete: (result: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onComplete(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setVerificationChannel('email');

    if (role !== 'donor') {
      updateFormField('aadhaarCard', '');
      setAadhaarFileName('');
    }

    if (role !== 'ngo') {
      updateFormField('ngoVerificationDocument', '');
      setNgoDocumentFileName('');
    }

    resetVerificationState('email');
    resetVerificationState('phone');
  };

  const handleAadhaarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setAadhaarFileName('');
      updateFormField('aadhaarCard', '');
      return;
    }

    readFileAsDataUrl(file, (result) => {
      updateFormField('aadhaarCard', result);
      setAadhaarFileName(file.name);
    });
  };

  const handleNgoDocumentUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setNgoDocumentFileName('');
      updateFormField('ngoVerificationDocument', '');
      return;
    }

    readFileAsDataUrl(file, (result) => {
      updateFormField('ngoVerificationDocument', result);
      setNgoDocumentFileName(file.name);
    });
  };

  const sendOtp = async (channel: VerificationChannel) => {
    const value = channel === 'email' ? formData.email.trim() : formData.phone.trim();
    const setter = channel === 'email' ? setEmailVerification : setPhoneVerification;
    const label = channel === 'email' ? 'email address' : 'phone number';

    if (!value) {
      alert('Enter your ' + label + ' first.');
      return;
    }

    setter((prev) => ({
      ...prev,
      value,
      sending: true,
      message: '',
    }));

    try {
      const response = await fetch(API_BASE + '/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          value,
          purpose: 'register',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send OTP');
      }

      setter((prev) => ({
        ...prev,
        value,
        sent: true,
        verified: false,
        sending: false,
        message: data.message || 'OTP sent successfully.',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send OTP';
      setter((prev) => ({
        ...prev,
        sending: false,
        message,
      }));
      alert(message);
    }
  };

  const verifyOtp = async (channel: VerificationChannel) => {
    const verification = channel === 'email' ? emailVerification : phoneVerification;
    const setter = channel === 'email' ? setEmailVerification : setPhoneVerification;

    if (!verification.value) {
      alert('Send OTP first.');
      return;
    }

    if (!verification.otp.trim()) {
      alert('Enter the OTP first.');
      return;
    }

    setter((prev) => ({
      ...prev,
      verifying: true,
      message: '',
    }));

    try {
      const response = await fetch(API_BASE + '/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          value: verification.value,
          otp: verification.otp.trim(),
          purpose: 'register',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to verify OTP');
      }

      setter((prev) => ({
        ...prev,
        verifying: false,
        verified: true,
        message: data.message || 'Verified successfully.',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to verify OTP';
      setter((prev) => ({
        ...prev,
        verifying: false,
        verified: false,
        message,
      }));
      alert(message);
    }
  };

  const renderBaseField = (channel: VerificationChannel, verified: boolean) => {
    const isEmail = channel === 'email';
    const value = isEmail ? formData.email : formData.phone;
    const Icon = isEmail ? Mail : Phone;
    const label = isEmail ? 'Email Address' : 'Phone Number';
    const placeholder = isEmail ? 'your@email.com' : '+91 9876543210';

    return (
      <div>
        <label className="block text-sm font-semibold mb-2">{label}</label>
        <div className="relative">
          <Icon className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
          <input
            type={isEmail ? 'email' : 'tel'}
            value={value}
            required={requiresOtpVerification ? true : isEmail}
            onChange={(event) => updateFormField(channel, event.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-3 border rounded-xl"
          />
          {verified ? (
            <CheckCircle2 className="absolute right-4 top-3 w-5 h-5 text-emerald-600" />
          ) : null}
        </div>
      </div>
    );
  };

  const renderVerificationSection = (channel: VerificationChannel) => {
    const verification = channel === 'email' ? emailVerification : phoneVerification;
    const label = channel === 'email' ? 'Email Address' : 'Phone Number';

    return (
      <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-emerald-900">Verify through {channel === 'email' ? 'Gmail / email' : 'phone OTP'}</p>
          <button
            type="button"
            onClick={() => sendOtp(channel)}
            disabled={verification.sending}
            className="px-4 py-2 rounded-xl border border-emerald-600 text-emerald-700 font-semibold disabled:opacity-60"
          >
            {verification.sending ? 'Sending...' : verification.sent ? 'Resend OTP' : 'Send OTP'}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={verification.otp}
            onChange={(event) => {
              const nextOtp = event.target.value.replace(/\D/g, '').slice(0, 6);
              const setter = channel === 'email' ? setEmailVerification : setPhoneVerification;
              setter((prev) => ({
                ...prev,
                otp: nextOtp,
              }));
            }}
            placeholder={'Enter OTP sent to your ' + (channel === 'email' ? 'email' : 'phone')}
            className="flex-1 px-4 py-3 border rounded-xl"
          />
          <button
            type="button"
            onClick={() => verifyOtp(channel)}
            disabled={verification.verifying || verification.verified}
            className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-60"
          >
            {verification.verified ? 'Verified' : verification.verifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        {verification.message ? <p className="text-xs text-gray-600">{verification.message}</p> : null}

        {verification.verified ? (
          <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            {label} verified for registration.
          </p>
        ) : null}
      </div>
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (requiresAadhaar && !formData.aadhaarCard) {
      alert('Please upload the donor Aadhaar card before registering.');
      return;
    }

    if (requiresOtpVerification) {
      const selectedVerification = verificationChannel === 'email' ? emailVerification : phoneVerification;
      if (!selectedVerification.verified) {
        alert('Verify your ' + verificationChannel + ' with OTP before registering.');
        return;
      }
    }

    const url = isLogin ? API_BASE + '/auth/login' : API_BASE + '/auth/register';

    const payload = isLogin
      ? {
          email: formData.email,
          password: formData.password,
        }
      : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: selectedRole,
          verificationChannel,
          aadhaarCard: selectedRole === 'donor' ? formData.aadhaarCard : '',
          ngoVerificationDocument: selectedRole === 'ngo' ? formData.ngoVerificationDocument : '',
        };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        const role = data.user?.role || selectedRole;

        if (role === 'donor') {
          navigate('/donor/dashboard');
        } else if (role === 'ngo') {
          navigate('/ngo/dashboard');
        } else {
          navigate('/donor/dashboard');
        }
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-emerald-600"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <KindKartLogo size={56} className="text-emerald-600" />
            <h1 className="text-4xl font-bold text-gray-900">KindKart</h1>
          </div>
          <p className="text-gray-600">Connecting surplus into support through technology</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-2 bg-gray-100 p-1 m-4 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={'py-3 rounded-lg font-semibold ' + (isLogin ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-600')}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={'py-3 rounded-lg font-semibold ' + (isLogin ? 'text-gray-600' : 'bg-white text-emerald-600 shadow-md')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-3">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const activeClass = selectedRole === role.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200';

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id as Role)}
                      className={'p-3 rounded-xl border-2 ' + activeClass}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs block">{role.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isRegistration ? (
              <div>
                <label className="block text-sm font-semibold mb-2">{nameLabel}</label>
                <div className="relative">
                  <User className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    required
                    onChange={(e) => updateFormField('name', e.target.value)}
                    placeholder={namePlaceholder}
                    className="w-full pl-12 pr-4 py-3 border rounded-xl"
                  />
                </div>
              </div>
            ) : null}

            {renderBaseField('email', emailVerification.verified)}

            {requiresOtpVerification ? renderBaseField('phone', phoneVerification.verified) : null}

            {requiresOtpVerification ? (
              <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">Choose one verification method</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVerificationChannel('email')}
                    className={
                      'rounded-xl border px-4 py-3 text-sm font-semibold ' +
                      (verificationChannel === 'email'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600')
                    }
                  >
                    Verify with Gmail
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationChannel('phone')}
                    className={
                      'rounded-xl border px-4 py-3 text-sm font-semibold ' +
                      (verificationChannel === 'phone'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600')
                    }
                  >
                    Verify with Phone
                  </button>
                </div>
                {renderVerificationSection(verificationChannel)}
              </div>
            ) : null}

            {requiresAadhaar ? (
              <div>
                <label className="block text-sm font-semibold mb-2">Upload Aadhaar Card</label>
                <label className="flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer hover:border-emerald-400 transition-colors">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{aadhaarFileName || 'Choose Aadhaar card image or PDF'}</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    required={requiresAadhaar}
                    onChange={handleAadhaarUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Required for donor verification and accountability.</p>
              </div>
            ) : null}

            {isNgoRegistration ? (
              <div>
                <label className="block text-sm font-semibold mb-2">Upload NGO Verification Document</label>
                <label className="flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer hover:border-emerald-400 transition-colors">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{ngoDocumentFileName || 'Optional: NGO certificate, registration proof, or supporting PDF/image'}</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleNgoDocumentUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  If uploaded, KindKart stores the NGO as document-verified. Otherwise it stores the selected OTP verification method.
                </p>
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  required
                  onChange={(e) => updateFormField('password', e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-12 pr-4 py-3 border rounded-xl"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold">
              {isLogin ? 'Login' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => setIsLogin((prev) => prev === false)}
                className="text-emerald-600 ml-1"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6 px-4">
          By continuing, you agree to KindKart&apos;s Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
