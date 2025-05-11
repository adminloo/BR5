import { db } from '../src/services/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { SUPPORTED_CITIES } from './types';

async function migrateBathrooms() {
  try {
    let batch = writeBatch(db);
    let migratedCount = 0;
    let idCounter = 1; // Start IDs at 1

    // Migrate each city's bathrooms
    for (const cityData of Object.values(SUPPORTED_CITIES)) {
      console.log(`Migrating ${cityData.name} bathrooms...`);
      
      const oldCollectionRef = collection(db, cityData.path);
      const snapshot = await getDocs(oldCollectionRef);
      
      for (const oldDoc of snapshot.docs) {
        const data = oldDoc.data();
        // Create document with sequential ID
        const newDocRef = doc(collection(db, 'bathrooms'), idCounter.toString());
        
        // Standardize and migrate data
        const standardizedData = {
          // Standardized fields
          address: data.address || '',
          averageRating: Number(data.averageRating || 3),
          changingTable: Boolean(data.changingTable || false),
          description: data.description || '',
          hours: data.hours || 'UNK',
          isFree: Boolean(data.isFree || true),
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          latitude: Number(data.latitude || 0),
          longitude: Number(data.longitude || 0),
          name: data.name || '',
          requiresKeyCode: Boolean(data.requiresKeyCode || false),
          status: data.status || 'UNK',
          totalRatings: Number(data.totalRatings || 1),
          wheelchairAccessible: Boolean(data.wheelchairAccessible || false)
        };
        
        batch.set(newDocRef, standardizedData);
        migratedCount++;
        idCounter++; // Increment ID counter
        
        if (migratedCount % 400 === 0) {
          await batch.commit();
          console.log(`Committed batch of ${migratedCount} bathrooms`);
          batch = writeBatch(db);
        }
      }
    }
    
    if (migratedCount % 400 !== 0) {
      await batch.commit();
    }
    
    console.log(`Successfully migrated ${migratedCount} bathrooms`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateBathrooms(); 