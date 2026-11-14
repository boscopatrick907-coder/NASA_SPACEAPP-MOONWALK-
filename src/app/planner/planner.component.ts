import { Component, computed, inject } from '@angular/core';
import { MissionService } from '../core/mission.service';
import type { Point } from '../core/models';
@Component({selector: 'app-planner', standalone: true, templateUrl: './planner.component.html', host: {class: 'panel route-panel'}})
export class PlannerComponent {
  readonly mission = inject(MissionService);
  readonly rows = computed(() => {
    const route = this.mission.route(), rows: {label: string; point: Point}[] = [];
    if (route.start) rows.push({label: 'Start', point: route.start});
    route.waypoints.forEach((point, i) => rows.push({label: 'Waypoint ' + (i + 1), point}));
    if (route.destination) rows.push({label: 'Destination', point: route.destination});
    return rows;
  });
}
