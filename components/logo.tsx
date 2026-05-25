import { FileText } from "lucide-react";

export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "h-8 w-8",
    default: "h-10 w-10",
    large: "h-14 w-14",
  };

  const iconSizes = {
    small: 16,
    default: 20,
    large: 28,
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg bg-primary flex items-center justify-center`}
    >
      <FileText className="text-primary-foreground" size={iconSizes[size]} />
    </div>
  );
}
