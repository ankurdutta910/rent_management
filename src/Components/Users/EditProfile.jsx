import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { supabase } from "../../supabase"; // adjust path if needed
import { toast, ToastContainer } from "react-toastify";

function EditProfile({
  openEditProfile,
  handleCloseEditProfile,
  fetchTenantDetails,
  tenant,
}) {
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(tenant?.contact || "");
  const [address, setAddress] = useState(tenant?.address || "");

  // 🧩 handle update
  const handleSubmit = async () => {
    if (!contact || !address) {
      toast.error("Please fill all fields before updating.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("Tenants")
        .update({
          contact: contact,
          address: address,
        })
        .eq("id", tenant.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      handleCloseEditProfile();
      fetchTenantDetails(); // ✅ Refresh updated details
    } catch (err) {
      console.error("Error updating profile:", err.message);
      toast.error("Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <Dialog
        fullWidth
        maxWidth="sm"
        open={openEditProfile}
        keepMounted
        onClose={handleCloseEditProfile}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle style={{ fontSize: "1rem" }}>Update Profile</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <div className="row">
              <div className="col-md-6 mb-3 mt-2">
                <TextField
                  label="Tenant Name"
                  fullWidth
                  value={tenant?.tenant_name || ""}
                  variant="outlined"
                  size="small"
                  disabled
                />
              </div>

              <div className="col-md-6 mb-3">
                <TextField
                  label="Contact"
                  fullWidth
                  type="number"
                  variant="outlined"
                  size="small"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>

              <div className="col-md-12 mb-3">
                <TextField
                  label="Address"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  size="small"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </DialogContentText>
        </DialogContent>

        <DialogActions style={{ marginBottom: "12px" }}>
          <Button
            onClick={handleCloseEditProfile}
            variant="outlined"
            size="small"
            color="grey"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="small"
            disabled={loading}
          >
            {loading ? "Please Wait..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EditProfile;
