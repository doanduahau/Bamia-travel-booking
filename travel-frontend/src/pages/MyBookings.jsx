import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import PageBanner from "../components/PageBanner";
import {
  Calendar,
  Users,
  ShoppingCart,
  Trash2,
  CalendarCheck,
  CalendarOff,
  AlertTriangle,
  Timer,
  RotateCcw,
} from "lucide-react";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://127.0.0.1:8000";
const BANNER_IMAGE =
  "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=2000";

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedCartItems, setSelectedCartItems] = useState([]);
  const [trashedBookings, setTrashedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingCalendar, setTogglingCalendar] = useState({});

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingRes, cartRes] = await Promise.all([
        api.get("bookings/"),
        api.get("cart/"),
      ]);
      setBookings(bookingRes.data);
      setCartItems(cartRes.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch thùng rác chỉ khi chuyển sang tab
  const fetchTrash = async () => {
    try {
      const res = await api.get("bookings/trash/");
      setTrashedBookings(res.data);
    } catch (error) {
      console.error("Lỗi lấy thùng rác:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "trash") {
      fetchTrash();
    }
  };

  // --- TOGGLE CALENDAR ---
  const handleToggleCalendar = async (bookingId, currentValue) => {
    setTogglingCalendar((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const res = await api.patch(`bookings/${bookingId}/toggle-calendar/`, {
        show_on_calendar: !currentValue,
      });
      setBookings(
        bookings.map((b) =>
          b.id === bookingId
            ? { ...b, show_on_calendar: res.data.show_on_calendar }
            : b,
        ),
      );
    } catch (error) {
      console.error("Lỗi cập nhật lịch:", error);
      alert("Không thể cập nhật. Vui lòng thử lại.");
    } finally {
      setTogglingCalendar((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  // --- XOÁ MỀM (chuyển vào thùng rác) ---
  const handleSoftDelete = async (bookingId) => {
    if (!window.confirm("Bạn có chắc muốn chuyển đơn hàng này vào thùng rác?"))
      return;
    try {
      await api.delete(`bookings/${bookingId}/`);
      setBookings(bookings.filter((b) => b.id !== bookingId));
    } catch (error) {
      console.error("Lỗi chuyển vào thùng rác:", error);
      alert("Không thể xoá. Vui lòng thử lại.");
    }
  };

  // --- KHÔI PHỤC ---
  const handleRestore = async (bookingId) => {
    try {
      await api.patch(`bookings/${bookingId}/restore/`);
      setTrashedBookings(trashedBookings.filter((b) => b.id !== bookingId));
      // Refresh lại danh sách booking chính
      const res = await api.get("bookings/");
      setBookings(res.data);
    } catch (error) {
      console.error("Lỗi khôi phục:", error);
      alert("Không thể khôi phục. Vui lòng thử lại.");
    }
  };

  // --- XOÁ VĨNH VIỄN ---
  const handlePermanentDelete = async (bookingId) => {
    if (
      !window.confirm(
        "⚠️ CẢNH BÁO: Đơn hàng sẽ bị xoá vĩnh viễn và không thể khôi phục. Bạn có chắc?",
      )
    )
      return;
    try {
      await api.delete(`bookings/${bookingId}/permanent-delete/`);
      setTrashedBookings(trashedBookings.filter((b) => b.id !== bookingId));
    } catch (error) {
      console.error("Lỗi xoá vĩnh viễn:", error);
      alert("Không thể xoá. Vui lòng thử lại.");
    }
  };

  // --- XOÁ TOÀN BỘ THÙNG RÁC ---
  const handleEmptyTrash = async () => {
    if (trashedBookings.length === 0) return;
    if (
      !window.confirm(
        `⚠️ Xoá vĩnh viễn tất cả ${trashedBookings.length} đơn hàng trong thùng rác?`,
      )
    )
      return;
    try {
      await api.delete("bookings/empty-trash/");
      setTrashedBookings([]);
    } catch (error) {
      console.error("Lỗi dọn thùng rác:", error);
      alert("Không thể dọn thùng rác. Vui lòng thử lại.");
    }
  };

  // --- GIỎ HÀNG ---
  const updateCartQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.patch(`cart/${cartId}/`, { number_of_people: newQuantity });
      setCartItems(
        cartItems.map((item) =>
          item.id === cartId
            ? { ...item, number_of_people: newQuantity }
            : item,
        ),
      );
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
    }
  };

  const removeFromCart = async (cartId) => {
    if (!window.confirm("Bạn có chắc muốn xóa tour này khỏi giỏ hàng?")) return;
    try {
      await api.delete(`cart/${cartId}/`);
      setCartItems(cartItems.filter((item) => item.id !== cartId));
      setSelectedCartItems((prev) => prev.filter((id) => id !== cartId));
    } catch (error) {
      console.error("Lỗi xóa giỏ hàng:", error);
    }
  };

  const handleSelectCartItem = (cartId) => {
    setSelectedCartItems((prev) =>
      prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId],
    );
  };

  const isAllSelected =
    cartItems.length > 0 && selectedCartItems.length === cartItems.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCartItems([]);
    } else {
      setSelectedCartItems(cartItems.map((item) => item.id));
    }
  };

  const cartTotal = cartItems
    .filter((item) => selectedCartItems.includes(item.id))
    .reduce(
      (total, item) => total + item.tour_detail.price * item.number_of_people,
      0,
    );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_BASE_URL}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
  };

  const handleCheckout = () => {
    const selectedData = cartItems.filter((item) =>
      selectedCartItems.includes(item.id),
    );
    navigate("/payments", {
      state: { selectedCartItems: selectedData, totalAmount: cartTotal },
    });
  };

  const handleRetryPayment = (booking) => {
    navigate("/payments", {
      state: {
        pendingBookings: [booking],
        totalAmount: Number(booking.total_price),
      },
    });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    try {
      await api.patch(`bookings/${bookingId}/cancel/`);
      setBookings(bookings.filter((b) => b.id !== bookingId));
    } catch (error) {
      console.error("Lỗi hủy đơn:", error);
      alert("Không thể hủy đơn hàng. Vui lòng thử lại.");
    }
  };

  // Helper: định dạng ngày xoá
  const formatDeletedDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="bg-slate-50 min-h-screen pb-20">
        <PageBanner
          title="Quản Lý Chuyến Đi"
          subtitle="Theo dõi hành trình, vận chuyển và các đơn hàng của bạn tại đây."
          image={BANNER_IMAGE}
        />
        <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
          <div className="mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 p-8 animate-pulse">
            <div className="h-11 w-[520px] max-w-full bg-slate-200 rounded-full mx-auto mb-8"></div>
            <div className="h-[420px] bg-slate-100 rounded-xl border border-slate-200"></div>
          </div>
        </div>
      </div>
    );

  const tabButtonClass = (tab, activeClass, inactiveClass) =>
    `inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-base font-semibold transition-all duration-200 ${activeTab === tab ? activeClass : inactiveClass}`;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <PageBanner 
        title="Quản Lý Chuyến Đi"
        subtitle="Theo dõi hành trình, vận chuyển và các đơn hàng của bạn tại đây."
        image={BANNER_IMAGE}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">

      {/* === HỆ THỐNG TAB === */}
      <div className="mt-2 mb-8 bg-white rounded-2xl shadow-lg border border-slate-100 p-3 flex flex-wrap justify-center gap-2">
        <button
          className={tabButtonClass(
            "bookings",
            "bg-blue-600 text-white shadow-sm",
            "text-slate-600 hover:bg-slate-100",
          )}
          onClick={() => handleTabChange("bookings")}
        >
          Lịch sử đặt tour
        </button>
        <button
          className={tabButtonClass(
            "cart",
            "bg-blue-600 text-white shadow-sm",
            "text-slate-600 hover:bg-slate-100",
          )}
          onClick={() => handleTabChange("cart")}
        >
          <ShoppingCart className="w-5 h-5" /> Giỏ hàng ({cartItems.length})
        </button>
        <button
          className={tabButtonClass(
            "trash",
            "bg-red-600 text-white shadow-sm",
            "text-slate-600 hover:bg-red-50 hover:text-red-600",
          )}
          onClick={() => handleTabChange("trash")}
        >
          <Trash2 className="w-5 h-5" /> Thùng rác
          {trashedBookings.length > 0 && (
            <span className="bg-white/90 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {trashedBookings.length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 md:p-6">

      {/* ===================== TAB LỊCH SỬ ĐẶT TOUR ===================== */}
      {activeTab === "bookings" && (
        <div>
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xl text-gray-500 mb-4">
                Bạn chưa đặt chuyến đi nào.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-200 ${
                    booking.show_on_calendar
                      ? "border-blue-200"
                      : "border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Mã đơn: #{booking.id}
                    </h3>
                    <p className="text-gray-600">
                      <Calendar className="inline w-4 h-4 mr-1" /> Ngày đi:{" "}
                      {booking.date}
                    </p>
                    <p className="text-gray-600">
                      <Users className="inline w-4 h-4 mr-1" /> Số người:{" "}
                      {booking.number_of_people}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-2xl font-bold text-blue-600">
                      {Number(booking.total_price).toLocaleString("vi-VN")} đ
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm inline-block ${
                        booking.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.status === "Paid"
                        ? "Đã Thanh Toán"
                        : booking.status === "Cancelled"
                          ? "Đã Hủy"
                          : "Chờ Thanh Toán"}
                    </span>

                    {/* Checkbox hiện trên lịch */}
                    <label
                      className={`flex items-center gap-2 cursor-pointer select-none text-sm font-medium px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                        booking.show_on_calendar
                          ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {booking.show_on_calendar ? (
                        <CalendarCheck className="w-4 h-4 text-blue-600" />
                      ) : (
                        <CalendarOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span>
                        {booking.show_on_calendar
                          ? "Hiện trên lịch"
                          : "Ẩn khỏi lịch"}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        checked={booking.show_on_calendar}
                        disabled={togglingCalendar[booking.id]}
                        onChange={() =>
                          handleToggleCalendar(
                            booking.id,
                            booking.show_on_calendar,
                          )
                        }
                      />
                    </label>

                    {/* Nút hành động */}
                    <div className="mt-1 flex flex-row justify-end gap-2">
                      {booking.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleRetryPayment(booking)}
                            className="bg-orange-500 text-white text-sm font-bold py-1.5 px-4 rounded-lg hover:bg-orange-600 transition"
                          >
                            Thanh toán ngay →
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="bg-red-50 text-red-600 text-sm font-medium py-1.5 px-3 rounded-lg border border-red-200 hover:bg-red-100 transition"
                          >
                            Hủy đơn
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleSoftDelete(booking.id)}
                        className="text-gray-400 hover:text-red-500 text-sm font-medium py-1.5 px-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition"
                        title="Chuyển vào thùng rác"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB GIỎ HÀNG ===================== */}
      {activeTab === "cart" && (
        <div>
          {cartItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xl text-gray-500 mb-4">
                Giỏ hàng của bạn đang trống.
              </p>
              <Link
                to="/tours"
                className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Tìm tour ngay
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-2/3 space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 relative items-start sm:items-center"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-2 sm:mt-0"
                      checked={selectedCartItems.includes(item.id)}
                      onChange={() => handleSelectCartItem(item.id)}
                    />
                    <img
                      src={getImageUrl(item.tour_detail.image)}
                      alt={item.tour_detail.title}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                          {item.tour_detail.title}
                        </h3>
                        <p className="text-blue-600 font-semibold mt-1">
                          {Number(item.tour_detail.price).toLocaleString(
                            "vi-VN",
                          )}{" "}
                          đ / người
                        </p>
                        {item.date && (
                          <p className="text-sm text-gray-500 mt-1">
                            Ngày dự kiến: {item.date}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.number_of_people - 1,
                              )
                            }
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 font-bold"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 font-medium">
                            {item.number_of_people}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.number_of_people + 1,
                              )
                            }
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Xóa
                        </button>
                      </div>
                    </div>
                    <div className="sm:absolute right-4 bottom-4 text-right">
                      <p className="text-sm text-gray-500">Thành tiền</p>
                      <p className="text-xl font-bold text-orange-500">
                        {Number(
                          item.tour_detail.price * item.number_of_people,
                        ).toLocaleString("vi-VN")}{" "}
                        đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:w-1/3">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                    Tóm tắt đơn hàng
                    <label className="text-sm font-normal text-gray-600 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                      Chọn tất cả
                    </label>
                  </h3>
                  <div className="flex justify-between items-center mb-4 text-gray-600">
                    <span>Tour được chọn:</span>
                    <span className="font-semibold">
                      {selectedCartItems.length} / {cartItems.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-lg">
                    <span className="font-bold text-gray-800">Tổng cộng:</span>
                    <span className="font-bold text-orange-600 text-2xl">
                      {cartTotal.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <button
                    className={`w-full font-bold py-3 rounded-lg transition-colors ${selectedCartItems.length === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-orange-500 text-white hover:bg-orange-600"}`}
                    disabled={selectedCartItems.length === 0}
                    onClick={handleCheckout}
                  >
                    Thanh toán{" "}
                    {selectedCartItems.length > 0 &&
                      `(${selectedCartItems.length})`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB THÙNG RÁC ===================== */}
      {activeTab === "trash" && (
        <div>
          {trashedBookings.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-2">Thùng rác trống</p>
              <p className="text-sm text-gray-400">
                Các đơn hàng bị xoá sẽ xuất hiện ở đây trong 30 ngày.
              </p>
            </div>
          ) : (
            <div>
              {/* Thanh thông báo + nút dọn sạch */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    Các đơn hàng trong thùng rác sẽ bị{" "}
                    <strong>xoá vĩnh viễn</strong> sau 30 ngày.
                  </span>
                </div>
                <button
                  onClick={handleEmptyTrash}
                  className="bg-red-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition flex items-center gap-2 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" /> Dọn sạch thùng rác
                </button>
              </div>

              {/* Danh sách đơn trong thùng rác */}
              <div className="space-y-4">
                {trashedBookings.map((booking) => {
                  const daysLeft = booking.days_until_auto_delete;
                  const isExpiringSoon = daysLeft <= 7;

                  return (
                    <div
                      key={booking.id}
                      className={`bg-white p-5 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                        isExpiringSoon
                          ? "border-red-300 bg-red-50/30"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold text-gray-700 mb-1">
                          Mã đơn: #{booking.id}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          <Calendar className="inline w-4 h-4 mr-1" /> Ngày đi:{" "}
                          {booking.date}
                        </p>
                        <p className="text-gray-500 text-sm">
                          <Users className="inline w-4 h-4 mr-1" /> Số người:{" "}
                          {booking.number_of_people}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Chuyển vào thùng rác:{" "}
                          {formatDeletedDate(booking.deleted_at)}
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-xl font-bold text-gray-500 line-through">
                          {Number(booking.total_price).toLocaleString("vi-VN")}{" "}
                          đ
                        </p>

                        {/* Đếm ngược */}
                        <div
                          className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${
                            isExpiringSoon
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          <Timer className="w-4 h-4" />
                          {isExpiringSoon
                            ? `Còn ${daysLeft} ngày — sắp bị xoá!`
                            : `Còn ${daysLeft} ngày`}
                        </div>

                        {/* Nút khôi phục & xoá vĩnh viễn */}
                        <div className="flex flex-row gap-2 mt-1">
                          <button
                            onClick={() => handleRestore(booking.id)}
                            className="bg-green-50 text-green-700 text-sm font-semibold py-2 px-4 rounded-lg border border-green-200 hover:bg-green-100 transition flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-4 h-4" /> Khôi phục
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(booking.id)}
                            className="bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition flex items-center gap-1.5"
                          >
                            <Trash2 className="w-4 h-4" /> Xoá vĩnh viễn
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </div>
    </div>
  );
};

export default MyBookings;
