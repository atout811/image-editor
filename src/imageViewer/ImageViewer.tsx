import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import React from "react";
import { Container, Grid } from "@mui/material";
import { LeftPane } from "../leftPane/LeftPane";

export const ImageViewer = () => {
  const [image, setImage] = React.useState<string>("");
  const [editedImage, setEditedImage] = React.useState<string>("");
  const [metadata, setMetadata] = React.useState<any[]>([]);
  const cropperRef = React.createRef<ReactCropperElement>();
  const originalImage = new Image();
  originalImage.src = image;

  React.useEffect(() => {
    if (image) {
      setEditedImage(image);
    }
  }, [image]);

  React.useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx && image) {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);

      metadata.forEach((area: any, index) => {
        // Fill the selected area with red color on the canvas
        ctx.fillStyle = "black";
        ctx.fillRect(area.x, area.y, area.width, area.height);
        canvas.setAttribute(`data-metadata${index}`, JSON.stringify(area));
      });

      // Get the data URL of the canvas with the metadata
      const canvasDataUrl = canvas.toDataURL();
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
    setEditedImage(image);
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
    const link = document.createElement("a");
    link.href = editedImage;
    link.download = "image_with_metadata.png";
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
