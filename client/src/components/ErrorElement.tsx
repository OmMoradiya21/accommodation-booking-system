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
    <div className="min-h-screen flex align-items-center justify-content-center p-4 surface-ground">
      <div className="surface-card p-5 border-round shadow-1 border-1 surface-border text-center max-w-30rem w-full">
        <i className="pi pi-exclamation-triangle text-5xl text-red-500 mb-3 block" />
        <h1 className="text-2xl font-bold text-900 m-0 mb-2">
          Oops! Something went wrong.
        </h1>
        {status && (
          <h2 className="text-base font-semibold text-500 m-0 mb-3">
            Error Status: {status}
          </h2>
        )}
        <p className="text-base text-700 line-height-3 m-0 mb-4">
          {errorMessage}
        </p>
        <Link
          to="/"
          className="btn-primary no-underline inline-flex align-items-center justify-content-center gap-2"
        >
          <i className="pi pi-arrow-left" />
          <span>Go Back to Login</span>
        </Link>
      </div>
    </div>
  );
};
