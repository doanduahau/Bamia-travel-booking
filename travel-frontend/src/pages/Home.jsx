import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import TourCard from "../components/TourCard";
import { Search, Globe, Shield, ThumbsUp, Heart } from "lucide-react";

// Component con xử lý hiệu ứng chạy số
const AnimatedCounter = ({ target, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Chỉ chạy 1 lần khi cuộn tới
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsVisible(true);
          hasAnimated.current = true;
        }
      },
      { threshold: 0.1 } // Kích hoạt khi 10% element hiện ra
    );

    if (countRef.current) observer.observe(countRef.current);
    
    return () => {
      if (countRef.current) observer.unobserve(countRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    // Cập nhật số mỗi 16ms (tương đương 60fps)
    const increment = target / (duration / 16); 
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        clearInterval(timer);
        setCount(target);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, target, duration]);

  // Format số theo định dạng có dấu phẩy (vd: 50,000)
  return <span ref={countRef}>{count.toLocaleString('vi-VN')}{suffix}</span>;
};

const popularDestinations = [
  {
    id: 1,
    name: "Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 2,
    name: "Hà Nội",
    image:
      "https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 3,
    name: "Hồ Chí Minh",
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 4,
    name: "Hội An",
    image:
      "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&q=80&w=2000",
  },
];
const Home = () => {
  const [featuredTours, setFeaturedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    // Cài đặt đổi ảnh mỗi 5 giây (5000ms)
    const interval = setInterval(() => {
      setCurrentBgIndex(
        (prevIndex) => (prevIndex + 1) % popularDestinations.length,
      );
    }, 3000);

    // Dọn dẹp interval khi rời khỏi trang Home
    return () => clearInterval(interval);
  }, []);

  // Lấy danh sách tour nổi bật từ Backend
  useEffect(() => {
    const fetchTours = async () => {
      try {
        // Lấy các tour sắp xếp theo rating cao nhất
        const response = await api.get("tours/?ordering=-rating");
        const allTours = response.data.results
          ? response.data.results
          : response.data;
        // Chỉ lấy 3 tour đầu tiên làm Featured
        setFeaturedTours(allTours.slice(0, 3));
      } catch (error) {
        console.error("Lỗi tải tour:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Encode chuỗi để tránh lỗi với các ký tự đặc biệt/tiếng Việt có dấu
      navigate(`/tours?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Nếu để trống thì cứ chuyển sang trang Tours xem tất cả
      navigate("/tours");
    }
  };

  // Dữ liệu tĩnh cho Destinations (Vì Backend Destination chưa có field ảnh)
  // const popularDestinations = [
  //     { id: 1, name: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=800' },
  //     { id: 2, name: 'Hà Nội', image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&q=80&w=800' },
  //     { id: 3, name: 'Hồ Chí Minh', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=800' },
  //     { id: 4, name: 'Hội An', image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&q=80&w=800' },
  // ];

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images with smooth transitions */}
        <div className="absolute inset-0 z-0 bg-black">
          {popularDestinations.map((dest, index) => (
            <div
              key={dest.id}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentBgIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url('${dest.image}')` }}
            ></div>
          ))}
          {/* Lớp phủ tối màu chuyên nghiệp */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 w-full max-w-5xl animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Khám phá hành trình <br/>
            <span className="text-orange-400">trong mơ</span> của bạn
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light">
            Hàng ngàn tour du lịch đẳng cấp và những trải nghiệm khó quên đang chờ đón bạn.
          </p>

          {/* Pill-shaped Search Bar (Inspired by Property theme) */}
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center bg-white p-1 rounded-full shadow-2xl hover:shadow-orange-500/10 transition-shadow"
            >
              <div className="flex-grow flex items-center pl-8">
                <Search className="text-gray-400 w-6 h-6 mr-3" />
                <input
                  type="text"
                  placeholder="Bạn muốn đi đâu hôm nay?"
                  className="w-full bg-transparent border-none focus:outline-none text-gray-800 text-lg py-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-[#005555] text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-[#004444] transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg mr-1"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. POPULAR DESTINATIONS */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#005555] mb-6">
            Điểm Đến <span className="text-orange-500">Phổ Biến</span>
          </h2>
          <div className="w-24 h-1.5 bg-orange-400 mx-auto rounded-full mb-8"></div>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Những địa điểm tuyệt vời nhất đã được chúng tôi tuyển chọn kỹ lưỡng dành riêng cho bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDestinations.map((dest) => (
            <div
              key={dest.id}
              onClick={() => navigate(`/tours?search=${dest.name}`)}
              className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <h3 className="absolute bottom-6 left-6 text-2xl font-bold text-white">
                {dest.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* MỤC SỐ LIỆU CHẠY (STATS) MỚI THÊM */}
      <div className="pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-200">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                  <AnimatedCounter target={154} />+
              </div>
              <p className="text-gray-500 font-medium tracking-wider uppercase text-xs md:text-sm">Điểm Đến</p>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                  <AnimatedCounter target={50000} suffix="+" />
              </div>
              <p className="text-gray-500 font-medium tracking-wider uppercase text-xs md:text-sm">Khách Hàng</p>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                  <AnimatedCounter target={98} suffix="%" />
              </div>
              <p className="text-gray-500 font-medium tracking-wider uppercase text-xs md:text-sm">Hài Lòng</p>
            </div>
            <div className="p-4 border-l border-gray-200">
              <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                  <AnimatedCounter target={12} />
              </div>
              <p className="text-gray-500 font-medium tracking-wider uppercase text-xs md:text-sm">Năm Kinh Nghiệm</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FEATURED TOURS */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#005555] mb-4">
                Tour <span className="text-orange-500">Nổi Bật</span>
              </h2>
              <p className="text-gray-500 text-lg">
                Những chuyến đi được đánh giá cao nhất bởi cộng đồng xê dịch.
              </p>
            </div>
            <button
              onClick={() => navigate("/tours")}
              className="hidden md:inline-block px-8 py-3 bg-white border-2 border-[#005555] text-[#005555] font-bold rounded-full hover:bg-[#005555] hover:text-white transition-all shadow-md"
            >
              Xem tất cả tour
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Đang tải tour nổi bật...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour) => (
                // Tận dụng component TourCard đã làm, tự động có hiệu ứng hover và shadow
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}

          <button
            onClick={() => navigate("/tours")}
            className="w-full mt-8 py-3 bg-white border border-[#005555] text-[#005555] rounded-xl font-bold md:hidden hover:bg-[#005555]/5 transition"
          >
            Xem tất cả tour
          </button>
        </div>
      </div>

      {/* 4. WHY CHOOSE US */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#005555] mb-6">
            Tại Sao Chọn <span className="text-orange-500">TravelBaMia?</span>
          </h2>
          <div className="w-24 h-1.5 bg-orange-400 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
            <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 flex items-center justify-center rounded-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Mạng lưới toàn cầu
            </h3>
            <p className="text-gray-600">
              Hàng ngàn điểm đến hấp dẫn trên toàn thế giới với mức giá cực kỳ
              ưu đãi.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
            <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 flex items-center justify-center rounded-2xl mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Thanh toán an toàn
            </h3>
            <p className="text-gray-600">
              Hệ thống bảo mật tối đa, hỗ trợ đa dạng phương thức thanh toán.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
            <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 flex items-center justify-center rounded-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Dịch vụ tận tâm
            </h3>
            <p className="text-gray-600">
              Đội ngũ hỗ trợ 24/7 luôn sẵn sàng đồng hành cùng bạn trên mọi nẻo
              đường.
            </p>
          </div>
        </div>
      </div>

      {/* 5. TESTIMONIALS */}
      <div className="bg-[#f5f7fa] py-20 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f3d3d] mb-4">
              Khách Hàng Nói Gì Về Chúng Tôi
            </h2>
            <div className="w-20 h-1 bg-orange-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: 1,
                name: "Nguyễn Văn A",
                role: "Doanh nhân",
                quote:
                  "Dịch vụ rất chuyên nghiệp, hướng dẫn viên nhiệt tình. Tôi chắc chắn sẽ quay lại!",
              },
              {
                id: 2,
                name: "Trần Thị B",
                role: "Giáo viên",
                quote:
                  "Website đặt tour dễ dàng, giao diện đẹp mắt và giá cả vô cùng minh bạch.",
              },
              {
                id: 3,
                name: "Lê Hoàng C",
                role: "Nhiếp ảnh gia",
                quote:
                  "Nhờ TravelVi mà tôi đã có những bức ảnh tuyệt đẹp tại những địa điểm độc lạ.",
              },
            ].map((review) => (
              <div
                key={review.id}
                className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 relative"
              >
                <p className="text-gray-700 mb-6 italic relative z-10">
                  "{review.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-[#0f3d3d] font-bold text-xl mr-4">
                    {review.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800">{review.name}</h4>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-500">{review.role}</span>
                      <ThumbsUp className="text-slate-300 w-6 h-6 shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
