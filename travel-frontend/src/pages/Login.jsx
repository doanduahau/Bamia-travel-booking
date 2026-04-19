import React, { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isForgotPassword) {
      try {
        const response = await api.post("auth/forgot-password/", { email });
        setMessage(response.data.success);
      } catch (err) {
        setError(err.response?.data?.error || "Có lỗi xảy ra!");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await api.post("auth/login/", {
          username,
          password,
        });
        login(response.data.access, response.data.refresh);
      } catch (err) {
        setError("Sai tài khoản hoặc mật khẩu!");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Left Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 group overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=2000"
          alt="Travel Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-16 text-white z-10 w-full">
          <span className="inline-block py-1 px-3 rounded-full bg-[#005555]/20 border border-[#005555]/30 text-[#005555] text-sm font-medium tracking-wider mb-4 backdrop-blur-sm">
            TRAVELBAMIA
          </span>
          <h2 className="text-5xl font-bold mb-6 font-serif leading-tight">
            Khám Phá <br />
            Thế Giới
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed">
            Bắt đầu hành trình của bạn với những trải nghiệm du lịch tuyệt vời
            nhất. Chúng tôi đưa bạn đến mọi nơi.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 bg-white h-full overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Link
              to="/"
              className="inline-block lg:hidden mb-8 text-[#007777] font-bold text-2xl tracking-tighter"
            >
              TravelBaMia.
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight text-left">
              {isForgotPassword ? "Khôi phục mật khẩu" : "Chào mừng trở lại!"}
            </h1>
            <p className="text-gray-500 text-lg text-left">
              {isForgotPassword
                ? "Nhập email của bạn để cấp lại mật khẩu mới."
                : "Đăng nhập để tiếp tục khám phá thế giới."}
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
              <span className="text-left">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isForgotPassword ? (
              <>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left transition-colors">
                    Tài khoản
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full border border-gray-200 bg-gray-50 text-gray-900 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007777]/50 focus:border-[#007777] transition-all focus:bg-white hover:border-gray-300"
                      placeholder="Nhập tên tài khoản"
                      required
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left transition-colors">
                    Mật khẩu
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
                      className="w-full border border-gray-200 bg-gray-50 text-gray-900 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007777]/50 focus:border-[#007777] transition-all focus:bg-white hover:border-gray-300"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2.5 h-4 w-4 rounded border-gray-300 text-[#007777] focus:ring-[#007777] transition-all cursor-pointer"
                    />
                    <span className="select-none">Ghi nhớ đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="font-semibold text-[#007070] hover:text-[#005555] hover:underline transition-all"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </>
            ) : (
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left transition-colors">
                  Email tài khoản
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-200 bg-gray-50 text-gray-900 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white hover:border-gray-300"
                    placeholder="your-email@example.com"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#007777] hover:bg-[#005555] text-white font-semibold py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007777] transition-all shadow-lg shadow-[#007777]/30 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <span>{isForgotPassword ? "Gửi yêu cầu" : "Đăng nhập"}</span>
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </form>

          {!isForgotPassword ? (
            <>
              <div className="mt-10 mb-6 flex items-center justify-center space-x-4">
                <span className="h-px bg-gray-200 w-full"></span>
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Hoặc
                </span>
                <span className="h-px bg-gray-200 w-full"></span>
              </div>

              <div className="flex gap-4">
                <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 bg-white shadow-sm">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M24 12.274c0-.853-.07-1.666-.214-2.433H12v4.57h6.81a5.617 5.617 0 0 1-2.463 3.655v3.08h3.966v-.002c2.327-2.146 3.687-5.323 3.687-8.87z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.376 0 6.208-1.124 8.277-3.04l-3.966-3.08c-1.12.756-2.553 1.206-4.311 1.206-3.327 0-6.143-2.25-7.149-5.275H.795v3.17C2.862 21.085 7.114 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M4.851 13.811A7.218 7.218 0 0 1 4.475 12c0-.623.111-1.233.315-1.811V7.02H.795A11.962 11.962 0 0 0 0 12c0 1.936.463 3.774 1.282 5.426l3.569-3.615z"
                    />
                    <path
                      fill="#4285F4"
                      d="M12 4.885c1.838 0 3.486.634 4.79 1.834l3.564-3.564C18.192 1.124 15.362 0 12 0 7.114 0 2.862 2.915.795 7.02l3.68 3.17C5.468 7.15 8.283 4.885 12 4.885z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Google
                  </span>
                </button>
                <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 bg-white shadow-sm">
                  <svg
                    className="w-5 h-5 mr-2 text-[#1877F2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Facebook
                  </span>
                </button>
              </div>
            </>
          ) : null}

          <div className="mt-8">
            <p className="text-left text-gray-600">
              {isForgotPassword ? (
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="font-semibold text-[#007777] hover:text-[#005555] hover:underline transition-all flex items-center"
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
                  Quay lại Đăng nhập
                </button>
              ) : (
                <>
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-[#007777] hover:text-[#005555] hover:underline transition-all"
                  >
                    Đăng ký ngay
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
