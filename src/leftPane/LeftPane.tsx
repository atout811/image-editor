import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import { Stack } from "@mui/material";

export type LeftPaneProps = {
  showAll: () => void;
  downloadImage: () => void;
  hideSelectedArea: () => void;
  showSelectedArea: () => void;
  setImage: (image: any) => void;
};

export const LeftPane = (props: LeftPaneProps) => {
  const {
    showAll,
    setImage,
    downloadImage,
    hideSelectedArea,
    showSelectedArea,
  } = props;

  const onUploadImage = (e: any) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as any);
    };
    reader.readAsDataURL(files[0]);
  };

  return (
    <Container style={{ margin: "15px" }}>
      <Stack spacing={2}>
        <Button variant="contained" component="label" onChange={onUploadImage}>
          Upload File
          <input type="file" hidden />
        </Button>
        <Button variant="contained" onClick={showSelectedArea}>
          Show The Selected Block
        </Button>

        <Button variant="contained" onClick={hideSelectedArea}>
          Hide Selected Area
        </Button>
        <Button variant="contained" onClick={showAll}>
          Show All
        </Button>
        <Button variant="contained" onClick={downloadImage}>
          Download
        </Button>
      </Stack>
    </Container>
  );
};
