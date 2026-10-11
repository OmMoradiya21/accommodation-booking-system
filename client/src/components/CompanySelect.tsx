import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useGlobalContext } from "../hooks/useGlobalContext";
import type { Company } from "../types.model";
import { api } from "../lib/axios";

export const CompanySelect = () => {
  const {
    user,
    selectedCompany,
    selectCompany,
    logout,
    isAuthenticated,
    isLoading,
  } = useGlobalContext();

  const [companies, setCompanies] = useState<Company[]>(() =>
    user?.companies ? [...user.companies] : [],
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
      return;
    }
    if (!user?.id) return;

    let isMounted = true;
    api
      .get(`users/${user.id}`)
      .then((res) => {
        if (isMounted && res.data?.companies) {
          setCompanies(res.data.companies);
        }
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isLoading, navigate, user?.id]);

  const handleSelect = (company: Company) => {
    selectCompany(company);
    navigate("/user");
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-500 text-sm">
        <i className="pi pi-spin pi-spinner text-2xl mb-2 block text-primary" />
        <span>Loading account...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen surface-ground flex flex-column">
      <header className="navbar flex align-items-center justify-content-between px-4 py-3 surface-card border-bottom-1 surface-border shadow-1">
        <div className="font-semibold text-sm text-900 flex align-items-center gap-2">
          <i className="pi pi-building text-primary text-base" />
          <span>Accommodation Booking</span>
        </div>
        <div className="flex align-items-center gap-3">
          <span className="text-xs text-600 font-medium">
            {user.email}
          </span>
          <button
            type="button"
            className="btn-outline text-xs flex align-items-center gap-1"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <i className="pi pi-sign-out text-xs" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-30rem mx-auto my-5 px-3 flex flex-column gap-3">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-900 m-0 mb-1">
            Select Company
          </h1>
          <p className="text-sm text-500 m-0">
            Choose a workspace to continue
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="surface-card p-5 border-round border-1 surface-border shadow-1 text-center text-500">
            <i className="pi pi-inbox text-3xl mb-2 text-400 block" />
            <p className="font-medium text-900 m-0">No companies assigned</p>
            <p className="text-xs text-500 mt-1 mb-0">
              No companies are assigned to your account. Contact your administrator for access.
            </p>
          </div>
        ) : (
          <div className="flex flex-column gap-3">
            {companies.map((company) => {
              const isSelected = selectedCompany?.id === company.id;
              return (
                <div
                  key={company.id}
                  id={`company-item-${company.id}`}
                  onClick={() => handleSelect(company)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelect(company);
                    }
                  }}
                  className={`surface-card p-3 border-round border-1 shadow-1 flex align-items-center justify-content-between cursor-pointer transition-colors transition-duration-150 ${
                    isSelected
                      ? "border-primary surface-100"
                      : "surface-border hover:surface-hover"
                  }`}
                >
                  <div className="flex align-items-center gap-3">
                    <div className="w-2.5rem h-2.5rem border-round surface-100 border-1 surface-border flex align-items-center justify-content-center text-primary font-bold">
                      <i className="pi pi-building text-base" />
                    </div>
                    <div>
                      <div className="font-semibold text-900 text-sm mb-1">
                        {company.name}
                      </div>
                      <div className="text-xs text-500 font-mono">
                        {company.id}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-outline text-xs px-3 py-2 flex align-items-center gap-1"
                  >
                    <span>Select</span>
                    <i className="pi pi-arrow-right text-xs" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
