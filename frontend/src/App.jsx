import { Routes, Route } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

const App = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-size-[14px_24px]" />

      {/* Gray Glow */}
      <div className="absolute -left-4 top-0 size-96 rounded-full bg-gray-500/20 blur-[100px]" />

      {/* Cyan Glow */}
      <div className="absolute -right-4 bottom-0 size-96 rounded-full bg-cyan-700/20 blur-[100px]" />

      {/* App Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
