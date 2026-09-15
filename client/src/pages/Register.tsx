import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useSettings } from "../context/SettingsContext";

export default function Register() {
  const { register } = useCustomerAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        password: form.password,
      });
      navigate("/profile");
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
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
          <h1 className="font-serif-display text-3xl text-charcoal">Create Account</h1>
          <p className="mt-2 text-sm text-warmgray">Join {settings.businessName} for a personalized shopping experience</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-charcoal">Full Name *</label>
            <input
              id="reg-name"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Priya Sharma"
              required
              minLength={2}
              className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-warmgray/50"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-charcoal">Email *</label>
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@email.com"
              required
              className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-warmgray/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-medium text-charcoal">Phone</label>
              <input
                id="reg-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-warmgray/50"
              />
            </div>
            <div>
              <label htmlFor="reg-city" className="mb-1.5 block text-sm font-medium text-charcoal">City</label>
              <input
                id="reg-city"
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="e.g. Mumbai"
                className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-warmgray/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-charcoal">Password *</label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
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

          <div>
            <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-charcoal">Confirm Password *</label>
            <input
              id="reg-confirm"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={6}
              className="focus-ring w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-warmgray/50"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-wine py-3 text-sm font-semibold text-ivory transition hover:bg-wine-dark disabled:opacity-50"
          >
            <UserPlus size={18} />
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-warmgray">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-wine hover:text-wine-dark">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
