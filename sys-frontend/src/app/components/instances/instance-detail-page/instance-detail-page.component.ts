import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {InstanceItem} from '../../../store/models/instance-item.model';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../store/models/app-state.model';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import * as InstanceSelector from '../../../store/selectors/instance.selector';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-instance-detail-page',
  templateUrl: './instance-detail-page.component.html',
  styleUrls: ['./instance-detail-page.component.scss']
})
export class InstanceDetailPageComponent implements OnInit {
  instance$: Observable<InstanceItem>;
  instanceItem: InstanceItem;
  instanceName: string;
  tabIndex = 0;
  links = [];

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    // redirect if state is empty -> caused by reloading current view
    if (this.router.getCurrentNavigation().extras.state === undefined){
      this.router.navigateByUrl('/instances').then();
    }
    this.tabIndex = this.router.getCurrentNavigation().extras.state.index;
  }

  ngOnInit(): void {

    this.instanceName = this.route.snapshot.paramMap.get('instance_name');
    this.instance$ = this.store.pipe(select(InstanceSelector.selectCurrentInstance, this.instanceName))
      .pipe(
        map((item: InstanceItem) => {
          return this.instanceItem = item;
        })
      );

    if (this.instanceItem !== undefined) {
      this.links = [
        { url: this.instanceItem, label: 'GitHub Repository' },
        { url: 'https://www.github.com/bibbox/'
            + this.instanceItem.app.name
            + '/blob/'
            + this.instanceItem.app.version
            + '/INSTALL-APP.md',
          label: 'Install Instructions' }
      ];
    }
  }

  log(message: string): void {
    console.log(message);
    console.log(this.instance$);
  }
}
