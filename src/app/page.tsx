import { Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { PacketInputForm } from "./PacketInputForm";
import { PacketContextProvider, PacketItemList } from "./PacketContext";
import { WebSocketProvider } from "./WebSocketContext";

export default function SocketClient() {
  return (
    <PacketContextProvider>
      <WebSocketProvider name="chat" url="ws://localhost:6262/chat">
        <Grid
          sx={{ height: "100%" }}
          container
          direction="column"
          justifyContent="stretch"
          alignItems="stretch"
          spacing={2}
        >
          <Grid xs="auto">
            <Typography variant="h2" color="initial" align="center">
              현재 상태
            </Typography>
          </Grid>
          <Grid sx={{ overflow: "scroll" }} xs>
            <Stack spacing={2}>
              <PacketItemList />
            </Stack>
          </Grid>
          <Grid xs="auto">
            <PacketInputForm />
          </Grid>
        </Grid>
      </WebSocketProvider>
    </PacketContextProvider>
  );
}
