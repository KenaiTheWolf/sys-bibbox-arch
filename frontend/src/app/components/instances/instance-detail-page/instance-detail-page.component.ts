import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {InstanceItem} from '../../../store/models/instance-item.model';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../store/models/app-state.model';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import * as InstanceSelector from '../../../store/selectors/instance.selector';
import {MatSnackBar} from '@angular/material/snack-bar';
import {InstanceService} from '../../../store/services/instance.service';
import {DeleteInstanceAction} from '../../../store/actions/instance.actions';
import {FormBuilder, Validators} from '@angular/forms';
import {SVG_PATHS} from '../../../commons';
import {environment} from '../../../../environments/environment';
import {Location} from '@angular/common';

@Component({
  selector: 'app-instance-detail-page',
  templateUrl: './instance-detail-page.component.html',
  styleUrls: ['./instance-detail-page.component.scss']
})
export class InstanceDetailPageComponent implements OnInit {
  tabIndex = 0; // 0: Dashboard, 1: Logs
  instance$: Observable<InstanceItem>;
  instanceItem: InstanceItem;
  instanceNameFromUrl: string;
  baseurl = environment.BASEURL;

  @ViewChild('scrollContainer') container: ElementRef;
  scrollTop: number = null;

  instanceLinks = []; // external Links to Github repo
  instanceContainerLogs = {}; // dictionary -> key: containerName, value: logs of container

  svgPaths = SVG_PATHS;

  // form fields for patch request
  instanceDetailForm = this.fb.group({
    displayname_short: ['',
      [
        Validators.required,
        Validators.maxLength(48)
      ]
    ],
    displayname_long: ['',
      [
        Validators.maxLength(96)
      ]
    ],
    description_short: ['', ],
    description_long: ['', ]
  });

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private instanceService: InstanceService,
    private fb: FormBuilder,
    private _location: Location
  ) {
    // redirect if state is empty -> caused by hard reloading current view
    if (this.router.getCurrentNavigation().extras.state === undefined){
      this.router.navigateByUrl('/instances').then();
    }
    this.tabIndex = this.router.getCurrentNavigation().extras.state.index;

    // TODO: use like this, get instanceName from route
    // if (this.router.getCurrentNavigation().extras.state !== undefined){
    //   this.tabIndex = this.router.getCurrentNavigation().extras.state.index;
    // }
  }

  ngOnInit(): void {
    this.instanceNameFromUrl = this.route.snapshot.paramMap.get('instance_name');
    this.instance$ = this.store.pipe(select(InstanceSelector.selectCurrentInstance, this.instanceNameFromUrl));
    this.instance$.subscribe(
      (instanceItem) => {
        this.instanceItem = instanceItem;
        this.loadGithubLinks();
        this.loadContainerLogs();
        this.updateForm();
      });
  }

  updateForm(): void {
    this.instanceDetailForm.patchValue({
      displayname_long: this.instanceItem.displayname_long,
      displayname_short: this.instanceItem.displayname_short,
      description_long: this.instanceItem.description_long,
      description_short: this.instanceItem.description_short
    });
  }

  loadGithubLinks(): void {
    let versionBranch = this.instanceItem.app.version;
    if (this.instanceItem.app.version === 'development') {
      versionBranch = 'master';
    }
    // get instance links
    this.instanceLinks = [
      { label: 'GitHub Repository:',
        url: 'https://www.github.com/bibbox/'
          + this.instanceItem.app.name},
      { label: 'Install Instructions:',
        url: 'https://www.github.com/bibbox/'
          + this.instanceItem.app.name
          + '/blob/'
          + versionBranch
          + '/INSTALL-APP.md', }
    ];
  }

  deleteInstance(): void {
    console.log('delete instance:' + this.instanceItem.instancename);
    this.instanceService.deleteInstance(this.instanceItem.instancename).subscribe(
      (res) => console.log(res)
    );
    this.router.navigateByUrl('/instances').then();
  }

  manageInstance(operation: string): void {
    this.instanceService.manageInstance(this.instanceItem.instancename, operation).subscribe((res) => console.log(res));
  }

  saveInstanceChanges(): void {
    console.log('save instance changes');
    this.snackbar.open(JSON.stringify(this.instanceDetailForm.value) + this.instanceDetailForm.valid, 'OK', {duration: 4000});

    if (this.instanceDetailForm.valid) {
      this.instanceService.updateInstanceDescription(this.instanceItem.instancename, JSON.stringify(this.instanceDetailForm.value))
        .subscribe(
        (res) => console.log(res)
      );
    }
  }

  loadContainerLogs(): void {
    this.instanceService.getInstanceContainerLogs(this.instanceItem.instancename).subscribe(
      (res: JSON) => {
        this.instanceContainerLogs = res;
      }
    );
  }

  backClicked(): void {
    this._location.back();
  }
}
