import React, { useEffect, useState } from "react";
import { api } from "../lib/axios";
import type { Company } from "../types.model";
import { useGlobalContext } from "../hooks/useGlobalContext";

interface ExtendedCompany extends Company {
  address?: string;
  industry?: string;
  createdAt?: string;
}

export const CompaniesManagement = () => {
  const { user } = useGlobalContext();
  const [companies, setCompanies] = useState<ExtendedCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [industry, setIndustry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ExtendedCompany | null>(
    null,
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const hasCreatePermission = Boolean(
    user?.permissions?.includes("company:create"),
  );
  const hasUpdatePermission = Boolean(
    user?.permissions?.includes("company:update"),
  );
  const hasDeletePermission = Boolean(
    user?.permissions?.includes("company:delete"),
  );

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/companies");
      setCompanies(res.data || []);
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Failed to load companies",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api
      .get("/companies")
      .then((res) => {
        if (isMounted) setCompanies(res.data || []);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const errObj = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setFeedback({
          type: "error",
          text:
            errObj?.response?.data?.message ||
            errObj?.message ||
            "Failed to load companies",
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartEdit = (comp: ExtendedCompany) => {
    setEditingCompany(comp);
    setName(comp.name);
    setAddress(comp.address || "");
    setIndustry(comp.industry || "");
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingCompany(null);
    setName("");
    setAddress("");
    setIndustry("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setFeedback(null);
    setIsSubmitting(true);

    try {
      if (editingCompany) {
        await api.patch(`/companies/${editingCompany.id}`, {
          name: name.trim(),
          address: address.trim() || undefined,
          industry: industry.trim() || undefined,
        });
        setFeedback({
          type: "success",
          text: `Company "${name}" updated successfully!`,
        });
        setEditingCompany(null);
      } else {
        await api.post("/companies", {
          name: name.trim(),
          address: address.trim() || undefined,
          industry: industry.trim() || undefined,
        });
        setFeedback({
          type: "success",
          text: `Company "${name}" created successfully!`,
        });
      }

      setName("");
      setAddress("");
      setIndustry("");
      await loadCompanies();
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Operation failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (comp: ExtendedCompany) => {
    if (
      !window.confirm(
        `Delete company "${comp.name}"? This will unlink associated resources.`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/companies/${comp.id}`);
      setFeedback({
        type: "success",
        text: `Company "${comp.name}" deleted successfully.`,
      });
      if (editingCompany?.id === comp.id) {
        handleCancelEdit();
      }
      await loadCompanies();
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Failed to delete company",
      });
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-900 m-0">
            Company Management
          </h1>
          <p className="text-sm text-500 m-0 mt-1">
            Create, update, and manage corporate accounts and workspaces
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 border-round text-sm flex align-items-center justify-content-between ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border-1 border-green-200"
              : "bg-red-50 text-red-700 border-1 border-red-200"
          }`}
        >
          <div className="flex align-items-center gap-2">
            <i
              className={
                feedback.type === "success"
                  ? "pi pi-check-circle text-green-600"
                  : "pi pi-exclamation-circle text-red-600"
              }
            />
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-link text-600 hover:text-900 cursor-pointer border-none bg-transparent"
            title="Dismiss message"
          >
            <i className="pi pi-times" />
          </button>
        </div>
      )}

      {(hasCreatePermission || (hasUpdatePermission && editingCompany)) && (
        <div className="surface-card p-4 border-round shadow-1 border-1 surface-border mb-3">
          <div className="flex align-items-center justify-content-between mb-3">
            <div className="text-xl font-semibold text-900 flex align-items-center gap-2">
              <i
                className={
                  editingCompany
                    ? "pi pi-pencil text-primary"
                    : "pi pi-building text-primary"
                }
              />
              <span>
                {editingCompany ? "Edit Company" : "Create New Company"}
              </span>
            </div>
            {editingCompany && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-outline text-xs"
                title="Cancel editing"
                disabled={isSubmitting}
              >
                <i className="pi pi-times" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-column gap-3">
            <div className="grid">
              <div className="col-12 md:col-4 flex flex-column gap-1">
                <label
                  htmlFor="companyName"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  className="input"
                  placeholder="e.g. Acme Resorts Ltd"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="col-12 md:col-4 flex flex-column gap-1">
                <label
                  htmlFor="companyAddress"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="companyAddress"
                  className="input"
                  placeholder="e.g. 100 Waterfront Blvd"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="col-12 md:col-4 flex flex-column gap-1">
                <label
                  htmlFor="companyIndustry"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Industry
                </label>
                <input
                  type="text"
                  id="companyIndustry"
                  className="input"
                  placeholder="e.g. Hospitality / Travel"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-content-end mt-2">
              {editingCompany && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  <i className="pi pi-times mr-1" />
                  <span>Cancel</span>
                </button>
              )}

              <button
                type="submit"
                className="btn-primary w-auto px-4"
                disabled={isSubmitting}
              >
                <i
                  className={
                    isSubmitting
                      ? "pi pi-spin pi-spinner mr-2"
                      : editingCompany
                        ? "pi pi-check mr-2"
                        : "pi pi-plus mr-2"
                  }
                />
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : editingCompany
                      ? "Update Company"
                      : "Create Company"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="surface-card border-round shadow-1 border-1 surface-border overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="flex align-items-center gap-2">
            <h2 className="text-base font-semibold text-900 m-0">
              Company Workspaces
            </h2>
            <span className="badge">
              {companies.length}{" "}
              {companies.length === 1 ? "company" : "companies"}
            </span>
          </div>

          <button
            type="button"
            onClick={loadCompanies}
            className="btn-outline text-xs"
            title="Refresh list"
            disabled={isLoading}
          >
            <i
              className={isLoading ? "pi pi-spin pi-spinner" : "pi pi-refresh"}
            />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading && companies.length === 0 ? (
          <div className="p-5 text-center text-500">
            <i className="pi pi-spin pi-spinner text-2xl mb-2 block" />
            <span>Loading companies...</span>
          </div>
        ) : companies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-5rem">Sr. No.</th>
                  <th className="min-w-10rem">Company Name</th>
                  <th>Address</th>
                  <th>Industry</th>
                  {hasUpdatePermission && (
                    <th className="text-center w-6rem">
                      Update
                    </th>
                  )}
                  {hasDeletePermission && (
                    <th className="text-center w-6rem">
                      Delete
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {companies.map((comp, index) => {
                  const isCurrentRowEditing = editingCompany?.id === comp.id;
                  return (
                    <tr
                      key={comp.id}
                      className={isCurrentRowEditing ? "surface-100" : ""}
                    >
                      <td>
                        <span className="text-600 font-medium">
                          {index + 1}
                        </span>
                      </td>
                      <td>
                        <div className="flex align-items-center gap-2">
                          <span className="font-semibold text-900">
                            {comp.name}
                          </span>
                          {isCurrentRowEditing && (
                            <span className="text-xs text-primary font-medium">
                              (editing)
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-600">
                          {comp.address || (
                            <span className="text-400 italic">None</span>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-600">
                          {comp.industry ? (
                            <span className="badge">{comp.industry}</span>
                          ) : (
                            <span className="text-400 italic">None</span>
                          )}
                        </span>
                      </td>

                      {hasUpdatePermission && (
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(comp)}
                            className="btn-outline text-xs"
                            title="Edit company"
                          >
                            <i className="pi pi-pencil text-primary" />
                            <span>Update</span>
                          </button>
                        </td>
                      )}

                      {hasDeletePermission && (
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteCompany(comp)}
                            className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50"
                            title="Delete company"
                          >
                            <i className="pi pi-trash" />
                            <span>Delete</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5 text-center text-500">
            <i className="pi pi-building text-3xl mb-2 text-400 block" />
            <p className="m-0 font-medium text-900">No companies found</p>
            <p className="text-xs text-500 mt-1">
              Add your first company using the form above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
