import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import AppSidebar from "@/components/app-sidebar"
import { Providers } from "./providers"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SidebarTriggerWrapper } from "@/components/sidebar-trigger-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HIMTALKS Admin - Himpunan Mahasiswa Teknik Informatika",
  description: "Admin platform for messages and song confessions for UNSIKA students",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen w-full relative">
            <AppSidebar />
            <main className="flex-1 overflow-auto bg-muted/10 w-full flex flex-col relative">
              {/* Mobile Header */}
              <header className="md:hidden sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                <SidebarTrigger />
                <span className="font-semibold text-lg">HIMTALKS Admin</span>
              </header>
              {/* Desktop Sidebar Trigger - Only shows when collapsed */}
              <SidebarTriggerWrapper />
              <div className="flex-1 w-full">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
