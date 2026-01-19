import React, { useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLocation, useNavigate } from "react-router-dom";
import { ToWords } from "to-words";

const Receipt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tenantData = location.state?.tenant || {};
  const PaymentData = location.state?.payment || {};

  useEffect(() => {
    if (
      Object.keys(tenantData).length === 0 ||
      Object.keys(PaymentData).length === 0
    ) {
      navigate("/my-rents");
    }
  }, [tenantData, PaymentData, navigate]);

  const receiptprefix = new Date(PaymentData.paymentdate).getFullYear();
  const receiptsuffix = String(PaymentData.id).padStart(2, "0");
  const handleDownload = () => {
    const input = document.querySelector(".downloadable"); // select the div

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4"); // A4 size in portrait
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      // calculate the height of the image to fit A4 width
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let position = 0;

      if (imgHeight < pdfHeight) {
        // image fits in one page
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // image is taller than A4, split into multiple pages
        let remainingHeight = imgHeight;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          remainingHeight -= pdfHeight;
          if (remainingHeight > 0) {
            pdf.addPage();
            position = -pdfHeight * (imgHeight / pdfHeight);
          }
        }
      }

      pdf.save(
        tenantData?.tenant_name +
          "-" +
          PaymentData.paymentdate +
          "-" +
          receiptprefix +
          receiptsuffix
      );
    });
  };

  const TotalPayment =
    parseFloat(PaymentData?.amount) +
    parseFloat(PaymentData?.electricity) +
    parseFloat(PaymentData?.latefine) +
    parseFloat(PaymentData?.extraamount);

  const formattedDate = new Date(PaymentData?.paymentdate).toLocaleDateString(
    "en-US",
    {
      month: "short", // gives 'Jan', 'Feb', etc.
      day: "numeric", // gives '5'
      year: "numeric", // gives '2024'
    }
  );

  const toWords = new ToWords({
    localeCode: "en-IN", // Indian numbering format
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
    },
  });
  return (
    <div style={{ marginTop: "10vh" }}>
      {/* Download file */}
      <div
        className="downloadable"
        style={{
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          width: "100%",
        }}
      >
        <h2
          style={{ textAlign: "right", fontWeight: "bold", fontSize: "1rem" }}
        >
          House Rent Receipt
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start", // aligns both top
            marginTop: "20px",
          }}
        >
          <div>
            <p style={{ fontSize: "0.6rem" }}>
              H No.252, Bharalichuk, Dhemaji,<br /> 787057, 
              Assam, India <br />
              (+91) 708952212
            </p>
          </div>
          <div>
            <p style={{ fontSize: "0.6rem" }}>
              Receipt Number:{" "}
              <b style={{ fontSize: "0.6rem" }}>
                #{receiptprefix}
                {receiptsuffix}
              </b>{" "}
              <br />
              Receipt Date:{" "}
              <b style={{ fontSize: "0.6rem" }}>{formattedDate}</b>
            </p>
          </div>
        </div>

        <p style={{ marginTop: "25px", fontSize: "0.7rem" }}>
          This is to acknowledge that{" "}
          <b style={{ textTransform: "uppercase", fontSize: "0.7rem" }}>
            {tenantData?.tenant_name}
          </b>{" "}
          has paid an amount of{" "}
          <b style={{ textTransform: "uppercase", fontSize: "0.7rem" }}>
            ₹{TotalPayment?.toLocaleString("en-IN")}
          </b>{" "}
          <i style={{ fontSize: "0.7rem" }}>
            ({toWords.convert(TotalPayment || 0) || ""})
          </i>{" "}
          as house rent{" "}
          <b style={{ fontSize: "0.7rem" }}>
            ({tenantData?.Assets?.asset_name})
          </b>{" "}
          for the month of{" "}
          <b style={{ fontSize: "0.7rem" }}>{PaymentData?.month}</b>, received
          in full and final settlement for that month.
        </p>

        <div style={{ position: "relative" }}>
          <table
            style={{
              width: "80%",
              marginTop: "20px",
              position: "absolute",
              right: 0,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                    textAlign: "left",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                    textAlign: "right",
                  }}
                >
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px" }}>
                  Base Rent
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                    textAlign: "right",
                  }}
                >
                  {PaymentData?.amount?.toLocaleString("en-IN")}.00
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px" }}>
                  Electricity ({PaymentData?.meterreading} units)
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                    textAlign: "right",
                  }}
                >
                  {PaymentData?.electricity?.toLocaleString("en-IN")}.00
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px" }}>
                  Late Fine
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                    textAlign: "right",
                  }}
                >
                  {PaymentData?.latefine?.toLocaleString("en-IN")}.00
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #000", padding: "5px" }}>
                  Others
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                    textAlign: "right",
                  }}
                >
                  {PaymentData?.extraamount?.toLocaleString("en-IN")}.00
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Grand Total
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {TotalPayment?.toLocaleString("en-IN")}.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ position: "relative", marginTop: "230px" }}>
          <p style={{ fontSize: "0.7rem" }}>
            Received By: <b style={{ fontSize: "0.7rem" }}>Ranjumoni Dutta</b>{" "}
            <br />
            Contact: (+91) 7086952212 / 9954451205
          </p>
        </div>
      </div>
      {/* Download file */}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          textAlign: "center",
          zIndex: 6,
          padding: "19px",
          cursor: "pointer",
          color: "white",
          backgroundColor: "#1969c4ff",
        }}
        onClick={handleDownload}
      >
        <b style={{ fontSize: "1rem" }}>Download PDF</b>
      </div>
    </div>
  );
};

export default Receipt;
