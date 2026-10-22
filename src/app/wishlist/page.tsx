import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <div className="pb-24 md:pb-32">
      <Container>
        <div className="pt-10 md:pt-14">
          <WishlistView />
        </div>
      </Container>
    </div>
  );
}
