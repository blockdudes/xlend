import { createThirdwebClient } from "thirdweb";
import { EquitoClient } from "@equito-sdk/client";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
var equitoClient: EquitoClient;

if (!clientId) {
  throw new Error("No client ID provided");
}

export const client = createThirdwebClient({
  clientId: clientId,
});

export const getEquitoClient = async () => {
  if (!equitoClient) {
    const wsProvider = process.env.NEXT_PUBLIC_TESTNET_WS_ENDPOINT;
    const archiveWsProvider =
      process.env.NEXT_PUBLIC_TESTNET_ARCHIVE_WS_ENDPOINT;
    if (!wsProvider || !archiveWsProvider) {
      throw new Error(
        "Missing environment variables NEXT_PUBLIC_TESTNET_WS_ENDPOINT and NEXT_PUBLIC_TESTNET_ARCHIVE_WS_ENDPOINT for Equito client"
      );
    }
    equitoClient = await EquitoClient.create({
      wsProvider,
      archiveWsProvider,
    });
  }

  console.log("equitoClient", equitoClient);
  return equitoClient;
};
