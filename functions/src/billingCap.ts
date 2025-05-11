import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { CloudBillingClient } from '@google-cloud/billing';
import axios from 'axios';
import * as admin from 'firebase-admin';
import { defineString } from 'firebase-functions/params';

// Initialize Firebase Admin if it hasn't been initialized yet
if (!admin.apps.length) {
  admin.initializeApp();
}

const PROJECT_ID = defineString('PROJECT_ID', { default: 'iosbr2' });
const BUDGET_ID = 'be8d7bfc-7d3c-4081-a000-573678da2423';
const DISCORD_WEBHOOK_URL = defineString('DISCORD_WEBHOOK_URL');
const PUBSUB_TOPIC = 'loo_cap_billing';

// Function to disable billing
const disableBilling = async (projectId: string) => {
  try {
    const billingClient = new CloudBillingClient();
    const projectName = `projects/${projectId}`;

    const [billingInfo] = await billingClient.getProjectBillingInfo({
      name: projectName,
    });

    if (billingInfo.billingEnabled) {
      const [response] = await billingClient.updateProjectBillingInfo({
        name: projectName,
        projectBillingInfo: { billingAccountName: '' },
      });
      return response;
    }
    return null;
  } catch (e) {
    console.error('Failed to disable billing', e);
    return null;
  }
};

// Function to send Discord notification
const sendDiscordNotification = async (message: string) => {
  try {
    await axios.post(DISCORD_WEBHOOK_URL.value(), {
      content: message,
    });
  } catch (e) {
    console.error('Failed to send Discord notification', e);
  }
};

// Cloud Function triggered by Pub/Sub
export const handleBillingAlert = onMessagePublished({
  topic: PUBSUB_TOPIC,
  region: 'us-central1',
  memory: '256MiB',
}, async (event) => {
  try {
    const data = event.data.message.json;
    const budgetAmount = data.budgetAmount;
    const costAmount = data.costAmount;
    const currencyCode = data.currencyCode;

    const notificationMessage = `🚨 Alert: Budget threshold exceeded!\nBudget Amount: ${budgetAmount} ${currencyCode}\nCurrent Cost: ${costAmount} ${currencyCode}`;
    
    await sendDiscordNotification(notificationMessage);

    if (costAmount >= budgetAmount) {
      const billingResponse = await disableBilling(PROJECT_ID.value());
      if (billingResponse) {
        await sendDiscordNotification('⚠️ Project billing has been disabled!');
      }
    }
  } catch (e) {
    console.error('Error processing Pub/Sub message:', e);
    await sendDiscordNotification('❌ Error processing billing alert!');
  }
}); 