import { MessageCard } from './MessageCard'

export function MessageList({ messages, onViewTicket }) {
    return (
        <div className='space-y-4'>
            {messages.map((msg) => (
                <MessageCard
                    key={msg.messageId}
                    message={msg}
                    onViewTicket={onViewTicket}
                />
            ))}
        </div>
    )
}
