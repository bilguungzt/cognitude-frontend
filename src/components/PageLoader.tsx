import { Loader } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center text-gray-500">
      <Loader className="mr-3 h-6 w-6 animate-spin" />
      <span>Loading...</span>
    </div>
  );
}

