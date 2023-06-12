export const handleImageVerify = (imgSrc: string) => {
  const imageData = atob(
    imgSrc.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
  );
  const arrayBuffer = new ArrayBuffer(imageData.length);
  const uintArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < imageData.length; i++) {
    uintArray[i] = imageData.charCodeAt(i);
  }
  const blob = new Blob([arrayBuffer], { type: "image/jpeg" });

  // Create a new FormData object
  const formData = new FormData();
  formData.append("targetImage", blob, "image.jpg"); // Append the image to the FormData

  // Make a POST request with the FormData
  fetch("https://smh7spdpmi.execute-api.ap-southeast-1.amazonaws.com/checkin", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      // Handle the response
      console.log(response);
      if (response.status === 200) {
        alert("facial recognition successful");
      } else if (response.status === 204) {
        alert("facial recognition failed");
      } else {
        throw new Error(
          "Bad Response: " +
            response.status +
            ", " +
            response.json().then((body) => body)
        );
      }
    })
    .catch((error) => {
      // Handle errors
      alert("Error verifying image: " + error);
    });
};
