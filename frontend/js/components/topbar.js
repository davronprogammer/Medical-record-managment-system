const formatUzbekDate = (date = new Date()) => {
  return new Intl.DateTimeFormat("uz-UZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const getInitials = (fullName) => {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const createIcon = (path) => {
  return `
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="${path}"></path>
    </svg>
  `;
};

const icons = {
  menu: "M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z",
  search: "M10.5 4a6.5 6.5 0 0 1 5.17 10.44l4.2 4.2-1.41 1.41-4.2-4.2A6.5 6.5 0 1 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z",
  bell: "M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z",
};

export const createTopbar = ({
  user = {
    fullName: "Admin foydalanuvchi",
    role: "ADMIN",
  },
  searchPlaceholder = "Qidirish...",
} = {}) => {
  const topbar = document.createElement("header");
  topbar.className = "app-topbar";

  topbar.innerHTML = `
    <div class="app-topbar__left">
      <button class="app-topbar__toggle" type="button" aria-label="Yon menyuni ochish">
        ${createIcon(icons.menu)}
      </button>

      <div class="app-topbar__search" role="search" aria-label="Umumiy qidirish">
        <span class="app-topbar__search-icon">${createIcon(icons.search)}</span>
        <input class="app-topbar__search-input" type="search" placeholder="${searchPlaceholder}" autocomplete="off" aria-label="Umumiy qidirish" aria-expanded="false" aria-controls="globalSearchResults">
        <div class="app-global-search" id="globalSearchResults" hidden></div>
      </div>
    </div>

    <div class="app-topbar__right">
      <time class="app-topbar__date">${formatUzbekDate()}</time>

      <button class="app-topbar__notification" type="button" aria-label="Bildirishnomalar">
        ${createIcon(icons.bell)}
      </button>

      <div class="app-topbar__user">
        <div class="app-topbar__avatar" aria-hidden="true">${getInitials(user.fullName)}</div>
        <div class="app-topbar__user-meta">
          <strong class="app-topbar__user-name">${user.fullName}</strong>
          <span class="app-topbar__user-role">${user.role}</span>
        </div>
      </div>
    </div>
  `;

  topbar.querySelector(".app-topbar__toggle").addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("mrms:sidebar-toggle"));
  });

  return topbar;
};

export const mountTopbar = (target, options) => {
  const container = typeof target === "string" ? document.querySelector(target) : target;

  if (!container) {
    return null;
  }

  const topbar = createTopbar(options);
  container.appendChild(topbar);

  return topbar;
};
