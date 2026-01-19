import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { FaPhoneVolume } from "react-icons/fa6";
import { FaCloudUploadAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { FaUserTag } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import {
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddCotenant from "./AddCotenant";
import { MdVerified } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaPencilAlt } from "react-icons/fa";
import EditProfile from "./EditProfile";
import { toast, ToastContainer } from "react-toastify";
import boy from "../assets/img/boy.webp";
import girl from "../assets/img/girl.webp";
import img from "../assets/img/photo.webp";

function MyProfile() {
  const [tenant, setTenant] = useState(null);
  const [coTenants, setCoTenants] = useState([]);
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
        toast.error("No user logged in");
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
          id_file_front,id_file_back,aadhar_verified,
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
        const { data: coTenantData, error: coTenantError } = await supabase
          .from("CoTenants")
          .select("id,name, contact, relation_type,status")
          .eq("tenant_id", tenantData.id);

        if (coTenantError) throw coTenantError;
        setCoTenants(coTenantData || []);

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
            remark
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

  const [openAddCotenant, setOpenAddCotenant] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openID, setOpenID] = useState(false);

  const handleOpenAddCotenant = () => {
    setOpenAddCotenant(true);
  };

  const handleCloseAddCotenant = () => {
    setOpenAddCotenant(false);
  };

  const handleOpenEditProfile = () => {
    setOpenEditProfile(true);
  };

  const handleCloseEditProfile = () => {
    setOpenEditProfile(false);
  };

  const handleOpenID = () => {
    setOpenID(true);
  };
  const handleCloseID = () => {
    setOpenID(false);
  };

  const handleDeleteCotenant = async (cotenantId) => {
    if (!window.confirm("Are you sure you want to delete this co-tenant?"))
      return;

    const { error } = await supabase
      .from("CoTenants")
      .delete()
      .eq("id", cotenantId);

    if (error) {
      console.error("Error deleting co-tenant:", error.message);
      toast.error("Failed to delete co-tenant.");
    } else {
      toast.success("Co-tenant deleted successfully.");
      fetchTenantDetails(); // ✅ refresh list
    }
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
      <AddCotenant
        handleCloseAddCotenant={handleCloseAddCotenant}
        openAddCotenant={openAddCotenant}
        tenant={tenant}
        fetchTenantDetails={fetchTenantDetails}
      />

      <EditProfile
        handleCloseEditProfile={handleCloseEditProfile}
        openEditProfile={openEditProfile}
        tenant={tenant}
        fetchTenantDetails={fetchTenantDetails}
      />

      <div className="container main">
        <h5 className="section-title mb-2">
          <FaUserTag style={{ color: "grey", marginTop: "-4px" }} /> My Profile
        </h5>

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
              alt="user"
              className="img-fluid"
              style={{ width: "55px", height: "55px" }}
            />
            <div>
              <b>{tenant.tenant_name}</b>
              <p>
                <FaPhoneVolume /> (+91) {tenant.contact ? tenant.contact : "-"}
              </p>
              <p className="mb-1">
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

          <hr style={{ marginTop: "5px", borderColor: "#86aad3ff" }} />
          <div className="p-1">
            <p>
              Monthly Rent: <b>₹{tenant.final_rent}</b>
            </p>
            <p>
              Security Deposit:{" "}
              <b style={{ color: "green" }}>₹{tenant.deposit}</b>{" "}
              <i>(Refundable)</i>
            </p>
            <hr
              className="my-2"
              style={{ marginTop: "5px", borderColor: "#86aad3ff" }}
            />
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

        {/* ✅ My Details  */}
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
                <>
                  {" "}
                  <b
                    onClick={handleOpenID}
                    style={{ cursor: "pointer", color: "cornflowerblue" }}
                  >
                    View Aadhaar Card
                  </b>
                </>
              )}
            </p>

            {tenant.aadhar_verified == 1 ? (
              <b style={{ color: "green" }}>
                <MdVerified style={{ marginTop: "-2.4px" }} />
                Verified
              </b>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/upload-id")}
                  variant="outlined"
                  color="error"
                  size="small"
                >
                  <FaCloudUploadAlt /> Upload
                </Button>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="d-flex justify-content-between">
            <h5 className="section-title mb-1">
              <FaUsers
                style={{ color: "grey", marginTop: "-4px", fontSize: "18px" }}
              />{" "}
              My Co-Tenants
            </h5>{" "}
            <p
              style={{ cursor: "pointer", color: "grey" }}
              onClick={handleOpenAddCotenant}
            >
              + Add Co-Tenant
            </p>
          </div>

          <div className="card p-2 mt-1">
            <div className="d-flex justify-content-between fw-bold mb-2">
              <div style={{ width: "40%" }}>Name</div>
              <div style={{ width: "25%" }}>Relation</div>
              <div style={{ width: "28%" }}>Contact</div>
              <div style={{ width: "7%" }}></div>
            </div>

            {coTenants && coTenants.length > 0 ? (
              coTenants.map((co, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between border-top py-1"
                >
                  <div style={{ width: "40%" }}>
                    {co.name}{" "}
                    {co.status == 1 ? (
                      <MdVerified style={{ color: "green" }} />
                    ) : null}
                  </div>
                  <div style={{ width: "25%" }}>{co.relation_type}</div>
                  <div style={{ width: "28%" }}>{co.contact}</div>
                  <div style={{ width: "7%" }}>
                    <FaRegTrashCan
                      onClick={() => handleDeleteCotenant(co.id)}
                      style={{ color: "red", cursor: "pointer" }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-center mt-2">No co-tenants found.</p>
            )}
          </div>
        </div>

        <p
          className="version"
          style={{ textAlign: "center", marginTop: "100px" }}
        >
          Version: 1.02
        </p>

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

        {/* Modal end */}
      </div>
    </>
  );
}

export default MyProfile;
