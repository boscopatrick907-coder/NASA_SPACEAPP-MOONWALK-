import { Component, inject } from '@angular/core';
import { MissionService } from './core/mission.service';
import { OfflineService } from './core/offline.service';
import { MapComponent } from './map/map.component';
import { LayersComponent } from './layers/layers.component';
import { PlannerComponent } from './planner/planner.component';
import { ScienceComponent } from './science/science.component';
import { NotebookComponent } from './notebook/notebook.component';

// This component assembles the page. Each child owns a visible feature.
@Component({
  selector: 'app-root', standalone: true,
  imports: [MapComponent, LayersComponent, PlannerComponent, ScienceComponent, NotebookComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly mission = inject(MissionService);
  readonly offline = inject(OfflineService);
  constructor() {void this.initialize();}
  private async initialize(): Promise<void> {
    await this.mission.load();
    if (!this.mission.loadError()) void this.offline.prepare();
  }
}
