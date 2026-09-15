import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import Logo from "../../components/Logo";

export default function AdminLogin() {
  const { admin, login, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && admin) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Incorrect email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-dark px-5">
      <div className="hairline w-full max-w-sm bg-ivory p-8">
        <div className="mb-8 flex justify-center">
          <Logo tagline size="md" />
        </div>
        <h1 className="mb-1 text-center font-serif-display text-2xl text-charcoal">
          Admin Login
        </h1>
        <p className="mb-6 text-center text-sm text-warmgray">
          Sign in to manage your boutique
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-charcoal">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              placeholder="admin@3ssaree.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-charcoal">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring w-full bg-wine py-3 text-sm font-semibold text-ivory transition hover:bg-wine-dark disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-warmgray">
          Demo credentials: admin@3ssaree.com / Boutique@123
        </p>
      </div>
    </div>
  );
}
