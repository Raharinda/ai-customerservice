// File: app/api/request/[id]/messages/route.js
import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'

// GET - Fetch messages untuk request tertentu
export async function GET(request, { params }) {
    try {
        // Verify token
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const idToken = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(idToken)
        const userId = decodedToken.uid

        // Get request ID from params
        const { id: requestId } = await params

        // Verify user owns this request
        const requestDoc = await adminDb
            .collection('requests')
            .doc(requestId)
            .get()

        if (!requestDoc.exists) {
            return NextResponse.json(
                { error: 'Request not found' },
                { status: 404 },
            )
        }

        if (requestDoc.data().userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // ✅ Fetch messages from root collection with requestId filter
        const messagesSnapshot = await adminDb
            .collection('messages')
            .where('requestId', '==', requestId)
            .orderBy('createdAt', 'asc')
            .get()

        const messages = []
        messagesSnapshot.forEach((doc) => {
            const data = doc.data()
            messages.push({
                id: doc.id,
                ...data,
                // Handle Firestore Timestamp
                createdAt: data.createdAt?.toDate?.()
                    ? data.createdAt.toDate().toISOString()
                    : data.createdAt,
                // Determine sender based on userId
                sender: data.userId === userId ? 'user' : 'agent',
            })
        })

        console.log(
            `✅ Fetched ${messages.length} messages for request ${requestId}`,
        )

        return NextResponse.json({
            success: true,
            messages,
        })
    } catch (error) {
        console.error('❌ Error fetching messages:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 },
        )
    }
}

// POST - Send new message
export async function POST(request, { params }) {
    try {
        // Verify token
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const idToken = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(idToken)
        const userId = decodedToken.uid

        // Get request ID from params
        const { id: requestId } = await params

        // Get message content from body
        const body = await request.json()
        const { content } = body

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 },
            )
        }

        // Verify user owns this request
        const requestDoc = await adminDb
            .collection('requests')
            .doc(requestId)
            .get()

        if (!requestDoc.exists) {
            return NextResponse.json(
                { error: 'Request not found' },
                { status: 404 },
            )
        }

        if (requestDoc.data().userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // ✅ Create message in root collection (same structure as initial message)
        const messageRef = adminDb.collection('messages').doc()
        const now = new Date().toISOString()

        const messageData = {
            id: messageRef.id,
            requestId,
            userId,
            content: content.trim(),
            createdAt: now,
            isInternal: false,
            senderName: decodedToken.name || decodedToken.email || 'You',
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
            })

        console.log('✅ Message sent:', messageRef.id)

        return NextResponse.json({
            success: true,
            message: {
                id: messageRef.id,
                ...messageData,
                sender: 'user',
            },
        })
    } catch (error) {
        console.error('❌ Error sending message:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 },
        )
    }
}
