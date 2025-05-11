import { CloudBillingClient } from '@google-cloud/billing';
import { projectId } from './config';

// Minimum cost difference (in your currency) required to trigger an alert
export const MIN_COST_DIFF_FOR_ALERT = 1;

const billingClient = new CloudBillingClient();

export async function disableBillingForProject() {
  try {
    const [projects] = await billingClient.listProjectBillingInfo({
      name: `projects/${projectId}`,
    });

    if (projects.length <= 0) {
      throw new Error('No projects found.');
    }

    const projectBillingInfo = projects[0];
    const billingAccountName = projectBillingInfo.billingAccountName;

    if (billingAccountName) {
      const updateInfo = {
        name: `projects/${projectId}/billingInfo`,
        projectBillingInfo: { billingAccountName: '' },
      };

      const [response] = await billingClient.updateProjectBillingInfo(updateInfo);
      return response;
    } else {
      console.log('Project billing already disabled');
      return null;
    }
  } catch (e) {
    console.error('Failed to disable billing', e);
    return null;
  }
}

export interface BudgetData {
  budgetAmount: number;
  costAmount: number;
  costIntervalStart: string;
  budgetDisplayName: string;
  alertThresholdExceeded: number;
} 