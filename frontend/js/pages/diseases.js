import { diseasesApi, patientsApi } from "../api.js";
import { createResourcePage } from "./resource-page.js";

const asList = (value) => Array.isArray(value) ? value : Object.values(value || {}).find(Array.isArray) || [];

const findPatientName = (patientId, lookups) => {
  const patient = asList(lookups.patients).find((item) => Number(item.patientId) === Number(patientId));
  return patient?.fullName || "-";
};

export const renderDiseases = (context) => {
  return createResourcePage({
    resource: "diseases",
    title: "Tashxislar",
    subtitle: "ICD kodlar, tashxis tavsiflari va bemorlarga bog'langan yozuvlar",
    api: diseasesApi,
    idField: "diseaseId",
    searchPlaceholder: "ICD kodi, tavsif yoki bemor bo'yicha qidirish...",
    emptyText: "Hozircha tashxis yozuvlari kiritilmagan.",
    loadLookups: async () => ({
      patients: await patientsApi.list(),
    }),
    columns: [
      { key: "diseaseId", label: "ID" },
      { key: "patientId", label: "Bemor", render: (record, lookups) => findPatientName(record.patientId, lookups) },
      { key: "icdCode", label: "ICD kod" },
      { key: "description", label: "Tavsif" },
    ],
    fields: [
      {
        name: "patientId",
        label: "Bemor",
        type: "select",
        number: true,
        optionsKey: "patients",
        valueField: "patientId",
        labelField: "fullName",
      },
      { name: "icdCode", label: "ICD kod", placeholder: "I10" },
      { name: "description", label: "Tavsif", type: "textarea", placeholder: "Tashxis tavsifi" },
    ],
  }, context);
};
