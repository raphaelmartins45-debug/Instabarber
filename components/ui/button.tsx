import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

// Botões do sistema de design (D-134): o primário é o destaque, com brilho por baixo e um reflexo
// que atravessa no hover (como a landing); os outros são calmos. Pressionar afunda 1 px.
const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-semibold whitespace-nowrap transition-[background-color,border-color,box-shadow,color,transform] duration-200 ease-sistema outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,.35)_inset,0_10px_24px_-12px_rgba(var(--ac-rgb),.6)] hover:bg-[var(--ac-hi)] hover:shadow-[0_1px_0_rgba(255,255,255,.45)_inset,0_16px_32px_-12px_rgba(var(--ac-rgb),.7)] after:pointer-events-none after:absolute after:inset-0 after:-translate-x-[120%] after:bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,.4)_50%,transparent_65%)] after:transition-transform after:duration-700 after:ease-sistema hover:after:translate-x-[120%] motion-reduce:after:hidden",
        destructive:
          "bg-destructive text-[var(--sup-fundo)] hover:bg-destructive/90 focus-visible:ring-destructive/30",
        outline:
          "border border-borda-forte bg-foreground/[.03] text-foreground hover:border-[rgba(var(--ac-rgb),.6)] hover:bg-accent",
        secondary: "border border-border bg-secondary text-secondary-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-foreground/[.06]",
        link: "text-ligacao underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-6 text-base has-[>svg]:px-4",
        icon: "size-10",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
