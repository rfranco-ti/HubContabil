import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context";
import "@mantine/core/styles.css";
import "./index.css";
import App from "./App.jsx";

// Polyfill para compatibilidade com codigo legado que usa localStorage.getItem('token')
// Usa chamadas diretas ao prototype original para evitar recursao infinita
const originalGetItem = Storage.prototype.getItem;
Storage.prototype.getItem = function (key) {
  if (key === "token") {
    return (
      originalGetItem.call(this, "accessToken") ||
      originalGetItem.call(this, "token")
    );
  }
  return originalGetItem.call(this, key);
};

const originalRemoveItem = Storage.prototype.removeItem;
Storage.prototype.removeItem = function (key) {
  if (key === "token") {
    originalRemoveItem.call(this, "accessToken");
    originalRemoveItem.call(this, "refreshToken");
    originalRemoveItem.call(this, "user");
    return originalRemoveItem.call(this, "token");
  }
  return originalRemoveItem.call(this, key);
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
