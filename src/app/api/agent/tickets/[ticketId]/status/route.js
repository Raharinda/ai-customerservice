import { adminDb, adminAuth } from '@/lib/firebaseAdmin'
import { NextResponse } from 'next/server'

/**
 * PATCH /api/agent/tickets/[ticketId]/status
 * Update ticket status - Optimized with denormalized data
 *
 * Features:
 * - Auto-update status history
 * - Auto-create system message
 * - Update counters and timestamps
 * - Agent authentication required
 * - Smart status transitions
 *
 * Valid status transitions:
 * - open -> in-progress, resolved
 * - in-progress -> resolved, open
 * - resolved -> in-progress, closed
 * - closed -> (no changes allowed)
 */
export async function PATCH(request, { params }) {
    try {
        const { ticketId } = await params
        console.log(
            `🔄 PATCH /api/agent/tickets/${ticketId}/status - Status update`,
        )

        if (!ticketId) {
            return NextResponse.json(
                { error: 'Ticket ID is required' },
                { status: 400 },
            )
        }

        // === AUTHENTICATION ===
        const authHeader = request.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized - Token required' },
                { status: 401 },
            )
        }

        const idToken = authHeader.split('Bearer ')[1]
        let agentUid, agentEmail, agentName

        try {
            const decodedToken = await adminAuth.verifyIdToken(idToken)
            agentUid = decodedToken.uid
            agentEmail = decodedToken.email

            // Verify agent role
            const agentDoc = await adminDb
                .collection('users')
                .doc(agentUid)
                .get()

            if (!agentDoc.exists || agentDoc.data().role !== 'agent') {
                return NextResponse.json(
                    { error: 'Access denied - Agent role required' },
                    { status: 403 },
                )
            }

            agentName = agentDoc.data().name || agentEmail
        } catch (authError) {
            console.error('❌ Authentication failed:', authError)
            return NextResponse.json(
                { error: 'Invalid token', details: authError.message },
                { status: 401 },
            )
        }

        // === PARSE REQUEST BODY ===
        const body = await request.json()
        const { status: newStatus } = body

        // Validate status
        const validStatuses = ['open', 'in-progress', 'resolved', 'closed']
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return NextResponse.json(
                {
                    error: 'Invalid status',
                    message: `Status must be one of: ${validStatuses.join(', ')}`,
                },
                { status: 400 },
            )
        }

        // === GET TICKET ===
        const ticketRef = adminDb.collection('tickets').doc(ticketId)
        const ticketDoc = await ticketRef.get()

        if (!ticketDoc.exists) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 },
            )
        }

        const ticketData = ticketDoc.data()
        const oldStatus = ticketData.status

        // Prevent changes to closed tickets (unless reopening)
        if (oldStatus === 'closed' && newStatus !== 'in-progress') {
            return NextResponse.json(
                {
                    error: 'Cannot modify closed ticket',
                    message: 'Ticket is closed. Reopen first if needed.',
                },
                { status: 400 },
            )
        }

        // Skip if status is the same
        if (oldStatus === newStatus) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Status is already set to ' + newStatus,
                    data: {
                        ticketId,
                        status: newStatus,
                    },
                },
                { status: 200 },
            )
        }

        console.log(`Status change: ${oldStatus} → ${newStatus}`)

        // === UPDATE TICKET ===
        const now = new Date().toISOString()
        const updateData = {
            status: newStatus,
            updatedAt: now,
            [`statusHistory.${newStatus}At`]: now,
            [`statusHistory.${newStatus}By`]: agentUid,
        }

        // Auto-assign to agent if not assigned
        if (!ticketData.assignedTo) {
            updateData.assignedTo = agentUid
            updateData.assignedAt = now
        }

        // Status-specific updates
        if (newStatus === 'resolved') {
            updateData.resolvedAt = now
            updateData.resolvedBy = agentUid
            updateData.unreadCount = 0 // Reset unread count
        }

        if (newStatus === 'closed') {
            updateData.closedAt = now
            updateData.closedBy = agentUid
            updateData.unreadCount = 0 // Reset unread count
        }

        if (newStatus === 'in-progress' && oldStatus === 'open') {
            updateData.startedAt = now
            updateData.startedBy = agentUid
        }

        await ticketRef.update(updateData)

        console.log(`Ticket ${ticketId} status updated`)

        // === CREATE SYSTEM MESSAGE ===
        const systemMessage = getStatusChangeMessage(
            oldStatus,
            newStatus,
            agentName,
        )

        const messageData = {
            message: systemMessage,
            senderRole: 'system',
            senderName: 'System',
            senderId: 'system',
            senderEmail: 'system@internal',
            createdAt: now,
            read: true,
            type: 'status_change',
            metadata: {
                oldStatus,
                newStatus,
                changedBy: agentUid,
                changedByName: agentName,
                changedByEmail: agentEmail,
            },
        }

        await ticketRef.collection('messages').add(messageData)

        console.log(`System message created`)

        // === UPDATE MESSAGE COUNT ===
        await ticketRef.update({
            messageCount: (ticketData.messageCount || 0) + 1,
            lastMessageAt: now,
        })

        return NextResponse.json(
            {
                success: true,
                message: `Ticket status updated to ${newStatus}`,
                data: {
                    ticketId,
                    oldStatus,
                    newStatus,
                    updatedBy: agentName,
                    updatedAt: now,
                },
            },
            { status: 200 },
        )
    } catch (error) {
        console.error('Error updating ticket status:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error.message,
            },
            { status: 500 },
        )
    }
}

/**
 * Generate status change message for system notification
 * Returns emoji + human-readable message
 */
function getStatusChangeMessage(oldStatus, newStatus, agentName) {
    const messages = {
        'open->in-progress': `${agentName} started working on this ticket`,
        'open->resolved': `${agentName} marked this ticket as resolved`,
        'in-progress->resolved': `${agentName} marked this ticket as resolved`,
        'in-progress->open': `${agentName} moved this ticket back to open`,
        'resolved->closed': `${agentName} closed this ticket`,
        'resolved->in-progress': `${agentName} reopened this ticket`,
        'closed->in-progress': `${agentName} reopened this closed ticket`,
    }

    const key = `${oldStatus}->${newStatus}`
    return (
        messages[key] ||
        `${agentName} changed ticket status from ${oldStatus} to ${newStatus}`
    )
}
