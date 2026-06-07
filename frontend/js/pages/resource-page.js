import { ApiError } from "../api.js";
import { showToast } from "../components/toast.js";
import { canPerform } from "../config/permissions.js";

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

const normalizeList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const arrayValue = Object.values(payload).find(Array.isArray);
  return arrayValue || [];
};

const getErrorMessage = (error) => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Sessiya tugagan. Qayta kiring.";
    }

    if (error.status === 403) {
      return "Bu amal uchun ruxsat yo'q.";
    }
  }

  return error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi.";
};

const setStatus = (status, message = "", type = "info") => {
  status.textContent = message;
  status.className = `resource-status is-${type}`;
};

const createButton = (label, className, onClick) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
};

const buildOptionLabel = (item, labelField) => {
  if (typeof labelField === "function") {
    return labelField(item);
  }

  return item[labelField] ?? item.name ?? item.fullName ?? item.id;
};

const createChoiceControl = (field, value, lookups) => {
  const wrapper = createElement("fieldset", "resource-field resource-field--choice");
  const legend = createElement("legend", "resource-field__legend", field.label);
  const group = createElement("div", "resource-choice-group");
  const selectedValue = String(value?.[field.name] ?? "");
  const options = normalizeList(lookups[field.optionsKey] || []);

  options.forEach((item) => {
    const optionValue = String(item[field.valueField]);
    const choice = createElement("label", "resource-choice");
    const input = document.createElement("input");
    const marker = createElement("span", "resource-choice__marker");
    const text = createElement("span", "resource-choice__text", buildOptionLabel(item, field.labelField));

    input.type = field.type;
    input.name = field.name;
    input.value = optionValue;
    input.required = field.required !== false;
    input.checked = selectedValue === optionValue;

    choice.append(input, marker, text);
    group.appendChild(choice);
  });

  wrapper.append(legend, group);
  return wrapper;
};

const closeOpenSelects = (except = null) => {
  document.querySelectorAll(".resource-select.is-open").forEach((select) => {
    if (select !== except) {
      select.classList.remove("is-open");
      select.querySelector(".resource-select__button")?.setAttribute("aria-expanded", "false");
    }
  });
};

