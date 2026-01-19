import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { supabase } from "../../../supabase";
import { ImBlocked } from "react-icons/im";
import { FaPencilAlt } from "react-icons/fa";

function RentalDetails() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState({});
  const [rentPayments, setRentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  const fetchTenantDetails = async () => {
    try {
      // Fetch tenant
      const { data: tenantRecord, error: tenantError } = await supabase
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
        .eq("id", id)
        .single();

      if (tenantError) throw tenantError;
      setTenant(tenantRecord);

      // Fetch rent payments
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
        .eq("tenant_id", id)
        .order("paymentdate", { ascending: false });

      if (rentError) throw rentError;
      setRentPayments(rentData || []);
    } catch (err) {
      console.error("Error fetching tenant details:", err.message);
    } finally {
      setLoading(false);
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

  return (
    <>
      <ToastContainer />
      <div className="container main">
        <h5 className="section-title mb-2">Rental Details</h5>

        {/* Tenant Info Card */}
        {loading ? (
          <>
            <div className="card p-3 mb-3" style={{ background: "#f0f0f0ff" }}>
              <p className="mb-0">
                Tenant -{" "}
                <b>
                  ---
                  <i>--</i>
                </b>
              </p>

              <p className="mb-1">
                Agreed Rent - <b>₹0.00</b>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="card p-3 mb-3" style={{ background: "#f0f0f0ff" }}>
              <p className="mb-0">
                Tenant -{" "}
                <b>
                  {tenant?.tenant_name}{" "}
                  <i>({tenant?.Assets?.asset_name || "Unknown Asset"})</i>
                </b>
              </p>

              <p className="mb-1">
                Monthly Rent - <b>₹{tenant?.final_rent}</b>
              </p>
            </div>
          </>
        )}

        {/* Rent Payments Section */}
        <h5 className="section-title mt-3">Payment History</h5>

        {rentPayments && rentPayments.length > 0 ? (
          rentPayments.map((payment) => (
            <div
              key={payment.id}
              className="card p-2 mt-2"
              style={{
                backgroundColor:
                  payment.status === "Pending" ? "#f8d7dad7" : null,
                borderColor: payment.status === "Pending" ? "#f1aeb5" : null,
                color: payment.status === "Pending" ? "#58151C" : null,
              }}
            >
              <div
                className="d-flex gap-2"
                style={{
                  position: "absolute",
                  bottom: "15px",
                  right: "15px",
                  fontSize: "16px",
                }}
              >
                <FaPencilAlt
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/edit-rent/${payment?.id}`)}
                />
              </div>
              {/* Top Row */}
              <div className="d-flex justify-content-between">
                <p>
                  Month: <b>{payment.month} </b>
                </p>

                {payment.status === "Approved" ? (
                  <p>
                    Payment Date:{" "}
                    <b>{formatDate(payment.paymentdate)}</b>
                  </p>
                ) : (
                  <b>
                    <ImBlocked style={{ marginTop: "-3px" }} /> Payment Pending
                  </b>
                )}
              </div>

              <hr className="my-1" />

              {/* Rent & Electricity */}
              <div className="d-flex justify-content-between">
                <p>
                  Rent: <b>₹{payment.amount}.00</b>
                </p>
                <p>
                  Electricity: <b>₹{payment.electricity}.00</b> | Units:{" "}
                  <b>{payment.meterreading}</b>
                </p>
              </div>

              {/* Fines & Extra */}
              <div className="d-flex justify-content-between">
                <p>
                  Late Fine:{" "}
                  <b>{payment.latefine ? `₹${payment.latefine}.00` : "-"}</b>
                </p>

                <p>
                  Others:{" "}
                  <b>
                    {payment.extraamount ? `₹${payment.extraamount}.00` : "-"}
                  </b>
                </p>
              </div>

              {/* Grand Total */}
              <div className="d-flex justify-content-end">
                <p>
                  Grand Total:{" "}
                  <b
                    style={{
                      color: payment.status === "Pending" ? "#58151C" : "green",
                    }}
                  >
                    ₹
                    {payment.amount +
                      payment.electricity +
                      (payment.latefine || 0) +
                      (payment.extraamount || 0)}
                    .00
                  </b>
                </p>
              </div>

              <hr className="mt-1 mb-1" />

              {/* Remark */}
              <p>
                <i>Remark:</i> {payment.remark || "-"}
              </p>

              {/* Receipt */}
              {payment.status === "Approved" ? (
                <p
                  style={{
                    cursor: "pointer",
                    color: "cornflowerblue",
                    maxWidth: "60%",
                  }}
                  onClick={() =>
                    navigate("/receipt", { state: { tenant, payment } })
                  }
                >
                  Download Receipt
                </p>
              ) : (
                <p>Receipt Not Generated</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted mt-2">No rent payments found.</p>
        )}
      </div>
    </>
  );
}

export default RentalDetails;
