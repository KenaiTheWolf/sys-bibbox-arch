import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {SVG_PATHS} from '../../commons';
import {ActivityService} from '../../store/services/activity.service';
import {ActivityItem, LogItem} from '../../store/models/activity.model';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {interval, Observable, Subject, Subscription} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';
import {NONE_TYPE} from '@angular/compiler';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  focussedActivityID: number = this.router.getCurrentNavigation().extras.state?.index || undefined;

  svgPaths = SVG_PATHS;
  activityStates = {
    finished : 'assets/done.png',
    error: 'assets/error.png',
    ongoing: 'assets/loading.gif'
  };

  LOG_TYPES = {
    WARNING : 'WARNING',
    ERROR: 'ERROR',
    INFO: 'INFO'
  };

  activityList: ActivityItem[] = [];
  activityLogs: LogItem[] = [];
  timeInterval: Subscription = interval(1000).subscribe();

  // rm route, data$ ...

  constructor(
    private activityService: ActivityService,
    private router: Router) {

    if (this.focussedActivityID !== undefined){
      this.getLogsOfActivity(this.focussedActivityID);
    }
  }

  ngOnInit(): void {
    this.getActivities();
  }

  ngOnDestroy(): void {
    this.timeInterval.unsubscribe();
  }

  getActivities(): void {
    this.activityService.getActivities().subscribe(
      (res) => this.activityList = res,
    );
    // this.activityList.sort((a, b) => (a.id < b.id) ? 1 : -1);
  }

  getLogsOfActivity(activityID: number): void {
    this.timeInterval.unsubscribe();
    this.timeInterval = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.activityService.getLogsOfActivity(activityID))
      ).subscribe((res: LogItem[]) => this.activityLogs = res);
    // this.activityService.getLogsOfActivity(activityID).subscribe((res) => this.activityLogs = res);
  }

  unsubscribeFromLogs(): void {
    this.timeInterval.unsubscribe();
  }

  clearLogs(): void {
    this.activityLogs = [];
  }
}
