import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";

const StatusBanner = ({ ollamaStatus, isFetchingData, onRetry }) => {
  if (ollamaStatus === "ok") return null;
  if (ollamaStatus === "offline") {
    return (
      <div className="px-3 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2 text-xs text-red-600">
        <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1">
          AI đang offline. Chạy <code className="bg-red-100 px-1 rounded">ollama serve</code> để bật.
        </span>
        <button onClick={onRetry} className="flex items-center gap-1 text-red-700 font-semibold hover:underline">
          <RefreshCw className="w-3 h-3" /> Thử lại
        </button>
      </div>
    );
  }
  if (ollamaStatus === "unknown" && isFetchingData) {
    return (
      <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-600">
        <span className="animate-pulse">⏳</span>
        <span>Đang kiểm tra kết nối AI...</span>
      </div>
    );
  }
  return null;
};

export default StatusBanner;
