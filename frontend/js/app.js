import { createSidebar } from "./components/sidebar.js";
import { createTopbar } from "./components/topbar.js";
import { renderCurrentPage } from "./router.js";
import { requireAuth } from "./auth.js";
import { departmentsApi, diseasesApi, doctorsApi, patientsApi } from "./api.js";
import { canAccessPage, ROLE_LABELS } from "./config/permissions.js";

const app = document.querySelector("#app");

const stylesheets = [
  "css/app.css",
];

const pageTitles = {
  dashboard: "Boshqaruv paneli",
  doctors: "Shifokorlar",
  patients: "Bemorlar",
  diseases: "Tashxislar",
  departments: "Bo'limlar",
  settings: "Sozlamalar",
};

const searchResources = [
  {
    page: "patients",
    label: "Bemor",
    api: patientsApi,
    fields: ["fullName", "phone", "address", "gender", "age", "patientId"],
    title: (record) => record.fullName || "Nomsiz bemor",
    meta: (record) => [record.phone, record.address].filter(Boolean).join(" · ") || "Bemor ma'lumoti",
  },
  {
    page: "doctors",
    label: "Shifokor",
    api: doctorsApi,
    fields: ["fullName", "specialization", "phone", "email", "doctorId"],
    title: (record) => record.fullName || "Nomsiz shifokor",
    meta: (record) => [record.specialization, record.phone].filter(Boolean).join(" · ") || "Shifokor ma'lumoti",
  },
  {
    page: "departments",
    label: "Bo'lim",
    api: departmentsApi,
    fields: ["name", "departmentId"],
    title: (record) => record.name || "Nomsiz bo'lim",
    meta: (record) => record.departmentId ? `ID: ${record.departmentId}` : "Klinika bo'limi",
  },
  {
    page: "diseases",
    label: "Tashxis",
    api: diseasesApi,
    fields: ["icdCode", "description", "diseaseId", "patientId"],
    title: (record) => record.icdCode || "ICD kodi yo'q",
    meta: (record) => record.description || "Tashxis yozuvi",
  },
];

const getPageFromPathname = (pathname = window.location.pathname) => {
  const fileName = pathname.split("/").pop() || "";
  const page = fileName.replace(".html", "");

  return pageTitles[page] ? page : "dashboard";
};

const getAssetPrefix = () => {
  return window.location.pathname.includes("/pages/") ? "../" : "./";
};

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

const createPageHref = (page) => new URL(`pages/${page}.html`, getAppRootHref()).href;

const normalizeList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  return Object.values(payload).find(Array.isArray) || [];
};

const findDoctorProfile = async (user) => {
  if (user?.role !== "CLINICIAN") {
    return null;
  }

  try {
    const doctors = normalizeList(await doctorsApi.list());
    const doctor = doctors.find((item) => {
      return Number(item.doctorId) === Number(user.doctorId);
    }) || doctors.find((item) => {
      const fullName = String(item.fullName || "").toLowerCase();
      const username = String(user.username || "").toLowerCase();
      const userFullName = String(user.fullName || "").toLowerCase();

      return fullName === userFullName || fullName.includes(username);
    });

    if (!doctor) {
      return null;
    }

    const departments = normalizeList(await departmentsApi.list());
    const department = departments.find((item) => {
      return Number(item.departmentId) === Number(doctor.departmentId);
    });

    return {
      ...doctor,
      departmentName: department?.name || "",
    };
  } catch {
    return null;
  }
};

const buildTopbarUser = async (user) => {
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || "Foydalanuvchi";
  const doctor = await findDoctorProfile(user);
  const fullName = doctor?.fullName || user?.fullName || user?.username || "MRMS foydalanuvchi";
  const details = [
    { label: "Login", value: user?.username },
    { label: "Rol", value: roleLabel },
    { label: "Bo'lim", value: doctor?.departmentName || user?.department },
    { label: "Telefon raqam", value: doctor?.phone || user?.phone },
    { label: "Email", value: doctor?.email || user?.email },
  ];

  return {
    fullName,
    role: roleLabel,
    details,
  };
};

const recordMatchesQuery = (record, fields, query) => {
  return fields.some((field) => {
    return String(record?.[field] ?? "").toLowerCase().includes(query);
  });
};

