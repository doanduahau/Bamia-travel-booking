import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_MODEL = "qwen2.5";
const CHAT_STORAGE_KEY = "travel_bamia_chat_history";
const CHAT_EXPIRY_MS = 30 * 60 * 1000; // 30 phút

// Hàm build system prompt động từ dữ liệu thật
const buildSystemPrompt = (tours = [], bookings = [], userData = null) => {
  // --- Phần Trạng thái người dùng ---
  let userStatusText = "=== TRẠNG THÁI NGƯỜI DÙNG ===\n";
  if (userData) {
    userStatusText += `• Trạng thái: ĐÃ ĐĂNG NHẬP\n• Tên tài khoản: ${userData.username || "N/A"}\n• Email: ${userData.email || "N/A"}\n`;
  } else {
    userStatusText += `• Trạng thái: CHƯA ĐĂNG NHẬP (Khách vãng lai)\n• Quyền: Chỉ được xem tour, không có quyền truy cập thông tin cá nhân hay đơn hàng.\n`;
  }

  // --- Phần tours ---
  let toursText = "=== DANH SÁCH TOUR ĐANG CÓ ===\n";
  if (tours.length === 0) {
    toursText += "Hiện chưa có tour nào.\n";
  } else {
    tours.forEach((t) => {
      const loc = t.location_detail?.name || "N/A";
      const cat = t.category_detail?.name || "N/A";
      toursText +=
        `\n• [ID:${t.id}] ${t.title}` +
        `\n  Địa điểm: ${loc} | Danh mục: ${cat}` +
        `\n  Giá: ${Number(t.price).toLocaleString("vi-VN")} VNĐ/người | Thời gian: ${t.duration}` +
        `\n  Đánh giá: ${t.rating}/5 | Còn chỗ: ${t.available_slots} slot` +
        `\n  Mô tả: ${String(t.description).slice(0, 150)}...\n`;
    });
  }

  // --- Phần bookings (chỉ có khi đã đăng nhập) ---
  let bookingsText = "";
  if (userData) {
    bookingsText = `\n=== ĐƠN HÀNG CỦA ${userData.username?.toUpperCase()} ===\n`;
    if (bookings.length === 0) {
      bookingsText += "Khách hiện chưa có đơn hàng nào trong lịch sử.\n";
    } else {
      bookings.forEach((b) => {
        const tourTitle = b.tour_detail?.title || "N/A";
        bookingsText +=
          `\n• Đơn #${b.id}: ${tourTitle}` +
          `\n  Ngày đi: ${b.date} | Số người: ${b.number_of_people}` +
          `\n  Tổng tiền: ${Number(b.total_price).toLocaleString("vi-VN")} VNĐ | Trạng thái: ${b.status}\n`;
      });
    }
  }

  return `Bạn là trợ lý AI chuyên nghiệp của TravelBaMia - công ty du lịch hàng đầu Việt Nam.

=== QUY TẮC BẢO MẬT NGƯỜI DÙNG (VÔ CÙNG QUAN TRỌNG) ===
1. Kiểm tra phần "TRẠNG THÁI NGƯỜI DÙNG" bên dưới trước khi trả lời.
2. Nếu trạng thái là "CHƯA ĐĂNG NHẬP":
   - Tuyệt đối KHÔNG được địa ra thông tin cá nhân, email hay đơn hàng cho khách.
   - Nếu khách hỏi về đơn hàng của họ, hãy yêu cầu họ đăng nhập để xem thông tin.
3. Nếu trạng thái là "ĐÃ ĐĂNG NHẬP":
   - Bạn được quyền truy cập và sử dụng thông tin trong mục "ĐƠN HÀNG" để tư vấn.
   - Luôn xưng hô thân thiện bằng tên của họ.

=== QUY TẮC CẤM (VÔ CÙNG QUAN TRỌNG) ===
1. TUYỆT ĐỐI KHÔNG sử dụng các nhãn hệ thống như [TASK_COMPLETE], [DONE], [SUCCESS]... trong câu trả lời.
2. CHỈ sử dụng nhãn [TOUR_CARD:ID] hoặc [ESCALATE] khi thật sự cần thiết.
3. Không trả lời về technical (mã nguồn, database...).

${userStatusText}${toursText}${bookingsText}`;
};

