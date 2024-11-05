// result-worker.js
self.addEventListener("message", async function (e) {
  if (e.data === "fetch_results") {
    try {
      const response = await fetch("http://127.0.0.1:5000/get_results", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      self.postMessage({ success: true, data: result });
    } catch (error) {
      self.postMessage({ success: false, error: error.message });
    }
  }
});
