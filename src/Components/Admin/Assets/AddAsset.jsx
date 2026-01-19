import React, { useState } from "react";
import { Select, MenuItem, TextField, Button } from "@mui/material";
import { supabase } from "../../../supabase"; // adjust the path to your supabase client
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AddAsset() {
  const [assetName, setAssetName] = useState("");
  const [status, setStatus] = useState("Available");
  const [description, setDescription] = useState("");
  const [defaultRent, setDefaultRent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Basic validation
    if (!assetName || !defaultRent) {
      toast.error("Please fill all required fields.");
      setLoading(false);
      return;
    }

    // Insert into Supabase table "assets"
    const { data, error } = await supabase.from("Assets").insert([
      {
        asset_name: assetName,
        status: "Available",
        description: description,
        default_rent: defaultRent,
      },
    ]);

    if (error) {
      toast.error("Failed to add asset: " + error.message);
      setLoading(false);
    } else {
      setLoading(false);
      // Reset form
      setAssetName("");
      setStatus("Available");
      setDescription("");
      setDefaultRent("");
      navigate(-1);  
      setTimeout(() => {
        toast.success("Asset added successfully!");
      }, 1500);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container main">
        <h5 className="section-title mb-3">Add New Asset</h5>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <TextField
            id="asset_name"
            size="small"
            label="Asset Name"
            variant="outlined"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            required
          />

          <TextField
            id="description"
            multiline
            minRows={3}
            label="Description"
            variant="outlined"
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            id="default_rent"
            size="small"
            label="Default Rent"
            variant="outlined"
            value={defaultRent}
            onChange={(e) => setDefaultRent(e.target.value)}
            required
          />
          <Select size="small" value={status} id="status" disabled>
            <MenuItem value="Available">Available</MenuItem>
          </Select>

          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            color="primary"
          >
            {loading ? "Saving..." : "Add Asset"}
          </Button>
        </form>
      </div>
    </>
  );
}

export default AddAsset;
