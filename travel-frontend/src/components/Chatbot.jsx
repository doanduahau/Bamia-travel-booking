import React, { useState, useRef, useEffect, useContext } from 'react';
import api from '../api/axios';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Chatbot = () => {
    const { user } = useContext(AuthContext);
    const initialMessage = { text: "Xin chào! Mình là trợ lý AI của TravelBaMia. Mình có thể giúp gì cho chuyến đi sắp tới của bạn?", isBot: true };

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([initialMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Nếu không có user (vừa đăng xuất), thì xóa lịch sử chat và đóng khung chat lại
        if (!user) {
            setMessages([initialMessage]);
            setIsOpen(false); // Tùy chọn: Tự động đóng cửa sổ chat khi đăng xuất
        }
    }, [user]);

    // Tự động cuộn xuống tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        setMessages(prev => [...prev, { text: userText, isBot: false }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('chat/', { message: userText });
            setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
        } catch (error) {
            console.error("Lỗi khi chat với AI:", error);
            setMessages(prev => [...prev, { text: "Xin lỗi, hệ thống AI đang bận. Vui lòng thử lại sau nhé!", isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Nút bấm tròn để mở Chat */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-[#005555] text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all animate-bounce"
                >
                    <MessageCircle className="w-7 h-7" />
                </button>
            )}

            {/* Khung cửa sổ Chat */}
            {isOpen && (
                <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px] animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-[#005555] p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot className="w-6 h-6" />
                            <h3 className="font-bold text-lg">TravelVi BaMia</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-full transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Vùng chứa tin nhắn */}
                    <div className="flex-grow p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isBot ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none' : 'bg-[#005555] text-white rounded-tr-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Khung nhập tin nhắn */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Nhập câu hỏi..."
                            className="flex-grow bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
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