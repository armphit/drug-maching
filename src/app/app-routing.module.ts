import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatchingComponent } from './pages/matching/matching.component';

const routes: Routes = [
  {
    path: '',
    component: MatchingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
