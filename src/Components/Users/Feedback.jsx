import React, { useState, useEffect } from "react";
import {
  TextField,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { supabase } from "../../supabase";
import { Alert } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

function Feedback() {
  const [formData, setFormData] = useState({
    message: "",
  });

  const [anonymous, setAnonymous] = useState(false); // ✅ NEW
  const [loading, setLoading] = useState(false);
  const [subloading, setSubLoading] = useState(false);
  const [tenant, setTenant] = useState({});

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
        .select(`id, tenant_name`)
        .eq("userid", user.id)
        .single();

      if (tenantError) throw tenantError;
      setTenant(tenantData);
    } catch (err) {
      console.error("Error fetching tenant details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, message: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubLoading(true);

    try {
      const { error } = await supabase.from("Feedbacks").insert([
        {
          message: formData.message,
          tenant_id: tenant?.id, // ✅ Anonymous logic
          anonymous: anonymous, // store TRUE/FALSE
        },
      ]);

      if (error) throw error;

      toast.success("Feedback submitted successfully!");
      setFormData({ message: "" });
      setAnonymous(false);
    } catch (err) {
      console.error("Error submitting:", err.message);
      toast.error("Failed to submit feedback!");
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container main">
        <h5 className="section-title mb-3">Submit Feedback</h5>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <TextField
                style={{ width: "100%"}}
                id="message"
                placeholder="Write your feedback here..."
                required
                value={formData.message}
                onChange={handleChange}
                multiline
                rows={5}
              />
            </div>

            <div className="col-md-12 mb-3">
              {/* ✅ Anonymous Checkbox */}

              <FormControlLabel
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                control={<Checkbox />}
                label="Submit as Anonymous"
              />
            </div>

            <div className="col-md-12 mb-3">
              <Button
                type="submit"
                variant="contained"
                disabled={subloading}
                fullWidth
              >
                {subloading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default Feedback;
