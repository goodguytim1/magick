// PocketBase setup - Even simpler alternative
// 1. Download PocketBase from https://pocketbase.io/
// 2. Run: ./pocketbase serve
// 3. Create admin account at http://localhost:8090/_/

// PocketBase client setup
const POCKETBASE_URL = 'http://localhost:8090'; // or your hosted URL

export class PocketBaseClient {
  private baseUrl: string;

  constructor(baseUrl: string = POCKETBASE_URL) {
    this.baseUrl = baseUrl;
  }

  async savePersonalityData(userId: string, personalityData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/users/records/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalityData,
          updatedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to save');
      console.log('Personality data saved to PocketBase');
    } catch (error) {
      console.error('Error saving to PocketBase:', error);
      throw error;
    }
  }

  async getPersonalityData(userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/users/records/${userId}`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.personalityData || null;
    } catch (error) {
      console.error('Error getting from PocketBase:', error);
      return null;
    }
  }

  async hasCompletedPersonalityTest(userId: string) {
    try {
      const personalityData = await this.getPersonalityData(userId);
      return personalityData !== null && 
             personalityData.loveLanguage !== undefined &&
             personalityData.personalityType !== undefined &&
             personalityData.zodiacSign !== undefined;
    } catch (error) {
      console.error('Error checking completion:', error);
      return false;
    }
  }
}

export const pocketbase = new PocketBaseClient();
