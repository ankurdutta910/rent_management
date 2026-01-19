import React, { useState, useEffect } from "react";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
import { supabase } from "../supabase";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import H1 from "./assets/img/H1.webp";
import H2 from "./assets/img/H2.webp";
import H3 from "./assets/img/H3.webp";

function HealthInsurance() {
  const navigate = useNavigate();

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // SELF MEMBER
  const [selfName, setSelfName] = useState("");
  const [selfDob, setSelfDob] = useState("");
  const [selfAge, setSelfAge] = useState("");
  const [message, setMessage] = useState(false);

  // FAMILY TOGGLE
  const [addFamily, setAddFamily] = useState(false);

  const familyFields = [
    { key: "father", label: "Father" },
    { key: "mother", label: "Mother" },
    { key: "wife", label: "Wife" },
    { key: "child1", label: "Child 1" },
    { key: "child2", label: "Child 2" },
    { key: "child3", label: "Child 3" },
  ];

  const initialFamilyState = {
    father: "",
    mother: "",
    wife: "",
    child1: "",
    child2: "",
    child3: "",
  };

  const [familyDob, setFamilyDob] = useState(initialFamilyState);
  const [familyAges, setFamilyAges] = useState(initialFamilyState);

  const handleFamilyChange = (field, value) => {
    setFamilyDob((prev) => ({ ...prev, [field]: value }));
    setFamilyAges((prev) => ({ ...prev, [field]: calculateAge(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Self validation
    if (!selfName) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!selfDob) {
      toast.error("Please enter your date of birth.");
      return;
    }

    // Family validation
    if (addFamily) {
      for (let f of [
        "father",
        "mother",
        "wife",
        "child1",
        "child2",
        "child3",
      ]) {
        if (!familyDob[f]) {
          toast.error(`Please enter DOB for ${f.toUpperCase()}.`);
          return;
        }
        if (f.includes("child") && familyAges[f] > 25) {
          toast.error(`${f.toUpperCase()} age must be below 26.`);
          return;
        }
      }
    }

    // GET LOGGED-IN USER
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login first!");
      return;
    }
    const userId = user.id;

    // GET TENANT ID USING LOGGED IN USER ID
    const { data: tenantData, error: tenantError } = await supabase
      .from("Tenants")
      .select("*")
      .eq("userid", userId)
      .single();

    if (tenantError || !tenantData) {
      toast.error("Tenant not found!");
      return;
    }

    const tenantId = tenantData.id;

    // PAYLOAD (DOB stored instead of Age)
    const payload = {
      tenantId,
      fullname: selfName,
      selfage: selfDob,

      fatherage: familyDob.father || null,
      motherage: familyDob.mother || null,
      wifeage: familyDob.wife || null,
      child1age: familyDob.child1 || null,
      child2age: familyDob.child2 || null,
      child3age: familyDob.child3 || null,
    };

    const { error } = await supabase.from("HealthInsurance").insert([payload]);

    if (error) {
      toast.error("Submission failed: " + error.message);
    } else {
      toast.success("Details submitted successfully!");
      setMessage(true);
      // RESET SELF
      setSelfName("");
      setSelfDob("");
      setSelfAge("");

      // RESET FAMILY
      setAddFamily(false);
      setFamilyDob(initialFamilyState);
      setFamilyAges(initialFamilyState);
    }
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

  return (
    <>
      <ToastContainer />
      <div className="container main">
        <div className="custom-slider mb-2">
          <div
            className="slider-wrapper"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((img, i) => (
              <img key={i} src={img} className="slide" alt="" />
            ))}
          </div>
        </div>
        <h5 className="section-title mb-2">
          Fill your details:
        </h5>
        {message && (
          <Alert variant="primary">
            Your Quotation will be sent to your registered Email within 24
            hours.
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {/* SELF MEMBER */}
          <div className="p-1">

            <TextField
              size="small"
              label="Full Name"
              value={selfName}
              onChange={(e) => setSelfName(e.target.value)}
              required
              fullWidth
              className="mb-2"
            />

            <TextField
              type="date"
              size="small"
              label="Date of Birth"
              InputLabelProps={{ shrink: true }}
              value={selfDob}
              onChange={(e) => {
                const dob = e.target.value;
                setSelfDob(dob);
                setSelfAge(calculateAge(dob));
              }}
              required
              fullWidth
            />

            {selfAge !== "" && (
              <p className="mt-1">
                <strong>Age:</strong> {selfAge} years
              </p>
            )}
          </div>

          {/* FAMILY CHECKBOX */}
          <FormControlLabel
            control={
              <Checkbox
                checked={addFamily}
                onChange={(e) => setAddFamily(e.target.checked)}
              />
            }
            label="Add Family Members?"
          />

          {/* FAMILY MEMBERS */}
          {addFamily && (
            <div>
              {familyFields.map((item) => (
                <div key={item.key} className="p-2 border rounded mb-3">
                  <h6>{item.label}</h6>

                  <TextField
                    type="date"
                    size="small"
                    label="Date of Birth"
                    InputLabelProps={{ shrink: true }}
                    value={familyDob[item.key]}
                    onChange={(e) =>
                      handleFamilyChange(item.key, e.target.value)
                    }
                    required
                    fullWidth
                  />

                  {familyAges[item.key] !== "" && (
                    <p className="mt-1">
                      <strong>Age:</strong> {familyAges[item.key]} years{" "}
                      {item.key.includes("child") &&
                        familyAges[item.key] > 25 && (
                          <span style={{ color: "red" }}>
                            {" "}
                            (Age limit exceeded!)
                          </span>
                        )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button type="submit" variant="contained">
            Submit
          </Button>
        </form>
      </div>
    </>
  );
}

export default HealthInsurance;
