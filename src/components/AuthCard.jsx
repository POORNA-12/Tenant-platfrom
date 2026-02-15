import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    Building2,
    ShieldCheck,
    ExternalLink,
    ArrowRight,
    Loader2,
    KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';

export default function AuthCard() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // OTP step for signup
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({
        orgSlug: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const { orgSlug, email, password, confirmPassword } = formData;

        if (!orgSlug.trim()) {
            setError('Organization slug is required.');
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                if (!otpStep) {
                    // Step 1 — send OTP
                    if (password !== confirmPassword) {
                        setError('Passwords do not match.');
                        setLoading(false);
                        return;
                    }
                    await authService.signup(orgSlug, email, password, confirmPassword);
                    setOtpStep(true);
                    setSuccess('Verification code sent to your email!');
                } else {
                    // Step 2 — verify OTP & create account
                    if (!otp.trim()) {
                        setError('Please enter the verification code.');
                        setLoading(false);
                        return;
                    }
                    await authService.verifySignup(orgSlug, email, password, confirmPassword, otp);
                    setSuccess('Account created! Redirecting to sign in...');
                    setOtpStep(false);
                    setOtp('');
                    setTimeout(() => {
                        setIsSignUp(false);
                        setSuccess('');
                    }, 1500);
                }
            } else {
                // Sign in
                const data = await authService.signin(orgSlug, email, password);
                login(orgSlug, email);
            }
        } catch (err) {
            // Try to extract field-level errors from the API response
            if (err.data && typeof err.data === 'object') {
                const messages = Object.values(err.data)
                    .flat()
                    .filter((v) => typeof v === 'string');
                setError(messages.join(' ') || err.message);
            } else {
                setError(err.message || 'Something went wrong.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            await authService.sendVerification(formData.email, formData.orgSlug);
            setSuccess('Verification code resent!');
        } catch (err) {
            setError(err.message || 'Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (signup) => {
        setIsSignUp(signup);
        setOtpStep(false);
        setOtp('');
        setError('');
        setSuccess('');
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-8">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="12" cy="8" r="3" fill="white" />
                        <circle cx="6" cy="16" r="3" fill="white" />
                        <circle cx="18" cy="16" r="3" fill="white" />
                        <line x1="12" y1="11" x2="6" y2="13" stroke="white" strokeWidth="2" />
                        <line x1="12" y1="11" x2="18" y2="13" stroke="white" strokeWidth="2" />
                    </svg>
                </div>
            </div>

            {/* Card */}
            <div className="bg-cardbg rounded-2xl shadow-xl shadow-black/5 border border-border/60 overflow-hidden">
                <div className="px-8 pt-8 pb-2">
                    {/* Heading */}
                    <h1 className="text-2xl font-bold text-textprimary leading-tight">
                        Welcome Back
                    </h1>
                    <h2 className="text-2xl font-bold text-textprimary leading-tight">
                        {isSignUp ? (otpStep ? 'Verify Email' : 'Create Account') : 'Sign In'}
                    </h2>
                    <p className="text-sm text-textsecondary mt-1 mb-6">
                        {otpStep
                            ? 'Enter the verification code sent to your email'
                            : 'Enter your organization details to continue'}
                    </p>

                    {/* Tabs */}
                    {!otpStep && (
                        <div className="flex bg-bg rounded-xl p-1 mb-6 border border-border/60">
                            <button
                                type="button"
                                onClick={() => switchMode(false)}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${!isSignUp
                                        ? 'bg-cardbg text-textprimary shadow-sm'
                                        : 'text-textsecondary hover:text-textprimary'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => switchMode(true)}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${isSignUp
                                        ? 'bg-cardbg text-textprimary shadow-sm'
                                        : 'text-textsecondary hover:text-textprimary'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mx-8 mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-danger font-medium">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mx-8 mb-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-success font-medium">
                        {success}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 pb-6">
                    {/* OTP Step */}
                    {otpStep ? (
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-textprimary mb-1.5">
                                Verification Code
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    className="w-full px-4 py-3 bg-inputbg border border-border rounded-xl text-sm text-textprimary placeholder:text-textmuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 text-center tracking-[0.4em] text-lg font-bold"
                                />
                                <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-textmuted" />
                            </div>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="mt-2 text-xs font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
                            >
                                Resend code
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Organization Slug */}
                            <div className="mb-4">
                                <label className="flex items-center text-sm font-semibold text-textprimary mb-1.5">
                                    Organization Slug
                                    <span
                                        className="ml-1 text-primary text-xs cursor-pointer"
                                        title="A unique identifier for your organization"
                                    >
                                        ⓘ
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="orgSlug"
                                        value={formData.orgSlug}
                                        onChange={handleChange}
                                        placeholder="my-company-slug"
                                        className="w-full px-4 py-3 bg-inputbg border border-border rounded-xl text-sm text-textprimary placeholder:text-textmuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                                    />
                                    <Building2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-textmuted" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-textprimary mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@company.com"
                                        className="w-full px-4 py-3 bg-inputbg border border-border rounded-xl text-sm text-textprimary placeholder:text-textmuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                                    />
                                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-textmuted" />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-textprimary mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-inputbg border border-border rounded-xl text-sm text-textprimary placeholder:text-textmuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textmuted hover:text-textsecondary transition-colors cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <Eye className="w-5 h-5" />
                                        ) : (
                                            <EyeOff className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password (Sign Up only) */}
                            {isSignUp && (
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-textprimary mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3 bg-inputbg border border-border rounded-xl text-sm text-textprimary placeholder:text-textmuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textmuted hover:text-textsecondary transition-colors cursor-pointer"
                                        >
                                            {showConfirmPassword ? (
                                                <Eye className="w-5 h-5" />
                                            ) : (
                                                <EyeOff className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isSignUp
                                    ? otpStep
                                        ? 'Verify & Create Account'
                                        : 'Send Verification Code'
                                    : 'Sign In to Dashboard'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </button>

                    {/* Links */}
                    {!otpStep && (
                        <div className="text-center mt-5">
                            <a
                                href="#"
                                className="text-sm font-medium text-textprimary hover:text-primary transition-colors"
                            >
                                Forgot your password?
                            </a>
                            <p className="text-xs text-textmuted mt-1.5">
                                By signing up, you agree to our{' '}
                                <a href="#" className="text-primary hover:underline">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-primary hover:underline">
                                    Privacy Policy
                                </a>
                                .
                            </p>
                        </div>
                    )}

                    {otpStep && (
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setOtpStep(false);
                                    setOtp('');
                                    setError('');
                                    setSuccess('');
                                }}
                                className="text-sm font-medium text-textsecondary hover:text-textprimary transition-colors cursor-pointer"
                            >
                                ← Back to signup form
                            </button>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex items-center justify-between px-8 py-4 border-t border-border/60 bg-bg/50">
                    <span className="text-xs text-primary/80 font-medium">
                        Enterprise SSO available
                    </span>
                    <a
                        href="#"
                        className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                    >
                        Contact Support
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            {/* Security Badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-textmuted">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    SECURE SSL
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Lock className="w-4 h-4" />
                    AES-256
                </div>
            </div>
        </div>
    );
}
