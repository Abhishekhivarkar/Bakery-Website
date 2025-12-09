import React from "react";
import { Link } from "react-router-dom";
import {
    FaEnvelope,
    FaLinkedin,
    FaInstagram,  
    FaFacebook,
    FaMapMarkerAlt,
    FaArrowRight,
    FaPaperPlane,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import logo from "../assets/homePage/logo White.png";

const Footer = () => {
  // Inline SVG pattern encoded as data URI
  const svgPattern = `
    data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E
    %3Ccircle cx='40' cy='40' r='2' fill='%23a36d3c'/%3E
    %3Ccircle cx='20' cy='20' r='1.5' fill='%23a36d3c'/%3E
    %3Ccircle cx='60' cy='20' r='1.5' fill='%23a36d3c'/%3E
    %3Ccircle cx='20' cy='60' r='1.5' fill='%23a36d3c'/%3E
    %3Ccircle cx='60' cy='60' r='1.5' fill='%23a36d3c'/%3E
    %3C/svg%3E`;

  return (
    <footer
      className="pt-16 pb-10 shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative overflow-hidden"
      style={{
        backgroundColor: "#6f482a", // maintain original brown
        backgroundImage: `url(${svgPattern})`,
        backgroundRepeat: "repeat",
        backgroundSize: "80px 80px", // subtle carving effect
      }}
    >
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo + About */}
        <div>
          <img
            src={logo}
            alt="Bakery Logo"
            className="h-14 mb-4 drop-shadow-md"
          />

          <p className="text-sm text-[#F9FBFB] leading-relaxed mb-6">
            Freshly baked happiness every day — Cakes, pastries, cookies & more.
            Made with love for every celebration!
          </p>

          {/* Email */}
          <div className="flex items-center gap-3 mt-4">
            <div className="bg-[#d78f52] p-3 rounded-full shadow-lg">
              <FaEnvelope className="text-white" />
            </div>
            <p className="text-sm text-[#F9FBFB]">
              Email us: <br />
              <span className="font-semibold text-[#F9FBFB]">
                Official@graphura.in
              </span>
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3
            className="text-xl font-semibold text-[#F9FBFB] mb-4 relative 
                    after:block after:w-14 after:h-[3px] after:bg-[#d78f52] after:mt-1"
          >
            Quick Links
          </h3>

          <ul className="space-y-3 text-[#F9FBFB]">
            {[ 
              { path: "/home", label: "Home" },
              { path: "/about", label: "About Us" },
              { path: "/cakes", label: "Our Cakes" },
              { path: "/gallery", label: "Gallery" },
              { path: "/contact", label: "Contact" },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center gap-2 hover:text-[#d78f52] transition"
                >
                  <FaArrowRight size={12} /> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bakery Services */}
        <div>
          <h3
            className="text-xl font-semibold text-[#F9FBFB] mb-4 relative 
                    after:block after:w-14 after:h-[3px] after:bg-[#d78f52] after:mt-1"
          >
            Services
          </h3>

          <ul className="space-y-3 text-[#F9FBFB]">
            {[
              { path: "/birthdaycake", label: "Birthday Cakes" },
              { path: "/weddingcake", label: "Wedding Cakes" },
              { path: "/customcake", label: "Custom Cakes" },
              { path: "/partycake", label: "Party Catering" },
              { path: "/customizecake", label: "Customize Cake" },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center gap-2 hover:text-[#d78f52] transition"
                >
                  <FaArrowRight size={12} /> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3
            className="text-xl font-semibold text-[#F9FBFB] mb-4 relative 
                    after:block after:w-14 after:h-[3px] after:bg-[#d78f52] after:mt-1"
          >
            Newsletter
          </h3>

          <p className="text-sm text-[#F9FBFB] mb-4">
            Get offers, bakery updates, and festive cake combos!
          </p>

          <div className="bg-white shadow-md rounded-full flex overflow-hidden">
            <input
              type="email"
              className="flex-grow px-4 py-2 text-sm focus:outline-none"
              placeholder="Enter your email"
            />
            <button className="bg-[#d78f52] px-4 py-2 text-white flex items-center justify-center hover:bg-[#d78f52] transition">
              <FaPaperPlane size={16} />
            </button>
          </div>

          {/* Subscribe Button */}
          <Link to="/subscribe">
            <button className="mt-4 bg-[#dfa26d] text-white hover:bg-[#e6b07c] px-6 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition cursor-pointer">
              Subscribe
            </button>
          </Link>

          {/* Social */}
          <div className="flex gap-5 mt-6 text-xl text-[#F9FBFB]">
            {[
              { icon: FaLinkedin, path: "https://www.linkedin.com/company/graphura-india-private-limited/posts/?feedView=all" },
              { icon: FaInstagram, path: "https://www.instagram.com/graphura.in?igsh=MXh0Zmt6eXB4NnpjNQ==" },
              { icon: FaFacebook, path: "https://www.facebook.com/Graphura.in" },
              { icon: FaXTwitter, path: "https://x.com/Graphura" },
              { icon: FaMapMarkerAlt, path: "https://maps.app.goo.gl/DoXYDapgZWJix4uE7" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  to={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#e6b07c] transition cursor-pointer"
                >
                  <Icon />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 py-4 bg-[#fff9f4] backdrop-blur-md">
        <p className="text-center text-sm text-[#4a3f35] font-semibold">
          © 2025{" "}
          <span className="font-semibold text-[#6f482a]">
            Graphura India Private Limited
          </span>{" "}
          — All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
