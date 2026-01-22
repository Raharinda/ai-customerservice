/**
 * MIGRATION SCRIPT: Requests → Tickets
 * 
 * This script migrates all data from the old REQUEST system to the new unified TICKETS system
 * 
 * What it does:
 * 1. Read all documents from 'requests' collection
 * 2. For each request:
 *    - Create a new ticket document with optimized structure
 *    - Find all messages from 'messages' collection with matching requestId
 *    - Copy messages to ticket's messages subcollection
 *    - Maintain data integrity
 * 3. Generate migration report
 * 
 * IMPORTANT: Run this script ONLY ONCE after backing up your database!
 * 
 * Usage:
 * node migrate-requests-to-tickets.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to add this

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Migration configuration
const CONFIG = {
  dryRun: true, // Set to false to actually perform migration
  batchSize: 50, // Process in batches to avoid memory issues
  logProgress: true,
};

// Migration statistics
const stats = {
  totalRequests: 0,
  successfulTickets: 0,
  failedTickets: 0,
  totalMessages: 0,
  migratedMessages: 0,
  errors: [],
};

/**
 * Migrate a single request to ticket
 */
async function migrateRequest(requestDoc) {
  const requestId = requestDoc.id;
  const requestData = requestDoc.data();
  
  try {
    console.log(`\n📋 Migrating request: ${requestId}`);
    console.log(`   Subject: ${requestData.subject}`);
    
    // === FETCH ALL MESSAGES FOR THIS REQUEST ===
    const messagesSnapshot = await db
      .collection('messages')
      .where('requestId', '==', requestId)
      .orderBy('createdAt', 'asc')
      .get();
    
    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    stats.totalMessages += messages.length;
    console.log(`   Found ${messages.length} messages`);
    
    // === CREATE TICKET DATA (Optimized structure) ===
    const now = new Date().toISOString();
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    
    const ticketData = {
      // Core fields
      subject: requestData.subject || 'No Subject',
      description: requestData.description || '',
      category: requestData.category || 'Other',
      priority: requestData.priority || 'medium',
      status: requestData.status || 'open',
      
      // Customer info (from request or first message)
      customerId: requestData.userId || 'anonymous',
      customerName: messages[0]?.senderName || 'Unknown Customer',
      customerEmail: requestData.userEmail || 'unknown@example.com',
      
      // Assignment
      assignedTo: null,
      
      // Timestamps
      createdAt: requestData.createdAt || now,
      updatedAt: requestData.updatedAt || now,
      lastMessageAt: lastMessage?.createdAt || requestData.createdAt || now,
      
      // Counters
      messageCount: messages.length,
      unreadCount: messages.filter(m => !m.read).length,
      
      // Metadata
      tags: [],
      metadata: {
        migratedFrom: 'requests',
        originalRequestId: requestId,
        migrationDate: now,
      }
    };
    
    if (!CONFIG.dryRun) {
      // === CREATE TICKET ===
      const ticketRef = await db.collection('tickets').add(ticketData);
      const ticketId = ticketRef.id;
      
      console.log(`   ✅ Ticket created: ${ticketId}`);
      
      // === MIGRATE MESSAGES ===
      const batch = db.batch();
      let batchCount = 0;
      
      for (const message of messages) {
        const messageData = {
          // Sender info
          senderId: message.userId || 'anonymous',
          senderName: message.senderName || 'Unknown',
          senderEmail: message.senderEmail || 'unknown@example.com',
          senderRole: message.senderRole || 'customer',
          
          // Message content
          message: message.content || message.message || '',
          
          // Metadata
          createdAt: message.createdAt,
          read: message.read || false,
          attachments: [],
          edited: false,
          editedAt: null,
          
          // Migration metadata
          migratedFrom: {
            collection: 'messages',
            documentId: message.id,
          }
        };
        
        const messageRef = ticketRef.collection('messages').doc();
        batch.set(messageRef, messageData);
        batchCount++;
        
        // Commit batch every 500 operations (Firestore limit)
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
      
      // Commit remaining messages
      if (batchCount > 0) {
        await batch.commit();
      }
      
      stats.migratedMessages += messages.length;
      console.log(`   ✅ ${messages.length} messages migrated`);
    } else {
      console.log(`   [DRY RUN] Would create ticket with ${messages.length} messages`);
    }
    
    stats.successfulTickets++;
    
  } catch (error) {
    console.error(`   ❌ Error migrating request ${requestId}:`, error.message);
    stats.failedTickets++;
    stats.errors.push({
      requestId,
      error: error.message,
    });
  }
}

/**
 * Main migration function
 */
async function migrateAllRequests() {
  console.log('🚀 Starting migration: Requests → Tickets');
  console.log(`   Mode: ${CONFIG.dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  console.log('');
  
  try {
    // Fetch all requests
    console.log('📊 Fetching all requests...');
    const requestsSnapshot = await db.collection('requests').get();
    stats.totalRequests = requestsSnapshot.docs.length;
    
    console.log(`   Found ${stats.totalRequests} requests to migrate\n`);
    
    if (stats.totalRequests === 0) {
      console.log('ℹ️  No requests found. Nothing to migrate.');
      return;
    }
    
    // Process requests in batches
    const requests = requestsSnapshot.docs;
    for (let i = 0; i < requests.length; i += CONFIG.batchSize) {
      const batch = requests.slice(i, i + CONFIG.batchSize);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(requests.length / CONFIG.batchSize)}`);
      
      for (const requestDoc of batch) {
        await migrateRequest(requestDoc);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Print migration summary
 */
function printSummary() {
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Mode:                ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Total Requests:      ${stats.totalRequests}`);
  console.log(`Successful Tickets:  ${stats.successfulTickets}`);
  console.log(`Failed Tickets:      ${stats.failedTickets}`);
  console.log(`Total Messages:      ${stats.totalMessages}`);
  console.log(`Migrated Messages:   ${stats.migratedMessages}`);
  console.log('='.repeat(60));
  
  if (stats.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    stats.errors.forEach(err => {
      console.log(`   Request ${err.requestId}: ${err.error}`);
    });
  }
  
  if (CONFIG.dryRun) {
    console.log('\nℹ️  This was a DRY RUN. No changes were made.');
    console.log('   To perform actual migration, set CONFIG.dryRun = false');
  } else {
    console.log('\n✅ Migration completed!');
    console.log('   Next steps:');
    console.log('   1. Verify migrated data in Firebase Console');
    console.log('   2. Test application with new tickets');
    console.log('   3. Once verified, you can archive old requests collection');
  }
  
  console.log('='.repeat(60) + '\n');
}

/**
 * Run migration
 */
async function run() {
  try {
    await migrateAllRequests();
    printSummary();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed with error:', error);
    printSummary();
    process.exit(1);
  }
}

// Execute migration
run();
