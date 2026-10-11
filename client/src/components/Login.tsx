import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useGlobalContext } from "../hooks/useGlobalContext";
import { api } from "../lib/axios";

export const Login = () => {
  const [email, setEmail] = useState("jane@example.com");
  const [password, setPassword] = useState("user123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, isAuthenticated, user } = useGlobalContext();
  const navigate = useNavigate();

  const loginUser = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

  const handleLoginBtn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await loginUser(email, password);

      if (data?.accessToken && data?.user) {
        login(data.accessToken, data.user);
        navigate("select-company");
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

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/select-company");
    } else {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex align-items-center justify-content-center p-3 surface-ground">
      <div className="surface-card border-round shadow-1 border-1 surface-border p-5 w-full max-w-30rem">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-900 m-0 mb-1">Login</h1>
          <p className="text-sm text-500 m-0">
            Enter your credentials to access your account
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 border-round bg-red-50 border-1 border-red-200 text-red-700 text-sm mb-3">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLoginBtn} className="flex flex-column gap-3">
          <div className="flex flex-column gap-1">
            <label htmlFor="email" className="text-sm font-medium text-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="password" className="text-sm font-medium text-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
};
