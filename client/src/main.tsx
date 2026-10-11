import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { PrimeReactProvider } from "@primereact/core";

const primeReact = {
  // theme: {
  //   preset: ,
  // },
};

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <PrimeReactProvider {...primeReact}>
      <App />
    </PrimeReactProvider>,
  );
}
