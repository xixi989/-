import { Container } from "@/components/ui/container";
import { announcements } from "@/data/site";

export function AnnouncementBar() {
  return (
    <div className="bg-ink text-bone">
      <Container>
        <div className="flex h-9 items-center justify-center overflow-hidden">
          {/* Short form on phones so the line never truncates mid-word. */}
          <p className="label text-[0.65rem] text-bone/90 md:hidden">
            Complimentary shipping over $150
          </p>
          <p className="label hidden truncate text-[0.65rem] text-bone/90 md:block">
            {announcements[0]}
          </p>
        </div>
      </Container>
    </div>
  );
}
