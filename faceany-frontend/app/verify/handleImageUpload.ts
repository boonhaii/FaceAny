const handleImageUpload = (imgSrc: string) => {
  const imageData = atob(
    imgSrc.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
  );
  const arrayBuffer = new ArrayBuffer(imageData.length);
  const uintArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < imageData.length; i++) {
    uintArray[i] = imageData.charCodeAt(i);
  }
  const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
};