const createSearchResult = (result) => {
  const link = document.createElement("a");
  link.className = "app-global-search__result";
  link.href = result.href;
  link.dataset.page = result.page;

  const badge = document.createElement("span");
  badge.className = "app-global-search__badge";
  badge.textContent = result.label;

  const content = document.createElement("span");
  content.className = "app-global-search__content";

  const title = document.createElement("strong");
  title.textContent = result.title;

  const meta = document.createElement("small");
  meta.textContent = result.meta;

  content.append(title, meta);
  link.append(badge, content);

  return link;
};

const renderSearchMessage = (panel, message, className = "") => {
  panel.replaceChildren();
  const state = document.createElement("p");
  state.className = `app-global-search__state ${className}`.trim();
  state.textContent = message;
  panel.appendChild(state);
};

const setSearchOpen = (input, panel, isOpen) => {
  panel.hidden = !isOpen;
  input.setAttribute("aria-expanded", String(isOpen));
};

const bindGlobalSearch = (shell, user) => {
  const input = shell.querySelector(".app-topbar__search-input");
  const panel = shell.querySelector(".app-global-search");

  if (!input || !panel) {
    return;
  }

  const allowedResources = searchResources.filter((resource) => {
    return canAccessPage(user.role, resource.page);
  });

  const cache = new Map();
  let debounceTimer = null;
  let requestId = 0;

  const loadResource = async (resource) => {
    if (!cache.has(resource.page)) {
      const request = resource.api.list().then(normalizeList).catch((error) => {
        cache.delete(resource.page);
        throw error;
      });

      cache.set(resource.page, request);
    }

    return cache.get(resource.page);
  };

  const search = async () => {
    const query = input.value.trim().toLowerCase();
    const currentRequestId = ++requestId;

    if (!query) {
      setSearchOpen(input, panel, false);
      panel.replaceChildren();
      return;
    }

    if (query.length < 2) {
      renderSearchMessage(panel, "Qidirish uchun kamida 2 ta belgi kiriting.");
      setSearchOpen(input, panel, true);
      return;
    }

    renderSearchMessage(panel, "Qidirilmoqda...");
    setSearchOpen(input, panel, true);

    try {
      const lists = await Promise.all(allowedResources.map(async (resource) => {
        const records = await loadResource(resource);
        return { resource, records };
      }));

      if (currentRequestId !== requestId) {
        return;
      }

      const results = lists.flatMap(({ resource, records }) => {
        return records
          .filter((record) => recordMatchesQuery(record, resource.fields, query))
          .slice(0, 4)
          .map((record) => ({
            page: resource.page,
            label: resource.label,
            href: createPageHref(resource.page),
            title: resource.title(record),
            meta: resource.meta(record),
          }));
      }).slice(0, 10);

      panel.replaceChildren();

      if (!results.length) {
        renderSearchMessage(panel, "Mos ma'lumot topilmadi.", "is-empty");
        return;
      }

      const heading = document.createElement("div");
      heading.className = "app-global-search__heading";
      heading.textContent = `${results.length} ta natija`;
      panel.appendChild(heading);
      results.forEach((result) => panel.appendChild(createSearchResult(result)));
    } catch (error) {
      if (currentRequestId !== requestId) {
        return;
      }

      renderSearchMessage(panel, error.message || "Qidirish vaqtida xatolik yuz berdi.", "is-error");
    }
  };

  input.addEventListener("input", () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(search, 240);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) {
      search();
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = "";
      setSearchOpen(input, panel, false);
      panel.replaceChildren();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;

    if (!target || shell.contains(target) && target.closest(".app-topbar__search")) {
      return;
    }

    setSearchOpen(input, panel, false);
  });
};

const loadStylesheets = () => {
  const prefix = getAssetPrefix();

  stylesheets.forEach((href) => {
    const fullHref = `${prefix}${href}`;
    const exists = [...document.styleSheets].some((sheet) => {
      return sheet.href && sheet.href.endsWith(href);
    });

    if (exists) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fullHref;
    document.head.appendChild(link);
  });
};

const getCurrentPage = () => {
  const bodyPage = document.body.dataset.page;

  if (pageTitles[bodyPage]) {
    return bodyPage;
  }

  return getPageFromPathname();
};

