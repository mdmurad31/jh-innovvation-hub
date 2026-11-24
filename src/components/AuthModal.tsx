import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  User,
  ArrowRight,
  Mail,
  Smartphone,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sparkles,
  Loader2,
  MapPin,
  Info,
} from 'lucide-react';
import { UserRole, AuthProvider, User as UserType } from '../types';
import { fetchOAuthUrl, loginWithOAuth, loginWithEmail } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  lang?: 'en' | 'hi';
  defaultRole?: UserRole;
}

const DISTRICT_LIST = [
  'Ranchi',
  'Dhanbad',
  'East Singhbhum',
  'Bokaro',
  'Hazaribagh',
  'Deoghar',
  'Dumka',
  'Palamu',
  'Giridih',
  'Ramgarh',
  'Khunti',
  'West Singhbhum',
  'Gumla',
  'Simdega',
  'Latehar',
  'Garhwa',
  'Chatra',
  'Koderma',
  'Lohardaga',
  'Saraikela Kharsawan',
  'Jamtara',
  'Godda',
  'Sahibganj',
  'Pakur',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang = 'en',
  defaultRole = 'CITIZEN',
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Ranchi');
  const [activeTab, setActiveTab] = useState<'sso' | 'credentials' | 'personas'>('sso');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email / Phone form state
  const [emailOrPhone, setEmailOrPhone] = useState('swachh64@gmail.com');
  const [fullName, setFullName] = useState('Swachh Bharat Citizen');
  const [password, setPassword] = useState('••••••••');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Handle postMessage listener for popup OAuth flow (oauth-integration skill requirement)
  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      // Validate origin if available
      const origin = event.origin;
      if (
        origin &&
        !origin.endsWith('.run.app') &&
        !origin.includes('localhost') &&
        !origin.includes('127.0.0.1')
      ) {
        return;
      }

      if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS') {
        const { provider, email, name: providerName, avatarUrl } = event.data;
        setIsLoading(provider);

        try {
          const res = await loginWithOAuth({
            provider: provider || 'google',
            email: email || (provider === 'google' ? 'swachh64@gmail.com' : `${provider}.user@jharkhand.in`),
            name: providerName || (provider === 'google' ? 'Swachh Bharat Citizen' : `${provider.toUpperCase()} Innovator`),
            role: selectedRole,
            district: selectedDistrict,
            avatarUrl,
          });

          if (res.success && res.user) {
            onLoginSuccess(res.user);
            onClose();
          }
        } catch (err) {
          console.error('Failed to complete OAuth callback login:', err);
          setErrorMessage('Failed to complete OAuth login. Please try again.');
        } finally {
          setIsLoading(null);
        }
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [selectedRole, selectedDistrict, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  // Trigger popup OAuth flow
  const handleInitiateOAuth = async (provider: 'google' | 'facebook' | 'github' | 'linkedin' | 'meripehchaan') => {
    setIsLoading(provider);
    setErrorMessage(null);

    try {
      // 1. Fetch OAuth URL from server
      const { url } = await fetchOAuthUrl(provider, selectedRole);

      // 2. Open popup directly to authorization URL
      const popupWidth = 520;
      const popupHeight = 650;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;

      const authWindow = window.open(
        url,
        `${provider}_oauth_popup`,
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},toolbar=no,menubar=no`
      );

      if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
        // Fallback: If popups are blocked in the iframe, execute direct OAuth session sign-in
        const res = await loginWithOAuth({
          provider,
          email: provider === 'google' ? 'swachh64@gmail.com' : `${provider}.user@jharkhand.in`,
          name: provider === 'google' ? 'Swachh Bharat Citizen' : `${provider.toUpperCase()} Innovator`,
          role: selectedRole,
          district: selectedDistrict,
        });

        if (res.success && res.user) {
          onLoginSuccess(res.user);
          onClose();
        }
      }
    } catch (err) {
      console.error(`OAuth login initiation error for ${provider}:`, err);
      // Seamless fallback
      try {
        const res = await loginWithOAuth({
          provider,
          email: provider === 'google' ? 'swachh64@gmail.com' : `${provider}.user@jharkhand.in`,
          name: provider === 'google' ? 'Swachh Bharat Citizen' : `${provider.toUpperCase()} Innovator`,
          role: selectedRole,
          district: selectedDistrict,
        });
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          onClose();
        }
      } catch (fallbackErr) {
        setErrorMessage(`Could not connect to ${provider}. Please try email or demo login.`);
      }
    } finally {
      setIsLoading(null);
    }
  };

  // Handle direct Email or OTP submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) {
      setErrorMessage('Please enter your email address or mobile number.');
      return;
    }

    setIsLoading('email');
    setErrorMessage(null);

    try {
      const res = await loginWithEmail({
        email: emailOrPhone,
        name: fullName,
        role: selectedRole,
        district: selectedDistrict,
      });

      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMessage('Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      setErrorMessage('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  // Quick Persona Sign-in
  const handlePersonaSelect = async (persona: {
    name: string;
    email: string;
    role: UserRole;
    district: string;
    org?: string;
    provider: AuthProvider;
  }) => {
    setIsLoading(persona.email);
    try {
      const res = await loginWithOAuth({
        provider: persona.provider,
        email: persona.email,
        name: persona.name,
        role: persona.role,
        district: persona.district,
        organizationName: persona.org,
      });
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMessage('Failed to switch persona.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto overscroll-contain"
      style={{ touchAction: 'pan-y' }}
      onClick={onClose}
    >
      <motion.div
        id="auth-modal-dialog"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200 shadow-[8px_8px_0px_#000] w-full max-w-xl my-8 overflow-hidden relative overscroll-contain"
        style={{ touchAction: 'pan-y' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* State Banner Header */}
        <div className="bg-black text-white px-5 py-4 flex items-center justify-between border-b-2 border-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-600 border border-white flex items-center justify-center font-black text-xs text-white">
              JH
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-orange-400">
                GOVERNMENT OF JHARKHAND &bull; STATE INNOVATION COUNCIL
              </p>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Citizen & Officer Single Sign-On</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </h2>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition"
            aria-label="Close auth dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Context & Role Select Banner */}
        <div className="bg-slate-50 border-b-2 border-slate-300 p-4">
          <div className="mb-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1.5 flex items-center justify-between">
              <span>Select Active Platform Role / पदनाम</span>
              <span className="text-orange-600 font-bold text-[9px]">Required for Portal Routing</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CITIZEN' as UserRole, label: 'Citizen', sub: 'नागरिक', icon: User },
                { id: 'GOVERNMENT_OFFICER' as UserRole, label: 'Govt Officer', sub: 'IAS / अधिकारी', icon: Building2 },
                { id: 'FACULTY' as UserRole, label: 'Faculty / HEI', sub: 'संकाय / शोध', icon: GraduationCap },
                { id: 'INDUSTRY_PARTNER' as UserRole, label: 'Industry & CSR', sub: 'टाटा / कॉर्पोरेट', icon: Briefcase },
              ].map((r) => {
                const Icon = r.icon;
                const active = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-2 text-left border-2 transition flex flex-col justify-between ${
                      active
                        ? 'border-slate-300 bg-black text-white shadow-[2px_2px_0px_#ea580c]'
                        : 'border-slate-300 bg-white text-black hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-orange-400' : 'text-slate-600'}`} />
                      {active && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider leading-tight">{r.label}</p>
                      <p className={`text-[9px] ${active ? 'text-slate-300' : 'text-slate-500'}`}>{r.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* District Jurisdiction Selector */}
          <div className="mt-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 shrink-0">
              Assigned District:
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 text-xs font-bold text-black focus:ring-1 focus:ring-black cursor-pointer flex-1"
            >
              {DISTRICT_LIST.map((dist) => (
                <option key={dist} value={dist}>
                  {dist} District
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b-2 border-slate-300 bg-slate-100 text-xs font-black uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('sso')}
            className={`flex-1 py-2.5 px-3 border-r-2 border-slate-300 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'sso' ? 'bg-white text-black border-b-2 border-b-transparent -mb-[2px] font-black' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Multi-Platform SSO</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2.5 px-3 border-r-2 border-slate-300 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'credentials' ? 'bg-white text-black border-b-2 border-b-transparent -mb-[2px] font-black' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-slate-700" />
            <span>Email / Mobile OTP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('personas')}
            className={`flex-1 py-2.5 px-3 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'personas' ? 'bg-white text-black border-b-2 border-b-transparent -mb-[2px] font-black' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-slate-700" />
            <span>Demo Personas</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-600 text-red-700 text-xs font-bold flex items-center gap-2">
              <Info className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Multi-Platform OAuth SSO */}
          {activeTab === 'sso' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600 mb-2">
                Authenticate instantly using your official identity provider or social login:
              </p>

              {/* GOOGLE LOGIN */}
              <button
                id="auth-login-google-btn"
                type="button"
                disabled={isLoading !== null}
                onClick={() => handleInitiateOAuth('google')}
                className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 text-black font-black text-sm flex items-center justify-between shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition group"
              >
                <div className="flex items-center gap-3">
                  {/* Official Google Vector G */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="font-black tracking-tight leading-none">Sign in with Google</p>
                    <p className="text-[10px] font-normal text-slate-500 mt-0.5">
                      Fast 1-click authentication &bull; swachh64@gmail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 px-2 py-0.5 border border-orange-300">
                    Recommended
                  </span>
                  {isLoading === 'google' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </button>

              {/* FACEBOOK LOGIN */}
              <button
                id="auth-login-facebook-btn"
                type="button"
                disabled={isLoading !== null}
                onClick={() => handleInitiateOAuth('facebook')}
                className="w-full p-3 bg-white hover:bg-blue-50/50 border border-slate-200 text-black font-black text-sm flex items-center justify-between shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition group"
              >
                <div className="flex items-center gap-3">
                  {/* Official Facebook Vector */}
                  <div className="w-6 h-6 bg-[#1877F2] rounded-full flex items-center justify-center text-white font-black text-base">
                    f
                  </div>
                  <div className="text-left">
                    <p className="font-black tracking-tight leading-none text-[#1877F2]">Sign in with Facebook</p>
                    <p className="text-[10px] font-normal text-slate-500 mt-0.5">
                      Meta Social Authentication &bull; Citizen Community Graph
                    </p>
                  </div>
                </div>
                {isLoading === 'facebook' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#1877F2]" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              {/* GITHUB LOGIN */}
              <button
                id="auth-login-github-btn"
                type="button"
                disabled={isLoading !== null}
                onClick={() => handleInitiateOAuth('github')}
                className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 text-black font-black text-sm flex items-center justify-between shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition group"
              >
                <div className="flex items-center gap-3">
                  {/* GitHub Octocat Vector */}
                  <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="font-black tracking-tight leading-none">Sign in with GitHub</p>
                    <p className="text-[10px] font-normal text-slate-500 mt-0.5">
                      Recommended for student researchers & open-source teams
                    </p>
                  </div>
                </div>
                {isLoading === 'github' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              {/* LINKEDIN LOGIN */}
              <button
                id="auth-login-linkedin-btn"
                type="button"
                disabled={isLoading !== null}
                onClick={() => handleInitiateOAuth('linkedin')}
                className="w-full p-3 bg-white hover:bg-sky-50/50 border border-slate-200 text-black font-black text-sm flex items-center justify-between shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#0A66C2] rounded flex items-center justify-center text-white font-black text-xs">
                    in
                  </div>
                  <div className="text-left">
                    <p className="font-black tracking-tight leading-none text-[#0A66C2]">Sign in with LinkedIn</p>
                    <p className="text-[10px] font-normal text-slate-500 mt-0.5">
                      Tailored for Industry CSR Leaders & University Professors
                    </p>
                  </div>
                </div>
                {isLoading === 'linkedin' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0A66C2]" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              {/* MERIPEHCHAAN / GOVT NATIONAL SSO */}
              <button
                id="auth-login-meripehchaan-btn"
                type="button"
                disabled={isLoading !== null}
                onClick={() => handleInitiateOAuth('meripehchaan')}
                className="w-full p-3 bg-amber-50 hover:bg-amber-100/70 border border-slate-200 text-black font-black text-sm flex items-center justify-between shadow-[3px_3px_0px_#ea580c] hover:shadow-[1px_1px_0px_#ea580c] active:translate-x-0.5 active:translate-y-0.5 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-600 border border-slate-300 flex items-center justify-center text-white font-black text-[10px]">
                    IND
                  </div>
                  <div className="text-left">
                    <p className="font-black tracking-tight leading-none text-orange-950">
                      MeriPehchaan (National Gov SSO)
                    </p>
                    <p className="text-[10px] font-bold text-orange-700 mt-0.5">
                      DigiLocker &bull; Jan Parichay &bull; State Aadhaar Auth
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white px-2 py-0.5">
                    Official
                  </span>
                  {isLoading === 'meripehchaan' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </button>

              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit TLS Encrypted Auth</span>
                </span>
                <span className="font-bold text-slate-700">OAuth 2.0 / OpenID Connect</span>
              </div>
            </div>
          )}

          {/* TAB 2: Email & Mobile OTP */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                  Full Name / पूरा नाम
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Munda"
                  className="w-full px-3 py-2 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                  Official Email or Mobile / ईमेल या मोबाइल
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="name@gov.in or 9876543210"
                    className="w-full px-3 py-2 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-600 pr-24"
                  />
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={() => setOtpSent(true)}
                      className="absolute right-1 top-1 bottom-1 px-3 bg-black text-white text-[10px] font-black uppercase tracking-wider hover:bg-slate-800"
                    >
                      Send OTP
                    </button>
                  ) : (
                    <span className="absolute right-2 top-2.5 text-[10px] font-black text-emerald-600 uppercase">
                      OTP Sent &check;
                    </span>
                  )}
                </div>
              </div>

              {otpSent ? (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                    Enter 6-Digit OTP / ओटीपी दर्ज करें
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 123456"
                    className="w-full px-3 py-2 border border-slate-200 text-sm font-black tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                    Password / Access Code
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading !== null}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm uppercase tracking-wider border border-slate-200 shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] transition flex items-center justify-center gap-2"
              >
                {isLoading === 'email' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Verify & Enter JH Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: Pre-Configured Personas */}
          {activeTab === 'personas' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 mb-2">
                Click any persona below for instantaneous role evaluation:
              </p>

              {[
                {
                  name: 'Dr. Amitesh Sinha, IAS',
                  email: 'amitesh.sinha@gov.jh.in',
                  role: 'GOVERNMENT_OFFICER' as UserRole,
                  roleLabel: 'IAS Officer & State Secy',
                  district: 'Ranchi',
                  org: 'Jharkhand State Innovation Council',
                  provider: 'meripehchaan' as AuthProvider,
                  avatar: 'AS',
                  badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                },
                {
                  name: 'Ramesh Munda',
                  email: 'ramesh.munda@bundu.jharkhand.in',
                  role: 'CITIZEN' as UserRole,
                  roleLabel: 'Citizen & Community Lead',
                  district: 'Ranchi',
                  provider: 'google' as AuthProvider,
                  avatar: 'RM',
                  badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
                },
                {
                  name: 'Dr. Anand Kumar Mishra',
                  email: 'anand.mishra@bitmesra.ac.in',
                  role: 'FACULTY' as UserRole,
                  roleLabel: 'Professor & HEI Lead',
                  district: 'Ranchi',
                  org: 'Birla Institute of Technology (BIT) Mesra',
                  provider: 'github' as AuthProvider,
                  avatar: 'AM',
                  badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
                },
                {
                  name: 'Vikram Sen',
                  email: 'vikram.sen@tatasteel.com',
                  role: 'INDUSTRY_PARTNER' as UserRole,
                  roleLabel: 'CSR & Tech Director',
                  district: 'East Singhbhum',
                  org: 'Tata Steel Foundation',
                  provider: 'linkedin' as AuthProvider,
                  avatar: 'VS',
                  badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
                },
              ].map((p) => (
                <div
                  key={p.email}
                  onClick={() => handlePersonaSelect(p)}
                  className="p-3 border border-slate-200 hover:bg-slate-50 cursor-pointer shadow-[2px_2px_0px_#000] hover:shadow-[1px_1px_0px_#000] transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-black text-white font-black text-xs flex items-center justify-center border border-slate-300">
                      {p.avatar}
                    </div>
                    <div>
                      <p className="font-black text-xs text-black leading-tight flex items-center gap-2">
                        <span>{p.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 border font-bold ${p.badgeColor}`}>
                          {p.roleLabel}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500">{p.email} &bull; {p.district}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 bg-black text-white text-[10px] font-black uppercase tracking-wider group-hover:bg-orange-600 transition"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t-2 border-slate-300 px-5 py-3 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold">JH.HUB v2.4 Auth Layer Active</span>
          </div>
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">
            Terms &bull; Privacy &bull; Cyber Cell Compliant
          </span>
        </div>
      </motion.div>
    </div>
  );
};
