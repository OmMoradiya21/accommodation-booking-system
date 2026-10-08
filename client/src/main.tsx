import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import Lara from "@primeuix/themes/lara";
import { PrimeReactProvider } from "@primereact/core";
import { CreateCustomer } from "./components/CreateCustomer";

const primeReact = {
  theme: {
    preset: Lara,
  },
};

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <PrimeReactProvider {...primeReact}>
      <StrictMode>
        {/* Toggle between CreateCustomer for component testing or App for full router */}
        {/* <App /> */}
        <CreateCustomer />
      </StrictMode>
    </PrimeReactProvider>,
  );
}
