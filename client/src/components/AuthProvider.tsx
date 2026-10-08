import { Outlet } from "react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../hooks/useGlobalContext";
import type { Company, GlobalContextType, GlobalState, User } from "../types.model";
import { api } from "../lib/axios";

export const GlobalContextProvider = () => {
  const [state, setState] = useState<GlobalState>(() => {
    // Only store and read accessToken from localStorage
    const token = localStorage.getItem("accessToken");

    return {
      user: null,
      selectedCompany: null,
      accessToken: token,
      isAuthenticated: Boolean(token),
      isLoading: Boolean(token),
    };
  });

  const login = useCallback((token: string, user: User) => {
    // Only store accessToken in localStorage
    localStorage.setItem("accessToken", token);

    setState((prev) => ({
      ...prev,
      accessToken: token,
      user,
      selectedCompany: null,
      isAuthenticated: true,
      isLoading: false,
    }));
  }, []);

  const logout = useCallback(() => {
    // Only remove accessToken from localStorage
    localStorage.removeItem("accessToken");

    setState({
      user: null,
      selectedCompany: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const selectCompany = useCallback((company: Company) => {
    // Store in React memory only
    setState((prev) => ({
      ...prev,
      selectedCompany: company,
    }));
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const res = await api.get("/auth/current-user");
      if (res.data?.user) {
        setState((prev) => ({
          ...prev,
          user: res.data.user,
          accessToken: res.data.accessToken || prev.accessToken,
          isAuthenticated: true,
          isLoading: false,
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  // Sync user profile on application startup if accessToken exists
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    let isMounted = true;
    api
      .get("/auth/current-user")
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.user) {
          setState((prev) => ({
            ...prev,
            user: res.data.user,
            accessToken: res.data.accessToken || prev.accessToken,
            isAuthenticated: true,
            isLoading: false,
          }));
        }
      })
      .catch(() => {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateGlobalData = useCallback((newData: Partial<GlobalState> | { [key: string]: unknown }) => {
    setState((prev) => ({
      ...prev,
      ...newData,
    } as GlobalState));
  }, []);

  const value: GlobalContextType = useMemo(
    () => ({
      state,
      user: state.user,
      selectedCompany: state.selectedCompany,
      accessToken: state.accessToken,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      globalUserData: {
        user: state.user,
        selectedCompany: state.selectedCompany,
      },
      login,
      logout,
      selectCompany,
      updateGlobalData,
      refreshCurrentUser,
    }),
    [state, login, logout, selectCompany, updateGlobalData, refreshCurrentUser],
  );

  return (
    <GlobalContext.Provider value={value}>
      <Outlet />
    </GlobalContext.Provider>
  );
};
