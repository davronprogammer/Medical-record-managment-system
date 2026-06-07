const getAppRootHref = () => {
  const url = new URL(window.location.href);
  const pagesIndex = url.pathname.lastIndexOf("/pages/");

  if (pagesIndex !== -1) {
    url.pathname = url.pathname.slice(0, pagesIndex + 1);
  } else {
    url.pathname = url.pathname.slice(0, url.pathname.lastIndexOf("/") + 1);
  }

  url.search = "";
  url.hash = "";

  return url.href;
};

const appRootHref = getAppRootHref();

const createPageHref = (page) => {
  return new URL(`pages/${page}.html`, appRootHref).href;
};

const navigationItems = [
  {
    key: "dashboard",
    label: "Boshqaruv paneli",
    href: createPageHref("dashboard"),
    icon: "M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7v-9h-7v9Zm0-11h7V4h-7v5Z",
  },
  {
    key: "doctors",
    label: "Shifokorlar",
    href: createPageHref("doctors"),
    icon: "M12 3a4 4 0 0 1 4 4v1h2a2 2 0 0 1 2 2v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-5a2 2 0 0 1 2-2h2V7a4 4 0 0 1 4-4Zm-2 5h4V7a2 2 0 0 0-4 0v1Zm1 5H8v2h3v3h2v-3h3v-2h-3v-3h-2v3Z",
  },
  {
    key: "patients",
    label: "Bemorlar",
    href: createPageHref("patients"),
    icon: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z",
  },
  {
    key: "diseases",
    label: "Tashxislar",
    href: createPageHref("diseases"),
    icon: "M12 3 4 6v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6l-8-3Zm1 6h3v2h-3v3h-2v-3H8V9h3V6h2v3Z",
  },
  {
    key: "departments",
    label: "Bo'limlar",
    href: createPageHref("departments"),
    icon: "M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h2a2 2 0 0 1 2 2v11h-5v-4h-4v4H5Zm3-12h2V7H8v2Zm0 4h2v-2H8v2Zm4-4h2V7h-2v2Zm0 4h2v-2h-2v2Z",
  },
  {
    key: "settings",
    label: "Sozlamalar",
    href: createPageHref("settings"),
    icon: "M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.4-2.4 1a7.7 7.7 0 0 0-2.6-1.5L14 2h-4l-.4 3.1A7.7 7.7 0 0 0 7 6.6l-2.4-1-2 3.4 2 1.5c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2 1.5 2 3.4 2.4-1a7.7 7.7 0 0 0 2.6 1.5L10 22h4l.4-3.1a7.7 7.7 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z",
  },
];

const logoutItem = {
  key: "logout",
  label: "Chiqish",
  href: new URL("index.html", appRootHref).href,
  icon: "M16 17v-3H9v-4h7V7l5 5-5 5ZM14 3v2H5v14h9v2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9Z",
};

const createIcon = (path) => {
  return `
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="${path}"></path>
    </svg>
  `;
};

const getActiveKey = () => {
  const fileName = window.location.pathname.split("/").pop().replace(".html", "");
  return !fileName || fileName === "index" ? "dashboard" : fileName;
};

const createNavLink = (item, activeKey, extraClass = "") => {
  const isActive = item.key === activeKey;

  return `
    <a class="app-sidebar__link ${extraClass} ${isActive ? "is-active" : ""}" href="${item.href}" data-nav-key="${item.key}">
      <span class="app-sidebar__icon">${createIcon(item.icon)}</span>
      <span class="app-sidebar__text">${item.label}</span>
    </a>
  `;
};

export const createSidebar = ({ activeKey = getActiveKey(), role = ROLES.ADMIN } = {}) => {
  const sidebar = document.createElement("aside");
  sidebar.className = "app-sidebar";
  sidebar.setAttribute("aria-label", "Asosiy navigatsiya");
  const visibleNavigationItems = getVisiblePages(role, navigationItems);

  sidebar.innerHTML = `
    <div class="app-sidebar__brand">
      <div class="app-sidebar__logo" aria-hidden="true">M</div>
      <div class="app-sidebar__title">
        <strong class="app-sidebar__name">MRMS</strong>
        <span class="app-sidebar__subtitle">Tibbiy boshqaruv</span>
      </div>
    </div>

    <nav class="app-sidebar__nav">
      ${visibleNavigationItems.map((item) => createNavLink(item, activeKey)).join("")}
    </nav>

    <div class="app-sidebar__footer">
      ${createNavLink(logoutItem, activeKey, "app-sidebar__logout")}
    </div>
  `;

  sidebar.querySelector('[data-nav-key="logout"]')?.addEventListener("click", (event) => {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent("mrms:logout"));
  });

  return sidebar;
};

export const mountSidebar = (target, options) => {
  const container = typeof target === "string" ? document.querySelector(target) : target;

  if (!container) {
    return null;
  }

  const sidebar = createSidebar(options);
  container.appendChild(sidebar);

  return sidebar;
};
import { getVisiblePages, ROLES } from "../config/permissions.js";
