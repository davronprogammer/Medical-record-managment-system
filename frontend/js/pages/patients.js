import { doctorsApi, patientsApi } from "../api.js";
import { createResourcePage } from "./resource-page.js";

const asList = (value) => Array.isArray(value) ? value : Object.values(value || {}).find(Array.isArray) || [];

const findDoctorName = (doctorId, lookups) => {
  const doctor = asList(lookups.doctors).find((item) => Number(item.doctorId) === Number(doctorId));
  return doctor?.fullName || "-";
};

const valueOrDash = (value) => value || "-";

const openPatientProfile = async (record) => {
  const existing = document.querySelector(".profile-drawer");

  if (existing) {
    existing.remove();
  }

  const drawer = document.createElement("aside");
  drawer.className = "profile-drawer";
  drawer.innerHTML = `
    <div class="profile-drawer__panel">
      <div class="profile-drawer__header">
        <div>
          <span>Bemor profili</span>
          <h2>${record.fullName}</h2>
        </div>
        <button type="button" class="resource-button">Yopish</button>
      </div>
      <p class="resource-status">Profil yuklanmoqda...</p>
    </div>
  `;

  drawer.querySelector("button").addEventListener("click", () => drawer.remove());
  document.body.appendChild(drawer);

  try {
    const profile = await patientsApi.profile(record.patientId);
    const patient = profile.patient || profile;
    const doctor = profile.doctor || profile.assignedDoctor || {};
    const department = profile.department || {};
    const diseases = asList(profile.diseases);
    const panel = drawer.querySelector(".profile-drawer__panel");

    panel.innerHTML = `
      <div class="profile-drawer__header">
        <div>
          <span>Bemor profili</span>
          <h2>${valueOrDash(patient.fullName)}</h2>
        </div>
        <button type="button" class="resource-button">Yopish</button>
      </div>

      <div class="profile-grid">
        <div><span>Yosh</span><strong>${valueOrDash(patient.age)}</strong></div>
        <div><span>Jinsi</span><strong>${valueOrDash(patient.gender)}</strong></div>
        <div><span>Telefon</span><strong>${valueOrDash(patient.phone)}</strong></div>
        <div><span>Manzil</span><strong>${valueOrDash(patient.address)}</strong></div>
        <div><span>Shifokor</span><strong>${valueOrDash(doctor.fullName)}</strong></div>
        <div><span>Bo'lim</span><strong>${valueOrDash(department.name)}</strong></div>
      </div>

      <div class="profile-section">
        <h3>Tashxis yozuvlari</h3>
        ${
          diseases.length
            ? diseases.map((disease) => `
                <article>
                  <strong>${valueOrDash(disease.icdCode)}</strong>
                  <p>${valueOrDash(disease.description)}</p>
                </article>
              `).join("")
            : "<p>Tashxis yozuvlari topilmadi.</p>"
        }
      </div>
    `;

    panel.querySelector("button").addEventListener("click", () => drawer.remove());
  } catch (error) {
    drawer.querySelector(".resource-status").textContent = error.message || "Profilni yuklashda xatolik yuz berdi.";
    drawer.querySelector(".resource-status").classList.add("is-error");
  }
};

export const renderPatients = (context) => {
  return createResourcePage({
    resource: "patients",
    title: "Bemorlar",
    subtitle: "Bemorlar ro'yxati, qabul ma'lumotlari va biriktirilgan shifokorlar",
    api: patientsApi,
    idField: "patientId",
    searchPlaceholder: "Bemor ismi, telefon yoki manzil bo'yicha qidirish...",
    emptyText: "Hozircha bemorlar kiritilmagan.",
    loadLookups: async () => ({
      doctors: await doctorsApi.list(),
      genders: [
        { value: "Erkak", label: "Erkak" },
        { value: "Ayol", label: "Ayol" },
      ],
    }),
    profile: {
      open: openPatientProfile,
    },
    columns: [
      { key: "patientId", label: "ID" },
      { key: "fullName", label: "F.I.Sh." },
      { key: "age", label: "Yosh" },
      { key: "gender", label: "Jinsi" },
      { key: "phone", label: "Telefon" },
      { key: "doctorId", label: "Shifokor", render: (record, lookups) => findDoctorName(record.doctorId, lookups) },
    ],
    fields: [
      { name: "fullName", label: "F.I.Sh.", placeholder: "Malika Rahimova" },
      { name: "age", label: "Yosh", type: "number", number: true, placeholder: "35" },
      {
        name: "gender",
        label: "Jinsi",
        type: "radio",
        optionsKey: "genders",
        valueField: "value",
        labelField: "label",
      },
      { name: "phone", label: "Telefon", type: "tel", placeholder: "+998 90 123 45 67" },
      { name: "address", label: "Manzil", placeholder: "Toshkent shahri" },
      {
        name: "doctorId",
        label: "Biriktirilgan shifokor",
        type: "select",
        number: true,
        optionsKey: "doctors",
        valueField: "doctorId",
        labelField: "fullName",
      },
    ],
  }, context);
};
