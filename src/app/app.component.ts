import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],  // ✅ Use RouterModule
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  title: 'the task manager' = "the task manager";
}
