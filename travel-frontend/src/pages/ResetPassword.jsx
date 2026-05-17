import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);

  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  // Xác thực token khi trang vừa load
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`auth/reset-password-confirm/?uid=${uid}&token=${token}`);
        setIsValidToken(true);
      } catch (err) {
        setError(err.response?.data?.error || "Đường dẫn khôi phục mật khẩu đã hết hạn hoặc không hợp lệ!");
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };
    verifyToken();
  }, [uid, token]);

  // Bộ đếm thời gian chuyển hướng khi thành công
  useEffect(() => {
    if (message && redirectCount > 0) {
      const timer = setTimeout(() => {
        setRedirectCount(redirectCount - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (message && redirectCount === 0) {
      navigate("/login");
    }
  }, [message, redirectCount, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate mật khẩu khớp nhau
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải chứa ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("auth/reset-password-confirm/", {
        uid,
        token,
        new_password: password,
      });
      setMessage(response.data.success || "Đặt lại mật khẩu thành công!");
      setIsValidToken(false); // Khóa form lập tức sau khi đổi thành công
    } catch (err) {
      setError(err.response?.data?.error || "Đường dẫn khôi phục mật khẩu không hợp lệ hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#005555] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium animate-pulse">Đang xác thực liên kết khôi phục...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Left Image Section - Đồng bộ thiết kế với Login */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 group overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000"
          alt="Reset Password Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-16 text-white z-10 w-full">
          <span className="inline-block py-1 px-3 rounded-full bg-[#005555]/20 border border-[#005555]/30 text-[#005555] text-sm font-medium tracking-wider mb-4 backdrop-blur-sm">
            TRAVELBAMIA SECURITY
          </span>
          <h2 className="text-5xl font-bold mb-6 font-serif leading-tight">
            Đặt Lại <br />
            Mật Khẩu Mới
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed">
            Bảo mật tài khoản của bạn là ưu tiên hàng đầu của chúng tôi. Vui lòng thiết lập mật khẩu mới đủ mạnh để bảo vệ thông tin cá nhân.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 bg-white h-full overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Link
              to="/"
              className="inline-block lg:hidden mb-8 text-[#005555] font-bold text-2xl tracking-tighter"
            >
              TravelBaMia.
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight text-left">
              {isValidToken ? "Thiết lập mật khẩu" : "Khôi phục mật khẩu"}
            </h1>
            <p className="text-gray-500 text-lg text-left">
              {isValidToken 
                ? "Nhập mật khẩu mới của bạn bên dưới để hoàn tất việc khôi phục." 
                : message 
                  ? "Cập nhật mật khẩu thành công!" 
                  : "Đường dẫn khôi phục mật khẩu đã hết hạn hoặc đã được sử dụng trước đó."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-start">
              <svg
                className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-left">{error}</span>
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm border border-green-100 flex items-start">
              <svg
                className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="text-left font-medium">
                {message} <br />
                <span className="text-xs text-green-500 font-normal">
                  Hệ thống sẽ tự động đưa bạn về trang đăng nhập sau {redirectCount} giây...
                </span>
              </span>
            </div>
          )}

          {isValidToken && !message && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left transition-colors">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 bg-gray-50 text-gray-900 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005555]/50 focus:border-[#005555] transition-all focus:bg-white hover:border-gray-300"
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left transition-colors">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-200 bg-gray-50 text-gray-900 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005555]/50 focus:border-[#005555] transition-all focus:bg-white hover:border-gray-300"
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#005555] hover:bg-[#004444] text-white font-semibold py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005555] transition-all shadow-lg shadow-[#005555]/30 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <span>Xác nhận mật khẩu mới</span>
                <svg
                  className="w-5 h-5 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </form>
          )}

          <div className="mt-10 text-left">
            <Link
              to="/login"
              className="font-semibold text-[#005555] hover:text-[#004444] hover:underline transition-all flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Quay lại trang Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
