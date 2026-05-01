"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { MessageSquare, Music, LayoutDashboard, LogOut, LogIn, Users, Settings as SettingsIcon, MessageCircle, ChevronLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { useLoginModal } from "@/hooks/use-login-modal"

export default function AppSidebar() {
  const pathname = usePathname()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { showLoginModal } = useLoginModal()
  const { toggleSidebar, state } = useSidebar()

  const handleLoginClick = () => {
    showLoginModal("Sign in with your student.unsika.ac.id email to access all features")
  }

  return (
    <Sidebar>
      <SidebarHeader className="pb-4 pt-4">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="font-semibold text-lg">Menu</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        {isAuthenticated && user ? (
          <div className="px-3 py-2" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="flex items-center gap-3" style={{ width: '100%', overflow: 'hidden' }}>
              <Avatar className="shrink-0" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                <AvatarImage src={user.picture ?? "/placeholder.svg?height=40&width=40"} alt={user.name || user.email || ""} />
                <AvatarFallback>{(user.name || user.email)?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2px',
                overflow: 'hidden',
                flex: 1,
                minWidth: 0
              }}>
                <span style={{ 
                  fontWeight: 500, 
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}>
                  {user.name || "UNSIKA Student"}
                </span>
                <span style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--muted-foreground)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}>
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLoginClick} size="lg">
                <Avatar>
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
                <span>Sign In</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="gap-2 px-2">
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"} size="lg">
                <Link href="/dashboard" className="flex items-center gap-3 py-3">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="text-base">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/messages"} size="lg">
              <Link href="/messages" className="flex items-center gap-3 py-3">
                <MessageSquare className="h-5 w-5" />
                <span className="text-base">Messages</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/songfess"} size="lg">
              <Link href="/songfess" className="flex items-center gap-3 py-3">
                <Music className="h-5 w-5" />
                <span className="text-base">Songfess</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isAuthenticated && isAdmin && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/forum"} size="lg">
                  <Link href="/forum" className="flex items-center gap-3 py-3">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-base">Forum</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin-list"} size="lg">
                  <Link href="/admin-list" className="flex items-center gap-3 py-3">
                    <Users className="h-5 w-5" />
                    <span className="text-base">Admin List</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"} size="lg">
                  <Link href="/settings" className="flex items-center gap-3 py-3">
                    <SettingsIcon className="h-5 w-5" />
                    <span className="text-base">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        {isAuthenticated ? (
          <Button variant="ghost" size="lg" className="w-full justify-start py-6" onClick={logout}>
            <LogOut className="mr-3 h-5 w-5" />
            <span className="text-base">Logout</span>
          </Button>
        ) : (
          <Button variant="ghost" size="lg" className="w-full justify-start py-6" onClick={handleLoginClick}>
            <LogIn className="mr-3 h-5 w-5" />
            <span className="text-base">Sign In</span>
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
