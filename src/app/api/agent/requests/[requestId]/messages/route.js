import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'

/**
 * POST /api/agent/requests/[requestId]/messages
 * Agent mengirim pesan ke customer request
 */
export async function POST(request, { params }) {
    try {
        // Verify agent token
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const idToken = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(idToken)
        const agentId = decodedToken.uid

        // Verify user is agent
        const agentDoc = await adminDb.collection('users').doc(agentId).get()
        if (!agentDoc.exists || agentDoc.data().role !== 'agent') {
            return NextResponse.json({ error: 'Forbidden - Agent only' }, { status: 403 })
        }

        // Get request ID from params
        const { requestId } = await params

        // Get message content from body
        const body = await request.json()
        const { content } = body

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            )
        }

        // Verify request exists
        const requestDoc = await adminDb
            .collection('requests')
            .doc(requestId)
            .get()

        if (!requestDoc.exists) {
            return NextResponse.json(
                { error: 'Request not found' },
                { status: 404 }
            )
        }

        // Create message in root collection
        const messageRef = adminDb.collection('messages').doc()
        const now = new Date().toISOString()

        const messageData = {
            id: messageRef.id,
            requestId,
            userId: agentId,
            content: content.trim(),
            createdAt: now,
            isInternal: false,
            senderName: decodedToken.name || decodedToken.email || 'Agent',
            senderRole: 'agent', // Mark as agent message
        }

        await messageRef.set(messageData)

        // Update request's commentCount and updatedAt
        const currentCount = requestDoc.data().commentCount || 0
        await adminDb
            .collection('requests')
            .doc(requestId)
            .update({
                commentCount: currentCount + 1,
                updatedAt: now,
                status: 'in-progress', // Update status to in-progress when agent responds
            })

        console.log(`✅ Agent message created for request ${requestId}`)

        return NextResponse.json({
            success: true,
            message: messageData,
        })
    } catch (error) {
        console.error('❌ Error creating agent message:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
