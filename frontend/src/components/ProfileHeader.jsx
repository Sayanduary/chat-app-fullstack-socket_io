import { useRef, useState } from "react";
import { CameraIcon, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuth.store";

const ProfileHeader = () => {
  const { logout, authUser, updateProfile } = useAuthStore();
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-white/[0.035] backdrop-blur-2xl">
      <div className="flex items-center justify-between px-6 py-5">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative"
          >
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.svg"}
                alt={authUser?.fullName}
                className="h-16 w-16 rounded-2xl border border-white/10 object-cover transition duration-300 group-hover:scale-105"
              />

              {/* Online Indicator */}
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#05070a] bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,.8)]" />

              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/55 opacity-0 transition duration-300 group-hover:opacity-100">
                <CameraIcon className="h-5 w-5 text-white" />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </button>

          <div>
            <h2 className="max-w-[180px] truncate text-lg font-semibold text-white">
              {authUser?.fullName}
            </h2>

            <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
              Online
            </p>
          </div>
        </div>

        {/* Right */}
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl

            border
            border-white/10

            bg-white/[0.04]

            text-slate-300

            transition-all
            duration-300

            hover:border-red-500/30
            hover:bg-red-500/10
            hover:text-red-300
            hover:shadow-[0_0_25px_rgba(239,68,68,.2)]
          "
        >
          <LogOutIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default ProfileHeader;
