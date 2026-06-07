const generateId = (data, fieldName) => {
  // If there are no records yet, the first id should be 1.
  if (data.length === 0) {
    return 1;
  }

  // Find the biggest id in the selected field, then add 1.
  const highestId = Math.max(...data.map((item) => item[fieldName]));

  return highestId + 1;
};

module.exports = {
  generateId,
};
