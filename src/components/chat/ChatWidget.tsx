import { useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'
import { sanitizeText } from '@/lib/sanitize'

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  isOwn: boolean
  timestamp: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const { t } = useLocale()

  const handleSend = () => {
    if (!newMessage.trim()) return

    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'user-1',
      senderName: 'Vous',
      content: sanitizeText(newMessage.trim()),
      isOwn: true,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, msg])
    setNewMessage('')
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all md:bottom-6 md:right-6',
          isOpen
            ? 'bg-gray-600 text-white'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-soft-lg dark:bg-gray-900 animate-slide-up md:bottom-24 md:right-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <MessageCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.chat.title}</h3>
                <p className="text-xs text-green-500">{t.chat.online}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                {t.chat.noConversationsHint}
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex', msg.isOwn ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                    msg.isOwn
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md dark:bg-gray-800 dark:text-gray-100'
                  )}
                >
                  <p>{msg.content}</p>
                  <p className={cn('mt-1 text-[10px]', msg.isOwn ? 'text-primary-200' : 'text-gray-400')}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={t.chat.typeMessage}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
