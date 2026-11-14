import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MissionService } from '../core/mission.service';
@Component({selector: 'app-notebook', standalone: true, imports: [FormsModule, DatePipe], templateUrl: './notebook.component.html', host: {class: 'panel notebook-panel'}})
export class NotebookComponent {
  readonly mission = inject(MissionService);
  readonly newestFirst = computed(() => this.mission.notes().slice().reverse());
  noteText = '';
  save(): void {
    // Keep the editor contents if local storage failed.
    if (this.mission.saveNote(this.noteText)) this.noteText = '';
  }
}
