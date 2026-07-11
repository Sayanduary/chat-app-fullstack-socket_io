import { Navigate, Routes, Route } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuth.store";
import { useEffect } from "react";
import PageLaoder from "./components/PageLaoder";
import { Toaster } from "react-hot-toast";
import BorderAnimatedContainer from "./components/BorderAnimatedContainer";


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

      <BorderAnimatedContainer>
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
      </BorderAnimatedContainer>

    </div>
  );
};

export default App;
