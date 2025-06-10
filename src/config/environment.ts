interface Environment {
  isProduction: boolean;
  apiEndpoint: string;
  authProvider: 'local' | 'firebase';
  storageProvider: 'local' | 'firebase';
  geminiApiKey: string;
  geminiModel: string;
}

const localEnv: Environment = {
  isProduction: false,
  apiEndpoint: 'http://localhost:3000',
  authProvider: 'local',
  storageProvider: 'local',
  geminiApiKey: 'AIzaSyDbDB_XPsus5RqkqlEcv8LG2bYxTwkSbe4',
  geminiModel: 'gemini-1.5-flash-latest'
};

const prodEnv: Environment = {
  isProduction: true,
  apiEndpoint: 'https://your-firebase-app.web.app',
  authProvider: 'firebase',
  storageProvider: 'firebase',
  geminiApiKey: 'AIzaSyDbDB_XPsus5RqkqlEcv8LG2bYxTwkSbe4',
  geminiModel: 'gemini-1.5-flash-latest'
};

export const environment = process.env.NODE_ENV === 'production' ? prodEnv : localEnv; 