import React, { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Button, Dialog, Modal } from "@mui/material";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { ToastContainer, toast } from "react-toastify";
import { supabase } from "../../supabase";
import { Alert } from "react-bootstrap";
import Tesseract from "tesseract.js";
import { useNavigate } from "react-router-dom";
import Front from "../assets/img/aadhar-front.png";
import Back from "../assets/img/aadhar-back.png";
import Check from "../assets/img/check.webp";
import Scanning from "../assets/img/scanning.gif";

function UploadAadhar() {
  const navigate = useNavigate();

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [allset, setAllSet] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    if (status) {
      setDialogOpen(true);
    }
  }, [status]);

  // Cropper States
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSide, setCropSide] = useState(""); // front or back

  const fileInputRef = useRef();

  const handleFileSelect = (side) => {
    setCropSide(side);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = useCallback(async () => {
    if (!imageToCrop || !croppedAreaPixels) return null;

    const image = await createImage(imageToCrop);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1920;
    canvas.height = 1080;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const base64 = canvas.toDataURL("image/jpeg", 1.0);
    return base64;
  }, [imageToCrop, croppedAreaPixels]);

  const confirmCrop = async () => {
    const croppedImg = await getCroppedImage();
    if (cropSide === "front") {
      setFrontPreview(croppedImg);
      const blob = await (await fetch(croppedImg)).blob();
      setFrontImage(blob);
    } else {
      setBackPreview(croppedImg);
      const blob = await (await fetch(croppedImg)).blob();
      setBackImage(blob);
    }
    setCropModalOpen(false);
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (error) => reject(error));
      img.src = url;
    });

  // 🧠 OCR Aadhaar number extractor
  const extractAadharNumber = async (imageFile) => {
    try {
      const result = await Tesseract.recognize(imageFile, "eng");
      const text = result.data.text.replace(/\s+/g, " ");
      const match = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
      return match ? match[0] : null;
    } catch (error) {
      console.error("OCR error:", error);
      return null;
    }
  };

  // 📤 Upload Aadhaar images
  const uploadAadharImages = async () => {
    if (!frontImage || !backImage) {
      toast.error("Please upload both front and back sides!");
      return;
    }

    setLoading(true);
    setStatus("Scanning Aadhaar Card. Please wait...");

    try {
      // 🧠 Extract Aadhaar number from both images
      const frontNumber = await extractAadharNumber(frontImage);
      const backNumber = await extractAadharNumber(backImage);

      // ❌ If no Aadhaar number found in either → cancel
      if (!frontNumber && !backNumber) {
        toast.error(
          "Aadhaar number not detected in both images. Please upload clearer photos."
        );
        setStatus(
          "❌ Aadhaar number not detected in both images. Upload cancelled."
        );
        setLoading(false);
        return;
      }

      // ✅ Choose whichever number found first
      const detectedNumber = frontNumber || backNumber;
      setAadharNumber(detectedNumber);
      setStatus("Verifying Aadhaar Details. Please wait...");

      // 🔑 Current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("User not logged in.");

      const user = userData.user;
      const folderPath = `${user.id}/`;

      // 📤 Upload front
      const { error: frontError } = await supabase.storage
        .from("aadhar_uploads")
        .upload(`${folderPath}front.jpg`, frontImage, {
          contentType: "image/jpeg",
          upsert: true,
        });
      if (frontError) throw frontError;

      // 📤 Upload back
      const { error: backError } = await supabase.storage
        .from("aadhar_uploads")
        .upload(`${folderPath}back.jpg`, backImage, {
          contentType: "image/jpeg",
          upsert: true,
        });
      if (backError) throw backError;

      // 🌐 Get public URLs
      const { data: frontPublic } = supabase.storage
        .from("aadhar_uploads")
        .getPublicUrl(`${folderPath}front.jpg`);
      const { data: backPublic } = supabase.storage
        .from("aadhar_uploads")
        .getPublicUrl(`${folderPath}back.jpg`);

      // 🗄️ Update Supabase with URLs, Aadhaar number, and address
      setStatus("Saving Aadhar Details. Please wait...");
      const { error: updateError } = await supabase
        .from("Tenants")
        .update({
          id_file_front: frontPublic.publicUrl,
          id_file_back: backPublic.publicUrl,
          aadhar_number: detectedNumber,
          aadhar_verified: 1,
        })
        .eq("userid", user.id);

      if (updateError) throw updateError;

      setStatus("✅ Aadhaar Uploaded Successfully!");
      setAllSet(1);
    } catch (err) {
      console.error(err);
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <Dialog
        open={dialogOpen}
        onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return; // ❌ Prevent closing
          }
          setDialogOpen(false); // ✔️ Allow manual close from buttons
        }}
        disableEscapeKeyDown
      >
        <div
          style={{
            padding: "5px 30px 30px 30px",
            maxWidth: "400px",
            maxWidth: "390px",
          }}
        >
          {aadharNumber && aadharNumber ? (
            <>
              <p style={{ textAlign: "center" }}>
                <img
                  style={{ marginTop: "20px", width: "200px" }}
                  src={Check}
                  className="img-fluid"
                />
              </p>
              <Alert variant="success" style={{ marginTop: "17px" }}>
                Aadhaar Number: <strong>{aadharNumber}</strong>
              </Alert>
            </>
          ) : (
            <>
              <img src={Scanning} className="img-fluid" />
            </>
          )}
          <p style={{ marginTop: "10px", textAlign: "center" }}>{status}</p>

          {frontImage &&
            backImage &&
            (allset === 1 ? (
              <p style={{ textAlign: "center" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  style={{ marginTop: "25px" }}
                  size="small"
                >
                  Finish
                </Button>
              </p>
            ) : null)}
        </div>
      </Dialog>

      <div className="container main">
        <h5 className="section-title mt-4">
          Aadhaar Verification{" "}
          <RiVerifiedBadgeFill style={{ color: "green" }} />
        </h5>

        <p className="mb-3" style={{ marginTop: "-5px" }}>
          Click below to upload both sides of your Aadhaar card.
        </p>

        {/* {status && <Alert className="my-2">{status}</Alert>} */}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
        />

        <div className="row">
          {/* Front */}
          <div className="col-12 col-lg-6 mb-4 text-center">
            <div
              style={{
                border: "2px dashed #aaa",
                borderRadius: "10px",
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#f8f9fa",
              }}
              onClick={() => handleFileSelect("front")}
            >
              {frontPreview ? (
                <img
                  src={frontPreview}
                  alt="Front Preview"
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    aspectRatio: "16/9",
                  }}
                />
              ) : (
                <>
                  <img
                    src={Front}
                    alt="Dummy Front"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      aspectRatio: "16/9",
                      opacity: 0.6,
                    }}
                  />
                  <p className="mt-2 text-muted">Click to upload Front Side</p>
                </>
              )}
            </div>
          </div>

          {/* Back */}
          <div className="col-12 col-lg-6 mb-4 text-center">
            <div
              style={{
                border: "2px dashed #aaa",
                borderRadius: "10px",
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#f8f9fa",
              }}
              onClick={() => handleFileSelect("back")}
            >
              {backPreview ? (
                <img
                  src={backPreview}
                  alt="Back Preview"
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    aspectRatio: "16/9",
                  }}
                />
              ) : (
                <>
                  <img
                    src={Back}
                    alt="Dummy Back"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      aspectRatio: "16/9",
                      opacity: 0.6,
                    }}
                  />
                  <p className="mt-2 text-muted">Click to upload Back Side</p>
                </>
              )}
            </div>
          </div>
        </div>

        {frontImage &&
          backImage &&
          (allset === 1 ? (
            <Button
              style={{
                width: "100%",
                height: "50px",
              }}
              variant="contained"
              size="small"
              onClick={() => navigate(-1)}
            >
              Finish
            </Button>
          ) : (
            <Button
              style={{
                width: "100%",
                height: "50px",
              }}
              onClick={uploadAadharImages}
              disabled={loading}
              variant="contained"
              size="small"
            >
              {loading ? "Uploading..." : "Confirm Upload"}
            </Button>
          ))}
      </div>
      <br />

      {/* 🪟 Crop Modal */}
      <Modal open={cropModalOpen} onClose={() => setCropModalOpen(false)}>
        <div
          style={{
            background: "#fff",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "400px",
            margin: "5% auto",
            padding: "20px",
          }}
        >
          <h6>Crop Image</h6>
          <div style={{ position: "relative", width: "100%", height: 300 }}>
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="d-flex justify-content-between mt-3">
            <Button
              variant="outlined"
              color="error"
              onClick={() => setCropModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={confirmCrop}>
              Crop & Save
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </>
  );
}

export default UploadAadhar;
