"use client";

import { Button, TextField } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

export function PacketInputForm() {
  return (
    <Grid container justifyContent="center" alignItems="center" spacing={2}>
      <Grid xs>
        <TextField
          id="outlined-basic"
          label="패킷 (Smart Hex String)"
          variant="outlined"
          fullWidth
        />
      </Grid>
      <Grid xs="auto">
        <Button variant="outlined" fullWidth>
          전송
        </Button>
      </Grid>
    </Grid>
  );
}
