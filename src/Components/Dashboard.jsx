import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Box, CircularProgress } from "@mui/material";
import { Alert } from "react-bootstrap";
import { FaRegBell } from "react-icons/fa6";
import ProfileImg from "./assets/img/profile.webp";
import RentImg from "./assets/img/rent.webp";
import H1 from "./assets/img/H1.webp";
import H2 from "./assets/img/H2.webp";
import H3 from "./assets/img/H3.webp";
import Complain from "./assets/img/review.webp";
import { Link, useNavigate } from "react-router-dom";
import { MdElectricBolt } from "react-icons/md";
import { LuBadgeIndianRupee } from "react-icons/lu";
import { PiSpeedometer } from "react-icons/pi";
import { MdPendingActions } from "react-icons/md";
import { LuLayoutDashboard } from "react-icons/lu";
import { CiCircleInfo } from "react-icons/ci";
import { IoMdInformationCircle } from "react-icons/io";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState({});
  const [loading, setLoading] = useState(true);
  const [calloading, setCalLoading] = useState(true);
  const [userRole, setUserRole] = useState("tenant");
  const [loadingRole, setLoadingRole] = useState(true);

  // Totals
  const [totalRent, setTotalRent] = useState(0);
  const [totalElectricity, setTotalElectricity] = useState(0);
  const [latestMeterReading, setLatestMeterReading] = useState(0);

  // Rent reminder months
  const [nextDueMonth, setNextDueMonth] = useState("");
  const [dueMonthAfterNext, setDueMonthAfterNext] = useState("");

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data?.user ?? null);
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  // Determine user role
  useEffect(() => {
    if (!user?.id) return;

    async function checkUserRole() {
      setLoadingRole(true);

      try {
        const { data, error } = await supabase
          .from("Admin")
          .select("user_id")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        setUserRole(data ? "admin" : "tenant");
      } catch (err) {
        console.error("Error checking user role:", err);
        setUserRole("tenant");
      } finally {
        setLoadingRole(false);
      }
    }

    checkUserRole();
  }, [user]);

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  const fetchTenantDetails = async () => {
    try {
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
            aadhar_verified,
            Assets (asset_name, description,meterreading,readingupdated)
          `
        )
        .eq("userid", user.id)
        .single();

      if (tenantError) throw tenantError;
      setTenant(tenantData);

      if (tenantData?.id) {
        const { data: coTenantData, error: coTenantError } = await supabase
          .from("CoTenants")
          .select("id,name, contact, relation_type,status")
          .eq("tenant_id", tenantData.id);

        if (coTenantError) throw coTenantError;

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
          const latestMeter =
            approvedRentData
              .filter((x) => x.meterreading !== 0)
              .sort(
                (a, b) => new Date(b.paymentdate) - new Date(a.paymentdate)
              )[0]?.meterreading || 0;

          setLatestMeterReading(latestMeter);

          // ✅ Determine last paid month (only Approved)
          const lastPaidMonthStr = approvedRentData[0].month; // e.g. "September 2024"
          const [monthName, yearStr] = lastPaidMonthStr.split(" ");
          const monthIndex = new Date(`${monthName} 1, ${yearStr}`).getMonth();
          const year = parseInt(yearStr);

          // Function to get month name and year offset by n months
          function getNextMonth(baseMonthIndex, baseYear, offset) {
            let newMonth = baseMonthIndex + offset;
            let newYear = baseYear;

            while (newMonth > 11) {
              newMonth -= 12;
              newYear += 1;
            }

            const newMonthName = new Date(newYear, newMonth).toLocaleString(
              "default",
              { month: "long" }
            );

            return `${newMonthName} ${newYear}`;
          }

          // 🟢 One month after last paid
          const nextDue = getNextMonth(monthIndex, year, 1);
          // 🟢 Two months after last paid (for “Due” display)
          const dueAfterNext = getNextMonth(monthIndex, year, 2);

          setNextDueMonth(nextDue);
          setDueMonthAfterNext(dueAfterNext);
          setCalLoading(false);
        }
      }
    } catch (err) {
      console.error("Error fetching tenant details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Fetch ALL totals for admin
  useEffect(() => {
    async function fetchAdminTotals() {
      if (userRole !== "admin") return;

      try {
        setCalLoading(true);

        const { data, error } = await supabase
          .from("RentPayments")
          .select("amount, electricity, status, paymentdate");

        if (error) throw error;

        // Filter Approved payments
        const approved = data.filter((r) => r.status === "Approved");

        // Filter for the selected year
        const filteredByYear = approved.filter((record) => {
          const year = new Date(record.paymentdate).getFullYear();
          return year === selectedYear;
        });

        // Total rent
        const rentTotal = filteredByYear.reduce(
          (sum, record) => sum + (record.amount || 0),
          0
        );

        // Total electricity
        const elecTotal = filteredByYear.reduce(
          (sum, record) => sum + (record.electricity || 0),
          0
        );

        setTotalRent(rentTotal);
        setTotalElectricity(elecTotal);
      } catch (err) {
        console.error("Admin total fetch failed:", err);
      } finally {
        setCalLoading(false);
      }
    }

    fetchAdminTotals();
  }, [userRole, selectedYear]);

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

  const images = [H1, H2, H3];

  const interval = 5000;

  const [index, setIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (loading || loadingRole) {
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
  }

  return (
    <div className="container main">
      <h5 className="section-title mb-2">
        <LuLayoutDashboard style={{ marginTop: "-4px", color: "grey" }} />{" "}
        Dashboard
      </h5>

      {userRole === "admin" ? (
        <>
          <div className="d-flex gap-2 mb-1">
            <div
              className="dash-card card p-2"
              style={{ backgroundColor: "#defed7ff", borderColor: "#b4f7a5ff" }}
            >
              <b
                style={{
                  color: "#70c95cff",
                  fontSize: "20px",
                  marginBottom: "4px",
                }}
              >
                <LuBadgeIndianRupee />
              </b>
              <p>Total Rent Paid:</p>
              <p className="dash-number" style={{ color: "#1e9304ff" }}>
                {calloading ? (
                  <CircularProgress size={15} style={{ color: "#94fa7dff" }} />
                ) : (
                  <>₹{totalRent.toLocaleString()}</>
                )}
              </p>
            </div>

            <div
              className="card dash-card p-2"
              style={{ backgroundColor: "#fee9d7ff", borderColor: "#ffd6b3ff" }}
            >
              <b
                style={{
                  color: "#f5b074ff",
                  fontSize: "20px",
                  marginBottom: "4px",
                }}
              >
                <MdElectricBolt />
              </b>
              <p>Total Electricity Paid:</p>
              <p className="dash-number" style={{ color: "#ef7f4fff" }}>
                {calloading ? (
                  <CircularProgress size={15} style={{ color: "#f5b074ff" }} />
                ) : (
                  <>₹{totalElectricity.toLocaleString()}</>
                )}
              </p>
            </div>
          </div>

          <p style={{ textAlign: "right", fontSize: "11px", color: "grey" }}>
            <CiCircleInfo style={{ marginTop: "-3px" }} /> Above analytics shows
            data of {currentYear}
          </p>
        </>
      ) : userRole === "tenant" ? (
        <>
          {/* Totals */}
          <div className="d-flex gap-2 mb-2">
            {/* <div
              className="dash-card card p-2"
              style={{ backgroundColor: "#defed7ff", borderColor: "#b4f7a5ff" }}
            >
              <b
                style={{
                  color: "#70c95cff",
                  fontSize: "20px",
                  marginBottom: "4px",
                }}
              >
                <LuBadgeIndianRupee />
              </b>
              <p>Rent Paid:</p>
              <p className="dash-number" style={{ color: "#1e9304ff" }}>
                {calloading ? (
                  <CircularProgress size={15} style={{ color: "#94fa7dff" }} />
                ) : (
                  <>₹{totalRent.toLocaleString()}</>
                )}
              </p>
            </div> */}
            {/* 
            <div
              className="card dash-card p-2"
              style={{ backgroundColor: "#fee9d7ff", borderColor: "#ffd6b3ff" }}
            >
              <b
                style={{
                  color: "#f5b074ff",
                  fontSize: "20px",
                  marginBottom: "4px",
                }}
              >
                <MdElectricBolt />
              </b>
              <p>Electricity Paid:</p>
              <p className="dash-number" style={{ color: "#ef7f4fff" }}>
              {calloading ? (
                <CircularProgress size={15} style={{ color: "#f5b074ff" }} />
                ) : (
                  <>₹{totalElectricity.toLocaleString()}</>
                  )}
                  </p>
            </div> */}

            <div
              className="card dash-card p-2"
              style={{ backgroundColor: "#defed7ff", borderColor: "#b4f7a5ff" }}
            >
              <b
                style={{
                  color: "#70c95cff",

                  fontSize: "22px",
                  marginBottom: "2px",
                }}
              >
                <PiSpeedometer />
              </b>
              <p>Paid Meter Reading:</p>
              <p className="dash-number" style={{ color: "#1e9304ff" }}>
                {calloading ? (
                  <CircularProgress size={15} style={{ color: "#94fa7dff" }} />
                ) : (
                  <>
                    {latestMeterReading}
                    <span style={{ fontWeight: "400" }}> Units</span>
                  </>
                )}
              </p>
            </div>

            <div
              className="dash-card card p-2"
              style={{ backgroundColor: "#d7e9feff", borderColor: "#b6d5f7ff" }}
            >
              <b
                style={{
                  color: "#6caff7ff",
                  fontSize: "20px",
                  marginBottom: "4px",
                }}
              >
                <PiSpeedometer />
              </b>
              <p>Current Meter Reading:</p>
              <p className="dash-number" style={{ color: "#4c9cf1ff" }}>
                {calloading ? (
                  <CircularProgress size={15} style={{ color: "#6caff7ff" }} />
                ) : (
                  <>
                    {tenant.Assets.meterreading || 0.0}{" "}
                    <span style={{ fontWeight: "400" }}>Units</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* <Alert
            style={{ backgroundColor: "#f3f3f3ff", borderColor: "#dededeff" }}
            className="mb-2"
          >
           
            </Alert> */}

          <p className="mb-2" style={{ color: "#838383ff" }}>
            <IoMdInformationCircle style={{ marginTop: "-2px" }} /> Reading
            Updated on:{" "}
            {calloading ? (
              <CircularProgress size={10} style={{ color: "#4e4800ff" }} />
            ) : (
              <b>{formatDate(tenant.Assets.readingupdated)}</b>
            )}
          </p>

          {/* Rent Reminder */}
          <Alert variant="danger">
            {/* <FaRegBell style={{ marginTop: "-2px", fontSize: "16px" }} />{" "}
            Upcoming Rent Payment
            <div className="d-flex justify-content-between mt-2">
              <p>
                Month:{" "}
                <b>
                  {calloading ? (
                    <>
                      <CircularProgress
                        size={11}
                        style={{ color: "#ba443aff" }}
                      />
                    </>
                  ) : (
                    <>{nextDueMonth || "N/A"}</>
                  )}
                </b>
              </p>
              <p>
                Due:{" "}
                <b>
                  {calloading ? (
                    <>
                      <CircularProgress
                        size={11}
                        style={{ color: "#ba443aff" }}
                      />
                    </>
                  ) : (
                    <>5th {dueMonthAfterNext || ""}</>
                  )}
                </b>
              </p>
            </div> */}
            {tenant.aadhar_verified == 0 ? (
              <>
                {/* <br /> */}
                <p>
                  <MdPendingActions
                    style={{ marginTop: "-2px", fontSize: "16px" }}
                  />{" "}
                  Aadhaar verification pending. Please upload your Aadhaar card.{" "}
                  <Link
                    to="/upload-id"
                    style={{ color: "red", textDecoration: "underline" }}
                  >
                    Upload Now
                  </Link>
                </p>
              </>
            ) : null}
            </Alert>
            
        
          {/* Quick Links */}
          <div className="d-flex gap-2">
            {/* My Rents */}
            <Link to="/my-rents" className="flex-grow-1 text-decoration-none">
              <div className="card p-3 text-center h-100 w-100">
                <img
                  src={RentImg}
                  style={{ width: "60px" }}
                  className="img-fluid mx-auto"
                  alt="Rent"
                />
                <b className="mt-2 d-block text-dark">My Rents</b>
              </div>
            </Link>

            {/* My Profile */}
            <Link to="/my-profile" className="flex-grow-1 text-decoration-none">
              <div className="card p-3 text-center h-100 w-100">
                <img
                  src={ProfileImg}
                  style={{ width: "60px" }}
                  className="img-fluid mx-auto"
                  alt="Profile"
                />
                <b className="mt-2 d-block text-dark">My Profile</b>
              </div>
            </Link>

            {/* Feedback */}
            <Link
              to="/submit-feedback"
              className="flex-grow-1 text-decoration-none"
            >
              <div className="card p-3 text-center h-100 w-100">
                <img
                  src={Complain}
                  style={{ width: "60px" }}
                  className="img-fluid mx-auto"
                  alt="Feedback"
                />
                <b className="mt-2 d-block text-dark">Feedback</b>
              </div>
            </Link>
            </div>
            

            <div className="card mt-3"></div>

          <div className="custom-slider mt-3">
            <div
              className="slider-wrapper"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => navigate("/health-insurance")}
                  className="slide"
                  alt=""
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div></div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
