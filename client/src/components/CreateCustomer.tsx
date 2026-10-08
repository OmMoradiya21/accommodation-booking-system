import { useState } from "react";
import type { Company, CustomerList } from "../types.model";
import { api } from "../lib/axios";

import { DataTable } from "primereact/datatable";

export const CreateCustomer = () => {
  //useEffect to fetch company
  const [companies, setCompanies] = useState<Company[]>([
    { id: "1", name: "navy" },
    { id: "4feac9de-9433-4c3b-ba29-69d2a3fcaada", name: "ground" },
  ]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("0");
  const [customers, setCustomers] = useState<CustomerList[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const getCustomerDataByCompanyId = async (id: string) => {
    setSelectedCompanyId(id);
    if (id === "0") {
      setCustomers([]);
      return;
    }
    const res = await api.get(`companies/${id}`);
    setCustomers(res.data.customers || []);
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <label htmlFor="company-selection">Select Company: </label>
      <select
        name="company-selection"
        id="companySelection"
        value={selectedCompanyId}
        onChange={(e) => getCustomerDataByCompanyId(e.target.value)}
      >
        <option value={"0"}>Select Company</option>
        {companies.map(({ id, name }) => (
          <option value={id} key={id}>
            {name}
          </option>
        ))}
      </select>
      {/* TODO: create customer model */}
      <h2>Add Customer to Company</h2>
      <form onSubmit={handleAddCustomer}>
        <label htmlFor="customerName">Name :</label>
        <input
          type="text"
          name="add-customer"
          id="customerName"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <label htmlFor="email">Email :</label>
        <input
          type="email"
          name="email"
          id="email"
          required
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
        />

        <label htmlFor="phone">Phone No. :</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          required
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
        ></input>
        <button type="submit">Add Customer</button>
      </form>

      {!customers.length ? (
        <h3>Please select company to view Customer</h3>
      ) : (
        <div className="w-full">
          <DataTable.Root data={customers} stripedRows>
            <DataTable.TableContainer>
              <DataTable.Table style={{ minWidth: "50rem" }}>
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
                      <DataTable.THeadTitle>Created_At</DataTable.THeadTitle>
                    </DataTable.THeadCell>
                  </DataTable.THeadRow>
                </DataTable.THead>
                <DataTable.TBody>
                  {({ item }: { item: CustomerList }) => (
                    <DataTable.Row key={item.id}>
                      <DataTable.Cell>
                        <span className="font-medium">{item.name}</span>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <div className="flex items-center gap-2">
                          <span>{item.email}</span>
                        </div>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <div className="text-center">
                          <span className="text-sm">{item.phone}</span>
                        </div>
                      </DataTable.Cell>
                      <DataTable.Cell>
                        <span className="font-semibold text-center">
                          ${item.createdAt}
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
  );
};
