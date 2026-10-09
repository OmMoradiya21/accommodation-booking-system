import React, { useEffect, useState } from "react";
import type { Company, CustomerList, GlobalState } from "../types.model";
import { api } from "../lib/axios";
import { DataTable } from "primereact/datatable";
import { useGlobalContext } from "../hooks/useGlobalContext";

//permission : can_create_customer
export const ManageCustomer = () => {
  const { user, selectedCompany, logout, isAuthenticated, isLoading } =
    useGlobalContext();

  const [companies, setCompanies] = useState<Company[]>([
    { id: "1", name: "nothing" },
    { id: "4feac9de-9433-4c3b-ba29-69d2a3fcaada", name: "prodev" },
  ]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("0");
  const [customers, setCustomers] = useState<CustomerList[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isOpenUpdatingCustomerModel, setIsOpenUpdatingCustomerModel] =
    useState(false);
  const [isOpenCreatingCustomerModel, setIsOpenCreatingCustomerModel] =
    useState(false);
  const [updatingCustomerId, setUpdatingCustomerId] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await api.get("companies");
      const companies = res.data;
      setCompanies(companies);
    };
    fetchCompanies();
  }, []);

  if (
    selectedCompanyId === "0" &&
    (isOpenCreatingCustomerModel || isOpenUpdatingCustomerModel)
  ) {
    setIsOpenCreatingCustomerModel(false);
    setIsOpenUpdatingCustomerModel(false);
  }

  const getCustomerDataByCompanyId = async (id: string) => {
    setSelectedCompanyId(id);
    if (id === "0") {
      setCustomers([]);
      return;
    }
    try {
      const res = await api.get(`companies/${id}`);
      setCustomers(res.data.customers || []);
    } catch {
      // Sample mock data for preview if backend is unreachable
      setCustomers([
        {
          id: "1",
          company_id: id,
          name: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          createdAt: "2026-03-01",
          updatedAt: "2026-03-01",
        },
        {
          id: "2",
          company_id: id,
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "987-654-3210",
          createdAt: "2026-03-02",
          updatedAt: "2026-03-02",
        },
      ]);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) {
      alert("please add neccessary fields.");
      return;
    }

    const newCustomer = {
      company_id: selectedCompanyId,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
    };
    try {
      await api.post("/customers", newCustomer);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      await getCustomerDataByCompanyId(selectedCompanyId);
    } catch (error) {
      console.log(error);
    }
  };
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone) {
      alert("please add neccessary fields.");
      return;
    }
    const updatedCustomerData = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
    };
    try {
      await api.patch(`/customers/${updatingCustomerId}`, updatedCustomerData);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setIsOpenCreatingCustomerModel(true);
      setIsOpenUpdatingCustomerModel(false);
      await getCustomerDataByCompanyId(selectedCompanyId);
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteCustomer = async (id: string) => {
    try {
      await api.delete(`/customers/${id}`);
      await getCustomerDataByCompanyId(selectedCompanyId);
    } catch (error) {
      console.log(error);
    }
  };

  const OpenCustomerUpdateModel = async (id: string) => {
    setIsOpenUpdatingCustomerModel(true);
    setIsOpenCreatingCustomerModel(false);
    const customer = customers.find((customer) => customer.id === id);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setCustomerPhone(customer.phone);
    setUpdatingCustomerId(customer.id);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto flex flex-column gap-4">
      <div className="surface-card p-4 border-round shadow-1">
        <div className="flex flex-column md:flex-row align-items-start md:align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom-1 surface-border">
          <div>
            <h1 className="text-xl font-bold m-0 mb-1">Customer Management</h1>
            <p className="text-sm text-500 m-0">
              Manage and assign customers to company workspaces.
            </p>
          </div>

          <div className="flex align-items-center gap-2">
            <label htmlFor="companySelection" className="font-medium text-sm">
              Select Company:
            </label>
            <select
              name="company-selection"
              id="companySelection"
              className="input"
              style={{ width: "auto", minWidth: "180px" }}
              value={selectedCompanyId}
              onChange={(e) => getCustomerDataByCompanyId(e.target.value)}
            >
              <option value="0">Choose Company</option>
              {companies.map(({ id, name }) => (
                <option value={id} key={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          hidden={selectedCompanyId === "0" || isOpenCreatingCustomerModel}
          onClick={() => {
            setUpdatingCustomerId("");
            setIsOpenCreatingCustomerModel(true);
            setIsOpenUpdatingCustomerModel(false);
          }}
        >
          Create Customer
        </button>
        <div className="grid">
          {/* create customer */}
          {isOpenCreatingCustomerModel || isOpenUpdatingCustomerModel ? (
            <div className="col-12 lg:col-4">
              <div className="border-1 surface-border border-round p-4 surface-50">
                <h2 className="text-base font-semibold mb-3 mt-0">
                  {isOpenCreatingCustomerModel
                    ? "Create Customer"
                    : "Update Customer"}
                </h2>
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
                  <div>
                    <label
                      htmlFor="customerName"
                      className="block text-xs font-medium mb-1"
                    >
                      Name *
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

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium mb-1"
                    >
                      Email *
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

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-medium mb-1"
                    >
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input"
                      pattern="[0-9]{3}[0-9]{3}[0-9]{4}"
                      placeholder="123-456-7890"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary mt-1">
                    {isOpenCreatingCustomerModel
                      ? "Create Customer"
                      : "Update Customer"}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            ""
          )}

          {/* customer view */}
          <div className="col-12 lg:col-8">
            <h2 className="text-base font-semibold mb-3 mt-0 flex align-items-center justify-content-between">
              <span>Customers</span>
              <span className="text-xs text-500 font-normal">
                {customers.length} records found
              </span>
            </h2>

            {selectedCompanyId === "0" ? (
              <div className="border-1 surface-border border-round p-5 text-center text-500 surface-50">
                <i className="pi pi-building text-3xl mb-2 text-400 block" />
                <p className="m-0 font-medium">
                  Please select a company to view customers
                </p>
              </div>
            ) : customers.length === 0 ? (
              <div className="border-1 surface-border border-round p-5 text-center text-500 surface-50">
                <i className="pi pi-users text-3xl mb-2 text-400 block" />
                <p className="m-0 font-medium">
                  No customers found for this company
                </p>
                <p className="text-xs text-400 mt-1">
                  Use the form on the left to add one.
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
                          {/* if update and delete permission  */}
                          <DataTable.THeadCell>
                            <DataTable.THeadTitle>Update</DataTable.THeadTitle>
                          </DataTable.THeadCell>
                          <DataTable.THeadCell>
                            <DataTable.THeadTitle>Delete</DataTable.THeadTitle>
                          </DataTable.THeadCell>
                        </DataTable.THeadRow>
                      </DataTable.THead>
                      <DataTable.TBody>
                        {({ item }: { item: CustomerList }) => (
                          <DataTable.Row key={item.id}>
                            <DataTable.Cell className={"text-center"}>
                              <span className="font-medium text-sm ">
                                {item.name}
                              </span>
                            </DataTable.Cell>
                            <DataTable.Cell className={"text-center"}>
                              <span className="text-sm text-600">
                                {item.email}
                              </span>
                            </DataTable.Cell>
                            <DataTable.Cell className={"text-center"}>
                              <span className="text-sm text-600">
                                {item.phone}
                              </span>
                            </DataTable.Cell>
                            <DataTable.Cell className={"text-center"}>
                              <span className="text-xs font-semibold text-500">
                                {item.createdAt}
                              </span>
                            </DataTable.Cell>
                            <DataTable.Cell className={"text-center"}>
                              <span className="text-xs font-semibold text-500">
                                <button
                                  onClick={() =>
                                    OpenCustomerUpdateModel(item.id)
                                  }
                                >
                                  Update
                                </button>
                              </span>
                            </DataTable.Cell>
                            <DataTable.Cell className={"text-center"}>
                              <span className="text-xs font-semibold text-500">
                                <button
                                  onClick={() => handleDeleteCustomer(item.id)}
                                >
                                  Delete
                                </button>
                              </span>
                            </DataTable.Cell>
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
