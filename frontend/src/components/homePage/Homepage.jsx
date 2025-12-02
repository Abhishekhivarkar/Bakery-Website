import React from "react";
import cake from "../../assets/homePage/HeroCake3.png";
import { motion } from "framer-motion";
import Category from "./Category";
import ChefSection from "./ChefSection";
import DeliverySection from "./DeliverySection";
import Testimonial from "./Testimonials";
import WhyChooseUs from "./WhyChooseUs";
import FeaturedProducts from "./FeaturedProducts";
import { Link } from "react-router-dom";
import CakeCustomize from "./CakeCustomize";
import WhatsappButton from "./WhatsappButton";

const Homepage = () => {
  return (
    <div className="">
      {/* HERO SECTION */}
      <section className="w-full bg-[#e2bf9d] pt-24 md:pt-32 pb-10 min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Left Section */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#c85a32] leading-tight drop-shadow-lg"
            >
              Bringing You Happiness
              <br className="hidden md:block" />
              Through a Piece of Cake, <br />
              <span className="text-[#b75a90]"> Delivered Daily!</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mt-4 text-base sm:text-lg md:text-xl text-[#4a3f35] max-w-xl mx-auto md:mx-0"
            >
              Explore our delicious cupcakes, pastries, cakes & custom bakery
              treats made fresh with love every single day.
            </motion.p>

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="flex flex-row sm:flex-row items-center gap-3"
              >
                <Link to="/order">
                  <button
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-[#dda56a] to-[#e8b381] 
                                          text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition cursor-pointer"
                  >
                    Order Now
                  </button>
                </Link>
                <Link to="/menu">
                  <button
                    className="px-6 py-2 rounded-full bg-white 
                                           text-[#8b5e3c] font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition cursor-pointer"
                  >
                    Explore Menu
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="flex-1 flex justify-center">
            <motion.img
              src={cake}
              alt="Cake"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg drop-shadow-2xl"
            />
          </div>
        </div>
      </section>
      <WhatsappButton />
      <WhyChooseUs />
      <Category />
      <ChefSection />
      <FeaturedProducts />
      <DeliverySection />
      <Testimonial />
      <CakeCustomize />
    </div>
  );
};

export default Homepage;