const createSelectControl = (field, value, lookups) => {
  const wrapper = createElement("div", "resource-field resource-field--select");
  const label = createElement("span", "", field.label);
  const control = createElement("div", "resource-select");
  const button = document.createElement("button");
  const valueText = createElement("span", "resource-select__value");
  const chevron = createElement("span", "resource-select__chevron");
  const menu = createElement("div", "resource-select__menu");
  const input = document.createElement("input");
  const options = normalizeList(lookups[field.optionsKey] || []);
  const selectedValue = String(value?.[field.name] ?? "");
  const placeholderText = field.placeholder || "Tanlang";

  control.dataset.name = field.name;
  button.type = "button";
  button.className = "resource-select__button";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  menu.setAttribute("role", "listbox");

  input.type = "hidden";
  input.name = field.name;

  const setSelected = (optionValue, optionLabel) => {
    input.value = optionValue;
    valueText.textContent = optionLabel;
    valueText.classList.toggle("is-placeholder", !optionValue);
    control.classList.remove("is-invalid");

    menu.querySelectorAll(".resource-select__option").forEach((option) => {
      const isSelected = option.dataset.value === optionValue;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", String(isSelected));
    });
  };

  const addOption = (optionValue, optionLabel) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "resource-select__option";
    option.dataset.value = optionValue;
    option.textContent = optionLabel;
    option.setAttribute("role", "option");
    option.addEventListener("click", () => {
      setSelected(optionValue, optionLabel);
      control.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      button.focus();
    });
    menu.appendChild(option);
  };

  addOption("", placeholderText);
  options.forEach((item) => {
    addOption(String(item[field.valueField]), buildOptionLabel(item, field.labelField));
  });

  const selectedItem = options.find((item) => String(item[field.valueField]) === selectedValue);
  setSelected(
    selectedItem ? selectedValue : "",
    selectedItem ? buildOptionLabel(selectedItem, field.labelField) : placeholderText
  );

  button.addEventListener("click", () => {
    const willOpen = !control.classList.contains("is-open");
    closeOpenSelects(control);
    control.classList.toggle("is-open", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("click", (event) => {
    if (!control.contains(event.target)) {
      control.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      control.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    }
  });

  button.append(valueText, chevron);
  control.append(button, menu, input);
  wrapper.append(label, control);

  return wrapper;
};

const createFormControl = (field, value, lookups) => {
  const wrapper = createElement("label", "resource-field");
  const label = createElement("span", "", field.label);
  let input;

  if (field.type === "radio") {
    return createChoiceControl(field, value, lookups);
  }

  if (field.type === "select") {
    return createSelectControl(field, value, lookups);
  } else if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = 4;
  } else {
    input = document.createElement("input");
    input.type = field.type || "text";
  }

  input.name = field.name;
  input.required = field.required !== false;
  input.value = value?.[field.name] ?? "";
  input.placeholder = field.placeholder || "";
  wrapper.append(label, input);

  return wrapper;
};

const readFormData = (form, fields) => {
  const formData = new FormData(form);

  return fields.reduce((payload, field) => {
    const rawValue = String(formData.get(field.name) || "").trim();
    payload[field.name] = field.number ? Number(rawValue) : rawValue;
    return payload;
  }, {});
};

const showPermissionToast = () => {
  showToast({
    type: "warning",
    title: "Ruxsat yo'q",
    message: "Bu amal faqat ruxsat berilgan role uchun ishlaydi.",
  });
};

export const createResourcePage = ({
  resource,
  title,
  subtitle,
  api,
  idField,
  columns,
  fields,
  searchPlaceholder,
  emptyText,
  loadLookups,
  enrich = (item) => item,
  profile,
}, { user } = {}) => {
  const role = user?.role;
  const canCreate = canPerform(role, resource, "create");
  const canUpdate = canPerform(role, resource, "update");
  const canDelete = canPerform(role, resource, "delete");
  const canViewProfile = profile && canPerform(role, resource, "profile");

  let records = [];
  let lookups = {};
  let editingRecord = null;

  const page = createElement("section", "resource-page animate-soft-in");
  const header = createElement("header", "resource-header");
  const headerText = createElement("div");
  headerText.append(createElement("h1", "", title), createElement("p", "", subtitle));

  header.appendChild(headerText);

  if (canCreate) {
    const addButton = createButton("Yangi qo'shish", "resource-button resource-button--primary", () => {
      openForm();
    });

    header.appendChild(addButton);
  }

  const toolbar = createElement("div", "resource-toolbar");
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.placeholder = searchPlaceholder || "Qidirish...";
  searchInput.className = "resource-search";
  toolbar.appendChild(searchInput);

  const status = createElement("p", "resource-status");
  const formPanel = createElement("section", "resource-form-panel");
  const tableWrap = createElement("div", "resource-table-wrap");

  page.append(header, toolbar, status, formPanel, tableWrap);

  const closeForm = () => {
    editingRecord = null;
    formPanel.replaceChildren();
    formPanel.classList.remove("is-open");
  };

  const renderForm = () => {
    formPanel.replaceChildren();
    formPanel.classList.add("is-open");

    const form = document.createElement("form");
    form.className = "resource-form";

    const formHeader = createElement("div", "resource-form__header");
    formHeader.append(
      createElement("h2", "", editingRecord ? "Yozuvni tahrirlash" : "Yangi yozuv"),
      createButton("Yopish", "resource-button", closeForm)
    );

    const grid = createElement("div", "resource-form__grid");
    fields.forEach((field) => grid.appendChild(createFormControl(field, editingRecord, lookups)));

    const actions = createElement("div", "resource-form__actions");
    actions.append(
      createButton("Bekor qilish", "resource-button", closeForm),
      createButton("Saqlash", "resource-button resource-button--primary", () => form.requestSubmit())
    );

    form.append(formHeader, grid, actions);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const missingSelect = fields.find((field) => {
        return field.type === "select" && field.required !== false && !String(formData.get(field.name) || "").trim();
      });

      if (missingSelect) {
        const select = form.querySelector(`.resource-select[data-name="${missingSelect.name}"]`);
        select?.classList.add("is-invalid");
        select?.querySelector(".resource-select__button")?.focus();
        setStatus(status, `${missingSelect.label} maydonini tanlang.`, "error");
        return;
      }

      const payload = readFormData(form, fields);
      const isEditing = Boolean(editingRecord);

      if ((isEditing && !canUpdate) || (!isEditing && !canCreate)) {
        showPermissionToast();
        return;
      }

      setStatus(status, "Saqlanmoqda...", "info");

      try {
        if (isEditing) {
          await api.update(editingRecord[idField], payload);
        } else {
          await api.create(payload);
        }

        closeForm();
        showToast({
          type: "success",
          title: isEditing ? "Yozuv yangilandi" : "Yangi yozuv qo'shildi",
          message: `${title} ro'yxati yangilandi.`,
        });
        await loadRecords("Ma'lumot saqlandi.", "success");
      } catch (error) {
        const message = getErrorMessage(error);
        setStatus(status, message, "error");
        showToast({
          type: "error",
          title: "Saqlash amalga oshmadi",
          message,
        });
      }
    });

    formPanel.appendChild(form);
  };

  function openForm(record = null) {
    if ((record && !canUpdate) || (!record && !canCreate)) {
      showPermissionToast();
      return;
    }

    editingRecord = record;
    renderForm();
  }

  const filterRecords = () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter((record) => {
      return Object.values(record).some((value) => String(value ?? "").toLowerCase().includes(query));
    });
  };

  const renderTable = () => {
    tableWrap.replaceChildren();
    const filteredRecords = filterRecords();

    if (!filteredRecords.length) {
      const empty = createElement("div", "resource-empty");
      empty.append(createElement("h2", "", "Ma'lumot topilmadi"), createElement("p", "", emptyText || "Hozircha yozuv yo'q."));
      tableWrap.appendChild(empty);
      return;
    }

    const table = createElement("table", "resource-table");
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    columns.forEach((column) => {
      const th = document.createElement("th");
      th.textContent = column.label;
      headRow.appendChild(th);
    });

    if (canUpdate || canDelete || canViewProfile) {
      const th = document.createElement("th");
      th.textContent = "Amallar";
      headRow.appendChild(th);
    }

    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    filteredRecords.forEach((record) => {
      const row = document.createElement("tr");
      columns.forEach((column) => {
        const td = document.createElement("td");
        td.textContent = column.render ? column.render(record, lookups) : record[column.key] ?? "-";
        row.appendChild(td);
      });

      if (canUpdate || canDelete || canViewProfile) {
        const actions = createElement("td", "resource-actions");

        if (canViewProfile) {
          actions.appendChild(createButton("Profil", "resource-button", () => profile.open(record)));
        }

        if (canUpdate) {
          actions.appendChild(createButton("Tahrirlash", "resource-button", () => openForm(record)));
        }

        if (canDelete) {
          actions.appendChild(createButton("O'chirish", "resource-button resource-button--danger", async () => {
            try {
              await api.remove(record[idField]);
              showToast({
                type: "success",
                title: "Yozuv o'chirildi",
                message: `${title} ro'yxati yangilandi.`,
              });
              await loadRecords("Yozuv o'chirildi.", "success");
            } catch (error) {
              const message = getErrorMessage(error);
              setStatus(status, message, "error");
              showToast({
                type: "error",
                title: "O'chirish amalga oshmadi",
                message,
              });
            }
          }));
        }

        row.appendChild(actions);
      }

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableWrap.appendChild(table);
  };

  async function loadRecords(message = "", type = "info") {
    setStatus(status, "Yuklanmoqda...", "info");

    try {
      if (loadLookups) {
        lookups = await loadLookups();
      }

      records = normalizeList(await api.list()).map((item) => enrich(item, lookups));
      renderTable();
      setStatus(status, message || `${records.length} ta yozuv yuklandi.`, type);
    } catch (error) {
      tableWrap.replaceChildren();
      const empty = createElement("div", "resource-empty");
      empty.append(createElement("h2", "", "Xatolik"), createElement("p", "", getErrorMessage(error)));
      tableWrap.appendChild(empty);
      setStatus(status, getErrorMessage(error), "error");
    }
  }

  searchInput.addEventListener("input", renderTable);
  loadRecords();

  return page;
};
