// app/api/request/route.js
import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'

// GET - Fetch requests
export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const idToken = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(idToken)
        const userId = decodedToken.uid

        // Fetch user's requests
        const requestsSnapshot = await adminDb
            .collection('requests')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get()

        const requests = []
        requestsSnapshot.forEach((doc) => {
            requests.push({
                id: doc.id,
                ...doc.data(),
            })
        })

        console.log(`✅ Fetched ${requests.length} requests for user ${userId}`)

        return NextResponse.json({
            success: true,
            requests,
        })
    } catch (error) {
        console.error('❌ Error fetching requests:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch requests' },
            { status: 500 },
        )
    }
}

// POST - Create request
export async function POST(request) {
    try {
        const body = await request.json()
        const {
            subject,
            category,
            description,
            idToken,
            createInitialMessage,
        } = body

        console.log('📝 Received data:', {
            subject,
            category,
            createInitialMessage,
        })

        // Verify user token
        const decodedToken = await adminAuth.verifyIdToken(idToken)
        const userId = decodedToken.uid

        // Create request document
        const requestRef = adminDb.collection('requests').doc()
        const requestId = requestRef.id
        const now = new Date().toISOString()

        const requestData = {
            id: requestId,
            subject,
            category,
            description,
            status: 'pending',
            priority: 'medium',
            userId,
            createdAt: now,
            updatedAt: now,
            commentCount: createInitialMessage ? 1 : 0,
        }

        // Save request
        await requestRef.set(requestData)
        console.log('✅ Request created:', requestId)

        // Create initial message if flag is true
        if (createInitialMessage) {
            const messageRef = adminDb.collection('messages').doc()
            const messageData = {
                id: messageRef.id,
                requestId,
                userId,
                content: description,
                createdAt: now,
                isInternal: false,
                senderName: decodedToken.name || decodedToken.email || 'You',
            }
            await messageRef.set(messageData)
            console.log('✅ Initial message created:', messageRef.id)
        }

        return NextResponse.json({
            success: true,
            requestId,
            message: 'Request created successfully',
        })
    } catch (error) {
        console.error('❌ Error creating request:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create request' },
            { status: 500 },
        )
    }
}
