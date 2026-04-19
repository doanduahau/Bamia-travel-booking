import React, { useState } from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Send } from 'lucide-react';
import PageBanner from '../components/PageBanner';
import axios from '../api/axios';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            await axios.post('/auth/support/', {
                guest_name: formData.name,
                guest_email: formData.email,
                content: formData.message,
                request_type: 'CONTACT'
            });

            setIsSubmitting(false);
            setSubmitStatus('success');
            setFormData({ name: '', email: '', message: '' });

            setTimeout(() => setSubmitStatus(null), 8000);
        } catch (error) {
            console.error("Error sending message:", error);
            setIsSubmitting(false);
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 5000);
        }
    };

    return (
        <div className="w-full bg-gray-50 min-h-screen pb-20">
            {/* 1. HERO SECTION */}
            <PageBanner 
                title="Liên Hệ Với Chúng Tôi"
                subtitle="Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc, mọi nơi. Đừng ngần ngại để lại lời nhắn!"
                image="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=2000"
            />

            {/* MAIN CONTENT */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
                <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                    {/* 2. CONTACT INFORMATION (Cột trái) */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 h-full">
                            <h2 className="text-3xl font-bold text-gray-800 mb-8">Thông Tin Liên Hệ</h2>

                            <div className="space-y-6">
                                {/* Address Card */}
                                <div className="flex items-start group">
                                    <div className="w-14 h-14 bg-[#007777]/10 rounded-2xl flex items-center justify-center text-[#007777] group-hover:bg-[#007777] group-hover:text-white transition-colors duration-300 flex-shrink-0 shadow-sm">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">Địa chỉ</h3>
                                        <p className="text-gray-600 leading-relaxed">123 Đường Du Lịch, Quận 1<br />TP. Hồ Chí Minh, Việt Nam</p>
                                    </div>
                                </div>

                                {/* Phone Card */}
                                <div className="flex items-start group">
                                    <div className="w-14 h-14 bg-[#007777]/10 rounded-2xl flex items-center justify-center text-[#007777] group-hover:bg-[#007777] group-hover:text-white transition-colors duration-300 flex-shrink-0 shadow-sm">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">Điện thoại</h3>
                                        <p className="text-gray-600 leading-relaxed">+84 123 456 789<br />+84 987 654 321</p>
                                    </div>
                                </div>

                                {/* Email Card */}
                                <div className="flex items-start group">
                                    <div className="w-14 h-14 bg-[#007777]/10 rounded-2xl flex items-center justify-center text-[#007777] group-hover:bg-[#007777] group-hover:text-white transition-colors duration-300 flex-shrink-0 shadow-sm">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">Email</h3>
                                        <p className="text-gray-600 leading-relaxed">support@travelvi.com<br />booking@travelvi.com</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-8 border-gray-100" />

                            {/* Social Media */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Kết nối với chúng tôi</h3>
                                <div className="flex space-x-4">
                                    <a href="#" className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm">
                                        <Facebook className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-400 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-sm">
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. CONTACT FORM (Cột phải) */}
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Gửi Tin Nhắn</h2>
                        <p className="text-gray-500 mb-8">Bạn có thắc mắc hoặc cần tư vấn? Hãy điền form bên dưới nhé.</p>

                        {submitStatus === 'success' && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center">
                                <span className="font-semibold mr-2">Thành công!</span> Tin nhắn của bạn đã được gửi. Chúng tôi sẽ liên hệ lại sớm nhất.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và Tên</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#007777] focus:ring-2 focus:ring-[#007777]/20 transition-all outline-none bg-gray-50 focus:bg-white"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email của bạn</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#007777] focus:ring-2 focus:ring-[#007777]/20 transition-all outline-none bg-gray-50 focus:bg-white"
                                    placeholder="Ví dụ: email@domain.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung tin nhắn</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#007777] focus:ring-2 focus:ring-[#007777]/20 transition-all outline-none bg-gray-50 focus:bg-white resize-none"
                                    placeholder="Bạn muốn hỏi về vấn đề gì..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#007777] hover:bg-[#005555] hover:-translate-y-1'}`}
                            >
                                {isSubmitting ? 'Đang gửi...' : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" /> Gửi Tin Nhắn
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* 4. GOOGLE MAP (Full width phía dưới) */}
                <div className="mt-16 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-2">
                    <iframe
                        title="Học viện Công nghệ Bưu chính Viễn thông"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.527935681664!2d106.78224647769865!3d10.847392261731208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752772b245dff1%3A0xb838977f3d419d!2zSOG7jWMgdmnhu4duIEPDtG5nIG5naOG7hyBCxrB1IENow61uaCBWaeG7hW4gVGjDtG5nIGPGoSBz4bufIHThuqFpIFRQLkhDTQ!5e0!3m2!1svi!2s!4v1773511895507!5m2!1svi!2s"
                        className="w-full h-[400px] rounded-xl"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Contact;