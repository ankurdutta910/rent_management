import React, { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import logo from "./assets/img/logo.webp";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { toast, ToastContainer } from "react-toastify";
import { Alert } from "react-bootstrap";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

function GenerateUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
  });

  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 🔍 Check if email or contact already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("UserGenerate")
      .select("*")
      .or(`email.eq.${formData.email},contact.eq.${formData.contact}`);

    if (checkError) throw checkError;

    if (existingUser.length > 0) {
      toast.error("Email or mobile number already exists!");
      setLoading(false);
      return; // ❌ Stop submission
    }

    // ✅ Insert new user if no duplicates
    const { error: insertError } = await supabase.from("UserGenerate").insert([
      {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
      },
    ]);

    if (insertError) throw insertError;

    toast.success("User Credentials Request Submitted!");
    setDisable(true);
    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      contact: "",
    });

  } catch (err) {
    console.error("Error:", err.message);
    toast.error("Failed to submit request!");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <ToastContainer />

      <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top">
        <div className="container-fluid navbar-content">
          <Link className="navbar-brand">
            <img src={logo} className="img-fluid logoimg" alt="logo" />
          </Link>
        </div>
      </nav>

      <Box className="container main" style={{ paddingTop: "20px" }}>
        <h5 className="section-title mb-3">Generate User Credentials</h5>

        <form onSubmit={handleSubmit}>
          <div className="row">

            <div className="col-md-4 mb-3">
              <TextField
                name="name"
                fullWidth
                type="text"
                label="Full Name"
                size="small"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4 mb-3">
              <TextField
                name="email"
                fullWidth
                type="email"
                label="Email ID"
                size="small"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4 mb-3">
              <TextField
                name="contact"
                fullWidth
                type="text"
                label="Mobile Number"
                size="small"
                required
                value={formData.contact}
                onChange={handleChange}
              />
            </div>
          </div>

          {submitted && (
            <Alert variant="success">
              <IoMdCheckmarkCircleOutline /> Request submitted. Your username and
              password will be sent to your mobile number and email ID within 24
              hours.
            </Alert>
          )}

          <Button
            disabled={loading || disable}
            fullWidth
            variant="contained"
            type="submit"
          >
            {loading ? "Please wait..." : disable ? "Submitted" : "Submit"}
          </Button>
        </form>
      </Box>
    </>
  );
}

export default GenerateUser;
