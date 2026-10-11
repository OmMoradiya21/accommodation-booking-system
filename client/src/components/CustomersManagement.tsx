import React, { useEffect, useMemo, useState } from "react";
import type { Company, CustomerList } from "../types.model";
import { api } from "../lib/axios";
import { DataTable } from "primereact/datatable";
import { useGlobalContext } from "../hooks/useGlobalContext";

export const CustomersManagement = () => {
  const { user, selectedCompany, refreshCurrentUser } = useGlobalContext();

  const isAdmin = Boolean(user?.role?.toLowerCase() === "admin");

  const hasReadPermission =
    isAdmin || Boolean(user?.permissions?.includes("customer:read"));
  const hasCreatePermission =
    isAdmin || Boolean(user?.permissions?.includes("customer:create"));
  const hasUpdatePermission =
    isAdmin || Boolean(user?.permissions?.includes("customer:update"));
  const hasDeletePermission =
    isAdmin || Boolean(user?.permissions?.includes("customer:delete"));

  const userCompanies = useMemo(() => {
    if (user?.companies && user.companies.length > 0) return user.companies;
    if (selectedCompany) return [selectedCompany];
    return [];
  }, [user?.companies, selectedCompany]);

  const [adminCompanies, setAdminCompanies] = useState<Company[]>([]);
  const companies =
    isAdmin && adminCompanies.length > 0 ? adminCompanies : userCompanies;

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    () => selectedCompany?.id || "0",
  );
  const [customers, setCustomers] = useState<CustomerList[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isOpenUpdatingCustomerModel, setIsOpenUpdatingCustomerModel] =
    useState(false);
  const [isOpenCreatingCustomerModel, setIsOpenCreatingCustomerModel] =
    useState(false);
  const [updatingCustomerId, setUpdatingCustomerId] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isModelOpen =
    isOpenCreatingCustomerModel || isOpenUpdatingCustomerModel;

  useEffect(() => {
    refreshCurrentUser?.();

    if (!isAdmin) return;
    let isMounted = true;
    api
      .get("companies")
      .then((res) => {
        if (isMounted) setAdminCompanies(res.data || []);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin, refreshCurrentUser]);

  const activeCompanyId =
    selectedCompanyId !== "0"
      ? selectedCompanyId
      : selectedCompany?.id || (companies[0]?.id ?? "0");

  useEffect(() => {
    if (!activeCompanyId || activeCompanyId === "0") {
      return;
    }

    let isMounted = true;
    api
      .get(`/customers?companyId=${activeCompanyId}`)
      .then((res) => {
        if (isMounted) setCustomers(res.data || []);
      })
      .catch(() => {
        api
          .get(`/companies/${activeCompanyId}`)
          .then((fallbackRes) => {
            if (isMounted) setCustomers(fallbackRes.data?.customers || []);
          })
          .catch(() => {
            if (isMounted) setCustomers([]);
          });
      })
      .finally(() => {
        if (isMounted) setIsLoadingCustomers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCompanyId]);

  const reloadCustomers = async (companyId: string) => {
    if (!companyId || companyId === "0") return;
    try {
      const res = await api.get(`/customers?companyId=${companyId}`);
      setCustomers(res.data || []);
    } catch {
      try {
        const fallbackRes = await api.get(`/companies/${companyId}`);
        setCustomers(fallbackRes.data?.customers || []);
      } catch {
        setCustomers([]);
      }
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!hasCreatePermission) {
      setFeedback({
        type: "error",
        text: "You do not have permission to create customers.",
      });
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      setFeedback({
        type: "error",
        text: "Please fill in all required fields (Name and Email).",
      });
      return;
    }

    const targetCompId =
      activeCompanyId !== "0" ? activeCompanyId : selectedCompanyId;
    if (!targetCompId || targetCompId === "0") {
      setFeedback({
        type: "error",
        text: "Please select a valid company.",
      });
      return;
    }

    const newCustomer = {
      company_id: targetCompId,
      name: customerName.trim(),
      email: customerEmail.trim(),
      phone: customerPhone.trim() || undefined,
    };

    try {
      await api.post("/customers", newCustomer);
      setFeedback({
        type: "success",
        text: `Customer "${customerName}" created successfully!`,
      });
      closeModel();
      await reloadCustomers(targetCompId);
    } catch (error: unknown) {
      console.error("Error creating customer:", error);
      const errObj = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Failed to create customer",
      });
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!hasUpdatePermission) {
      setFeedback({
        type: "error",
        text: "You do not have permission to update customers.",
      });
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      setFeedback({
        type: "error",
        text: "Please fill in all required fields (Name and Email).",
      });
      return;
    }

    const updatedCustomerData = {
      name: customerName.trim(),
      email: customerEmail.trim(),
      phone: customerPhone.trim() || undefined,
    };

    try {
      await api.patch(`/customers/${updatingCustomerId}`, updatedCustomerData);
      setFeedback({
        type: "success",
        text: `Customer "${customerName}" updated successfully!`,
      });
      closeModel();
      await reloadCustomers(activeCompanyId);
    } catch (error: unknown) {
      console.error("Error updating customer:", error);
      const errObj = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Failed to update customer",
      });
    }
  };

  const handleDeleteCustomer = async (id: string, name?: string) => {
    setFeedback(null);

    if (!hasDeletePermission) {
      setFeedback({
        type: "error",
        text: "You do not have permission to delete customers.",
      });
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete customer ${name ? `"${name}"` : ""}?`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/customers/${id}`);
      setFeedback({
        type: "success",
        text: `Customer ${name ? `"${name}"` : ""} deleted successfully.`,
      });
      if (updatingCustomerId === id) {
        closeModel();
      }
      await reloadCustomers(activeCompanyId);
    } catch (error: unknown) {
      console.error("Error deleting customer:", error);
      const errObj = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFeedback({
        type: "error",
        text:
          errObj?.response?.data?.message ||
          errObj?.message ||
          "Failed to delete customer",
      });
    }
  };

  const OpenCustomerUpdateModel = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;
    setIsOpenUpdatingCustomerModel(true);
    setIsOpenCreatingCustomerModel(false);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setCustomerPhone(customer.phone || "");
    setUpdatingCustomerId(customer.id);
  };

  const closeModel = () => {
    setIsOpenCreatingCustomerModel(false);
    setIsOpenUpdatingCustomerModel(false);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setUpdatingCustomerId("");
  };

  if (!hasReadPermission) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="surface-card p-5 border-round shadow-1 border-1 surface-border text-center text-500">
          <i className="pi pi-lock text-3xl mb-2 text-red-500 block" />
          <h2 className="text-xl font-bold text-900 m-0 mb-1">Access Denied</h2>
          <p className="text-sm text-500 m-0">
            You do not have permission to view or manage customers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto flex flex-column gap-3">
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

      <div className="surface-card p-4 border-round shadow-1 border-1 surface-border">
        <div className="flex flex-column md:flex-row align-items-start md:align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom-1 surface-border">
          <div>
            <h1 className="text-xl font-bold text-900 m-0 mb-1">
              Customer Management
            </h1>
            <p className="text-sm text-500 m-0">
              Manage and assign customers to company workspaces.
            </p>
          </div>

          <div className="flex align-items-center gap-2">
            <label
              htmlFor="companySelection"
              className="font-medium text-sm text-700 whitespace-nowrap"
            >
              Select Company:
            </label>
            <select
              name="company-selection"
              id="companySelection"
              className="input w-auto min-w-12rem"
              value={activeCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              {companies.length === 0 && (
                <option value="0">No companies available</option>
              )}
              {companies.map(({ id, name }) => (
                <option value={id} key={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasCreatePermission && activeCompanyId !== "0" && !isModelOpen && (
          <div className="flex justify-content-end mb-3">
            <button
              type="button"
              className="btn-primary w-auto text-sm px-3"
              onClick={() => {
                setUpdatingCustomerId("");
                setCustomerName("");
                setCustomerEmail("");
                setCustomerPhone("");
                setIsOpenCreatingCustomerModel(true);
                setIsOpenUpdatingCustomerModel(false);
              }}
            >
              <i className="pi pi-plus mr-2" />
              <span>Create Customer</span>
            </button>
          </div>
        )}

        <div className="grid">
          {isModelOpen && (
            <div className="col-12 lg:col-4">
              <div className="border-1 surface-border border-round p-4 surface-50">
                <div className="flex align-items-center justify-content-between mb-3">
                  <h2 className="text-base font-semibold text-900 m-0 flex align-items-center gap-2">
                    <i
                      className={
                        isOpenCreatingCustomerModel
                          ? "pi pi-user-plus text-primary"
                          : "pi pi-pencil text-primary"
                      }
                    />
                    <span>
                      {isOpenCreatingCustomerModel
                        ? "Create Customer"
                        : "Update Customer"}
                    </span>
                  </h2>
                  <button
                    type="button"
                    onClick={closeModel}
                    className="btn-outline text-xs"
                    title="Close form"
                  >
                    <i className="pi pi-times" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    if (isOpenCreatingCustomerModel) {
                      handleCreateCustomer(e);
                    } else {
                      handleUpdateCustomer(e);
                    }
                  }}
                  className="flex flex-column gap-3"
                >
                  <div className="flex flex-column gap-1">
                    <label
                      htmlFor="customerName"
                      className="text-xs font-semibold text-700 uppercase"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="add-customer"
                      id="customerName"
                      className="input"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-column gap-1">
                    <label
                      htmlFor="email"
                      className="text-xs font-semibold text-700 uppercase"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="input"
                      required
                      placeholder="e.g. alex@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-column gap-1">
                    <label
                      htmlFor="phone"
                      className="text-xs font-semibold text-700 uppercase"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input"
                      placeholder="e.g. 1234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="btn-primary w-full">
                      <i
                        className={
                          isOpenCreatingCustomerModel
                            ? "pi pi-plus mr-1"
                            : "pi pi-check mr-1"
                        }
                      />
                      <span>
                        {isOpenCreatingCustomerModel
                          ? "Create Customer"
                          : "Update Customer"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={closeModel}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className={isModelOpen ? "col-12 lg:col-8" : "col-12"}>
            <div className="flex align-items-center justify-content-between mb-3">
              <h2 className="text-base font-semibold text-900 m-0">
                Customers
              </h2>
              <span className="badge">
                {customers.length}{" "}
                {customers.length === 1 ? "record" : "records"} found
              </span>
            </div>

            {activeCompanyId === "0" ? (
              <div className="border-1 surface-border border-round p-5 text-center text-500 surface-50">
                <i className="pi pi-building text-3xl mb-2 text-400 block" />
                <p className="m-0 font-medium">
                  Please select a company to view customers
                </p>
              </div>
            ) : isLoadingCustomers ? (
              <div className="border-1 surface-border border-round p-5 text-center text-500 surface-50">
                <i className="pi pi-spin pi-spinner text-2xl mb-2 text-primary block" />
                <p className="m-0 text-sm">Loading customers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="border-1 surface-border border-round p-5 text-center text-500 surface-50">
                <i className="pi pi-users text-3xl mb-2 text-400 block" />
                <p className="m-0 font-medium text-900">
                  No customers found for this company
                </p>
                <p className="text-xs text-500 mt-1">
                  {hasCreatePermission
                    ? "Use the Create Customer button to add one."
                    : "No records available."}
                </p>
              </div>
            ) : (
              <div className="w-full border-1 surface-border border-round overflow-hidden">
                <DataTable.Root data={customers} stripedRows>
                  <DataTable.TableContainer>
                    <DataTable.Table className="w-full">
                      <DataTable.THead>
                        <DataTable.THeadRow>
                          <DataTable.THeadCell>
                            <DataTable.THeadTitle>Name</DataTable.THeadTitle>
                          </DataTable.THeadCell>
                          <DataTable.THeadCell>
                            <DataTable.THeadTitle>Email</DataTable.THeadTitle>
                          </DataTable.THeadCell>
                          <DataTable.THeadCell>
                            <DataTable.THeadTitle>Phone</DataTable.THeadTitle>
                          </DataTable.THeadCell>
                          <DataTable.THeadCell>
                            <DataTable.THeadTitle>
                              Created At
                            </DataTable.THeadTitle>
                          </DataTable.THeadCell>

                          {hasUpdatePermission ? (
                            <DataTable.THeadCell className="text-center w-6rem">
                              <DataTable.THeadTitle>
                                Update
                              </DataTable.THeadTitle>
                            </DataTable.THeadCell>
                          ) : null}

                          {hasDeletePermission ? (
                            <DataTable.THeadCell className="text-center w-6rem">
                              <DataTable.THeadTitle>
                                Delete
                              </DataTable.THeadTitle>
                            </DataTable.THeadCell>
                          ) : null}
                        </DataTable.THeadRow>
                      </DataTable.THead>
                      <DataTable.TBody>
                        {({ item }: { item: CustomerList }) => (
                          <DataTable.Row key={item.id}>
                            <DataTable.Cell className="text-center py-2 px-3">
                              <span className="font-semibold text-sm text-900">
                                {item.name}
                              </span>
                            </DataTable.Cell>
                            <DataTable.Cell className="text-center py-2 px-3">
                              <span className="text-sm text-600">
                                {item.email}
                              </span>
                            </DataTable.Cell>
                            <DataTable.Cell className="text-center py-2 px-3">
                              <span className="text-sm text-600">
                                {item.phone || (
                                  <span className="text-400 italic">None</span>
                                )}
                              </span>
                            </DataTable.Cell>
                            <DataTable.Cell className="text-center py-2 px-3">
                              <span className="text-xs text-500 font-mono">
                                {item.createdAt
                                  ? String(item.createdAt).slice(0, 10)
                                  : "—"}
                              </span>
                            </DataTable.Cell>

                            {hasUpdatePermission ? (
                              <DataTable.Cell className="text-center py-2 px-3">
                                <button
                                  type="button"
                                  className="btn-outline text-xs"
                                  onClick={() =>
                                    OpenCustomerUpdateModel(item.id)
                                  }
                                >
                                  <i className="pi pi-pencil text-primary mr-1" />
                                  <span>Update</span>
                                </button>
                              </DataTable.Cell>
                            ) : null}

                            {hasDeletePermission ? (
                              <DataTable.Cell className="text-center py-2 px-3">
                                <button
                                  type="button"
                                  className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() =>
                                    handleDeleteCustomer(item.id, item.name)
                                  }
                                >
                                  <i className="pi pi-trash mr-1" />
                                  <span>Delete</span>
                                </button>
                              </DataTable.Cell>
                            ) : null}
                          </DataTable.Row>
                        )}
                      </DataTable.TBody>
                    </DataTable.Table>
                  </DataTable.TableContainer>
                </DataTable.Root>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
