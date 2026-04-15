import React from 'react';

const PageBanner = ({ title, subtitle, image }) => {
    return (
        <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 z-0 bg-slate-700 bg-cover bg-center"
                style={{ backgroundImage: `url('${image}')` }}
            >
                {/* Lớp phủ gradient chuyên nghiệp */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"></div>
            </div>
            
            <div className="relative z-10 w-full h-full px-4 animate-fade-in">
                <div className="mt-[5.5rem] h-[calc(100%-5.5rem)] max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-light drop-shadow-lg leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                    {/* Thanh gạch chân trang trí */}
                    <div className="w-20 h-1.5 bg-orange-500 mx-auto mt-8 rounded-full shadow-lg"></div>
                </div>
            </div>
        </div>
    );
};

export default PageBanner;
