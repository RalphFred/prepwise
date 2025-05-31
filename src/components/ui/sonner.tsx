"use client"

import { Toaster as Sonner } from "sonner"

const Toaster = () => {
  return (
    <Sonner
      position="bottom-right"
      expand={true}
      richColors
    />
  )
}

export { Toaster }
