import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { FaPhoneVolume } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { FaPencilAlt } from "react-icons/fa";
import EditProfile from "./EditProfile";
import { ImBlocked } from "react-icons/im";
import boy from "../assets/img/boy.webp";
import girl from "../assets/img/girl.webp";
import img from "../assets/img/photo.webp";
import { PiFilePdf } from "react-icons/pi";
import { RiSecurePaymentFill } from "react-icons/ri";
import { ToastContainer, toast } from "react-toastify";

function MyRents() {
  const [tenant, setTenant] = useState({});
  const [rentPayments, setRentPayments] = useState([]); // ✅ New state for rent payments
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  const fetchTenantDetails = async () => {
    try {
      // ✅ Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        console.log("No user logged in");
        setLoading(false);
        return;
      }

      // ✅ Fetch tenant details with asset info
      const { data: tenantData, error: tenantError } = await supabase
        .from("Tenants")
        .select(
          `
          id,
          tenant_name,
          contact,
          gender,
          asset_id,
          address,
          deposit,
          leaseStart,
          leaseEnd,
          id_file_front,
          final_rent,
          Assets (asset_name, description)
        `
        )
        .eq("userid", user.id)
        .single();

      if (tenantError) throw tenantError;
      setTenant(tenantData);

      // ✅ Fetch CoTenants
      if (tenantData?.id) {
        // ✅ Fetch RentPayments for this tenant
        const { data: rentData, error: rentError } = await supabase
          .from("RentPayments")
          .select(
            `
            id,
            paymentdate,month,
            amount,
            electricity,
            meterreading,
            latefine,
            extraamount,
            remark,status
          `
          )
          .eq("tenant_id", tenantData.id)
          .order("paymentdate", { ascending: false });

        if (rentError) throw rentError;
        setRentPayments(rentData || []);
      }
    } catch (err) {
      console.error("Error fetching tenant details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const [openEditProfile, setOpenEditProfile] = useState(false);

  const handleOpenEditProfile = () => {
    setOpenEditProfile(true);
  };

  const handleCloseEditProfile = () => {
    setOpenEditProfile(false);
  };

  const formatDate = (dateString, withTime = false) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    if (!withTime) {
      // Only Date
      return `${day}-${month}-${year}`;
    }

    // Date + Time
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <CircularProgress />
      </Box>
    );

  if (!tenant)
    return (
      <div className="text-center mt-4">
        No rental details found for this user.
      </div>
    );

  return (
    <>
      <ToastContainer />
      <EditProfile
        handleCloseEditProfile={handleCloseEditProfile}
        openEditProfile={openEditProfile}
        tenant={tenant}
        fetchTenantDetails={fetchTenantDetails}
      />

      <div className="container main">
        {/* ✅ Tenant Card */}
        <div
          className="card p-2 mb-2 position-relative"
          style={{ backgroundColor: "#f2f8ffff", borderColor: "#a8c3e3ff" }}
        >
          <div className="d-flex gap-2">
            <FaPencilAlt
              onClick={handleOpenEditProfile}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                color: "#121212",
              }}
            />
            <img
              src={
                tenant.gender == "Male"
                  ? boy
                  : tenant.gender == "Female"
                  ? girl
                  : img
              }
              alt="Room"
              className="img-fluid"
              style={{ width: "56px", height: "56px" }}
            />
            <div>
              <b>{tenant.tenant_name}</b>
              <p>
                <FaPhoneVolume /> (+91) {tenant.contact ? tenant.contact : "-"}
              </p>
              <p>
                Room:
                <b>
                  {tenant.Assets?.asset_name || "Unknown Asset"}{" "}
                  {tenant.Assets?.description
                    ? `- ${tenant.Assets.description}`
                    : ""}
                </b>
              </p>
            </div>
          </div>

          <hr style={{ marginTop: "5px", borderColor: "#a9c5e4ff" }} />
          <div className="p-1">
            <p>
              Monthly Rent: <b>₹{tenant.final_rent}</b>
            </p>
            <p>
              Security Deposit:{" "}
              <b style={{ color: "green" }}>₹{tenant.deposit}</b>{" "}
              <i>(Refundable)</i>
            </p>
          </div>
        </div>

        {/* ✅ Rent Payments Section */}
        <h5 className="section-title mt-3">
          <RiSecurePaymentFill style={{ marginTop: "-3px", color: "grey" }} />{" "}
          Payment History
        </h5>

        {rentPayments.length > 0 ? (
          rentPayments.map((payment) => (
            <div
              key={payment.id}
              className="card mt-2"
              style={{
                backgroundColor:
                  payment.status == "Pending" ? "#f8d7dad7" : null,
                borderColor: payment.status == "Pending" ? "#f1aeb5" : null,
                color: payment.status == "Pending" ? "#58151C" : null,
              }}
            >
              <div
                className="d-flex justify-content-between p-2"
                style={{
                  backgroundColor: "#f2f8ffff",
                  borderBottom: "1px solid #eeeeeeff",
                  borderRadius: "5px 5px 0 0",
                }}
              >
                <div>
                  <p>
                    Month: <b>{payment.month}</b>
                  </p>
                </div>
                <div>
                  <p>
                    {payment.status == "Approved" ? (
                      <>
                        Payment Date: <b>{formatDate(payment.paymentdate)}</b>
                      </>
                    ) : (
                      <b>
                        <ImBlocked style={{ marginTop: "-3px" }} /> Payment
                        Pending
                      </b>
                    )}
                  </p>
                </div>
              </div>

              <div className="p-2">
                <div className="d-flex justify-content-between">
                  <div>
                    <p>
                      Rent: <b>₹{payment.amount}.00</b>
                    </p>
                  </div>
                  <div>
                    <p>
                      Electricity: <b>₹{payment.electricity}.00</b> | Units:{" "}
                      <b>{payment.meterreading}</b>
                    </p>
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <div>
                    <p>
                      Late Fine:{" "}
                      <b>
                        {payment.latefine ? (
                          <span>₹{payment.latefine}.00</span>
                        ) : (
                          "-"
                        )}
                      </b>
                    </p>
                  </div>
                  <div>
                    <p>
                      Others:{" "}
                      <b>
                        {payment.extraamount ? (
                          <span>₹{payment.extraamount}.00</span>
                        ) : (
                          "-"
                        )}
                      </b>
                    </p>
                  </div>
                </div>

                <hr className="mt-1 mb-1" />
                <div className="d-flex justify-content-between">
                  <div>
                    <p>
                      <i>Remark:</i> {payment.remark || "-"}
                    </p>

                    {payment.status == "Approved" ? (
                      <>
                        <a
                          style={{ cursor: "pointer", color: "cornflowerblue" }}
                          onClick={() =>
                            navigate("/receipt", { state: { tenant, payment } })
                          }
                        >
                          <PiFilePdf
                            style={{ marginTop: "-2px", fontSize: "16px" }}
                          />{" "}
                          Download Receipt
                        </a>
                      </>
                    ) : (
                      <a>Receipt Not Generated</a>
                    )}
                  </div>
                  <p>
                    Grand Total:{" "}
                    <b
                      style={{
                        color:
                          payment.status == "Pending" ? "#58151C" : "green",
                      }}
                    >
                      ₹
                      {payment.amount +
                        payment.electricity +
                        payment.latefine +
                        payment.extraamount}
                      .00
                    </b>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted mt-2">No rent payments found.</p>
        )}
      </div>
    </>
  );
}

export default MyRents;
