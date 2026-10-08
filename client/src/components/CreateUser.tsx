import { useState } from "react";
import type { Company, RoleItem, UserListItem } from "../types.model";
import { api } from "../lib/axios";

export const CreateUser = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, companiesRes, rolesRes] = await Promise.all([
        api.get("/users"),
        api.get("/companies"),
        api.get("/roles").catch(() => ({ data: [] })),
      ]);
      setUsers(usersRes.data || []);
      setCompanies(companiesRes.data || []);
      const roleList = rolesRes.data || [];
      setRoles(roleList);
      if (roleList.length > 0 && !roleId) {
        const defaultRole = roleList.find((r: RoleItem) => r.name === "USER") || roleList[0];
        setRoleId(defaultRole.id);
      }
    } catch (error) {}
  };
  return <>
  </>;
};
