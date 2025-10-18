import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";

export default function Login({ onSwitch }) {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get("http://localhost:3005/users", {
        params: { email: form.email, password: form.password },
      });

      if (data.length === 0) {
        alert("Invalid email or password");
        return;
      }

      const user = data[0];
      setUser(user);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-[#2EB4AC] text-center">Login</h2>

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
        Login
      </button>

      <p className="text-center text-sm">
        Don't have an account?{" "}
        <button type="button" onClick={onSwitch} className="text-[#2EB4AC] font-semibold">
          Sign up
        </button>
      </p>
    </form>
  );
}
