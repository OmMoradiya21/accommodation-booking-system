import { useState } from "react";
import { useNavigate } from "react-router";
import { loginUser } from "../service/loginUser";
import { useGlobalContext } from "../hooks/useGlobalContext";

export const Login = () => {
  const [email, setEmail] = useState("jane@example.com");
  const [password, setPassword] = useState("user123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, isAuthenticated, user, selectedCompany } = useGlobalContext();
  const navigate = useNavigate();

  const handleLoginBtn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await loginUser(email, password);

      if (data?.accessToken && data?.user) {
        // Store only accessToken in localStorage, user in React state
        login(data.accessToken, data.user);
        navigate("/company");
      } else {
        setErrorMessage("Invalid credentials response.");
      }
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setErrorMessage(
        errObj?.response?.data?.message ||
          errObj?.message ||
          "Invalid email or password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.25rem" }}>
            Sign in
          </h1>
          <p style={{ color: "#71717a", fontSize: "0.85rem" }}>
            Enter your credentials to access your account
          </p>
        </div>

        {isAuthenticated && user && (
          <div
            style={{
              padding: "0.6rem 0.75rem",
              borderRadius: "6px",
              backgroundColor: "#f4f4f5",
              fontSize: "0.8rem",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Signed in as <strong>{user.email}</strong></span>
            <button
              type="button"
              className="btn-outline"
              style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
              onClick={() => navigate(selectedCompany ? "/dashboard" : "/company")}
            >
              Continue &rarr;
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: "0.6rem 0.75rem",
              borderRadius: "6px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#991b1b",
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLoginBtn}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "500",
                marginBottom: "0.35rem",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="minimal-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "500",
                marginBottom: "0.35rem",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="minimal-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn-minimal"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid #e4e4e7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#71717a" }}>Quick fill:</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              onClick={() => {
                setEmail("jane@example.com");
                setPassword("user123");
                setErrorMessage(null);
              }}
            >
              Staff
            </button>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("admin123");
                setErrorMessage(null);
              }}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
