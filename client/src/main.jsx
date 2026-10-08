import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import Lara from "@primeuix/themes/lara";
import { PrimeReactProvider } from "@primereact/core";
import { CreateCustomer } from "./components/CreateCustomer.js";

const primeReact = {
  theme: {
    preset: Lara,
  },
};

createRoot(document.getElementById("root")).render(
  <PrimeReactProvider {...primeReact}>
  <StrictMode>
    {/* <App /> */}
    <CreateCustomer />
  </StrictMode>
  </PrimeReactProvider>,
);
