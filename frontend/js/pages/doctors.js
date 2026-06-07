import { departmentsApi, doctorsApi } from "../api.js";
import { createResourcePage } from "./resource-page.js";

const asList = (value) => Array.isArray(value) ? value : Object.values(value || {}).find(Array.isArray) || [];

const findDepartmentName = (departmentId, lookups) => {
  const department = asList(lookups.departments).find((item) => Number(item.departmentId) === Number(departmentId));
  return department?.name || "-";
};

export const renderDoctors = (context) => {
  return createResourcePage({
    resource: "doctors",
    title: "Shifokorlar",
    subtitle: "Mutaxassislar, ularning bo'limlari va aloqa ma'lumotlari",
    api: doctorsApi,
    idField: "doctorId",
    searchPlaceholder: "Shifokor ismi, mutaxassisligi yoki telefon bo'yicha qidirish...",
    emptyText: "Hozircha shifokorlar kiritilmagan.",
    loadLookups: async () => ({
      departments: await departmentsApi.list(),
    }),
    columns: [
      { key: "doctorId", label: "ID" },
      { key: "fullName", label: "F.I.Sh." },
      { key: "specialization", label: "Mutaxassislik" },
      { key: "departmentId", label: "Bo'lim", render: (record, lookups) => findDepartmentName(record.departmentId, lookups) },
      { key: "phone", label: "Telefon" },
      { key: "email", label: "Email" },
    ],
    fields: [
      { name: "fullName", label: "F.I.Sh.", placeholder: "Dr. Aziz Aliyev" },
      { name: "specialization", label: "Mutaxassislik", placeholder: "Kardiolog" },
      {
        name: "departmentId",
        label: "Bo'lim",
        type: "select",
        number: true,
        optionsKey: "departments",
        valueField: "departmentId",
        labelField: "name",
      },
      { name: "phone", label: "Telefon", type: "tel", placeholder: "+998 90 123 45 67" },
      { name: "email", label: "Email", type: "email", placeholder: "doctor@example.com" },
    ],
  }, context);
};
