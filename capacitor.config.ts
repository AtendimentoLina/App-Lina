import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lina.app',
  appName: 'Lina Design',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;