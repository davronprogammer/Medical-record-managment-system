const renderNameByPage = (pageName) => {
  return `render${pageName.charAt(0).toUpperCase()}${pageName.slice(1)}`;
};

const createMissingPage = () => {
  const section = document.createElement("section");
  section.className = "page-state";

  const content = document.createElement("div");
  content.className = "page-state__content";

  const title = document.createElement("h1");
  title.textContent = "Sahifa topilmadi";

  const description = document.createElement("p");
  description.textContent = "So'ralgan sahifa uchun modul mavjud emas.";

  content.append(title, description);
  section.append(content);

  return section;
};

export const renderCurrentPage = async (container, pageName = "dashboard", context = {}) => {
  try {
    const module = await import(`./pages/${pageName}.js`);
    const render = module[renderNameByPage(pageName)];
    const content = typeof render === "function" ? await render(context) : createMissingPage();

    container.replaceChildren(content);
    container.focus({ preventScroll: true });
  } catch (error) {
    container.replaceChildren(createMissingPage());
  }
};
