export async function updateTicketStatus(ticketId, status) {
    const res = await fetch(`/api/agent/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    })

    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed update status')
    }
}
