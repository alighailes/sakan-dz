import { MessageCircle } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { useLocale } from '@/i18n'

export function MessagesPage() {
  const { t } = useLocale()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <EmptyState
        icon={MessageCircle}
        title={t.chat.noConversations}
        description={t.chat.noConversationsHint}
      />
    </div>
  )
}
