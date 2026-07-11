import { useState } from "react";
import { Link } from "react-router";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import {
  MessageCircleIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  LoaderIcon,
} from "lucide-react";
import { useAuthStore } from "../store/useAuth.store";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { isSigningUp, signup } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(formData);
  };
  return (
    <div className="flex w-full items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <BorderAnimatedContainer>
          <div className="w-full bg-white/[0.02] p-8 backdrop-blur-3xl sm:p-10">
            {/* Heading */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_30px_rgba(255,255,255,0.04)]">
                <MessageCircleIcon className="h-7 w-7 text-cyan-300" />
              </div>

              <h2 className="mb-2 text-2xl font-bold text-slate-100">
                Create Account
              </h2>

              <p className="text-slate-400">Sign up for a new account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="auth-input-label">Full Name</label>

                <div className="relative">
                  <UserIcon className="auth-input-icon" />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="input"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="auth-input-label">Email</label>

                <div className="relative">
                  <MailIcon className="auth-input-icon" />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="auth-input-label">Password</label>

                <div className="relative">
                  <LockIcon className="auth-input-icon" />

                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="input"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSigningUp}
                className="auth-btn cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSigningUp ? (
                  <LoaderIcon className="h-5 animate-spin" />
                ) : (
                  " Create Account"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-cyan-300 hover:text-cyan-200 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
};

export default SignUpPage;
