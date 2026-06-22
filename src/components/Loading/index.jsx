import { Loader2 } from 'lucide-react';

const Loading = ({ fullScreen = false, message = 'Đang xử lý...' }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-white/70 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center"
    : "w-full py-12 flex flex-col items-center justify-center";

  return (
    <div className={containerClasses}>
      <Loader2 className="w-12 h-12 text-hepco-green animate-spin mb-4" />
      <p className="text-gray-700 font-medium animate-pulse text-lg">{message}</p>
    </div>
  );
};

export default Loading;
