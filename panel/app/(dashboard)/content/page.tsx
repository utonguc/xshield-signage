import { getToken } from "@/lib/auth";
import { getContent } from "@/lib/api";
import ContentClient from "./content-client";

export default async function ContentPage() {
  const token   = await getToken();
  const content = await getContent(token);
  return <ContentClient initialContent={content} token={token} />;
}
