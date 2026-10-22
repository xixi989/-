import { InfoPage, metadataFor } from "@/components/content/info-page";

export const metadata = metadataFor("journal");

export default function Page() {
  return <InfoPage slug="journal" />;
}
