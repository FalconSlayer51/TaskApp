import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function MemberAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={cn("size-6", className)}>
      <AvatarFallback className="text-[10px]">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
