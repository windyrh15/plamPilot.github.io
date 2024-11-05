// Worker -----------------------------------

let uploadWorker;
let resultWorker;
let downloadWorker;

if (window.Worker) {
  uploadWorker = new Worker("script/uploadImg_worker.js");
  resultWorker = new Worker("script/result-worker.js");
  downloadWorker = new Worker("script/download-worker.js");
}

// ------------------------------------------

$(document).ready(function () {
  // Handle sidebar link clicks
  $("#sidebar a").click(function (e) {
    e.preventDefault();
    var target = $(this).data("target");
    if (target && $("#" + target).length) {
      $("section").addClass("hidden");
      $("#" + target).removeClass("hidden");

      // Hide all hero sections and footer
      $(".relative").hide();
      $("#footer").hide();

      // Show the correct hero section and footer
      if (target === "home") {
        $("#hero-home").show();
      } else if (target === "about") {
        $("#hero-about").show();
      } else if (target === "product") {
        $("#footer").show();
      }

      // Update the URL without reloading the page
      history.pushState(null, null, "#" + target);

      // Close the sidebar after clicking a link
      $("#sidebar").css("display", "none");
    } else {
      console.error("Invalid target or missing section for target: " + target);
    }
  });

  // Handle navigation link clicks
  $(".nav-link").click(function (e) {
    e.preventDefault();
    var target = $(this).data("target");
    if (target && $("#" + target).length) {
      $("section").addClass("hidden");
      $("#" + target).removeClass("hidden");

      // Hide all hero sections and footer
      $(".relative").hide();
      $("#footer").hide();

      // Show the correct hero section and footer
      if (target === "home") {
        $("#hero-home").show();
      } else if (target === "about") {
        $("#hero-about").show();
      } else if (target === "product") {
        $("#footer").show();
      }

      // Update the URL without reloading the page
      history.pushState(null, null, "#" + target);
    } else {
      console.error("Invalid target or missing section for target: " + target);
    }
  });

  // Handle browser back/forward navigation
  $(window).on("popstate", function () {
    var hash = location.hash.substring(1);
    if (hash && $("#" + hash).length) {
      $("section").addClass("hidden");
      $("#" + hash).removeClass("hidden");

      // Hide all hero sections and footer
      $(".relative").hide();
      $("#footer").hide();

      // Show the correct hero section and footer
      if (hash === "home") {
        $("#hero-home").show();
      } else if (hash === "about") {
        $("#hero-about").show();
      } else if (hash === "product") {
        $("#footer").show();
      }
    } else {
      console.error("Invalid hash or missing section for hash: " + hash);
    }
  });

  // Initialize the page based on the current URL hash
  var initialHash = location.hash.substring(1) || "home";
  if (initialHash && $("#" + initialHash).length) {
    $("section").addClass("hidden");
    $("#" + initialHash).removeClass("hidden");

    // Hide all hero sections and footer
    $(".relative").hide();
    $("#footer").hide();

    // Show the correct hero section and footer
    if (initialHash === "home") {
      $("#hero-home").show();
    } else if (initialHash === "about") {
      $("#hero-about").show();
    } else if (initialHash === "product") {
      $("#footer").show();
    }
  } else {
    console.error(
      "Invalid initial hash or missing section for hash: " + initialHash
    );
  }

  // Open sidebar
  $("#openSidebar").click(function () {
    $("#sidebar").css("display", "flex"); // Show the sidebar
  });

  // Close sidebar
  $(".close-btn").click(function () {
    $("#sidebar").css("display", "none"); // Hide the sidebar
  });

  // Close sidebar when clicking outside of it
  $(document).click(function (e) {
    if (!$(e.target).closest("#openSidebar, #sidebar").length) {
      $("#sidebar").css("display", "none"); // Hide the sidebar
    }
  });

  // -------------------------------------------------------------------------

  // Modifikasi fungsi uploadImages ------------------------------------------
  const uploadImages = async (files) => {
    if (uploadWorker) {
      return new Promise((resolve, reject) => {
        uploadWorker.onmessage = function (e) {
          if (e.data.success) {
            resolve(e.data.result);
          } else {
            reject(new Error(e.data.error));
          }
        };
        uploadWorker.postMessage(files);
      });
    } else {
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

        return await response.json();
      } catch (error) {
        console.error("Error uploading images:", error);
        throw error;
      }
    }
  };

  // Sembunyikan tombol "Hasil" dan div upload-info saat halaman dimuat
  $("#result-button").hide();
  $(".upload-info").hide();

  $("#file-input").on("change", async function () {
    const files = $(this)[0].files;

    // Cek apakah ada file yang dipilih
    if (files.length > 0) {
      const fileCountDisplay = document.querySelector(".file-count");

      // Tampilkan animasi loading
      const spinner = document.createElement("div");
      spinner.className = "spinner";

      const loadingText = document.createElement("div");
      loadingText.className = "loadingText";
      loadingText.innerHTML = `<p class="text-sm text-gray-600 font-medium mt-2">processing...</p>`;

      document.getElementById("spinLoading").appendChild(spinner); // Tampilkan spinner
      document.getElementById("spinLoading").appendChild(loadingText); // Tampilkan spinner

      // Sembunyikan upload-content
      const uploadContent = document.getElementById("upload-content-zone");
      uploadContent.style.display = "none"; // Sembunyikan upload-content

      // Tambahkan informasi jumlah file yang diunggah
      fileCountDisplay.innerHTML = `
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8h14a2 2 0 012 2v28a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h14m4-2v16m0-16L16 16m8-8l8 8"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p class="text-sm text-gray-600 font-medium mt-2">${files.length} file(s) selected</p>
    `;

      try {
        await uploadImages(files);
        console.log("Upload successful");
      } catch (error) {
        console.error("Error uploading images:", error);
      } finally {
        // Hapus animasi loading setelah proses upload selesai
        removeLoading();
        uploadContent.style.display = "flex"; // Tampilkan kembali upload-content setelah upload selesai
      }

      $(".upload-placeholder").hide(); // Sembunyikan placeholder
      $(".upload-info").show(); // Tampilkan div upload-info
      $("#result-button").show(); // Tampilkan tombol "Hasil"
    } else {
      $(".upload-info").hide(); // Sembunyikan div upload-info
      $(".upload-placeholder").show(); // Tampilkan kembali placeholder

      // Kembalikan placeholder ke keadaan semula
      const uploadArea = document.querySelector(".upload-placeholder");
      uploadArea.innerHTML = `
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8h14a2 2 0 012 2v28a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h14m4-2v16m0-16L16 16m8-8l8 8"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p>or drag and drop</p>
        <p>PNG, JPG, GIF up to 10MB</p>
    `;
    }
  });

  // Fungsi untuk menghapus animasi loading
  function removeLoading() {
    const spinner = document.querySelector(".spinner");
    const loadingText = document.querySelector(".loadingText");

    if (spinner) {
      spinner.remove(); // Menghapus animasi loading
      loadingText.remove();
    }
  }

  //   -------------------------------------------------------------------------

  function displayResults(res) {
    const resultDiv = document.querySelector(".result-process");

    // Clear previous results
    while (resultDiv.firstChild) {
      resultDiv.removeChild(resultDiv.firstChild);
    }

    // Create a container for images
    const imagesContainer = document.createElement("div");
    imagesContainer.classList.add("images-container");
    resultDiv.appendChild(imagesContainer);

    const images = res.images;
    const chunkSize = 5; // Process 5 images at a time
    let index = 0;

    function processChunk() {
      const chunk = images.slice(index, index + chunkSize);

      chunk.forEach((imageData, idx) => {
        const containerElement = document.createElement("div");
        containerElement.classList.add("card");

        const imgElement = document.createElement("img");
        imgElement.src = `data:image/jpeg;base64,${imageData.processed_image}`;
        imgElement.alt = `Processed Image: image-${index + idx + 1}`;
        imgElement.classList.add("processed-image");

        const bboxInfoName = document.createElement("p");
        const bboxInfoCount = document.createElement("p");

        bboxInfoName.className = "nameFile";
        bboxInfoCount.className = "countBoxes";

        bboxInfoName.textContent = `images-${index + idx + 1}`;
        bboxInfoCount.textContent = `Total Bounding Boxes: ${imageData.total_bounding_boxes}`;

        bboxInfoName.classList.add("bbox-infoName");
        bboxInfoCount.classList.add("bbox-infoCount");

        containerElement.appendChild(imgElement);
        containerElement.appendChild(bboxInfoName);
        containerElement.appendChild(bboxInfoCount);

        imagesContainer.appendChild(containerElement);
      });

      index += chunkSize;

      if (index < images.length) {
        requestAnimationFrame(processChunk);
      } else {
        // All images have been processed, now add the download button
        addDownloadButton(res, resultDiv);
      }
    }

    requestAnimationFrame(processChunk);
  }

  function addDownloadButton(data, parentElement) {
    // Remove any existing download button container
    const existingContainer = parentElement.querySelector(
      ".download-button-container"
    );
    if (existingContainer) {
      existingContainer.remove();
    }

    // Create a new container for the download button
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add(
      "download-button-container",
      "mt-4",
      "text-center"
    );

    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download Results as ZIP";
    downloadButton.classList.add("download-button");

    downloadButton.addEventListener("click", () => startDownload(data));

    buttonContainer.appendChild(downloadButton);
    parentElement.appendChild(buttonContainer);
  }

  function startDownload(data) {
    if (!downloadWorker) {
      downloadWorker = new Worker("download-worker.js");
    }

    downloadWorker.onmessage = function (e) {
      if (e.data.type === "complete") {
        const content = e.data.data;
        const url = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;

        // Generate current date in format YYYY-MM-DD
        const currentDate = new Date().toISOString().split("T")[0];

        // Set the download filename with the current date
        link.download = `tree-counting-results-${currentDate}.zip`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    downloadWorker.postMessage(data);
  }

  // Update the #result-button event handler to use this function
  $("#result-button").on("click", function (event) {
    if (resultWorker) {
      resultWorker.postMessage("fetch_results");

      resultWorker.onmessage = function (e) {
        if (e.data.success) {
          displayResults(e.data.data);
        } else {
          console.error("Fetch failed:", e.data.error);
        }
      };
    } else {
      fetch("http://127.0.0.1:5000/get_results", {
        method: "GET",
      })
        .then((res) => res.json())
        .then(displayResults)
        .catch((error) => {
          console.error("Fetch error:", error);
        });
    }
  });
});

function openModal(imageSrc) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  if (imageSrc) {
    modal.style.display = "flex"; // Tampilkan modal dengan flexbox
    modalImage.src = imageSrc; // Set src gambar
  } else {
    console.error("Image source is not valid."); // Log error jika tidak valid
    modal.style.display = "none"; // Sembunyikan modal jika tidak valid
  }
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
}
