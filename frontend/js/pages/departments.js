import { departmentsApi } from "../api.js";
import { createResourcePage } from "./resource-page.js";

export const renderDepartments = (context) => {
  return createResourcePage({
    resource: "departments",
    title: "Bo'limlar",
    subtitle: "Klinika bo'limlari ro'yxati va boshqaruvi",
    api: departmentsApi,
    idField: "departmentId",
    searchPlaceholder: "Bo'lim nomi bo'yicha qidirish...",
    emptyText: "Hozircha bo'limlar kiritilmagan.",
    columns: [
      { key: "departmentId", label: "ID" },
      { key: "name", label: "Bo'lim nomi" },
    ],
    fields: [
      { name: "name", label: "Bo'lim nomi", placeholder: "Masalan: Kardiologiya" },
    ],
  }, context);
};
