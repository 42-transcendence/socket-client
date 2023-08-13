import { Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { PacketInputForm } from "./PacketInputForm";
import { PacketContextProvider, PacketItemList } from "./PacketContext";
import { DefaultWebSocketContainer } from "./DefaultWebSocketContainer";
import { WebSocketRegistry } from "./WebSocketRegistry";
import { WebSocketRegistryContainer } from "./WebSocketContainer";

export default function SocketClient() {
  return (
    <PacketContextProvider>
      <WebSocketRegistryContainer>
        <DefaultWebSocketContainer name="chat" url="wss://back.stri.dev/chat">
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
        </DefaultWebSocketContainer>
      </WebSocketRegistryContainer>
    </PacketContextProvider>
  );
}
