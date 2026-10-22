import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/cart-page-view";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Shopping Bag",
  // A bag is per-shopper state; there is nothing here for a crawler.
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="pb-24 md:pb-32">
      <Container>
        <div className="pt-10 md:pt-14">
          <CartPageView />
        </div>
      </Container>
    </div>
  );
}
