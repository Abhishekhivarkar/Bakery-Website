import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    // if (!token) return (window.location.href = "/login");

    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const u = res.data;
        setUser(u);
        setForm({
          name: u?.name || "",
          username: u?.username || "",
          phone: u?.phone || "",
          street: u?.address?.street || "",
          city: u?.address?.city || "",
          state: u?.address?.state || "",
          pincode: u?.address?.pincode || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewImg(URL.createObjectURL(file));
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Loading...
      </div>
    );

  return (
    <div className="profile">
      <div className="pt-30 max-w-4xl mx-auto p-6 py-10">
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            Edit Profile
          </h2>

          {/* Image */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative w-28 h-28">
              <img
                src={
                  previewImg ||
                  user?.profilePicture ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                className="w-full h-full rounded-full object-cover border"
                alt="profile"
              />

              <label className="absolute bottom-0 right-0 bg-yellow-600 text-white px-2 py-1 rounded cursor-pointer text-sm">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {/* Editable Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "Full Name", name: "name" },
              { label: "Username", name: "username" },
              { label: "Phone Number", name: "phone" },
              { label: "Street", name: "street" },
              { label: "City", name: "city" },
              { label: "State", name: "state" },
              { label: "Pincode", name: "pincode" },
            ].map((field, index) => (
              <div key={index}>
                <label className="font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="w-full p-3 mt-1 rounded-lg border focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>
            ))}
          </div>

          <button className="mt-8 w-full bg-yellow-600 text-white py-3 rounded-lg text-lg font-medium">
            Update Profile
          </button>

          {/* Change Password */}
          <h3 className="text-xl font-semibold mt-10 mb-4">Change Password</h3>

          <div className="space-y-4">
            <input
              type="password"
              name="oldPassword"
              placeholder="Old Password"
              onChange={handlePasswordChange}
              className="w-full p-3 rounded-lg border"
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              onChange={handlePasswordChange}
              className="w-full p-3 rounded-lg border"
            />

            <button className="w-full bg-gray-800 text-white py-3 rounded-lg">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
