import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (user?.role === "admin") nav("/admin/dashboard");
    else if (["donor", "ngo"].includes(user?.role)) nav("/dashboard");
    else if (user) nav("/home");
  }, [user, nav]);

  // 🔹 Email/Password login
  const onSubmit = async (values) => {
    try {
      const { data } = await API.post("/auth/login", values);
      if (!data.user?.role) throw new Error("User role missing");

      login({ token: data.token, user: data.user });

      if (data.user.role === "admin") nav("/admin/dashboard");
      else if (["donor", "ngo"].includes(data.user.role)) nav("/dashboard");
      else nav("/home");
    } catch (err) {
      alert(err?.response?.data?.msg || "❌ Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
          Welcome Back
        </h1>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Login */}
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const tokenId = credentialResponse.credential;
              const { data } = await API.post("/auth/google", { tokenId });
              login({ token: data.token, user: data.user });

              if (data.user.role === "admin") nav("/admin/dashboard");
              else if (["donor", "ngo"].includes(data.user.role)) nav("/dashboard");
              else nav("/home");
            } catch (err) {
              alert(err?.response?.data?.msg || err.message || "❌ Google login failed");
            }
          }}
          onError={() => alert("❌ Google login failed")}
        />

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-green-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
