/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import * as functions from 'firebase-functions';
import { disableBillingForProject, BudgetData, MIN_COST_DIFF_FOR_ALERT } from './billingUtils';
import { DISABLE_BILLING_THRESHOLD, discordWebhookUrl } from './config';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import fetch from "node-fetch";

admin.initializeApp();

interface BathroomData {
  name: string;
  address?: string;
  description?: string;
  isWheelchairAccessible: boolean;
  changingTable: boolean;
  requiresKeyCode: boolean;
  isFree: boolean;
  hours?: string;
  latitude: number;
  longitude: number;
  submitterEmail?: string;
  submitterNotes?: string;
  cityId: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  averageRating?: number;
  totalRatings?: number;
  lastUpdated?: string;
}

// Configure nodemailer with your email service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "LooLabsAdmi@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "wqda sspy tbbm czpj",
  },
});

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const onNewBathroomSubmission = onDocumentCreated(
  "pendingBathrooms/{bathroomId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    const newBathroom = snapshot.data() as BathroomData;
    const {bathroomId} = event.params;

    // Generate Google Maps URL for verification
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${newBathroom.latitude},${newBathroom.longitude}`;

    // Get the Cloud Function URL for verification
    const functionBaseUrl = "https://us-central1-iosbr2.cloudfunctions.net/verifyBathroom";

    // Format the database info for email
    const databaseInfo = JSON.stringify(newBathroom, null, 2);

    const emailContent = `
      New Bathroom Submission:
      
      Name: ${newBathroom.name}
      Address: ${newBathroom.address || "Not provided"}
      Description: ${newBathroom.description || "Not provided"}
      
      Accessibility Features:
      - Wheelchair Accessible: ${newBathroom.isWheelchairAccessible ? "Yes" : "No"}
      - Changing Table: ${newBathroom.changingTable ? "Yes" : "No"}
      - Requires Key/Code: ${newBathroom.requiresKeyCode ? "Yes" : "No"}
      - Free to Use: ${newBathroom.isFree ? "Yes" : "No"}
      
      Hours of Operation: ${newBathroom.hours || "Not provided"}
      City ID: ${newBathroom.cityId}
      
      Location: ${googleMapsUrl}
      
      Submitter Email: ${newBathroom.submitterEmail || "Not provided"}
      Additional Notes: ${newBathroom.submitterNotes || "None"}
      
      To verify this bathroom, click one of these links:
      
      ✅ APPROVE: ${functionBaseUrl}?id=${bathroomId}&action=approve
      
      ❌ REJECT: ${functionBaseUrl}?id=${bathroomId}&action=reject
      
      To verify location on Google Maps: ${googleMapsUrl}
      
      Raw Database Info:
      ${databaseInfo}
    `;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || "LooLabsAdmi@gmail.com",
        to: process.env.EMAIL_USER || "LooLabsAdmi@gmail.com",
        subject: `New Bathroom Submission: ${newBathroom.name}`,
        text: emailContent,
      });
      
      console.log(`Email sent successfully for bathroom: ${bathroomId}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }
);

// Function to verify or reject a bathroom
export const verifyBathroom = onRequest(async (req, res) => {
  try {
    const {id, action} = req.query;
    
    if (!id || !action || (action !== "approve" && action !== "reject")) {
      res.status(400).send("Invalid parameters");
      return;
    }

    const db = admin.firestore();
    
    // Get the pending bathroom
    const pendingRef = db.collection("pendingBathrooms").doc(id as string);
    const pendingDoc = await pendingRef.get();
    
    if (!pendingDoc.exists) {
      res.status(404).send("Bathroom not found");
      return;
    }

    const bathroomData = pendingDoc.data() as BathroomData;

    if (action === "approve") {
      // Add to verified bathrooms
      const verifiedRef = db.collection("bathrooms").doc(id as string);
      await verifiedRef.set({
        ...bathroomData,
        status: "VERIFIED",
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        ratingCount: 1,
        totalRating: 3,
      });
      
      // Delete from pending
      await pendingRef.delete();
      
      res.send("Bathroom approved and added to verified bathrooms!");
    } else {
      // Mark as rejected
      await pendingRef.update({
        status: "REJECTED",
        rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      res.send("Bathroom rejected.");
    }
  } catch (error) {
    console.error("Error verifying bathroom:", error);
    res.status(500).send("Error processing verification");
  }
});

export const onBathroomReport = onDocumentCreated(
  "reports/{reportId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log("No data associated with the event");
      return;
    }

    const reportData = snapshot.data();
    const bathroomId = reportData.bathroomId;

    // Try different bathroom collections
    const collections = ["bathrooms", "FinalBathrooms", "bathrooms-official", "bathrooms-user"];
    let bathroomData = null;

    for (const collectionName of collections) {
      const bathroomRef = admin.firestore().collection(collectionName).doc(bathroomId);
      const bathroomDoc = await bathroomRef.get();
      if (bathroomDoc.exists) {
        bathroomData = bathroomDoc.data();
        break;
      }
    }

    if (!bathroomData) {
      console.error("No bathroom found for ID:", bathroomId);
      return;
    }

    const googleMapsUrl = `https://www.google.com/maps?q=${bathroomData.latitude},${bathroomData.longitude}`;
    const databaseInfo = JSON.stringify(bathroomData, null, 2);

    const emailContent = `
      Bathroom Report Received:
      
      Bathroom Details:
      Name: ${bathroomData.name}
      Address: ${bathroomData.address || "Not provided"}
      ID: ${bathroomId}
      
      Report Information:
      Type: ${reportData.type}
      Details: ${reportData.details}
      Submitted: ${new Date().toLocaleString()}
      
      Current Bathroom Status:
      - Wheelchair Accessible: ${bathroomData.isAccessible ? "Yes" : "No"}
      - Changing Tables: ${bathroomData.hasChangingTables ? "Yes" : "No"}
      - Requires Key/Code: ${bathroomData.requiresKey ? "Yes" : "No"}
      
      Location: ${googleMapsUrl}
      
      Raw Database Info:
      ${databaseInfo}
    `;

    // Create reusable transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "loolabsadmi@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "wqda sspy tbbm czpj"
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    try {
      await transporter.sendMail({
        from: "\"LooLabs Reports\" <loolabsadmi@gmail.com>",
        to: "loolabsadmi@gmail.com",
        subject: `Bathroom Report: ${bathroomData.name} - ${reportData.type}`,
        text: emailContent,
      });
      
      console.log(`Report email sent successfully for bathroom: ${bathroomId}`);

      // Update the report document to mark email as sent
      const reportRef = admin.firestore().collection("reports").doc(snapshot.id);
      await reportRef.update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp()
      });

    } catch (error) {
      console.error("Error sending report email:", error);
      
      // Log the error details to help with debugging
      const reportRef = admin.firestore().collection("reports").doc(snapshot.id);
      await reportRef.update({
        emailError: error.message,
        emailErrorAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
);

async function sendDiscordAlert(message: string) {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!discordWebhookUrl) return;
  
  try {
    await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: message
      })
    });
  } catch (error) {
    console.error("Error sending Discord alert:", error);
  }
}

// Export the new billing implementation
export { handleBillingAlert } from './billingCap';
