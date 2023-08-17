"use client";

import { ByteBuffer } from "@/library/byte-buffer";
import { Button, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useState } from "react";

function send(value: string) {
  const buf = ByteBuffer.fromSmartBufferString(value);
  console.log(value, "->", buf.toString());
}

function toDumpString(value: string) {
  try {
    return ByteBuffer.fromSmartBufferString(value).toString();
  } catch {
    return "Error!";
  }
}

export function PacketInputForm() {
  const [value, setValue] = useState("");
  return (
    <>
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        <Grid xs>
          <TextField
            id="outlined-basic"
            label="패킷 (Smart Buffer String)"
            variant="outlined"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid xs="auto">
          <Button variant="outlined" fullWidth onClick={(e) => send(value)}>
            전송
          </Button>
        </Grid>
      </Grid>
      <Typography overflow="scroll" maxWidth="100vh">
        버퍼: {toDumpString(value)}
      </Typography>
    </>
  );
}
