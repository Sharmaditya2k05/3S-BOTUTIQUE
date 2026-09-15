import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useSettings } from "../context/SettingsContext";

export default function Login() {
  const { login } = useCustomerAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/profile");
    } catch (err: any) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          {settings.logo && (
            <img src={settings.logo} alt={`${settings.businessName} logo`} className="mx-auto mb-4 h-16 w-16 object-contain" />
          )}
          <h1 className="font-serif-display text-3xl text-charcoal">Welcome Back</h1>
          <p className="mt-2 text-sm text-warmgray">Sign in to your {settings.businessName} account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-charcoal">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-warmgray/50"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-charcoal">Password</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-3 pr-11 text-sm text-charcoal placeholder:text-warmgray/50"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-wine py-3 text-sm font-semibold text-ivory transition hover:bg-wine-dark disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-warmgray">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-wine hover:text-wine-dark">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
