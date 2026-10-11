import React, { useEffect, useState, useMemo } from "react";
import { api } from "../lib/axios";
import type { Accommodation } from "../types.model";
import { useGlobalContext } from "../hooks/useGlobalContext";

export const AccommodationsManagement = () => {
  const { user, refreshCurrentUser } = useGlobalContext();

  const isAdmin = Boolean(user?.role?.toLowerCase() === "admin");

  const hasReadPermission =
    isAdmin || Boolean(user?.permissions?.includes("accommodation:read"));
  const hasCreatePermission =
    isAdmin || Boolean(user?.permissions?.includes("accommodation:create"));
  const hasUpdatePermission =
    isAdmin || Boolean(user?.permissions?.includes("accommodation:update"));
  const hasDeletePermission =
    isAdmin || Boolean(user?.permissions?.includes("accommodation:delete"));

  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<Accommodation | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadAccommodations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/accommodations");
      setAccommodations(res.data || []);
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
          "Failed to load accommodations",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCurrentUser?.();

    let isMounted = true;
    api
      .get("/accommodations")
      .then((res) => {
        if (isMounted) setAccommodations(res.data || []);
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
            "Failed to load accommodations",
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshCurrentUser]);

  const handleStartEdit = (item: Accommodation) => {
    setEditingItem(item);
    setName(item.name);
    setLocation(item.location);
    setPricePerNight(String(item.price_per_night));
    setDescription(item.description || "");
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setName("");
    setLocation("");
    setPricePerNight("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim() || !location.trim() || !pricePerNight) {
      setFeedback({
        type: "error",
        text: "Please fill in all required fields (Name, Location, and Price per night).",
      });
      return;
    }

    const priceNum = Number(pricePerNight);
    if (isNaN(priceNum) || priceNum < 0) {
      setFeedback({
        type: "error",
        text: "Price per night must be a valid positive number.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        location: location.trim(),
        price_per_night: priceNum,
        description: description.trim() || undefined,
      };

      if (editingItem) {
        await api.patch(`/accommodations/${editingItem.id}`, payload);
        setFeedback({
          type: "success",
          text: `Accommodation "${name}" updated successfully!`,
        });
        handleCancelEdit();
      } else {
        await api.post("/accommodations", payload);
        setFeedback({
          type: "success",
          text: `Accommodation "${name}" created successfully!`,
        });
        handleCancelEdit();
      }

      await loadAccommodations();
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

  const handleDelete = async (item: Accommodation) => {
    if (
      !window.confirm(
        `Are you sure you want to delete accommodation "${item.name}"? This will affect associated bookings.`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/accommodations/${item.id}`);
      setFeedback({
        type: "success",
        text: `Accommodation "${item.name}" deleted successfully.`,
      });
      if (editingItem?.id === item.id) {
        handleCancelEdit();
      }
      await loadAccommodations();
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
          "Failed to delete accommodation",
      });
    }
  };

  const filteredAccommodations = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return accommodations;
    return accommodations.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)),
    );
  }, [accommodations, searchTerm]);

  if (!hasReadPermission) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="surface-card p-5 border-round shadow-1 border-1 surface-border text-center text-500">
          <i className="pi pi-lock text-3xl mb-2 text-red-500 block" />
          <h2 className="text-xl font-bold text-900 m-0 mb-1">Access Denied</h2>
          <p className="text-sm text-500 m-0">
            You do not have permission to view or manage accommodations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto flex flex-column gap-3">
      <div className="flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-900 m-0">
            Accommodations Management
          </h1>
          <p className="text-sm text-500 m-0 mt-1">
            Manage lodging inventory, vacation rentals, locations, and nightly pricing
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

      {(hasCreatePermission || (hasUpdatePermission && editingItem)) && (
        <div className="surface-card p-4 border-round shadow-1 border-1 surface-border mb-3">
          <div className="flex align-items-center justify-content-between mb-3">
            <div className="text-xl font-semibold text-900 flex align-items-center gap-2">
              <i
                className={
                  editingItem
                    ? "pi pi-pencil text-primary"
                    : "pi pi-home text-primary"
                }
              />
              <span>
                {editingItem
                  ? "Edit Accommodation"
                  : "Create New Accommodation"}
              </span>
            </div>
            {editingItem && (
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
              <div className="col-12 md:col-6 lg:col-4 flex flex-column gap-1">
                <label
                  htmlFor="accName"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Property Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="accName"
                  className="input"
                  placeholder="e.g. Sunset Luxury Villa"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="col-12 md:col-6 lg:col-4 flex flex-column gap-1">
                <label
                  htmlFor="accLocation"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Location / City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="accLocation"
                  className="input"
                  placeholder="e.g. Malibu, CA or Downtown Zurich"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="col-12 md:col-6 lg:col-4 flex flex-column gap-1">
                <label
                  htmlFor="accPrice"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Price Per Night ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="accPrice"
                  className="input"
                  placeholder="e.g. 150.00"
                  required
                  min="0"
                  step="0.01"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                />
              </div>

              <div className="col-12 flex flex-column gap-1">
                <label
                  htmlFor="accDescription"
                  className="text-xs font-semibold text-700 uppercase"
                >
                  Description & Amenities
                </label>
                <textarea
                  id="accDescription"
                  rows={2}
                  className="input"
                  placeholder="Describe property features, guest capacity, ocean view, wifi, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-content-end mt-2">
              {editingItem && (
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
                      : editingItem
                        ? "pi pi-check mr-2"
                        : "pi pi-plus mr-2"
                  }
                />
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : editingItem
                      ? "Update Accommodation"
                      : "Create Accommodation"}
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
              Accommodation Inventory
            </h2>
            <span className="badge">
              {filteredAccommodations.length}{" "}
              {filteredAccommodations.length === 1 ? "property" : "properties"}
            </span>
          </div>

          <div className="flex align-items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name or location..."
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
              onClick={loadAccommodations}
              className="btn-outline text-xs"
              title="Refresh list"
              disabled={isLoading}
            >
              <i
                className={
                  isLoading ? "pi pi-spin pi-spinner" : "pi pi-refresh"
                }
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {isLoading && accommodations.length === 0 ? (
          <div className="p-5 text-center text-500">
            <i className="pi pi-spin pi-spinner text-2xl mb-2 block text-primary" />
            <span>Loading accommodations...</span>
          </div>
        ) : filteredAccommodations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-5rem">Sr. No.</th>
                  <th className="min-w-12rem">Property Name</th>
                  <th>Location</th>
                  <th>Price / Night</th>
                  <th>Description</th>
                  {hasUpdatePermission && (
                    <th className="text-center w-6rem">Update</th>
                  )}
                  {hasDeletePermission && (
                    <th className="text-center w-6rem">Delete</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredAccommodations.map((item, index) => {
                  const isCurrentRowEditing = editingItem?.id === item.id;
                  return (
                    <tr
                      key={item.id}
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
                            {item.name}
                          </span>
                          {isCurrentRowEditing && (
                            <span className="text-xs text-primary font-medium">
                              (editing)
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex align-items-center gap-1 text-sm text-600">
                          <i className="pi pi-map-marker text-xs text-500" />
                          <span>{item.location}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge font-bold text-green-700 bg-green-50 border-1 border-green-200">
                          ${Number(item.price_per_night).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-600 line-clamp-1">
                          {item.description || (
                            <span className="text-400 italic">None</span>
                          )}
                        </span>
                      </td>

                      {hasUpdatePermission && (
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="btn-outline text-xs"
                            title="Edit accommodation"
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
                            onClick={() => handleDelete(item)}
                            className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50"
                            title="Delete accommodation"
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
            <i className="pi pi-home text-3xl mb-2 text-400 block" />
            <p className="m-0 font-medium text-900">
              {searchTerm
                ? "No accommodations match your search"
                : "No accommodations found"}
            </p>
            <p className="text-xs text-500 mt-1">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Add your first property using the form above."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
