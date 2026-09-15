import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./theme.css";

const host = document.getElementById("malang-root");
if (!host) throw new Error("#malang-root 를 찾지 못했어요.");

createRoot(host).render(
  <StrictMode>
    <App />
  </StrictMode>
);
