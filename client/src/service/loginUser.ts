import { api } from "../lib/axios";

export const loginUser = async (email: string, password: string) => {
  const res = await api.post("auth/login", { email, password });
  console.log("first");
  console.log(res.data);
};
