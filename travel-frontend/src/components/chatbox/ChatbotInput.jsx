import React from "react";
import { Send } from "lucide-react";

const ChatbotInput = ({ 
  input, 
  setInput, 
  isLoading, 
  isFetchingData, 
  ollamaStatus, 
  onSendMessage, 
  inputRef 
}) => {
  return (
    <form
      onSubmit={onSendMessage}
      className="p-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0"
    >
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          isFetchingData
            ? "Đang tải dữ liệu..."
            : ollamaStatus === "offline"
            ? "AI đang offline..."
            : "Nhập câu hỏi..."
        }
        className="flex-grow bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#007777]/20 border border-transparent focus:border-[#007777]/30 disabled:opacity-60"
        disabled={isLoading || isFetchingData}
      />
      <button
        type="submit"
        disabled={isLoading || isFetchingData}
        className="w-10 h-10 bg-[#007777] text-white rounded-full flex items-center justify-center hover:bg-[#005555] disabled:opacity-70 disabled:cursor-not-allowed transition shadow-sm"
        aria-label="Gửi"
      >
        <Send className="w-4 h-4 ml-0.5" />
      </button>
    </form>
  );
};

export default ChatbotInput;
