import { LoaderIcon } from "lucide-react";
const PageLaoder = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoaderIcon className="size-10 animate-spin" />
    </div>
  );
};

export default PageLaoder;
