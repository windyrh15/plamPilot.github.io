const apiGetTotalBoundingBoxes = fetch(
  "http://127.0.0.1:5000/get_total_bounding_boxes", // Ganti URL jika API berada di server yang berbeda
  {
    method: "GET",
    redirect: "follow",
  }
)
  .then((response) => response.json()) // Pastikan response diubah menjadi JSON
  .then((result) => {
    // Update elemen HTML dengan data dari API
    document.getElementById("bounding-box-count").textContent =
      result.total_bounding_boxes_all_images;
  })
  .catch((error) =>
    console.error("Error fetching total bounding boxes:", error)
  );

// Panggil fungsi fetch API
apiGetTotalBoundingBoxes;
