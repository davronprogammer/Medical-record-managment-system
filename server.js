const app = require("./app");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`MRMS server is running on http://localhost:${PORT}`);
});

