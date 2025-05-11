import { db } from '../src/services/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { SUPPORTED_CITIES } from '../config/cities';

async function standardizeBathrooms() {
  try {
    const batch = writeBatch(db);
    let updatedCount = 0;

    for (const cityData of Object.values(SUPPORTED_CITIES)) {
      console.log(`Standardizing ${cityData.name} bathrooms...`);
      
      const bathroomsRef = collection(db, cityData.path);
      const snapshot = await getDocs(bathroomsRef);
      
      for (const bathroomDoc of snapshot.docs) {
        const oldData = bathroomDoc.data();
        
        // Standardize the bathroom document structure
        const standardizedData = {
          address: oldData.address || '',
          averageRating: Number(oldData.averageRating || 3),
          changingTable: Boolean(oldData.changingTable || false),
          description: oldData.description || '',
          hours: oldData.hours || 'UNK',
          isFree: Boolean(oldData.isFree || true),
          lastUpdated: oldData.lastUpdated || new Date().toISOString(),
          latitude: String(oldData.latitude || '0'),
          longitude: String(oldData.longitude || '0'),
          name: oldData.name || 'Unnamed Location',
          requiresKeyCode: Boolean(oldData.requiresKeyCode || false),
          status: oldData.status || 'UNK',
          totalRatings: Number(oldData.totalRatings || 1),
          wheelchairAccessible: Boolean(oldData.wheelchairAccessible || false)
        };

        // Update the document
        const bathroomRef = doc(bathroomsRef, bathroomDoc.id);
        batch.set(bathroomRef, standardizedData, { merge: true });
        updatedCount++;

        // Commit every 400 operations (Firestore limit is 500)
        if (updatedCount % 400 === 0) {
          await batch.commit();
          console.log(`Committed batch of ${updatedCount} bathrooms`);
          batch = writeBatch(db);
        }
      }
    }

    // Commit any remaining updates
    if (updatedCount % 400 !== 0) {
      await batch.commit();
    }

    console.log(`Successfully standardized ${updatedCount} bathrooms`);
  } catch (error) {
    console.error('Standardization failed:', error);
  }
}

// Run the standardization
standardizeBathrooms(); 