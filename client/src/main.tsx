import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import Lara from "@primeuix/themes/lara";
import { definePreset } from "@primeuix/themes";
import { PrimeReactProvider } from "@primereact/core";
import { ManageCustomer } from "./components/ManageCustomer";

const primeReact = {
  // theme: {
  //   preset: ,
  // },
};

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <PrimeReactProvider {...primeReact}>
      <StrictMode>
        {/* Toggle between ManageCustomer for component testing or App for full router */}
        <App />
      </StrictMode>
    </PrimeReactProvider>,
  );
}
