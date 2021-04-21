// import { Component, OnInit } from '@angular/core';
//
// @Component({
//   selector: 'app-test',
//   templateUrl: './test.component.html',
//   styleUrls: ['./test.component.scss']
// })
// export class TestComponent implements OnInit {
//
//   tags: [
//     {name: 'TEST-ADMIN', checked: false, color: 'primary', count: 5},
//     {name: 'TEST-ADMINISTRATION', checked: false, color: 'primary', count: 3 },
//     {name: 'TEST-BI', checked: false, color: 'primary', count: 3 },
//   ];
//
//   constructor() { }
//
//   ngOnInit(): void {
//   }
//
//   doNothing(tag): void {
//     console.log(tag);
//   }
//
// }
import {Component} from '@angular/core';

/**
 * @title Basic checkboxes
 */
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})

export class TestComponent {
  sumTags = 12;
  tasks = [
    {name: 'Primary', checked: false, color: 'primary', count: 2, facetBarStyle: { width: 2 / this.sumTags}},
    {name: 'Accent', checked: false, color: 'accent', count: 3},
    {name: 'Warn', checked: false, color: 'warn', count: 7}
  ];

  allComplete = false;

  updateAllComplete(): any {
    this.allComplete = this.tasks != null && this.tasks.every(t => t.checked);
  }

  someComplete(): boolean {
    if (this.tasks == null) {
      return false;
    }
    return this.tasks.filter(t => t.checked).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean): any {
    this.allComplete = completed;
    if (this.tasks == null) {
      return;
    }
    this.tasks.forEach(t => t.checked = completed);
  }

  log(tag): any {
    console.log(tag);
  }
}
