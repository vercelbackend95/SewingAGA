import * as React from "react";

import { cn } from "@/lib/utils";

interface AnimatedListItem {
  id: string;
  title: string;
}

interface AnimatedListProps {
  items: AnimatedListItem[];
  className?: string;
  itemClassName?: string;
  interval?: number;
}

const AnimatedList = ({
  items,
  className,
  itemClassName,
  interval = 2200,
}: AnimatedListProps) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (items.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [items.length, interval]);

  return (
    <div className={cn("relative h-16 overflow-hidden", className)}>
      {items.map((item, index) => {
        const offset = (index - activeIndex + items.length) % items.length;
        const translateY = offset === 0 ? 0 : offset === 1 ? 100 : -100;
        const isVisible = offset === 0;

        return (
          <div
            className={cn(
              "absolute inset-0 flex items-center rounded-xl border border-border bg-card px-4 shadow-sm transition-all duration-500",
              isVisible ? "opacity-100" : "opacity-0",
              itemClassName,
            )}
            key={item.id}
            style={{ transform: `translateY(${translateY}%)` }}
          >
            <p className="text-sm font-medium text-foreground">{item.title}</p>
          </div>
        );
      })}
    </div>
  );
};

export { AnimatedList };
