import { useState } from "react";
import { loginUser } from "../service/loginUser";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginBtn = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginUser(email, password);
    // Todo Navigation to company selection page
  };

  return (
    <form onSubmit={handleLoginBtn}>
      <div className="flex align-items-center justify-content-center min-h-screen bg-ground p-3">
        <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
          <div className="text-center mb-5">
            <div className="text-900 text-3xl font-medium mb-3">
              Welcome Back
            </div>
            <span className="text-600 font-medium line-height-3">
              Don't have an account?{" "}
            </span>
            <a className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">
              Create today!
            </a>
          </div>

          <div>
            <label htmlFor="email" className="block text-900 font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              className="w-full mb-3 p-inputtext p-component"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label
              htmlFor="password"
              className="block text-900 font-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full mb-3 p-inputtext p-component"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-content-center">
              <button type="submit">Log In</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
