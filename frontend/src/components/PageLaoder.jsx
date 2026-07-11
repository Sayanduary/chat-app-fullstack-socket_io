import { LoaderIcon } from "lucide-react";
const PageLaoder = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-[#05070a]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <LoaderIcon className="size-10 animate-spin text-cyan-300" />
      </div>
    </div>
  );
};

export default PageLaoder;
