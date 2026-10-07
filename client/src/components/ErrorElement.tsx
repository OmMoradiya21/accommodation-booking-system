import { useRouteError, isRouteErrorResponse, Link } from "react-router";

export const ErrorElement = () => {
  const error = useRouteError();

  let errorMessage = "An unexpected error occurred.";
  let status: number | string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    errorMessage =
      error.statusText ||
      (typeof error.data === "string" ? error.data : error.data?.message) ||
      "Page Not Found";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <div
      style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <h1 style={{ color: "#e53e3e" }}>Oops! Something went wrong.</h1>
      {status && <h2 style={{ color: "#718096" }}>Error Status: {status}</h2>}
      <p style={{ fontSize: "1.1rem", margin: "1.5rem 0", color: "#2d3748" }}>
        {errorMessage}
      </p>
      <Link
        to="/"
        style={{
          display: "inline-block",
          padding: "0.5rem 1rem",
          backgroundColor: "#3182ce",
          color: "#ffffff",
          borderRadius: "4px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Go Back to Login
      </Link>
    </div>
  );
};
