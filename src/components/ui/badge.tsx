import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-none  bg-[#003CBF] rounded-full lg:py-1 lg:px-4 text-[#013DC0]  text-xs lg:text-sm font-medium ",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        primary: "border-none  bg-[#E9F4FF] rounded-full lg:py-1 lg:px-4 text-[#013DC0]  text-xs lg:text-sm font-medium ",
        outline: "text-foreground",
        nursing: "border-none  bg-[#E9F4FF] rounded-full py-1 lg:px-4 text-[#013DC0]  text-xs lg:text-xs font-medium "
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
