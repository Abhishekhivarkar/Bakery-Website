import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Testimonial = () => {
    const testimonials = [
        {
            name: "Aarav Sharma",
            message:
                "The cakes are unbelievably soft and fresh! Delivery was on time and the packaging was perfect.",
            image:
                "https://i.pinimg.com/1200x/e8/09/8a/e8098a3d487b4fd7b8d591d7d9db32bb.jpg",
        },
        {
            name: "Priya Mehta",
            message:
                "Best bakery in town! Their cupcakes melt in your mouth. The staff is super friendly and helpful.",
            image:
                "https://i.pinimg.com/1200x/1c/85/2e/1c852ea928150dfcf54c5457dbca0a35.jpg",
        },
        {
            name: "Rohan Verma",
            message:
                "Ordered a birthday cake and everyone loved it! Beautiful design and great taste. Will order again!",
            image:
                "https://i.pinimg.com/736x/fc/af/7a/fcaf7aec4b7be05a0d062eff7851d2aa.jpg",
        },
    ];

    return (
        <section className="w-full py-32 bg-[#e2bf9d] relative overflow-hidden">

            {/* Centered faded CLIENTS text (background) */}
            <h1
                className="
                absolute 
                top-40 md:top-40 left-1/2 
                -translate-x-1/2 -translate-y-[70%]
                text-[90px] sm:text-[120px] md:text-[160px] lg:text-[200px] 
                font-extrabold 
                text-[#b75a90]/20 
                tracking-wider 
                select-none pointer-events-none 
                whitespace-nowrap
                z-0
            "
            >
                CLIENTS
            </h1>

            <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">

                {/* Foreground heading */}
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#8b5e3c] mb-16 text-center relative">
                    Our Happy Clients
                </h2>

                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    autoplay={{ delay: 3000 }}
                    spaceBetween={40}
                    slidesPerView={1}
                    breakpoints={{
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                >
                    {testimonials.map((t, index) => (
                        <SwiperSlide key={index}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 120, damping: 12 }}
                                className="bg-white backdrop-blur-lg p-8 border border-white/40 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={t.image}
                                        alt={t.name}
                                        className="w-14 h-14 rounded-full object-cover shadow-md"
                                    />
                                    <h3 className="text-lg font-bold text-[#c85a32]">
                                        {t.name}
                                    </h3>
                                </div>

                                <p className="text-[#4a3f35] leading-relaxed mb-4">
                                    “{t.message}”
                                </p>

                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <motion.span
                                            key={s}
                                            className="text-yellow-400 text-xl"
                                            whileHover={{ scale: 1.3 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                        >
                                            ★
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default Testimonial;