import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'

/**
 * GET /api/request/[id]
 * Mengambil detail request tertentu
 * Bisa diakses oleh owner request atau agent
 */
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

        // Fetch request
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

        const requestData = requestDoc.data()

        // Check authorization - either owner or agent
        const userDoc = await adminDb.collection('users').doc(userId).get()
        const userRole = userDoc.exists ? userDoc.data().role : null
        
        if (requestData.userId !== userId && userRole !== 'agent') {
            return NextResponse.json(
                { error: 'Forbidden - You can only view your own requests or you must be an agent' },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            request: {
                id: requestDoc.id,
                ...requestData,
            },
        })
    } catch (error) {
        console.error('❌ Error fetching request:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
