import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/axios";
import type {
  Accommodation,
  Booking,
  BookingStatus,
  Company,
  CustomerList,
} from "../types.model";
import { useGlobalContext } from "../hooks/useGlobalContext";

export const BookingsManagement = () => {
  const { user, selectedCompany, refreshCurrentUser } = useGlobalContext();

  const isAdmin = Boolean(user?.role?.toLowerCase() === "admin");

  const hasReadPermission =
    isAdmin || Boolean(user?.permissions?.includes("booking:read"));
  const hasCreatePermission =
    isAdmin || Boolean(user?.permissions?.includes("booking:create"));
  const hasDeletePermission =
    isAdmin || Boolean(user?.permissions?.includes("booking:delete"));
  const hasApprovePermission =
    isAdmin || Boolean(user?.permissions?.includes("booking:approve"));

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

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<CustomerList[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);

  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [accommodationId, setAccommodationId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [status, setStatus] = useState<BookingStatus>("Pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const activeCompanyId =
    selectedCompanyId !== "0"
      ? selectedCompanyId
      : selectedCompany?.id || (companies[0]?.id ?? "0");

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

  useEffect(() => {
    let isMounted = true;
    api
      .get("/accommodations")
      .then((res) => {
        if (isMounted) setAccommodations(res.data || []);
      })
      .catch((err) => {
        console.error("Error loading accommodations:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeCompanyId || activeCompanyId === "0") {
      return;
    }

    let isMounted = true;

    Promise.all([
      api.get(`/bookings?companyId=${activeCompanyId}`).catch(() => ({ data: [] })),
      api.get(`/customers?companyId=${activeCompanyId}`).catch(() => ({ data: [] })),
    ])
      .then(([bookingsRes, customersRes]) => {
        if (!isMounted) return;
        setBookings(bookingsRes.data || []);
        setCustomers(customersRes.data || []);
      })
      .catch((err) => {
        console.error("Error loading booking dependencies:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingBookings(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCompanyId]);

  const reloadBookings = async (compCompanyId: string) => {
    if (!compCompanyId || compCompanyId === "0") return;
    try {
      const res = await api.get(`/bookings?companyId=${compCompanyId}`);
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error reloading bookings:", err);
    }
  };

  const durationCalculation = useMemo(() => {
    if (!checkIn || !checkOut) return { nights: 0, totalCost: 0 };
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = d2.getTime() - d1.getTime();
    const nights = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const selectedAcc = accommodations.find((a) => a.id === accommodationId);
    const nightlyPrice = selectedAcc ? Number(selectedAcc.price_per_night) : 0;
    return {
      nights,
      totalCost: nights * nightlyPrice,
      nightlyPrice,
    };
  }, [checkIn, checkOut, accommodationId, accommodations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!customerId || !accommodationId || !checkIn || !checkOut) {
      setFeedback({
        type: "error",
        text: "Please fill in all required booking fields.",
      });
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setFeedback({
        type: "error",
        text: "Check-out date must be strictly after the check-in date.",
      });
      return;
    }

    if (!activeCompanyId || activeCompanyId === "0") {
      setFeedback({
        type: "error",
        text: "Please select an active company workspace.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/bookings", {
        company_id: activeCompanyId,
        customer_id: customerId,
        accommodation_id: accommodationId,
        check_in: checkIn,
        check_out: checkOut,
        status,
      });
      setFeedback({
        type: "success",
        text: "Booking created successfully!",
      });
      setCustomerId("");
      setAccommodationId("");
      setCheckIn("");
      setCheckOut("");
      setStatus("Pending");

      await reloadBookings(activeCompanyId);
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

  const handleQuickStatusChange = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    setFeedback(null);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      setFeedback({
        type: "success",
        text: `Booking status changed to ${newStatus}.`,
      });
      await reloadBookings(activeCompanyId);
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
          "Failed to update booking status",
      });
    }
  };

  const handleDeleteBooking = async (b: Booking) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      await api.delete(`/bookings/${b.id}`);
      setFeedback({
        type: "success",
        text: "Booking deleted successfully.",
      });
      await reloadBookings(activeCompanyId);
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
          "Failed to delete booking",
      });
    }
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case "Approved":
        return "bg-green-100 text-green-800 border-1 border-green-300";
      case "Declined":
      case "Cancelled":
        return "bg-red-100 text-red-800 border-1 border-red-300";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-1 border-blue-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-1 border-yellow-300";
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "ALL" && b.status !== statusFilter) {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const cName = b.customer?.name?.toLowerCase() || "";
      const cEmail = b.customer?.email?.toLowerCase() || "";
      const aName = b.accommodation?.name?.toLowerCase() || "";
      const aLoc = b.accommodation?.location?.toLowerCase() || "";
      return (
        cName.includes(q) ||
        cEmail.includes(q) ||
        aName.includes(q) ||
        aLoc.includes(q)
      );
    });
  }, [bookings, statusFilter, searchTerm]);

  if (!hasReadPermission) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="surface-card p-5 border-round shadow-1 border-1 surface-border text-center text-500">
          <i className="pi pi-lock text-3xl mb-2 text-red-500 block" />
          <h2 className="text-xl font-bold text-900 m-0 mb-1">Access Denied</h2>
          <p className="text-sm text-500 m-0">
            You do not have permission to view or manage bookings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto flex flex-column gap-3">
      <div className="flex flex-column md:flex-row align-items-start md:align-items-center justify-content-between gap-3 mb-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-900 m-0">
            Booking & Reservation Management
          </h1>
          <p className="text-sm text-500 m-0 mt-1">
            Schedule accommodation stays for customers, calculate costs, and approve reservations
          </p>
        </div>

        <div className="flex align-items-center gap-2">
          <label
            htmlFor="bookingCompanySelection"
            className="font-medium text-sm text-700 whitespace-nowrap"
          >
            Company Workspace:
          </label>
          <select
            id="bookingCompanySelection"
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

      {hasCreatePermission && (
        <div className="surface-card p-4 border-round shadow-1 border-1 surface-border mb-3">
          <div className="flex align-items-center justify-content-between mb-3">
            <div className="text-xl font-semibold text-900 flex align-items-center gap-2">
              <i className="pi pi-calendar-plus text-primary" />
              <span>Create New Booking</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-column gap-3">
            <div className="grid">
              <div className="col-12 md:col-6 lg:col-3 flex flex-column gap-1">
                <label
                  htmlFor="bookingCustomer"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  id="bookingCustomer"
                  className="input"
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Select Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
                {customers.length === 0 && (
                  <span className="text-xs text-400 italic">
                    No customers found in this company.
                  </span>
                )}
              </div>

              <div className="col-12 md:col-6 lg:col-3 flex flex-column gap-1">
                <label
                  htmlFor="bookingAccommodation"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Accommodation <span className="text-red-500">*</span>
                </label>
                <select
                  id="bookingAccommodation"
                  className="input"
                  required
                  value={accommodationId}
                  onChange={(e) => setAccommodationId(e.target.value)}
                >
                  <option value="">Select Accommodation...</option>
                  {accommodations.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (${Number(a.price_per_night).toFixed(2)}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 md:col-6 lg:col-2 flex flex-column gap-1">
                <label
                  htmlFor="bookingCheckIn"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Check-in Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="bookingCheckIn"
                  className="input"
                  required
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="col-12 md:col-6 lg:col-2 flex flex-column gap-1">
                <label
                  htmlFor="bookingCheckOut"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Check-out Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="bookingCheckOut"
                  className="input"
                  required
                  min={checkIn || undefined}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div className="col-12 md:col-6 lg:col-2 flex flex-column gap-1">
                <label
                  htmlFor="bookingStatus"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Status
                </label>
                <select
                  id="bookingStatus"
                  className="input"
                  disabled={!hasApprovePermission && !isAdmin}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookingStatus)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>
            </div>

            {durationCalculation.nights > 0 && (
              <div className="p-3 border-round surface-50 border-1 surface-border flex align-items-center justify-content-between flex-wrap gap-2 text-sm">
                <div className="flex align-items-center gap-3">
                  <span className="font-semibold text-700">
                    Duration:{" "}
                    <span className="text-900 font-bold">
                      {durationCalculation.nights}{" "}
                      {durationCalculation.nights === 1 ? "night" : "nights"}
                    </span>
                  </span>
                  <span className="text-400">|</span>
                  <span className="text-600">
                    Nightly Rate:{" "}
                    <span className="text-900 font-semibold">
                      ${durationCalculation.nightlyPrice.toFixed(2)}
                    </span>
                  </span>
                </div>
                <div className="flex align-items-center gap-2">
                  <span className="text-600 font-medium">Estimated Total:</span>
                  <span className="badge text-base font-bold bg-green-50 text-green-700 border-1 border-green-300">
                    ${durationCalculation.totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-content-end mt-2">
              <button
                type="submit"
                className="btn-primary w-auto px-4"
                disabled={isSubmitting}
              >
                <i
                  className={
                    isSubmitting
                      ? "pi pi-spin pi-spinner mr-2"
                      : "pi pi-plus mr-2"
                  }
                />
                <span>{isSubmitting ? "Saving..." : "Create Booking"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="surface-card border-round shadow-1 border-1 surface-border overflow-hidden">
        <div className="p-3 border-bottom-1 surface-border flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="flex align-items-center gap-2">
            <h2 className="text-base font-semibold text-900 m-0">
              Active Bookings
            </h2>
            <span className="badge">
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "booking" : "bookings"}
            </span>
          </div>

          <div className="flex align-items-center gap-2 flex-wrap">
            <select
              className="input py-1 px-2 text-xs w-8rem"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Declined">Declined</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search customer, accommodation..."
                className="input py-1 px-3 text-xs w-14rem"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="p-link absolute right-0 top-0 bottom-0 px-2 text-400 hover:text-700"
                  title="Clear search"
                >
                  <i className="pi pi-times text-xs" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => reloadBookings(activeCompanyId)}
              className="btn-outline text-xs"
              title="Refresh list"
              disabled={isLoadingBookings}
            >
              <i
                className={
                  isLoadingBookings ? "pi pi-spin pi-spinner" : "pi pi-refresh"
                }
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {activeCompanyId === "0" ? (
          <div className="p-5 text-center text-500">
            <i className="pi pi-building text-3xl mb-2 text-400 block" />
            <p className="m-0 font-medium text-900">
              Please select a company workspace to view bookings
            </p>
          </div>
        ) : isLoadingBookings && bookings.length === 0 ? (
          <div className="p-5 text-center text-500">
            <i className="pi pi-spin pi-spinner text-2xl mb-2 block text-primary" />
            <span>Loading reservations...</span>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-4rem">Sr. No.</th>
                  <th>Customer</th>
                  <th>Accommodation</th>
                  <th>Stay Period</th>
                  <th>Status</th>
                  {hasApprovePermission && (
                    <th className="text-center w-11rem">Action</th>
                  )}
                  {hasDeletePermission && (
                    <th className="text-center w-6rem">Delete</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b, index) => {
                  const cIn = b.check_in ? String(b.check_in).slice(0, 10) : "—";
                  const cOut = b.check_out ? String(b.check_out).slice(0, 10) : "—";

                  return (
                    <tr key={b.id}>
                      <td>
                        <span className="text-600 font-medium">
                          {index + 1}
                        </span>
                      </td>

                      <td>
                        <div>
                          <div className="font-semibold text-900 text-sm">
                            {b.customer?.name || "Customer Not Found"}
                          </div>
                          <div className="text-xs text-500">
                            {b.customer?.email || "—"}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div>
                          <div className="font-semibold text-900 text-sm">
                            {b.accommodation?.name || "Accommodation Not Found"}
                          </div>
                          <div className="text-xs text-500 flex align-items-center gap-1">
                            <i className="pi pi-map-marker text-xs" />
                            <span>{b.accommodation?.location || "—"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="flex flex-column gap-1 text-xs font-mono">
                          <span className="text-800">
                            {cIn} &rarr; {cOut}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge text-xs font-semibold ${getStatusBadgeClass(
                            b.status,
                          )}`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {hasApprovePermission && (
                        <td className="text-center">
                          <div className="flex align-items-center justify-content-center gap-1">
                            {b.status === "Pending" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickStatusChange(b.id, "Approved")
                                  }
                                  className="btn-outline text-xs text-green-700 border-green-200 hover:bg-green-50 px-2 py-1"
                                  title="Approve booking"
                                >
                                  <i className="pi pi-check mr-1" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickStatusChange(b.id, "Declined")
                                  }
                                  className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50 px-2 py-1"
                                  title="Decline booking"
                                >
                                  <i className="pi pi-times mr-1" />
                                  <span>Decline</span>
                                </button>
                              </>
                            ) : b.status === "Approved" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickStatusChange(b.id, "Declined")
                                }
                                className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50 px-2 py-1"
                                title="Decline booking"
                              >
                                <i className="pi pi-times mr-1" />
                                <span>Decline</span>
                              </button>
                            ) : b.status === "Declined" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickStatusChange(b.id, "Approved")
                                }
                                className="btn-outline text-xs text-green-700 border-green-200 hover:bg-green-50 px-2 py-1"
                                title="Approve booking"
                              >
                                <i className="pi pi-check mr-1" />
                                <span>Approve</span>
                              </button>
                            ) : (
                              <span className="text-xs text-400 italic">
                                {b.status}
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {hasDeletePermission && (
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(b)}
                            className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50"
                            title="Delete booking"
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
            <i className="pi pi-calendar-times text-3xl mb-2 text-400 block" />
            <p className="m-0 font-medium text-900">
              {searchTerm || statusFilter !== "ALL"
                ? "No bookings match your filter criteria"
                : "No bookings found in this workspace"}
            </p>
            <p className="text-xs text-500 mt-1">
              {hasCreatePermission
                ? "Create your first reservation using the form above."
                : "No reservations available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
