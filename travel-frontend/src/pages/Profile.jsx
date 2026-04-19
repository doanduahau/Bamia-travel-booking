import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import PageBanner from "../components/PageBanner";
import {
  User,
  Mail,
  Lock,
  KeyRound,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      // Fetch latest user data from API to ensure we have email etc.
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("auth/profile/");
      setProfileData(res.data);
    } catch (error) {
      console.error("Lỗi lấy thông tin profile:", error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await api.patch("auth/profile/", profileData);
      updateUser(res.data);
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
    } catch (error) {
      const errorMsg =
        error.response?.data?.username?.[0] ||
        error.response?.data?.email?.[0] ||
        "Có lỗi xảy ra khi cập nhật.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: "error", text: "Mật khẩu mới không khớp." });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post("auth/change-password/", {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.old_password?.[0] ||
        error.response?.data?.error ||
        "Mật khẩu cũ không chính xác.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <PageBanner
        title="Quản Lý Tài Khoản"
        subtitle="Cập nhật thông tin cá nhân và quản lý bảo mật tài khoản của bạn."
        image="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=2000"
      />

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {message.text && (
          <div
            className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mt-4 items-stretch">
          {/* Section 1: Personal Info */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 flex flex-col h-full">
            <div className="min-h-[110px]">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Thông Tin Cá Nhân
              </h2>
              <p className="text-gray-500 mb-8">
                Cập nhật tên người dùng và địa chỉ email của bạn tại đây.
              </p>
            </div>

            <form
              onSubmit={handleProfileSubmit}
              className="space-y-6 flex flex-col flex-grow"
            >
              <div className="flex-grow space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên người dùng
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#007777] focus:ring-2 focus:ring-[#007777]/20 transition-all outline-none bg-gray-50 focus:bg-white font-medium"
                    placeholder="Ví dụ: travel_lover"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email của bạn
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#007777] focus:ring-2 focus:ring-[#007777]/20 transition-all outline-none bg-gray-50 focus:bg-white font-medium"
                    placeholder="Ví dụ: email@domain.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#007777] focus:ring-2 focus:ring-[#007777]/20 transition-all outline-none bg-gray-50 focus:bg-white font-medium"
                    placeholder="Ví dụ: 0912345678"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg mt-6 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#007777] hover:bg-[#005555] hover:-translate-y-1"}`}
              >
                <Save className="w-5 h-5 mr-2" />{" "}
                {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
              </button>
            </form>
          </div>

          {/* Section 2: Change Password */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 flex flex-col h-full">
            <div className="min-h-[110px]">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Đổi Mật Khẩu
              </h2>
              <p className="text-gray-500 mb-8">
                Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.
              </p>
            </div>

            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-6 flex flex-col flex-grow"
            >
              <div className="flex-grow space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu cũ
                  </label>
                  <input
                    type="password"
                    value={passwordData.old_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        old_password: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#007777] focus:ring-2 focus:ring-[#007777]/20 transition-all outline-none bg-gray-50 focus:bg-white font-medium"
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#007777] focus:ring-2 focus:ring-[#007777]/20 transition-all outline-none bg-gray-50 focus:bg-white font-medium"
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#007777] focus:ring-2 focus:ring-[#007777]/20 transition-all outline-none bg-gray-50 focus:bg-white font-medium"
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg mt-6 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#007777] hover:bg-[#005555] hover:-translate-y-1"}`}
              >
                <Lock className="w-5 h-5 mr-2" />{" "}
                {loading ? "Đang thực hiện..." : "Cập Nhật Mật Khẩu"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
