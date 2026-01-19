import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Slide,
  TextField,
} from "@mui/material";
import { supabase } from "../../supabase"; // adjust path as needed
import { toast, ToastContainer } from "react-toastify";

function AddCotenant({
  handleCloseAddCotenant,
  openAddCotenant,
  tenant,
  fetchTenantDetails,
}) {
  const [coTenantName, setCoTenantName] = useState("");
  const [relationType, setRelationType] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!coTenantName || !relationType || !contact) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("CoTenants") // 👈 your Supabase table name
        .insert([
          {
            tenant_id: tenant.id,
            name: coTenantName,
            relation_type: relationType,
            contact: contact,
            status: 0,
          },
        ]);

      if (error) throw error;

      toast.success("Co-tenant added successfully!");
      handleCloseAddCotenant();
      fetchTenantDetails();
      // Reset form fields
      setCoTenantName("");
      setRelationType("");
      setContact("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add co-tenant");
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
        open={openAddCotenant}
        keepMounted
        onClose={handleCloseAddCotenant}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle style={{ fontSize: "1rem" }}>Add Co-Tenant</DialogTitle>
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
                  label="Co-Tenant Name"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={coTenantName}
                  onChange={(e) => setCoTenantName(e.target.value)}
                />
              </div>

              <div className="col-md-6 mb-3">
                <FormControl fullWidth size="small">
                  <InputLabel id="relation-type-label">
                    Relation Type
                  </InputLabel>
                  <Select
                    labelId="relation-type-label"
                    value={relationType}
                    label="Relation Type"
                    onChange={(e) => setRelationType(e.target.value)}
                  >
                    <MenuItem value="Husband">Husband</MenuItem>
                    <MenuItem value="Wife">Wife</MenuItem>
                    <MenuItem value="Son">Son</MenuItem>
                    <MenuItem value="Daughter">Daughter</MenuItem>
                    <MenuItem value="Father">Father</MenuItem>
                    <MenuItem value="Mother">Mother</MenuItem>
                    <MenuItem value="Brother">Brother</MenuItem>
                    <MenuItem value="Sister">Sister</MenuItem>
                    <MenuItem value="Friend">Friend</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="col-md-6 mb-3">
                <TextField
                  label="Contact"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
            </div>
          </DialogContentText>
        </DialogContent>

        <DialogActions style={{ marginBottom: "12px" }}>
          <Button
            onClick={handleCloseAddCotenant}
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

export default AddCotenant;
