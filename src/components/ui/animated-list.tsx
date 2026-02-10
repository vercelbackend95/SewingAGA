"use client";

import React, {
  type ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";

function AnimatedListItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
      {children}
    </div>
  );
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedList = React.memo(
  ({ children, className, delay = 1000, ...props }: AnimatedListProps) => {
    const [index, setIndex] = useState(0);
    const childrenArray = useMemo(
      () => React.Children.toArray(children),
      [children]
    );

    useEffect(() => {
      if (childrenArray.length === 0) return;

      if (index < childrenArray.length - 1) {
        const timeout = window.setTimeout(() => {
          setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
        }, delay);

        return () => window.clearTimeout(timeout);
      }
    }, [index, delay, childrenArray.length]);

    const itemsToShow = useMemo(() => {
      return childrenArray.slice(0, index + 1).reverse();
    }, [index, childrenArray]);

    return (
      <div className={cn("flex flex-col items-center gap-4", className)} {...props}>
        {itemsToShow.map((item) => (
          <AnimatedListItem key={(item as React.ReactElement).key}>
            {item}
          </AnimatedListItem>
        ))}
      </div>
    );
  }
);

AnimatedList.displayName = "AnimatedList";
