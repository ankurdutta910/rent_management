import React, { useState, useEffect } from "react";
import { TextField, Box, Button, CircularProgress } from "@mui/material";
import { supabase } from "../../supabase";
import { toast, ToastContainer } from "react-toastify";
import { Alert } from "react-bootstrap";
import { MdOutlineNewLabel } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function AddRent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    electricity: "",
    latefine: "",
    extraamount: "",
    meterreading: "",
    remark: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitloading, setSubmitLoading] = useState(false);
  const [tenant, setTenant] = useState({});
  const [nextDueMonth, setNextDueMonth] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return;

      const { data: tenantData, error: tenantError } = await supabase
        .from("Tenants")
        .select(
          `
            id,
            tenant_name,
            final_rent
          `
        )
        .eq("userid", user.id)
        .single();

      if (tenantError) throw tenantError;
      setTenant(tenantData);

      // Fetch rent history (no "Approved" condition)
      const { data: rentData, error: rentError } = await supabase
        .from("RentPayments")
        .select("id, month, meterreading")
        .eq("tenant_id", tenantData.id)
        .order("paymentdate", { ascending: false });

      if (rentError) throw rentError;

      if (rentData && rentData.length > 0) {
        const lastPaidMonthStr = rentData[0].month; // e.g. "September 2024"
        const [monthName, yearStr] = lastPaidMonthStr.split(" ");
        const monthIndex = new Date(`${monthName} 1, ${yearStr}`).getMonth();
        const year = parseInt(yearStr);

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

        const nextDue = getNextMonth(monthIndex, year, 1);
        setNextDueMonth(nextDue);
      } else {
        const today = new Date();
        const monthName = today.toLocaleString("default", { month: "long" });
        const year = today.getFullYear();
        setNextDueMonth(`${monthName} ${year}`);
      }
    } catch (err) {
      console.error("Error fetching tenant details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const { error } = await supabase.from("RentPayments").insert([
        {
          amount: parseFloat(tenant.final_rent) || 0,
          electricity: parseFloat(formData.electricity) || 0,
          latefine: parseFloat(formData.latefine) || 0,
          extraamount: parseFloat(formData.extraamount) || 0,
          meterreading: parseFloat(formData.meterreading) || 0,
          remark: formData.remark,
          month: nextDueMonth,
          tenant_id: tenant?.id || "",
        },
      ]);

      if (error) throw error;
      navigate("/my-rents");
      setTimeout(() => {
        toast.success("Rent added successfully!");
      }, 1000);
      setFormData({
        amount: "",
        electricity: "",
        latefine: "",
        extraamount: "",
        meterreading: "",
        remark: "",
      });
    } catch (err) {
      console.error("Error adding rent:", err.message);
      toast.error("Failed to add rent!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const totalAmount =
    (parseFloat(tenant.final_rent) || 0) +
    (parseFloat(formData.electricity) || 0) +
    (parseFloat(formData.latefine) || 0) +
    (parseFloat(formData.extraamount) || 0);

  return (
    <>
      <ToastContainer />
      <div className="container main">
        <h5 className="section-title mb-3 mt-2">
          <MdOutlineNewLabel
            style={{ marginTop: "-4px", color: "grey", fontSize: "18px" }}
          />{" "}
          Add Rent
        </h5>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <TextField
                id="month"
                fullWidth
                type="text"
                label="Month"
                size="small"
                required
                disabled
                value={nextDueMonth}
                InputProps={{
                  readOnly: true,
                  endAdornment: loading && <CircularProgress size={20} />,
                }}
              />
            </div>

            <div className="col-md-4 mb-3">
              <TextField
                id="amount"
                fullWidth
                type="number"
                label="Base Rent"
                size="small"
                disabled
                required
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                }}
                value={tenant.final_rent}
              />
            </div>

            <div className="col-6 mb-3">
              <TextField
                id="electricity"
                fullWidth
                type="number"
                label="Electricity"
                size="small"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                }}
                value={formData.electricity}
                onChange={handleChange}
              />
            </div>

            <div className="col-6 mb-3">
              <TextField
                id="meterreading"
                fullWidth
                type="number"
                label="Meter Reading"
                size="small"
                value={formData.meterreading}
                onChange={handleChange}
              />
            </div>

            <div className="col-6 mb-3">
              <TextField
                id="latefine"
                fullWidth
                type="number"
                label="Late Fine"
                size="small"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                }}
                value={formData.latefine}
                onChange={handleChange}
              />
            </div>

            <div className="col-6 mb-3">
              <TextField
                id="extraamount"
                fullWidth
                type="number"
                label="Extra Amount"
                size="small"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                }}
                value={formData.extraamount}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <TextField
                id="remark"
                fullWidth
                label="Remark"
                size="small"
                multiline
                rows={2}
                value={formData.remark}
                onChange={handleChange}
              />
            </div>
          </div>

          <Alert variant="success" style={{ marginTop: "15px" }}>
            Total Payable Amount: <b>₹{totalAmount.toFixed(2)}</b>
          </Alert>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitloading}
          >
            {submitloading ? "Saving..." : "Submit"}
          </Button>
          <br />
          <br />
          <i style={{ color: "grey" }}>
            Note: Your payment will require landlord approval after you submit
            the request.
          </i>
        </form>
      </div>
    </>
  );
}

export default AddRent;
