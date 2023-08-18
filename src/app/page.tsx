import { Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { PacketInputForm } from "./PacketInputForm";
import { PacketContextProvider, PacketItemList } from "./PacketContext";
import { RecvText } from "./RecvText";
import { WebSocketRegistryContainer } from "@/websocket/websocket-hook";
import { DefaultWebSocketContainer } from "./DefaultWebSocketContainer";
import { cookies } from "next/headers";

export default function SocketClient() {
  const token = cookies().get("at")?.value ?? "";
  return (
    <PacketContextProvider>
      <WebSocketRegistryContainer>
        <DefaultWebSocketContainer
          name="sock"
          urlBase="wss://back.stri.dev/chat"
          token={token}
        >
          <RecvText />
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
