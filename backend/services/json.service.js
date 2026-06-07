const fs = require("fs/promises");
const path = require("path");

// This helper builds the full path to a JSON file inside the data folder.
const dataPath = (fileName) => {
  return path.join(__dirname, "../../data", fileName);
};

const readData = async (fileName) => {
  try {
    const fileContent = await fs.readFile(dataPath(fileName), "utf8");

    // If the file exists but has no content, return an empty array.
    if (!fileContent.trim()) {
      return [];
    }

    return JSON.parse(fileContent);
  } catch (error) {
    // If reading fails, return an empty array so the app can continue safely.
    console.error(`Could not read ${fileName}:`, error.message);
    return [];
  }
};

const writeData = async (fileName, data) => {
  // The third argument formats the JSON with 2 spaces for readability.
  await fs.writeFile(dataPath(fileName), JSON.stringify(data, null, 2));
};

module.exports = {
  readData,
  writeData,
};
