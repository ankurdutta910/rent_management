import React, { useState, useEffect } from "react";
import { TextField, Box, Button } from "@mui/material";
import { supabase } from "../../../supabase";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Alert } from "react-bootstrap";

function EditRent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: "",
    electricity: "",
    latefine: "",
    extraamount: "",
    meterreading: "",
    remark: "",
    paymentdate: "",
    month: "",
    status:""
  });

  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  // Fetch payment record
  useEffect(() => {
    const fetchPayment = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("RentPayments")
        .select(
          `
          id,
          amount,
          electricity,
          latefine,
          extraamount,
          meterreading,
          remark,
          paymentdate,
          month,status
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        toast.error("No record found!");
        setLoading(false);
        return;
      }

      setPaymentData(data);

      // Fill form with existing data
      setFormData({
        amount: data.amount || "",
        electricity: data.electricity || "",
        latefine: data.latefine || "",
        extraamount: data.extraamount || "",
        meterreading: data.meterreading || "",
        remark: data.remark || "",
        status: data.status || "",
        paymentdate: data.paymentdate || "",
        month: data.month || "",
      });

      setLoading(false);
    };

    fetchPayment();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!paymentData) {
      toast.error("No record to update!");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("RentPayments")
        .update({
          amount: parseFloat(formData.amount) || 0,
          electricity: parseFloat(formData.electricity) || 0,
          latefine: parseFloat(formData.latefine) || 0,
          extraamount: parseFloat(formData.extraamount) || 0,
          meterreading: parseFloat(formData.meterreading) || 0,
          remark: formData.remark,
          paymentdate: formData.paymentdate,
          month: formData.month,
          status: formData.status || "Approved" 
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Rent updated successfully!");
      navigate(-1);
    } catch (err) {
      toast.error("Failed to update rent!");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount =
    (parseFloat(formData.amount) || 0) +
    (parseFloat(formData.electricity) || 0) +
    (parseFloat(formData.latefine) || 0) +
    (parseFloat(formData.extraamount) || 0);

  return (
    <>
      <ToastContainer />
      <Box className="container main">
        <h5 className="section-title mb-3">Edit Rent</h5>

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Payment Date */}
            <div className="col-md-4 mb-3">
              <TextField
                fullWidth
                id="paymentdate"
                label="Payment Date"
                size="small"
                type="date"
                required
                InputLabelProps={{ shrink: true }}
                value={formData.paymentdate}
                onChange={handleChange}
              />
            </div>

            {/* Month */}
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

            {/* Amount */}
            <div className="col-md-4 mb-3">
              <TextField
                id="amount"
                fullWidth
                type="number"
                label="Amount"
                size="small"
                required
                value={formData.amount}
                onChange={handleChange}
              />
            </div>

            {/* Electricity */}
            <div className="col-md-4 mb-3">
              <TextField
                type="number"
                id="electricity"
                fullWidth
                label="Electricity"
                size="small"
                value={formData.electricity}
                onChange={handleChange}
              />
            </div>

            {/* Meter Reading */}
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

            {/* Late Fine */}
            <div className="col-md-4 mb-3">
              <TextField
                type="number"
                fullWidth
                id="latefine"
                label="Late Fine"
                size="small"
                value={formData.latefine}
                onChange={handleChange}
              />
            </div>

            {/* Extra Amount */}
            <div className="col-md-4 mb-3">
              <TextField
                fullWidth
                type="number"
                id="extraamount"
                label="Extra Amount"
                size="small"
                value={formData.extraamount}
                onChange={handleChange}
              />
            </div>

            {/* Remark */}
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
            {loading ? "Saving..." : "Update Rent"}
          </Button>
        </form>
      </Box>
    </>
  );
}

export default EditRent;
