import { InfoPage, metadataFor } from "@/components/content/info-page";

export const metadata = metadataFor("terms");

export default function Page() {
  return <InfoPage slug="terms" />;
}
