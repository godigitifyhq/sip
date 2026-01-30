// Sync KYC status from KYCDocument to User records
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function syncKycStatus() {
    console.log('🔄 Syncing KYC status from documents to users...');
    
    const kycDocs = await prisma.kYCDocument.findMany({
        orderBy: { createdAt: 'desc' },
    });
    
    const userKycMap = new Map();
    for (const doc of kycDocs) {
        if (!userKycMap.has(doc.userId)) {
            userKycMap.set(doc.userId, doc.status);
        }
    }
    
    console.log(`Found ${userKycMap.size} users with KYC documents`);
    
    let updated = 0;
    for (const [userId, status] of userKycMap.entries()) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { kycStatus: true }
        });
        
        if (user && user.kycStatus !== status) {
            await prisma.user.update({
                where: { id: userId },
                data: { kycStatus: status }
            });
            console.log(`✅ Updated user ${userId}: ${user.kycStatus || 'null'} -> ${status}`);
            updated++;
        }
    }
    
    console.log(`\n✅ Done! Updated ${updated} user(s)`);
}

syncKycStatus()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
