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

  const { isSigniningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
  };

  return (
    <div className="flex w-full items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <BorderAnimatedContainer>
          <div className="w-full p-8">
            {/* Heading */}
            <div className="mb-8 text-center">
              <MessageCircleIcon className="mx-auto mb-4 h-12 w-12 text-slate-400" />

              <h2 className="mb-2 text-2xl font-bold text-slate-200">
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
                disabled={isSigniningUp}
                className="w-full rounded-lg bg-cyan-600 py-3 font-semibold text-white transition hover:bg-cyan-700 cursor-pointer"
              >
                {isSigniningUp ? (
                  <LoaderIcon className="w-full h-5 animate-spin text-center" />
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
                className="font-medium text-cyan-400 hover:underline"
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
