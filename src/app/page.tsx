import { Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { PacketInputForm } from "./PacketInputForm";
import { PacketItem } from "./PacketItem";

export default function SocketClient() {
  return (
    <Grid
      sx={{ height: "100%" }}
      container
      direction="column"
      justifyContent="stretch"
      alignItems="stretch"
      spacing={2}
    >
      <Grid xs="auto">
        <header>현재 상태</header>
      </Grid>
      <Grid sx={{ overflow: "scroll" }} xs>
        <Stack spacing={2}>
          {[...new Array(128)].map((e) => (
            <PacketItem key={e}>Test message</PacketItem>
          ))}
        </Stack>
      </Grid>
      <Grid xs="auto">
        <PacketInputForm />
      </Grid>
    </Grid>
  );
}
