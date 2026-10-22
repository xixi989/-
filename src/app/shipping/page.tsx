import { InfoPage, metadataFor } from "@/components/content/info-page";

export const metadata = metadataFor("shipping");

export default function Page() {
  return <InfoPage slug="shipping" />;
}
