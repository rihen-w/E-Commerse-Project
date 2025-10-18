import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup({ onSwitch }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data: existing } = await axios.get("http://localhost:3005/users", {
        params: { email: form.email },
      });

      if (existing.length > 0) {
        alert("Email already exists");
        return;
      }

      const newUser = {
        ...form,
        wishlist: [],
        cart: [],
        orders: [],
      };

      await axios.post("http://localhost:3005/users", newUser);
      alert("Signup successful! Please login.");
      onSwitch(); // switch to login form
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-[#2EB4AC] text-center">Sign Up</h2>

      <input
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        className="w-full border p-2 rounded-lg"
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full border p-2 rounded-lg"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="w-full border p-2 rounded-lg"
        required
      />

      <button className="w-full bg-[#2EB4AC] text-white py-2 rounded-lg font-bold">
        Sign Up
      </button>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-[#2EB4AC] font-semibold">
          Login
        </button>
      </p>
    </form>
  );
}
