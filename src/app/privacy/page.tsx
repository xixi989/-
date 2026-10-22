import { InfoPage, metadataFor } from "@/components/content/info-page";

export const metadata = metadataFor("privacy");

export default function Page() {
  return <InfoPage slug="privacy" />;
}
