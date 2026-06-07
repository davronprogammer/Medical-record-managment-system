import { dashboardApi } from "../api.js";
import { ROLE_LABELS } from "../config/permissions.js";

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

const asList = (value) => Array.isArray(value) ? value : Object.values(value || {}).find(Array.isArray) || [];

const statValue = (stats, keys) => {
  const key = keys.find((item) => stats?.[item] !== undefined);
  return key ? stats[key] : 0;
};

const createStatCard = ({ title, value, description }) => {
  const card = createElement("article", "stat-card");
  card.append(
    createElement("span", "", title),
    createElement("strong", "", String(value)),
    createElement("p", "", description)
  );

  return card;
};

const createHeading = (title, subtitle) => {
  const heading = createElement("div", "card-heading");
  const text = createElement("div");

  text.append(createElement("h2", "", title), createElement("p", "", subtitle));
  heading.append(text);

  return heading;
};

const createSummaryRow = (label, value) => {
  const row = createElement("div", "summary-row");
  row.append(createElement("span", "", label), createElement("strong", "", String(value)));
  return row;
};

const createTimelineItem = (title, meta) => {
  const item = createElement("div", "timeline-item");
  const marker = createElement("span");
  const content = createElement("div");

  content.append(createElement("p", "", title), createElement("time", "", meta));
  item.append(marker, content);

  return item;
};

const formatDate = () => {
  return new Intl.DateTimeFormat("uz-UZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
};

const roleSubtitle = (role) => {
  if (role === "ADMIN") {
    return "Klinika faoliyati, foydalanuvchi ruxsatlari va asosiy yozuvlar nazorati";
  }

  if (role === "CLINICIAN") {
    return "Bemor profillari, tashxis yozuvlari va klinik kuzatuvlar";
  }

  return "Qabul jarayoni, bemorlar ro'yxati va tezkor ma'lumotlar";
};

const renderStats = (target, stats) => {
  target.replaceChildren();
  [
    { title: "Shifokorlar", value: statValue(stats, ["doctors", "doctorCount", "totalDoctors"]), description: "Faol mutaxassislar" },
    { title: "Bemorlar", value: statValue(stats, ["patients", "patientCount", "totalPatients"]), description: "Ro'yxatdan o'tgan" },
    { title: "Tashxislar", value: statValue(stats, ["diseases", "diseaseCount", "totalDiseases"]), description: "Tashxis yozuvlari" },
    { title: "Bo'limlar", value: statValue(stats, ["departments", "departmentCount", "totalDepartments"]), description: "Klinika bo'limlari" },
  ].forEach((item) => target.append(createStatCard(item)));
};

const renderRecentPatients = (target, patients) => {
  target.replaceChildren();
  const list = asList(patients);

  if (!list.length) {
    target.appendChild(createElement("p", "", "So'nggi bemorlar topilmadi."));
    return;
  }

  list.slice(0, 6).forEach((patient) => {
    target.append(createTimelineItem(patient.fullName || "Nomsiz bemor", patient.phone || patient.address || "Yangi yozuv"));
  });
};

const renderRecentDiseases = (target, diseases) => {
  target.replaceChildren();
  const list = asList(diseases);

  if (!list.length) {
    target.appendChild(createElement("p", "", "So'nggi tashxis yozuvlari topilmadi."));
    return;
  }

  list.slice(0, 4).forEach((disease) => {
    target.append(createSummaryRow(disease.icdCode || "ICD", disease.description || "-"));
  });
};

export const renderDashboard = ({ user } = {}) => {
  const page = createElement("section", "dashboard-page animate-soft-in");
  page.setAttribute("aria-label", "Boshqaruv paneli");

  const header = createElement("header", "dashboard-header");
  const headerText = createElement("div");
  const meta = createElement("div", "dashboard-header__meta");

  headerText.append(
    createElement("h1", "", "Boshqaruv paneli"),
    createElement("p", "", roleSubtitle(user?.role))
  );
  meta.append(createElement("span", "", formatDate()), createElement("strong", "", ROLE_LABELS[user?.role] || "Foydalanuvchi"));
  header.append(headerText, meta);

  const stats = createElement("section", "stats-grid");
  stats.setAttribute("aria-label", "Asosiy ko'rsatkichlar");
  stats.append(
    createStatCard({ title: "Yuklanmoqda", value: "...", description: "Backenddan ma'lumot olinmoqda" }),
    createStatCard({ title: "Yuklanmoqda", value: "...", description: "Backenddan ma'lumot olinmoqda" }),
    createStatCard({ title: "Yuklanmoqda", value: "...", description: "Backenddan ma'lumot olinmoqda" }),
    createStatCard({ title: "Yuklanmoqda", value: "...", description: "Backenddan ma'lumot olinmoqda" })
  );

  const middle = createElement("section", "dashboard-grid");
  const recentPatientsCard = createElement("article", "dashboard-card activity-card");
  const recentPatients = createElement("div", "timeline");
  recentPatients.appendChild(createElement("p", "", "Yuklanmoqda..."));
  recentPatientsCard.append(createHeading("So'nggi bemorlar", "Qabul va ro'yxatdan o'tkazish"), recentPatients);

  const recentDiseasesCard = createElement("aside", "dashboard-card today-card");
  const recentDiseases = createElement("div", "summary-list");
  recentDiseases.appendChild(createElement("p", "", "Yuklanmoqda..."));
  recentDiseasesCard.append(createHeading("So'nggi tashxislar", "Klinik yozuvlar"), recentDiseases);
  middle.append(recentPatientsCard, recentDiseasesCard);

  const status = createElement("p", "resource-status");
  page.append(header, stats, middle, status);

  Promise.all([
    dashboardApi.stats(),
    dashboardApi.recentPatients(),
    dashboardApi.recentDiseases(),
  ])
    .then(([statsPayload, patientsPayload, diseasesPayload]) => {
      renderStats(stats, statsPayload);
      renderRecentPatients(recentPatients, patientsPayload);
      renderRecentDiseases(recentDiseases, diseasesPayload);
      status.textContent = "Dashboard ma'lumotlari yangilandi.";
      status.classList.add("is-success");
    })
    .catch((error) => {
      status.textContent = error.message || "Dashboard ma'lumotlarini yuklashda xatolik yuz berdi.";
      status.classList.add("is-error");
    });

  return page;
};
