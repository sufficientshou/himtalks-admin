"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export function SidebarTriggerWrapper() {
  const { state } = useSidebar()

  if (state === "expanded") {
    return null
  }

  return (
    <div className="hidden md:block fixed top-4 left-4 z-50">
      <SidebarTrigger className="h-10 w-10 [&>svg]:h-6 [&>svg]:w-6" />
    </div>
  )
}
