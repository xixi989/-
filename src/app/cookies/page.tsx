import { InfoPage, metadataFor } from "@/components/content/info-page";

export const metadata = metadataFor("cookies");

export default function Page() {
  return <InfoPage slug="cookies" />;
}