const Chatbot = () => {
  const { user } = useContext(AuthContext);
  const initialMessage = {
    text: "Xin chào! Mình là trợ lý AI của TravelBaMia. Mình có thể giúp gì cho chuyến đi sắp tới của bạn? 🌍",
    isBot: true,
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toursData, setToursData] = useState([]); // Lưu data tour để hiển thị card
  const [systemPrompt, setSystemPrompt] = useState(buildSystemPrompt());
  const [isFetchingData, setIsFetchingData] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // 1. Load history từ localStorage khi mount
  useEffect(() => {
    const savedData = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedData) {
      try {
        const { messages: savedMessages, history: savedHistory, timestamp } = JSON.parse(savedData);
        const now = Date.now();
        
        // Kiểm tra xem đã quá 30 phút kể từ lần cuối hoạt động chưa
        if (now - timestamp < CHAT_EXPIRY_MS) {
          setMessages(savedMessages);
          setHistory(savedHistory);
        } else {
          // Đã quá hạn, xóa sạch
          localStorage.removeItem(CHAT_STORAGE_KEY);
        }
      } catch (e) {
        console.error("Lỗi parse chat history:", e);
      }
    }
  }, []);

  // 2. Lưu history vào localStorage mỗi khi có tin nhắn mới
  useEffect(() => {
    // Không lưu nếu chỉ có tin nhắn chào mừng mặc định
    if (messages.length > 1 || (messages.length === 1 && !messages[0].isBot)) {
      const dataToSave = {
        messages,
        history,
        timestamp: Date.now()
      };
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [messages, history]);

  // Reset khi đăng xuất
  useEffect(() => {
    if (!user) {
      setMessages([initialMessage]);
      setHistory([]);
      setIsOpen(false);
      setSystemPrompt(buildSystemPrompt());
      localStorage.removeItem(CHAT_STORAGE_KEY); // Xóa khi logout
    }
  }, [user]);

  // Fetch dữ liệu thật khi mở chatbox
  useEffect(() => {
    if (!isOpen) return;

    const fetchContextData = async () => {
      setIsFetchingData(true);
      try {
        // Luôn fetch tours (public endpoint)
        const toursRes = await api.get("tours/");
        const tours = toursRes.data?.results ?? toursRes.data ?? [];
        setToursData(tours);

        // Fetch bookings chỉ khi đã đăng nhập
        let bookings = [];
        if (user) {
          const bookingsRes = await api.get("bookings/");
          bookings = bookingsRes.data?.results ?? bookingsRes.data ?? [];
        }

        setSystemPrompt(buildSystemPrompt(tours, bookings, user));
      } catch (err) {
        console.error("Lỗi fetch context cho chatbot:", err);
        // Vẫn dùng prompt mặc định nếu fetch thất bại
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchContextData();
  }, [isOpen, user]); // Re-fetch khi mở lại hoặc user thay đổi

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isFetchingData) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { text: userText, isBot: false }]);
    setInput("");
    setIsLoading(true);

    const newHistory = [...history, { role: "user", content: userText }];

    try {
      // Gọi qua backend Django để bảo mật prompt và log lại nếu cần
      const response = await api.post("chat/", {
        message: userText,
        // Ta vẫn gửi systemPrompt từ FE để AI có dữ liệu tour/booking mới nhất
        system_instruction: systemPrompt, 
        history: history
      });

      const botReply = response.data?.reply || "Xin lỗi, mình chưa hiểu câu hỏi của bạn.";

      // Parse tìm các token đặc biệt
      let tourId = null;
      let isEscalated = false;
      
      const tourMatch = botReply.match(/\[TOUR_CARD:(\d+)\]/);
      if (tourMatch) {
        tourId = tourMatch[1];
      }

      if (botReply.includes("[ESCALATE]")) {
        isEscalated = true;
      }

      // Làm sạch tin nhắn trước khi hiển thị (Xóa toàn bộ các tag trong ngoặc vuông [] không mong muốn)
      const cleanReply = botReply
        .replace(/\[TOUR_CARD:\d+\]/g, "")
        .replace(/\[ESCALATE\]/g, "")
        .replace(/\[TASK_COMPLETE\]/g, "") // Xóa tag thừa
        .replace(/\[.*?\]/g, "")           // Xóa mọi tag lạ khác trong ngoặc vuông
        .trim();

      setHistory([...newHistory, { role: "assistant", content: botReply }]);
      setMessages((prev) => [...prev, { text: cleanReply, isBot: true, tourId, isEscalated }]);
    } catch (error) {
      console.error("Lỗi khi chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Xin lỗi, không kết nối được với AI. Vui lòng thử lại sau nhé! 🙏",
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sub-component hiển thị card tour
  const TourCard = ({ id }) => {
    const tour = toursData.find(t => String(t.id) === String(id));
    if (!tour) return null;

    return (
      <div className="mt-2 bg-white rounded-xl border border-teal-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="h-24 w-full bg-gray-200">
          <img 
            src={tour.image || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=300&q=80"} 
            alt={tour.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{tour.title}</h4>
          <p className="text-xs text-teal-600 font-semibold mt-1">
            {Number(tour.price).toLocaleString("vi-VN")} VNĐ
          </p>
          <button 
            onClick={() => {
              navigate(`/tours/${tour.id}`);
            }}
            className="mt-2 w-full py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-600 hover:text-white transition-colors"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-[#005555] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all animate-bounce"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] animate-fade-in-up">
          {/* Header */}
          <div className="bg-[#005555] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  TravelVi BaMia
                </h3>
                {isFetchingData && (
                  <p className="text-xs text-teal-200 leading-tight">
                    Đang tải dữ liệu tour...
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vùng tin nhắn */}
          <div className="flex-grow p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.isBot
                      ? "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                      : "bg-[#005555] text-white rounded-tr-none"
                  }`}
                >
                  {msg.text}
                  {msg.isBot && msg.tourId && <TourCard id={msg.tourId} />}
                  
                  {msg.isBot && msg.isEscalated && (
                    <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                      <p className="text-[11px] text-gray-500 italic">Bạn cần hỗ trợ thêm?</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setMessages(prev => [...prev, { text: "Tôi muốn tiếp tục hỏi AI", isBot: false }])}
                          className="flex-1 py-1 px-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition"
                        >
                          Tiếp tục với AI
                        </button>
                        <button 
                          onClick={() => {
                            navigate("/contact");
                          }}
                          className="flex-1 py-1 px-2 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700 transition"
                        >
                          Gặp nhân viên
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isFetchingData ? "Đang tải dữ liệu..." : "Nhập câu hỏi..."
              }
              className="flex-grow bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isLoading || isFetchingData}
            />
            <button
              type="submit"
              disabled={isLoading || isFetchingData || !input.trim()}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 transition"
            >
              <Send className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
