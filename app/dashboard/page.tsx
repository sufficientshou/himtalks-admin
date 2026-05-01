"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, isAdmin, logout } = useAuth()
  const [isVerifying, setIsVerifying] = useState(true)

  // Verify that the user is an admin
  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push("/login")
        } else if (!isAdmin) {
          router.push("/messages")
        } else {
          setIsVerifying(false)
        }
      }
    }

    verifyAdmin()
  }, [isLoading, isAuthenticated, isAdmin, router])

  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.name}</CardTitle>
            <CardDescription>You are logged in as an administrator</CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="messages">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="songfess">Songfess</TabsTrigger>
          </TabsList>
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Message Management</CardTitle>
                <CardDescription>Manage all messages in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Message management tools will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="songfess">
            <Card>
              <CardHeader>
                <CardTitle>Songfess Management</CardTitle>
                <CardDescription>Manage all songfess entries in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Songfess management tools will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