const setDocumentPage = (page) => {
  document.body.dataset.page = page;
  document.title = `MRMS | ${pageTitles[page] || pageTitles.dashboard}`;
};

const setActiveNavigation = (shell, page) => {
  shell.querySelectorAll(".app-sidebar__link[data-nav-key]").forEach((link) => {
    const isActive = link.dataset.navKey === page;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
      return;
    }

    link.removeAttribute("aria-current");
  });
};

const closeMobileSidebar = (shell) => {
  if (window.matchMedia("(max-width: 920px)").matches) {
    shell.classList.remove("is-sidebar-open");
  }
};

const createAppLayout = (user, topbarUser) => {
  const currentPage = getCurrentPage();
  const role = user?.role;

  const shell = document.createElement("div");
  shell.className = "app-shell";
  shell.id = "appShell";

  const sidebar = createSidebar({ activeKey: currentPage, role });

  const content = document.createElement("div");
  content.className = "app-content";

  const topbar = createTopbar({
    user: topbarUser,
    searchPlaceholder: "Bemor, shifokor, bo'lim yoki tashxis qidirish...",
  });

  const main = document.createElement("main");
  main.className = "app-main";
  main.id = "page-content";
  main.setAttribute("tabindex", "-1");

  content.append(topbar, main);
  shell.append(sidebar, content);

  return { shell, main };
};

const bindLayoutEvents = (shell, main, user) => {
  window.addEventListener("mrms:sidebar-toggle", () => {
    if (window.matchMedia("(max-width: 920px)").matches) {
      shell.classList.toggle("is-sidebar-open");
      return;
    }

    shell.classList.toggle("is-sidebar-collapsed");
  });

  const navigate = async (page, url, { replace = false } = {}) => {
    if (!pageTitles[page]) {
      page = "dashboard";
    }

    if (!canAccessPage(user.role, page)) {
      page = "dashboard";
      url = new URL("dashboard.html", window.location.href).href;
      replace = true;
    }

    setDocumentPage(page);
    setActiveNavigation(shell, page);

    if (url) {
      const method = replace ? "replaceState" : "pushState";
      window.history[method]({ page }, "", url);
    }

    await renderCurrentPage(main, page, { user });
    closeMobileSidebar(shell);
  };

  shell.addEventListener("click", async (event) => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    const searchLink = target?.closest(".app-global-search__result[data-page]");

    if (searchLink && shell.contains(searchLink)) {
      event.preventDefault();
      await navigate(searchLink.dataset.page, searchLink.href);
      const searchInput = shell.querySelector(".app-topbar__search-input");
      const searchPanel = shell.querySelector(".app-global-search");
      searchInput.value = "";
      searchPanel.replaceChildren();
      setSearchOpen(searchInput, searchPanel, false);
      return;
    }

    const link = target?.closest(".app-sidebar__link[data-nav-key]");

    if (!link || !shell.contains(link)) {
      return;
    }

    const page = link.dataset.navKey;

    if (!pageTitles[page]) {
      return;
    }

    event.preventDefault();

    if (page === getCurrentPage() && link.href === window.location.href) {
      closeMobileSidebar(shell);
      return;
    }

    await navigate(page, link.href);
  });

  window.addEventListener("popstate", async (event) => {
    const page = event.state?.page || getPageFromPathname();
    await navigate(page);
  });
};

const initApp = async () => {
  if (!app) {
    return;
  }

  loadStylesheets();

  const user = await requireAuth();

  if (!user) {
    return;
  }

  let page = getCurrentPage();
  let initialUrl = window.location.href;

  if (!canAccessPage(user.role, page)) {
    page = "dashboard";
    initialUrl = new URL("dashboard.html", window.location.href).href;
  }

  setDocumentPage(page);

  const topbarUser = await buildTopbarUser(user);
  const { shell, main } = createAppLayout(user, topbarUser);

  app.replaceChildren(shell);
  bindLayoutEvents(shell, main, user);
  bindGlobalSearch(shell, user);

  setDocumentPage(page);
  setActiveNavigation(shell, page);
  window.history.replaceState({ page }, "", initialUrl);
  await renderCurrentPage(main, page, { user });
};

initApp();
