import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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

  // -----------------------------
  // SAVE PROFILE FUNCTION
  // -----------------------------
  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("userToken");

    try {
      // Update basic profile info
      await axios.put(
         `http://localhost:5000/api/user/update-profile/${user._id}`,
        {
          name: form.name,
          username: form.username,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update/Add phone
      if (form.phone && form.phone !== user.phone) {
        await axios.patch(
          "http://localhost:5000/api/user/add-phone",
          { phone: form.phone },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const addressPayload = {
        street: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      };

      // Add or update address
      if (!user.address) {
        await axios.post(
          "http://localhost:5000/api/user/add-address",
          addressPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.put(
          "http://localhost:5000/api/user/update-address",
          addressPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Profile Updated Successfully!");
      navigate("/profile");

    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Loading...
      </div>
    );

  return (
    <div className="bg-[#f8f7f6]">
      <div className="max-w-4xl mx-auto p-6 py-10">
        <div className="bg-white shadow-lg rounded-2xl p-8">

          <h2 className="text-3xl font-bold mb-6 text-gray-900">Edit Profile</h2>

          {/* Profile Image */}
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

              <label className="absolute bottom-0 right-0 bg-[#DFA26D] text-white px-2 py-1 rounded cursor-pointer text-sm">
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
                <label className="font-medium text-gray-700">{field.label}</label>
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="w-full p-3 mt-1 rounded-lg border focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleUpdateProfile}
            className="mt-8 w-full bg-[#DFA26D] text-white py-3 rounded-lg text-lg font-medium"
          >
            Update Profile
          </button>

        </div>
      </div>
    </div>
  );
}