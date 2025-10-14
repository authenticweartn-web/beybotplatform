"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Send, MoreVertical, Bot, User, AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useConversations, useConversation } from "@/lib/hooks/use-conversations"
import { CONVERSATION_STATUS_COLORS } from "@/lib/constants"
import { formatDistanceToNow } from "date-fns"

export default function ConversationsPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useConversations(statusFilter)
  const {
    data: selectedConversation,
    isLoading: conversationLoading,
    refetch: refetchConversation,
  } = useConversation(selectedConversationId || "")

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log("[v0] Sending message:", messageInput)
      setMessageInput("")
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return timestamp
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Conversations List */}
      <div className="w-80 border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Conversations</h2>
            <Button variant="ghost" size="icon" onClick={() => refetchConversations()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="bg-secondary pl-9" />
          </div>
        </div>

        <div className="overflow-y-auto">
          {conversationsLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversationsError ? (
            <div className="p-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load conversations</AlertDescription>
              </Alert>
            </div>
          ) : conversations && conversations.length > 0 ? (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={cn(
                  "w-full border-b border-border p-4 text-left transition-colors hover:bg-secondary",
                  selectedConversationId === conversation.id && "bg-secondary",
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {conversation.customer_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{conversation.customer_name || "Unknown"}</p>
                      <span className="text-xs text-muted-foreground">
                        {conversation.last_message_at ? formatTimestamp(conversation.last_message_at) : ""}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {conversation.last_message || "No messages"}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn("text-xs", CONVERSATION_STATUS_COLORS[conversation.status] || "")}
                      >
                        {conversation.status}
                      </Badge>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {conversation.platform}
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No conversations found</p>
              <p className="mt-2 text-xs">Messages will appear here when customers contact you</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {!selectedConversationId ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Select a conversation to view messages</p>
              <p className="mt-2 text-xs">Auto-refreshes every 10 seconds</p>
            </div>
          </div>
        ) : conversationLoading ? (
          <div className="flex h-full flex-col">
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4 p-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-3/4" />
              ))}
            </div>
          </div>
        ) : selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {selectedConversation.customer_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{selectedConversation.customer_name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.status === "active" ? "Active now" : selectedConversation.status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => refetchConversation()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Mark as resolved</DropdownMenuItem>
                    <DropdownMenuItem>Assign to human</DropdownMenuItem>
                    <DropdownMenuItem>View customer profile</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete conversation</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-3", message.sender === "agent" ? "justify-start" : "justify-end")}
                  >
                    {message.sender === "agent" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={cn("max-w-[70%] space-y-1", message.sender === "agent" ? "items-start" : "items-end")}
                    >
                      <div
                        className={cn(
                          "rounded-lg p-3",
                          message.sender === "agent"
                            ? "bg-secondary text-foreground"
                            : "bg-primary text-primary-foreground",
                        )}
                      >
                        <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {message.created_at ? formatTimestamp(message.created_at) : ""}
                      </p>
                    </div>
                    {message.sender === "customer" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <p>No messages yet</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-border bg-card p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-secondary"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                AI agent is active. Messages will be handled automatically.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
