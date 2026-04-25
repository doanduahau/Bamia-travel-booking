import React from "react";
import { Bot, Trash2, X } from "lucide-react";

const ChatbotHeader = ({ ollamaStatus, isFetchingData, onClearChat, onClose }) => {
  return (
    <div className="bg-[#005555] p-4 text-white flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Bot className="w-6 h-6" />
          {ollamaStatus === "ok" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-[#005555]" />
          )}
          {ollamaStatus === "offline" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-400 rounded-full border border-[#005555]" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight">TravelVi BaMia</h3>
          <p className="text-xs text-teal-200 leading-tight">
            {isFetchingData ? "Đang tải dữ liệu..." : ollamaStatus === "ok" ? "AI đang hoạt động ✓" : "Trợ lý du lịch AI"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onClearChat}
          className="hover:bg-red-500 p-1.5 rounded-full transition-colors"
          title="Xóa cuộc trò chuyện"
          aria-label="Xóa chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="hover:bg-[#f97316] p-1.5 rounded-full transition"
          aria-label="Đóng chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatbotHeader;
