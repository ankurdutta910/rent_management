import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { FaCamera } from "react-icons/fa6";
import { supabase } from "../../supabase";
import { Button } from "@mui/material";
import { Alert } from "react-bootstrap";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { ToastContainer, toast } from "react-toastify";

function UploadAadhar() {
  const resizeObserverErrMsg =
    "ResizeObserver loop completed with undelivered notifications.";
  window.addEventListener("error", (e) => {
    if (e.message === resizeObserverErrMsg) {
      e.stopImmediatePropagation();
    }
  });

  const webcamRef = useRef(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [uploadedUrls, setUploadedUrls] = useState({ front: "", back: "" });

  // 📸 Capture image
  const capture = async (side) => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc)
      return alert("Unable to capture. Please allow camera access.");

    const cropped = await cropToRect(imageSrc);
    if (side === "front") setFrontImage(cropped);
    else setBackImage(cropped);
  };

  // 🧩 Upload both images separately in a folder named after userid
  const uploadAadharImages = async () => {
    if (!frontImage || !backImage) {
      toast.error("Please capture both front and back sides first!");
      return;
    }

    setLoading(true);
    setStatus("Uploading Aadhaar Images...");

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("User not logged in.");

      const user = userData.user;
      const folderPath = `${user.id}/`; // 📁 user-specific folder

      // Convert base64 to Blob
      const frontBlob = await (await fetch(frontImage)).blob();
      const backBlob = await (await fetch(backImage)).blob();

      // 📤 Upload front
      const { error: frontError } = await supabase.storage
        .from("aadhar_uploads")
        .upload(`${folderPath}front.jpg`, frontBlob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (frontError) throw frontError;

      // 📤 Upload back
      const { error: backError } = await supabase.storage
        .from("aadhar_uploads")
        .upload(`${folderPath}back.jpg`, backBlob, {
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

      setUploadedUrls({
        front: frontPublic.publicUrl,
        back: backPublic.publicUrl,
      });

      // 🗄️ Update Supabase "Tenants" table
      setStatus("Saving Aadhaar URLs to database...");
      const { error: updateError } = await supabase
        .from("Tenants")
        .update({
          id_file_front: frontPublic.publicUrl,
          id_file_back: backPublic.publicUrl,
        })
        .eq("userid", user.id);

      if (updateError) throw updateError;

      setStatus("✅ Aadhaar front & back uploaded successfully!");
      toast.success("Aadhaar Details Uploaded!");
    } catch (err) {
      console.error(err);
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🖼️ Crop Aadhaar region (16:9 ratio)
  const cropToRect = (imageSrc) =>
    new Promise(async (resolve) => {
      const img = await loadImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const targetAspect = 16 / 9;
      let cropWidth = img.width * 0.85;
      let cropHeight = cropWidth / targetAspect;

      if (cropHeight > img.height) {
        cropHeight = img.height * 0.85;
        cropWidth = cropHeight * targetAspect;
      }

      const cropX = (img.width - cropWidth) / 2;
      const cropY = (img.height - cropHeight) / 2;

      canvas.width = 1920;
      canvas.height = 1080;

      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, 1920, 1080);

      resolve(canvas.toDataURL("image/jpeg", 1.0));
    });

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  return (
    <>
      <ToastContainer />
      <div className="container main">
        <h5
          className="section-title"
          style={{ marginBottom: "0px", marginTop: "20px" }}
        >
          Aadhaar Photo Verification{" "}
          <RiVerifiedBadgeFill style={{ color: "green" }} />
        </h5>
        <p className="mb-2" style={{ color: "grey" }}>
          Align your Aadhaar inside the rectangular box
        </p>

        {!frontImage || !backImage ? (
          <div
            style={{ position: "relative", width: "100%", maxWidth: "100%" }}
          >
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: "environment",
                aspectRatio: 16 / 9,
              }}
              style={{
                width: "100%",
                borderRadius: "10px",
                marginBottom: "10px",
                aspectRatio: "16/9",
                objectFit: "cover",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: "46%",
                left: "50%",
                width: "80%",
                aspectRatio: "16/9",
                transform: "translate(-50%, -50%)",
                border: "3px solid #00ff88",
                borderRadius: "8px",
                boxShadow: "0 0 20px rgba(0,255,136,0.5)",
                pointerEvents: "none",
              }}
            ></div>

            {!frontImage && (
              <Button
                style={{
                  width: "95%",
                  height: "50px",
                  position: "fixed",
                  bottom: "80px",
                  left: "10px",
                  zIndex: "11",
                }}
                onClick={() => capture("front")}
                variant="contained"
                size="small"
              >
                <FaCamera style={{ marginRight: "5px", marginTop: "-2px" }} />
                Capture Front
              </Button>
            )}

            {frontImage && !backImage && (
              <Button
                style={{
                  width: "95%",
                  height: "50px",
                  position: "fixed",
                  bottom: "80px",
                  left: "10px",
                  zIndex: "11",
                }}
                onClick={() => capture("back")}
                variant="contained"
                size="small"
              >
                <FaCamera style={{ marginRight: "5px", marginTop: "-2px" }} />{" "}
                Capture Back
              </Button>
            )}
          </div>
        ) : null}

        {status && <Alert className="mt-3">{status}</Alert>}

        <div className="row" style={{ marginTop: "10px" }}>
          <div className="col-6">
            {frontImage && (
              <>
                <p>
                  <strong>Front Preview:</strong>
                </p>
                <img
                  src={frontImage}
                  alt="Front"
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    marginBottom: "10px",
                  }}
                />
              </>
            )}
          </div>
          <div className="col-6">
            {backImage && (
              <>
                <p>
                  <strong>Back Preview:</strong>
                </p>
                <img
                  src={backImage}
                  alt="Back"
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    marginBottom: "10px",
                  }}
                />
              </>
            )}
          </div>
        </div>

        {frontImage && backImage && (
          <Button
            style={{
              width: "95%",
              height: "50px",
              position: "fixed",
              bottom: "80px",
              left: "10px",
              zIndex: "11",
            }}
            onClick={uploadAadharImages}
            disabled={loading}
            variant="contained"
            size="small"
          >
            {loading ? "Uploading..." : "Confirm Upload"}
          </Button>
        )}
      </div>
    </>
  );
}

export default UploadAadhar;
