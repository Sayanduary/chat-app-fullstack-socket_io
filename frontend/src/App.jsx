import { Navigate, Routes, Route } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuth.store";
import { useEffect } from "react";
import PageLaoder from "./components/PageLaoder";
import { Toaster } from "react-hot-toast";


const App = () => {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <PageLaoder />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_32%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
      <div className="absolute -left-12 top-0 size-[32rem] rounded-full bg-cyan-500/12 blur-[140px]" />
      <div className="absolute -right-12 bottom-0 size-[30rem] rounded-full bg-teal-400/10 blur-[160px]" />

      {/* App Content */}
      <div className="relative z-10 flex h-screen w-screen">
        <Routes>
          <Route
            path="/"
            element={authUser ? <ChatPage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />}
          />
        </Routes>
        <Toaster />

      </div>
    </div>
  );
};

export default App;
