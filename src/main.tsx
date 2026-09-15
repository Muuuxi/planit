import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./themes.css";
import "./layout.css";
import "./hierarchy.css";
import { migrateLegacyStorage } from "./storageMigration";

try { migrateLegacyStorage(localStorage); } catch { /* Storage may be disabled; existing hooks report persistence errors. */ }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
