import React, { useState } from "react";
import logo from "./assets/img/logo.webp";
import gif from "./assets/img/download.webp";
import { IoLogoWhatsapp } from "react-icons/io";
import { Link } from "react-router-dom";

function Download() {
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const APK_URL =
    "https://rgacsmfkbcrazwhizyas.supabase.co/storage/v1/object/public/App/RDRentals.apk";

  const downloadApk = async () => {
    setProgress(0);
    setDownloading(true);
    setCompleted(false);

    const response = await fetch(APK_URL);

    if (!response.ok) {
      alert("Failed to download APK");
      setDownloading(false);
      return;
    }

    const contentLength = response.headers.get("content-length");
    const total = parseInt(contentLength, 10);

    let loaded = 0;
    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loaded += value.length;

      setProgress(Math.round((loaded / total) * 100));
    }

    const blob = new Blob(chunks, {
      type: "application/vnd.android.package-archive",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "RDRentals.apk";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    setDownloading(false);
    setCompleted(true);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top">
        <div className="container-fluid navbar-content">
          <Link className="navbar-brand">
            <img src={logo} className="img-fluid logoimg" alt="logo" />
          </Link>
        </div>
      </nav>
      <div
        className="container"
        style={{
          padding: "100px 20px 20px 20px",
          textAlign: "center",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <p style={{ textAlign: "justify", fontWeight: "500" }}>
          Manage all your rental activities in one place. Track your rent
          payments, view pending dues, raise complaints, submit feedback,
          download receipts, and stay updated with important notifications — all
          from your mobile.
        </p>
        <img
          src={gif}
          className="img-fluid mb-3"
          style={{
            width: "350px",
            marginTop: "2vh",
            mixBlendMode: "multiply",
          }}
        />

        {progress > 0 && (
          <div style={{ marginTop: "2px" }}>
            <div
              style={{
                width: "100%",
                height: "10px",
                background: "#eee",
                borderRadius: "4px",
                marginBottom: "5px",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "#007bff",
                  borderRadius: "4px",
                }}
              />
            </div>

            {progress < 100 ? (
              <div>Downloading: {progress}%</div>
            ) : (
              <span style={{ color: "#00813cff" }}>Download Completed</span>
            )}
          </div>
        )}

        <button
          onClick={downloadApk}
          disabled={downloading}
          className="btn btn-primary w-100 mt-4"
          style={{
            padding: "13px",
            border: "none",
            backgroundColor: downloading ? "#bcbbbbff" : "#007bff",
            // backgroundColor:  "#bcbbbbff",
            cursor: downloading ? "not-allowed" : "pointer",
          }}
        >
          {downloading
            ? "Downloading..."
            : completed
            ? "Download Again"
            : "Download App"}
        </button>

        <a
          href="https://wa.me/917086952212?text=Please%20share%20the%20RD%20Rentals%20App%20link"
          className="btn btn-success w-100 mt-2"
          style={{
            padding: "13px",
            border: "none",
            backgroundColor: "#017642ff",
          }}
        >
          Request via WhatsApp
        </a>
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          padding: "10px",
          textAlign: "center",
          width: "100%",
          backgroundColor: "#e0e0e0ff",
        }}
      >
        <a
          style={{ textDecoration: "none", color: "black" }}
          href="https://wa.me/917086952212?text=Hello,%20I%20need%20help!"
          target="_blank"
        >
          <IoLogoWhatsapp style={{ color: "green", marginTop: "-4px" }} />{" "}
          Contact: <b>(+91) 7086952212</b>
        </a>
      </div>
    </>
  );
}

export default Download;
