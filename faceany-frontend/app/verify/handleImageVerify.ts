export const handleImageVerify = async (imgSrc: string) => {
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

  const faceId = await checkIn(formData);
  const response = await fetch(`/api/face?faceId=${faceId}`);

  if (response.status !== 200) {
    throw new Error(
      "Bad Response: " + response.status + ", " + (await response.json())
    );
  }
  const name = await response.json();

  if (!name) {
    alert("No match found!");
    return null;
  }

  return name;
};

async function checkIn(formData: FormData) {
  try {
    // Make a POST request with the FormData
    const response = await fetch(
      "https://smh7spdpmi.execute-api.ap-southeast-1.amazonaws.com/checkin",
      {
        method: "POST",
        body: formData,
      }
    );
    if (response.status === 200) {
      const body = await response.json();
      if (body.faceId) {
        return body.faceId;
      }
    } else if (response.status === 204) {
      alert("No match found!");
    } else {
      throw new Error(
        "Bad Response: " +
          response.status +
          ", " +
          response.json().then((body) => body)
      );
    }
  } catch (error) {
    // Handle errors
    alert("Error verifying image: " + error);
    throw error;
  }
}
