import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { FaPhoneVolume } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { MdVerified } from "react-icons/md";
import boy from "../../assets/img/boy.webp";
import girl from "../../assets/img/girl.webp";
import { FaRegTrashCan } from "react-icons/fa6";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import img from "../../assets/img/photo.webp";

function TenantDetails() {
  const { id } = useParams();
  const [tenant, setTenant] = useState({});
  const [calloading, setCalLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [coTenants, setCoTenants] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [openAddCotenant, setOpenAddCotenant] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openID, setOpenID] = useState(false);

  // Totals
  const [totalRent, setTotalRent] = useState(0);
  const [totalElectricity, setTotalElectricity] = useState(0);
  const [latestMeterReading, setLatestMeterReading] = useState(0);

  const handleOpenID = () => {
    setOpenID(true);
  };
  const handleCloseID = () => {
    setOpenID(false);
  };

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  const fetchTenantDetails = async () => {
    if (!id) {
      navigate(-1);
      return;
    }

    try {
      // Fetch Tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from("Tenants")
        .select(
          `
            id,
            tenant_name,
            contact,email,
            gender,
            asset_id,
            address,
            deposit,
            leaseStart,
            leaseEnd,
            id_file_front,
            final_rent,
            id_file_back,
            aadhar_verified,
            userid,
            Assets (asset_name, description)
          `
        )
        .eq("id", id)
        .single();

      if (tenantError) throw tenantError;
      setTenant(tenantData);

      // Fetch CoTenants
      if (tenantData?.id) {
        const { data: coTenantData, error: coTenantError } = await supabase
          .from("CoTenants")
          .select("id,name, contact, relation_type, status")
          .eq("tenant_id", tenantData.id);

        if (coTenantError) throw coTenantError;
        setCoTenants(coTenantData || []);
        const { data: rentData, error: rentError } = await supabase
          .from("RentPayments")
          .select(
            `
                      id,
                      paymentdate,
                      month,
                      amount,
                      electricity,
                      meterreading,
                      latefine,
                      extraamount,
                      remark,
                      status
                    `
          )
          .eq("tenant_id", tenantData.id)
          .order("paymentdate", { ascending: false });

        if (rentError) throw rentError;

        // ✅ Only consider APPROVED payments
        const approvedRentData = (rentData || []).filter(
          (record) => record.status === "Approved"
        );

        // ✅ Calculate totals using only approved payments
        if (approvedRentData.length > 0) {
          const totalRentPaid = approvedRentData.reduce(
            (sum, record) => sum + (record.amount || 0),
            0
          );
          const totalElectricityPaid = approvedRentData.reduce(
            (sum, record) => sum + (record.electricity || 0),
            0
          );
          // const latestMeter =
          //   approvedRentData[0]?.meterreading ||
          //   approvedRentData[approvedRentData.length - 1]?.meterreading ||
          //   0;

          const latestMeter =
            approvedRentData
              .filter((x) => x.meterreading !== 0)
              .sort(
                (a, b) => new Date(b.paymentdate) - new Date(a.paymentdate)
              )[0]?.meterreading || 0;

          setTotalRent(totalRentPaid);
          setTotalElectricity(totalElectricityPaid);
          setLatestMeterReading(latestMeter);

          // ✅ Determine last paid month (only Approved)
          const lastPaidMonthStr = approvedRentData[0].month; // e.g. "September 2024"
          const [monthName, yearStr] = lastPaidMonthStr.split(" ");

          setCalLoading(false);
        }
      }
    } catch (err) {
      console.error("Error fetching tenant details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch auth user using custom view
  useEffect(() => {
    if (!tenant.userid) return;

    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("auth_users_view")
        .select("*")
        .eq("id", tenant.userid)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setUser(data);
    };

    fetchUser();
  }, [tenant.userid]);

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

  return (
    <>
      <div className="container main">
        {/* Tenant Card */}
        <div className="card p-2 mb-2 position-relative">
          <div className="d-flex gap-2">
            {/* <FaPencilAlt
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                color: "#121212",
              }}
            /> */}
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
              style={{ width: "55px", height: "55px", borderRadius: "10px" }}
            />
            <div>
              <b>{tenant.tenant_name}</b>
              <p>
                <FaPhoneVolume /> (+91) {tenant.contact ? tenant.contact : "-"}
              </p>
              <p className="mb-1">
                Room:
                <b>
                  {tenant.Assets?.asset_name || "Unknown"}{" "}
                  {tenant.Assets?.description
                    ? `- ${tenant.Assets.description}`
                    : ""}
                </b>
              </p>
            </div>
          </div>

          <hr />
          <div className="p-1">
            <p>
              Monthly Rent: <b>₹{tenant.final_rent}</b>
            </p>
            <p>
              Security Deposit:{" "}
              <b style={{ color: "green" }}>₹{tenant.deposit}</b>{" "}
              <i>(Refundable)</i>
            </p>
            <hr className="my-2" />
            <p>
              Lease Start: <b>{formatDate(tenant.leaseStart) || "-"}</b>
            </p>
            <p>
              Lease End:{" "}
              <b style={{ color: "red" }}>
                {formatDate(tenant.leaseEnd) || "-"}
              </b>
            </p>
          </div>
        </div>

        {/* Analytics */}
        <div className="d-flex gap-2 mb-2">
          <div
            className="dash-card card p-2"
            style={{ backgroundColor: "#ecececff", borderColor: "#cdcdcdff" }}
          >
            <p>Rent Paid:</p>
            <p className="dash-number" style={{ color: "#292929ff" }}>
              {calloading ? (
                <CircularProgress size={15} style={{ color: "#292929ff" }} />
              ) : (
                <>₹{totalRent.toLocaleString()}</>
              )}
            </p>
          </div>

          <div
            className="card dash-card p-2"
            style={{ backgroundColor: "#ecececff", borderColor: "#cdcdcdff" }}
          >
            <p>Electricity Paid:</p>
            <p className="dash-number" style={{ color: "#292929ff" }}>
              {calloading ? (
                <CircularProgress size={15} style={{ color: "#292929ff" }} />
              ) : (
                <>₹{totalElectricity.toLocaleString()}</>
              )}
            </p>
          </div>

          <div
            className="card dash-card p-2"
            style={{ backgroundColor: "#ecececff", borderColor: "#cdcdcdff" }}
          >
            <p>Meter Reading:</p>
            <p className="dash-number" style={{ color: "#292929ff" }}>
              {calloading ? (
                <CircularProgress size={15} style={{ color: "#292929ff" }} />
              ) : (
                <>
                  {latestMeterReading}
                  <span style={{ fontWeight: "400" }}>U</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* My Details Card */}
        <div className="card p-3 mb-3 position-relative">
          <p>
            Address:{" "}
            {tenant.address ? (
              <b>{tenant.address}</b>
            ) : (
              <i style={{ color: "grey" }}>Not Available</i>
            )}
          </p>

          <div className="d-flex justify-content-between mt-2">
            <p>
              ID Proof:{" "}
              {!tenant.id_file_front ? (
                <i style={{ color: "grey" }}>Aadhaar Not Uploaded</i>
              ) : (
                <b
                  style={{ cursor: "pointer", color: "cornflowerblue" }}
                  onClick={handleOpenID}
                >
                  View Aadhaar Card
                </b>
              )}
            </p>

            {tenant.aadhar_verified == 1 ? (
              <b style={{ color: "green" }}>
                <MdVerified style={{ marginTop: "-2.4px" }} />
                Verified
              </b>
            ) : null}
          </div>
        </div>

        {/* Co-tenants */}
        <div>
          <div className="d-flex justify-content-between">
            <h5 className="section-title mb-1">Co-Tenants</h5>
            <p style={{ cursor: "pointer", color: "grey" }}>+ Add Co-Tenant</p>
          </div>

          <div className="card p-2 mt-1">
            <div className="d-flex justify-content-between fw-bold mb-2">
              <div style={{ width: "40%" }}>Name</div>
              <div style={{ width: "25%" }}>Relation</div>
              <div style={{ width: "28%" }}>Contact</div>
              <div style={{ width: "7%" }}></div>
            </div>

            {coTenants?.length > 0 ? (
              coTenants.map((co) => (
                <div
                  key={co.id}
                  className="d-flex justify-content-between border-top py-1"
                >
                  <div style={{ width: "40%" }}>
                    {co.name}{" "}
                    {co.status == 1 ? (
                      <MdVerified
                        style={{ color: "green", marginTop: "-2px" }}
                      />
                    ) : null}
                  </div>
                  <div style={{ width: "25%" }}>{co.relation_type}</div>
                  <div style={{ width: "28%" }}>{co.contact}</div>
                  <div style={{ width: "7%" }}>
                    <FaRegTrashCan
                      style={{ color: "red", cursor: "pointer" }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted mt-2">No co-tenants found.</p>
            )}
          </div>
        </div>

        {/* Modal */}
        <Dialog
          open={openID}
          onClose={handleCloseID}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" style={{ fontSize: "1rem" }}>
            {"My Aadhaar Details"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <i>Aadhaar Front:</i>
              <img src={tenant.id_file_front} className="img-fluid mb-2" />
              <i>Aadhaar Back:</i>
              <img src={tenant.id_file_back} className="img-fluid" />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseID} variant="outlined" size="small">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Auth User Details */}
        <h5 className="section-title mt-3 mb-2">User Account Details</h5>
        <div className="card p-2" style={{ backgroundColor: "#efefefff" }}>
          {!user ? (
            <p color="grey">Loading user details...</p>
          ) : (
            <>
              <p>User ID: {user.id}</p>

              <p>Email: {tenant.email}</p>

              <p className="mt-2">
                <b>Created At:</b> {formatDate(user.created_at, true)}
              </p>

              <p style={{ color: "red" }}>
                <b>Last Sign-In:</b>{" "}
                {user.last_sign_in_at ? (
                  formatDate(user.last_sign_in_at, true)
                ) : (
                  <>-</>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default TenantDetails;
