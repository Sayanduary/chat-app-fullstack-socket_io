import { useState } from "react";
import { Link } from "react-router";
import {
  MessageCircleIcon,
  MailIcon,
  LockIcon,
  LoaderIcon,
} from "lucide-react";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useAuthStore } from "../store/useAuth.store";

const LoginPage = () => {
  const { isLoggingIn, login } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="flex w-full items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <BorderAnimatedContainer>
          <div className="w-full p-8">
            {/* Heading */}
            <div className="mb-8 text-center">
              <MessageCircleIcon className="mx-auto mb-4 h-12 w-12 text-cyan-400" />

              <h1 className="mb-2 text-3xl font-bold text-white">
                Welcome Back
              </h1>

              <p className="text-slate-400">Sign in to continue chatting</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="auth-input-label">Email</label>

                <div className="relative">
                  <MailIcon className="auth-input-icon" />

                  <input
                    type="email"
                    className="input"
                    placeholder="Enter your email"
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
                    className="input"
                    placeholder="Enter your password"
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

              {/* Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3 font-semibold text-white transition-all duration-300 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <>
                    <LoaderIcon className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Create Account
              </Link>
            </p>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
};

export default LoginPage;
