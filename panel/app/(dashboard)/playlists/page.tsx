import { getToken } from "@/lib/auth";
import { getPlaylists, getContent } from "@/lib/api";
import PlaylistsClient from "./playlists-client";

export default async function PlaylistsPage() {
  const token = await getToken();
  const [playlists, content] = await Promise.all([getPlaylists(token), getContent(token)]);
  return <PlaylistsClient initialPlaylists={playlists} allContent={content} token={token} />;
}
