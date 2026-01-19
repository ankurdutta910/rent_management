import React, { useState, useEffect } from "react";
import { TextField, Box, Typography, Button } from "@mui/material";
import { supabase } from "../../../supabase"; // adjust path if needed
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Alert } from "react-bootstrap";

function AddRent() {
  const location = useLocation();
  const tenantData = location.state?.tenant || {};
  const lastPaymentDate = location.state?.lastPaymentDate || null;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: tenantData.final_rent || "",
    electricity: "",
    latefine: "",
    extraamount: "",
    meterreading: "",
    remark: "",
    paymentdate: "",
    month: "",
    status: "Approved"
  });

  const [loading, setLoading] = useState(false);

  // ✅ Redirect if no tenant found
  useEffect(() => {
    if (!tenantData?.id) {
      toast.error("No Tenant Found!");
      navigate("/admin-rentals");
    }
  }, [tenantData, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Check if tenant data is available
    if (!tenantData?.id) {
      toast.error("No Tenant Found!");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from("RentPayments").insert([
        {
          amount: parseFloat(formData.amount),
          electricity: parseFloat(formData.electricity) || 0,
          latefine: parseFloat(formData.latefine) || 0,
          extraamount: parseFloat(formData.extraamount) || 0,
          meterreading: parseFloat(formData.meterreading) || 0,
          remark: formData.remark,
          paymentdate: formData.paymentdate,
          tenant_id: tenantData.id || "",
          status: formData.status || "Approved",
          month: formData.month,
        },
      ]);

      if (error) throw error;

      toast.success("Rent added successfully!");
      if (tenantData?.id) {
        navigate(`/rent-details/${tenantData?.id}`);
      } else {
        navigate(-1);
      }
      setFormData({
        amount: "",
        electricity: "",
        latefine: "",
        extraamount: "",
        meterreading: "",
        remark: "",
        paymentdate: "",
        status:"Approved"
      });
    } catch (err) {
      console.error("Error adding rent:", err.message);
      toast.error("Failed to add rent!");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // 🧮 Compute total dynamically
  const totalAmount =
    (parseFloat(formData.amount) || 0) +
    (parseFloat(formData.electricity) || 0) +
    (parseFloat(formData.latefine) || 0) +
    (parseFloat(formData.extraamount) || 0);

  return (
    <>
      <ToastContainer />
      <Box className="container main">
        <h5 className="section-title mb-3">Add Rent</h5>
        <div className="card p-3 mb-3" style={{ background: "#e6e6e6" }}>
          <p className="mb-0">
            Tenant -{" "}
            <b>
              {tenantData.tenant_name} <i>({tenantData.asset_name})</i>
            </b>
          </p>
          <p className="mb-1">
            Agreed Rent- <b>₹{tenantData.final_rent}</b>
          </p>
          <hr className="mt-1 mb-1" />
          <p className="mb-0">
            Last Payment-{" "}
            <b>
              {lastPaymentDate ? (
                formatDate(lastPaymentDate)
              ) : (
                <span style={{ color: "red" }}>No Payments Yet</span>
              )}
            </b>
          </p>
        </div>
        <hr />
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <TextField
                fullWidth
                id="paymentdate"
                label="Payment Date"
                size="small"
                type="date"
                required
                InputLabelProps={{ shrink: true }}
                value={
                  formData.paymentdate || new Date().toISOString().split("T")[0]
                } // ✅ default today
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4 mb-3">
              <TextField
                select
                id="month"
                label="Rent Month"
                fullWidth
                size="small"
                value={formData.month}
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">--Select--</option>
                <option value="May 2024">May 2024</option>
                <option value="June 2024">June 2024</option>
                <option value="July 2024">July 2024</option>
                <option value="August 2024">August 2024</option>
                <option value="September 2024">September 2024</option>
                <option value="October 2024">October 2024</option>
                <option value="November 2024">November 2024</option>
                <option value="December 2024">December 2024</option>
                <hr/>
                <option value="January 2025">January 2025</option>
                <option value="February 2025">February 2025</option>
                <option value="March 2025">March 2025</option>
                <option value="April 2025">April 2025</option>
                <option value="May 2025">May 2025</option>
                <option value="June 2025">June 2025</option>
                <option value="July 2025">July 2025</option>
                <option value="August 2025">August 2025</option>
                <option value="September 2025">September 2025</option>
                <option value="October 2025">October 2025</option>
                <option value="November 2025">November 2025</option>
                <option value="December 2025">December 2025</option>
                <hr/>
                <option value="January 2026">January 2026</option>
                <option value="February 2026">February 2026</option>
                <option value="March 2026">March 2026</option>
                <option value="April 2026">April 2026</option>
                <option value="May 2026">May 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="October 2026">October 2026</option>
                <option value="November 2026">November 2026</option>
                <option value="December 2026">December 2026</option>
              </TextField>
            </div>

            <div className="col-md-4 mb-3">
              <TextField
                id="amount"
                fullWidth
                type="number"
                label="Amount"
                size="small"
                required
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                }}
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 mb-3">
              <TextField
                type="number"
                id="electricity"
                fullWidth
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                }}
                label="Electricity"
                size="small"
                value={formData.electricity}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 mb-3">
              <TextField
                type="number"
                fullWidth
                id="meterreading"
                label="Meter Reading"
                size="small"
                value={formData.meterreading}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 mb-3">
              <TextField
                type="number"
                fullWidth
                id="latefine"
                label="Late Fine"
                size="small"
                value={formData.latefine}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                }}
              />
            </div>
            <div className="col-md-4 mb-3">
              <TextField
                fullWidth
                type="number"
                id="extraamount"
                label="Extra Amount"
                size="small"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                }}
                value={formData.extraamount}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4 mb-3">
              <TextField
                fullWidth
                id="remark"
                label="Remark"
                size="small"
                multiline
                rows={2}
                value={formData.remark}
                onChange={handleChange}
              />
            </div>
             <div className="col-md-4">
              <TextField
                select
                id="status"
                label="Status"
                fullWidth
                size="small"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="">--Select--</option>
                <option value="Approved">Approved</option> 
                <option value="Pending">Pending</option>    
              </TextField>
            </div>
          </div>

          <Alert style={{ marginTop: "15px" }}>
            Total Amount: <b>₹{totalAmount.toFixed(2)}</b>
          </Alert>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 1 }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit"}
          </Button>
        </form>
      </Box>
    </>
  );
}

export default AddRent;
