import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PrimaryButton from "../components/ui/PrimaryButton";
import { useAuth } from "../context/AuthContext";

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegisterFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginFormValues>();
  const registerForm = useForm<RegisterFormValues>();

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    const result = await login(values.email, values.password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Welcome back!");
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";
      navigate(from);
      return;
    }

    toast.error(result.message ?? "Invalid credentials.");
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    const result = await register(values.name, values.email, values.phone, values.password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Account created! Please sign in.");
      setMode("login");
      loginForm.setValue("email", values.email);
      return;
    }

    toast.error(result.message ?? "Could not create your account.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(180,105,34,0.12),_transparent_32%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-mithai-200 bg-white shadow-[0_25px_80px_rgba(120,66,31,0.14)] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-gradient-to-br from-maroon-800 via-maroon-700 to-mithai-700 p-8 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-mithai-200">Mithai Junction account</p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Freshly made sweets start with a warm welcome.</h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-mithai-100">
            Track orders, save addresses, and reorder your favorites with a single sign-in.
          </p>
          <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm backdrop-blur">
            <p className="font-semibold">New here?</p>
            <p className="mt-2 text-mithai-100">Create an account to save addresses and track your orders.</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex rounded-full border border-mithai-200 bg-cream-50 p-1">
            <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-maroon-700 text-white shadow-sm" : "text-stone-600"}`}>
              Sign in
            </button>
            <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-maroon-700 text-white shadow-sm" : "text-stone-600"}`}>
              Create account
            </button>
          </div>

          {mode === "login" ? (
            <form className="mt-8 space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="email">Email</label>
                <input id="email" type="email" className="w-full rounded-2xl border border-mithai-200 px-4 py-3 outline-none transition focus:border-maroon-400 focus:ring-2 focus:ring-mithai-100" placeholder="you@example.com" {...loginForm.register("email", { required: "Email is required", pattern: { value: /.+@.+\..+/, message: "Enter a valid email" } })} />
                {loginForm.formState.errors.email ? <p className="mt-2 text-sm text-red-500">{loginForm.formState.errors.email.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="password">Password</label>
                <input id="password" type="password" className="w-full rounded-2xl border border-mithai-200 px-4 py-3 outline-none transition focus:border-maroon-400 focus:ring-2 focus:ring-mithai-100" placeholder="Enter password" {...loginForm.register("password", { required: "Password is required" })} />
                {loginForm.formState.errors.password ? <p className="mt-2 text-sm text-red-500">{loginForm.formState.errors.password.message}</p> : null}
              </div>

              <PrimaryButton fullWidth type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </PrimaryButton>
            </form>
          ) : (
            <form className="mt-8 space-y-4" onSubmit={registerForm.handleSubmit(handleRegister)}>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="name">Full name</label>
                <input id="name" className="w-full rounded-2xl border border-mithai-200 px-4 py-3 outline-none transition focus:border-maroon-400 focus:ring-2 focus:ring-mithai-100" placeholder="Aarav Sharma" {...registerForm.register("name", { required: "Name is required", pattern: { value: /^[A-Za-z]+(\s[A-Za-z]+)*$/, message: "Use letters and single spaces only" } })} />
                {registerForm.formState.errors.name ? <p className="mt-2 text-sm text-red-500">{registerForm.formState.errors.name.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="registerEmail">Email</label>
                <input id="registerEmail" type="email" className="w-full rounded-2xl border border-mithai-200 px-4 py-3 outline-none transition focus:border-maroon-400 focus:ring-2 focus:ring-mithai-100" placeholder="you@example.com" {...registerForm.register("email", { required: "Email is required", pattern: { value: /.+@.+\..+/, message: "Enter a valid email" } })} />
                {registerForm.formState.errors.email ? <p className="mt-2 text-sm text-red-500">{registerForm.formState.errors.email.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="phone">Phone (10 digits)</label>
                <input id="phone" className="w-full rounded-2xl border border-mithai-200 px-4 py-3 outline-none transition focus:border-maroon-400 focus:ring-2 focus:ring-mithai-100" placeholder="9876543210" {...registerForm.register("phone", { required: "Phone is required", pattern: { value: /^[0-9]{10}$/, message: "Enter a 10-digit phone number" } })} />
                {registerForm.formState.errors.phone ? <p className="mt-2 text-sm text-red-500">{registerForm.formState.errors.phone.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="registerPassword">Password</label>
                <input
                  id="registerPassword"
                  type="password"
                  className="w-full rounded-2xl border border-mithai-200 px-4 py-3 outline-none transition focus:border-maroon-400 focus:ring-2 focus:ring-mithai-100"
                  placeholder="Create a password"
                  {...registerForm.register("password", {
                    required: "Password is required",
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
                      message: "Must include upper, lower, number, and special character",
                    },
                  })}
                />
                <p className="mt-1 text-xs text-stone-500">At least one uppercase, one lowercase, one number, and one special character.</p>
                {registerForm.formState.errors.password ? <p className="mt-2 text-sm text-red-500">{registerForm.formState.errors.password.message}</p> : null}
              </div>

              <PrimaryButton fullWidth type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </PrimaryButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
