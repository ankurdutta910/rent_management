import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  TextField,
  Button,
  InputLabel,
  FormControl,
  IconButton,
} from "@mui/material";
import { supabase } from "../../../supabase";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AddTenant() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [address, setAddress] = useState("");
  const [finalRent, setFinalRent] = useState("");
  const [deposit, setDeposit] = useState(""); // ✅ new
  const [leaseStart, setLeaseStart] = useState(""); // ✅ new
  const [leaseEnd, setLeaseEnd] = useState(""); // ✅ new
  const [gender, setGender] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [coTenants, setCoTenants] = useState([
    { name: "", relation_type: "", gender: "", contact: "" },
  ]);

  // Fetch all assets
  useEffect(() => {
    const fetchAssets = async () => {
      const { data, error } = await supabase
        .from("Assets")
        .select("id, asset_name, status");
      if (error) console.error(error);
      else setAssets(data || []);
    };
    fetchAssets();
  }, []);

  // Add / Remove co-tenants
  const addCoTenant = () => {
    setCoTenants([
      ...coTenants,
      { name: "", relation_type: "", gender: "", contact: "" },
    ]);
  };

  const removeCoTenant = (index) => {
    setCoTenants(coTenants.filter((_, i) => i !== index));
  };

  const handleCoTenantChange = (index, field, value) => {
    const updated = [...coTenants];
    updated[index][field] = value;
    setCoTenants(updated);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      !tenantName ||
      !selectedAsset ||
      !finalRent ||
      !gender ||
      !contact ||
      !deposit ||
      !leaseStart ||
      !leaseEnd
    ) {
      toast.error("Please fill all required fields.");
      setLoading(false);
      return;
    }

    // Insert tenant record
    const { data: tenantData, error: tenantError } = await supabase
      .from("Tenants")
      .insert([
        {
          tenant_name: tenantName,
          asset_id: selectedAsset,
          address,
          final_rent: finalRent,
          deposit,
          leaseStart,
          leaseEnd,
          gender,
          contact,
        },
      ])
      .select();

    if (tenantError) {
      toast.error("Failed to add tenant: " + tenantError.message);
      setLoading(false);
      return;
    }

    const tenantId = tenantData[0]?.id;

    // Insert co-tenants (if any)
    const validCoTenants = coTenants.filter((c) => c.name.trim() !== "");
    if (tenantId && validCoTenants.length > 0) {
      const { error: coTenantError } = await supabase.from("CoTenants").insert(
        validCoTenants.map((c) => ({
          tenant_id: tenantId,
          name: c.name,
          relation_type: c.relation_type,
          gender: c.gender,
          contact: c.contact,
        }))
      );
      if (coTenantError)
        toast.error.error("Co-tenant insert error:", coTenantError);
      setLoading(false);
    }

    // ✅ Update asset status to "Not Available"
    const { error: updateError } = await supabase
      .from("Assets")
      .update({ status: "Not Available" })
      .eq("id", selectedAsset);

    if (updateError) {
      // console.error("Error updating asset status:", updateError);
      toast.error("Tenant added, but failed to update asset status.");
      setLoading(false);
    } else {
      setLoading(false);
      toast.success("Tenant and Co-tenants added successfully!");
      navigate("/admin-tenants");
    }

    // Reset form
    setTenantName("");
    setSelectedAsset("");
    setAddress("");
    setFinalRent("");
    setDeposit("");
    setLeaseStart("");
    setLeaseEnd("");
    setGender("");
    setContact("");
    setCoTenants([{ name: "", relation_type: "", gender: "", contact: "" }]);
  };

  return (
    <>
      <ToastContainer />
      <div className="container main">
        <h5 className="section-title mb-3">Add New Tenant</h5>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {/* Asset Selector */}
          <FormControl size="small">
            <InputLabel id="asset-label">Select Asset</InputLabel>
            <Select
              labelId="asset-label"
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              label="Select Asset"
            >
              <MenuItem value="">
                <em>Select Asset</em>
              </MenuItem>
              {assets.map((asset) => (
                <MenuItem
                  key={asset.id}
                  value={asset.id}
                  disabled={asset.status === "Not Available"}
                >
                  {asset.asset_name}{" "}
                  {asset.status === "Not Available" ? " (Not Available)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Tenant Info */}
          <TextField
            label="Tenant Name"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            size="small"
            required
          />

          <FormControl size="small">
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              label="Gender"
            >
              <MenuItem value="">
                <em>Select Gender</em>
              </MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            size="small"
            inputProps={{ maxLength: 15 }}
            required
          />

          <TextField
            label="Permanent Address"
            multiline
            minRows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            size="small"
          />

          <TextField
            label="Final Rent (₹)"
            value={finalRent}
            onChange={(e) => setFinalRent(e.target.value)}
            size="small"
            required
          />

          {/* ✅ Deposit */}
          <TextField
            label="Security Deposit (₹)"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            size="small"
            required
          />

          {/* ✅ Lease Dates */}
          <div className="d-flex gap-3">
            <TextField
              label="Lease Start Date"
              type="date"
              value={leaseStart}
              onChange={(e) => setLeaseStart(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Lease End Date"
              type="date"
              value={leaseEnd}
              onChange={(e) => setLeaseEnd(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              required
            />
          </div>

          {/* Co-Tenants Section */}
          <h6 className="mb-0">Co-Tenants</h6>
          {coTenants.map((cot, index) => (
            <div key={index} className="row mt-0">
              <div className="col-md-3 mb-2">
                <TextField
                  fullWidth
                  label="Name"
                  size="small"
                  value={cot.name}
                  onChange={(e) =>
                    handleCoTenantChange(index, "name", e.target.value)
                  }
                />
              </div>
              <div className="col-md-3 mb-2">
                <TextField
                  fullWidth
                  label="Relation"
                  size="small"
                  value={cot.relation_type}
                  onChange={(e) =>
                    handleCoTenantChange(index, "relation_type", e.target.value)
                  }
                />
              </div>
              <div className="col-md-2 mb-2">
                <FormControl fullWidth size="small">
                  <Select
                    value={cot.gender}
                    onChange={(e) =>
                      handleCoTenantChange(index, "gender", e.target.value)
                    }
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Gender</em>
                    </MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="col-md-2 mb-2">
                <TextField
                  fullWidth
                  label="Contact"
                  size="small"
                  value={cot.contact}
                  onChange={(e) =>
                    handleCoTenantChange(index, "contact", e.target.value)
                  }
                />
              </div>
              <div className="col-md-1">
                <IconButton color="error" onClick={() => removeCoTenant(index)}>
                  <RemoveCircle />
                </IconButton>
              </div>
            </div>
          ))}
          <Button startIcon={<AddCircle />} onClick={addCoTenant}>
            Add Co-Tenant
          </Button>

          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            color="primary"
          >
            {loading ? "Saving..." : "Add Tenant"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddTenant;
