const TOAST_CONTAINER_ID = "mrmsToastStack";
const DEFAULT_DURATION = 4200;

const toastMeta = {
  success: {
    label: "OK",
    title: "Amal bajarildi",
  },
  error: {
    label: "!",
    title: "Xatolik",
  },
  warning: {
    label: "!",
    title: "Ogohlantirish",
  },
  info: {
    label: "i",
    title: "Ma'lumot",
  },
};

const getToastContainer = () => {
  let container = document.querySelector(`#${TOAST_CONTAINER_ID}`);

  if (container) {
    return container;
  }

  container = document.createElement("div");
  container.id = TOAST_CONTAINER_ID;
  container.className = "toast-stack";
  container.setAttribute("aria-live", "polite");
  container.setAttribute("aria-atomic", "false");
  document.body.appendChild(container);

  return container;
};

const removeToast = (toast) => {
  toast.classList.add("is-leaving");

  window.setTimeout(() => {
    toast.remove();
  }, 220);
};

export const showToast = ({
  type = "info",
  title,
  message = "",
  duration = DEFAULT_DURATION,
} = {}) => {
  const meta = toastMeta[type] || toastMeta.info;
  const toast = document.createElement("article");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  const badge = document.createElement("span");
  badge.className = "toast__badge";
  badge.textContent = meta.label;

  const content = document.createElement("div");
  content.className = "toast__content";

  const heading = document.createElement("strong");
  heading.textContent = title || meta.title;
  content.appendChild(heading);

  if (message) {
    const text = document.createElement("p");
    text.textContent = message;
    content.appendChild(text);
  }

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "toast__close";
  closeButton.setAttribute("aria-label", "Xabarni yopish");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", () => removeToast(toast));

  toast.append(badge, content, closeButton);
  getToastContainer().appendChild(toast);

  window.requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  if (duration > 0) {
    window.setTimeout(() => removeToast(toast), duration);
  }

  return toast;
};
