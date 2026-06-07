import { API_BASE_URL } from "../config/config.js";
import { ROLE_LABELS } from "../config/permissions.js";
import { logout } from "../auth.js";

const createElement = (tag, className = "", textContent = "") => {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
};

const createInfoRow = (label, value) => {
  const row = createElement("div", "settings-row");
  row.append(createElement("span", "", label), createElement("strong", "", value || "-"));
  return row;
};

export const renderSettings = ({ user } = {}) => {
  const page = createElement("section", "settings-page resource-page animate-soft-in");
  const header = createElement("header", "resource-header");
  const text = createElement("div");

  text.append(
    createElement("h1", "", "Sozlamalar"),
    createElement("p", "", "Sessiya, backend ulanishi va joriy foydalanuvchi ma'lumotlari")
  );

  const logoutButton = createElement("button", "resource-button resource-button--danger", "Chiqish");
  logoutButton.type = "button";
  logoutButton.addEventListener("click", logout);
  header.append(text, logoutButton);

  const card = createElement("article", "settings-card");
  card.append(
    createInfoRow("Foydalanuvchi", user?.username),
    createInfoRow("Role", ROLE_LABELS[user?.role] || user?.role),
    createInfoRow("Backend API", API_BASE_URL),
    createInfoRow("Auth turi", "httpOnly cookie + optional Bearer token")
  );

  page.append(header, card);
  return page;
};
