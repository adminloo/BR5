// Your Firebase project ID
export const projectId = process.env.PROJECT_ID || "";

// Discord webhook URL for notifications (optional)
export const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || "";

// The percentage of your budget at which you want to disable billing
export const DISABLE_BILLING_THRESHOLD = 1.0; // 100% of budget 