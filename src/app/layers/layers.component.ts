import { Component, inject } from '@angular/core';
import { MissionService } from '../core/mission.service';
@Component({selector: 'app-layers', standalone: true, templateUrl: './layers.component.html', host: {class: 'panel layers-panel'}})
export class LayersComponent {
  readonly mission = inject(MissionService);
  readonly layers = [
    {name: 'imagery', title: 'HiRISE context image', detail: 'Historical optical imagery'},
    {name: 'markers', title: 'Example science targets', detail: 'Illustrative positions'},
    {name: 'grid', title: 'Image coordinate grid', detail: '200 image pixels · not meters'},
    {name: 'coverage', title: 'Uncertainty overlay', detail: 'Terrain assessment unavailable'}
  ] as const;
}
