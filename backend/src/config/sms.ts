/**
 * SMS service client mock stub.
 * This should be updated in production to interface with CDAC / NIC SMS Gateway services.
 */
export const sms = {
  /**
   * Dispatch SMS mock
   */
  async sendSMS(mobileNumber: string, message: string): Promise<boolean> {
    try {
      console.log(`[SMS-MOCK] Dispatching to ${mobileNumber}: "${message}"`);
      // Simulate network request duration
      await new Promise((resolve) => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error(`[SMS-MOCK] Failed to dispatch SMS to ${mobileNumber}:`, error);
      return false;
    }
  }
};
export default sms;
