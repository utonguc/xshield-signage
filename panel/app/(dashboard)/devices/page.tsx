import { getToken } from "@/lib/auth";
import { getDevices, getPlaylists } from "@/lib/api";
import DevicesClient from "./devices-client";

export default async function DevicesPage() {
  const token = await getToken();
  const [devices, playlists] = await Promise.all([getDevices(token), getPlaylists(token)]);
  return <DevicesClient initialDevices={devices} playlists={playlists} token={token} />;
}
