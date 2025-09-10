import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

console.log('🎯 Starting Angular application...');
console.log('📦 AppComponent:', AppComponent);
console.log('⚙️ AppConfig:', appConfig);

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('✅ Angular application started successfully!');
  })
  .catch(error => {
    console.error('❌ Failed to start Angular application:', error);
  });
