import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import React from "react";
import { Container, Grid } from "@mui/material";
import { LeftPane } from "../leftPane/LeftPane";

function base64ToHex(str: string) {
  const raw = atob(str);
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += hex.length === 2 ? hex : "0" + hex;
  }
  return result.toUpperCase();
}

function jsonToHex(jsonString: string) {
  // Convert the JSON string to a byte array
  const byteArray = new TextEncoder().encode(jsonString);

  // Generate the hex representation
  let hex = "";
  for (let i = 0; i < byteArray.length; i++) {
    const hexByte = byteArray[i].toString(16);
    hex += hexByte.length === 1 ? "0" + hexByte : hexByte;
  }

  return hex;
}

const hexToBytes = (hex: string) => {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
};

export const ImageViewer = () => {
  const [image, setImage] = React.useState("");
  const [editedImage, setEditedImage] = React.useState<any>();
  const [pureImage, setPureImage] = React.useState<any>("");
  const [metadata, setMetadata] = React.useState<any[]>([]);
  const cropperRef = React.createRef<ReactCropperElement>();

  const originalImage = new Image();
  originalImage.src = image;

  React.useEffect(() => {
    if (image) {
      const hexImage = base64ToHex(image.split(",")[1]);
      const hexMetadata = hexImage.substring(hexImage.lastIndexOf("FFD9") + 4);
      const metadataBytes = hexToBytes(hexMetadata);
      const existedMetadata = String.fromCharCode(...metadataBytes);
      const imageWithoutMetadata = hexImage.substring(
        0,
        hexImage.lastIndexOf("FFD9") + 4
      );
      const uint8Array = new Uint8Array(hexToBytes(imageWithoutMetadata));
      const blob = new Blob([uint8Array], { type: "image/jpeg" });
      const imageUrl = URL.createObjectURL(blob);

      setPureImage(imageWithoutMetadata);
      setEditedImage(imageUrl);

      if (existedMetadata) setMetadata(JSON.parse(existedMetadata));
    }
  }, [image]);

  React.useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx && image) {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);

      metadata.forEach((area: any) => {
        // Fill the selected area with red color on the canvas
        ctx.fillStyle = "black";
        ctx.fillRect(area.x, area.y, area.width, area.height);
      });

      // Get the data URL of the canvas with the metadata
      const canvasDataUrl = canvas.toDataURL("image/jpeg");
      setEditedImage(canvasDataUrl);
    }
  }, [metadata]);

  const hideSelectedArea = () => {
    if (typeof cropperRef.current?.cropper.getCroppedCanvas() === "undefined") {
      return;
    }
    // Get the selected area coordinates
    const cropData = cropperRef.current?.cropper.getData();

    setMetadata((prev) => [...prev, cropData]);
  };

  const showAll = () => {
    setEditedImage(editedImage);
    setMetadata([]);
  };
  const showSelectedArea = () => {
    const cropData = cropperRef.current?.cropper.getData();
    metadata.forEach((area, index) => {
      const left = Math.max(area.x, cropData?.x ?? 0);
      const top = Math.max(area.y, cropData?.y ?? 0);
      const right = Math.min(
        area.x + area.width,
        (cropData?.x ?? 0) + (cropData?.width ?? 0)
      );
      const bottom = Math.min(
        area.y + area.height,
        (cropData?.y ?? 0) + (cropData?.height ?? 0)
      );

      if (left < right && top < bottom) {
        setMetadata((prev) => prev.filter((_, i) => i !== index));
      }
    });
  };

  const downloadImage = () => {
    const modifiedImage = pureImage + jsonToHex(JSON.stringify(metadata));
    const byteData = hexToBytes(modifiedImage);

    // Create a Uint8Array from the byte array
    const uint8Array = new Uint8Array(byteData);
    const link = document.createElement("a");
    const blob = new Blob([uint8Array], { type: "image/jpeg" });
    link.href = URL.createObjectURL(blob);
    link.download = "image_with_metadata.jpeg";
    link.click();
  };

  return (
    <Grid container spacing={2} style={{ height: "90vh" }}>
      <Grid xs={4} style={{ display: "flex", alignItems: "center" }}>
        <LeftPane
          showAll={showAll}
          setImage={setImage}
          downloadImage={downloadImage}
          hideSelectedArea={hideSelectedArea}
          showSelectedArea={showSelectedArea}
        />
      </Grid>
      <Grid
        xs={8}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {image ? (
          <Container style={{ margin: "15px" }}>
            <Cropper
              ref={cropperRef}
              style={{ height: "100%", width: "100%" }}
              zoomTo={0.5}
              initialAspectRatio={1}
              preview=".img-preview"
              src={editedImage}
              viewMode={1}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              responsive={true}
              autoCropArea={1}
              autoCrop={false}
              checkOrientation={false}
              guides={true}
            />
          </Container>
        ) : (
          <div>Upload an image</div>
        )}
      </Grid>
    </Grid>
  );
};
