import React from "react";
import { useNavigate } from "react-router-dom";

const TourCard = ({ id, toursData }) => {
  const navigate = useNavigate();
  const tour = toursData.find((t) => String(t.id) === String(id));
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
          onClick={() => navigate(`/tours/${tour.id}`)}
          className="mt-2 w-full py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg hover:bg-teal-600 hover:text-white transition-colors"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default TourCard;
