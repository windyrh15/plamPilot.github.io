// upload-worker.js
self.addEventListener("message", async function (e) {
  const files = e.data;
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/upload_images", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    self.postMessage({ success: true, result: result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
});
