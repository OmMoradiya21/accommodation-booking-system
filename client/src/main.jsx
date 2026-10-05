import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import Lara from "@primeuix/themes/lara";
import { PrimeReactProvider } from "@primereact/core";

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const primeReact = {
  theme: {
    preset: Lara,
  },
};

createRoot(document.getElementById('root')).render(
    <PrimeReactProvider value={primeReact}>
        <StrictMode>
            <App />
        </StrictMode>
    </PrimeReactProvider>
)
