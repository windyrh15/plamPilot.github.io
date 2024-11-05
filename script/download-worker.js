importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js"
);

self.onmessage = async function (e) {
  const data = e.data;
  const zip = new JSZip();

  // Add CSV file
  let csv = "Filename,Total Bounding Boxes\n";
  data.images.forEach((image, idx) => {
    const newFilename = `image-${idx + 1}.jpg`;
    csv += `${newFilename},${image.total_bounding_boxes}\n`;
  });
  zip.file("results.csv", csv);

  // Add images
  data.images.forEach((image, idx) => {
    const newFilename = `image-${idx + 1}.jpg`;
    const imgData = atob(image.processed_image);
    const arrayBuffer = new ArrayBuffer(imgData.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < imgData.length; i++) {
      uintArray[i] = imgData.charCodeAt(i);
    }

    zip.file(newFilename, arrayBuffer, { binary: true });
  });

  // Generate zip file
  const content = await zip.generateAsync({ type: "blob" });

  // Send the ZIP blob back to the main thread
  self.postMessage({ type: "complete", data: content });
};
