import { Component, computed, inject } from '@angular/core';
import { MissionService } from '../core/mission.service';
@Component({selector: 'app-science', standalone: true, templateUrl: './science.component.html', host: {class: 'panel science-panel'}})
export class ScienceComponent {
  readonly mission = inject(MissionService);
  readonly source = computed(() => this.mission.selectedTarget()?.sourceUrl ?? this.mission.manifest()?.datasets[0]?.sourceUrl ?? null);
}
