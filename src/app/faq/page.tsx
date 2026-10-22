import { InfoPage, metadataFor } from "@/components/content/info-page";

export const metadata = metadataFor("faq");

export default function Page() {
  return <InfoPage slug="faq" />;
}
