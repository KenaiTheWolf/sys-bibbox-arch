import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {
  InstanceActionTypes,
  AddInstanceAction, AddInstanceFailureAction, AddInstanceSuccessAction,
  LoadInstancesAction, LoadInstancesFailureAction, LoadInstancesSuccessAction,
  DeleteInstanceAction, DeleteInstanceFailureAction, DeleteInstanceSuccessAction
} from '../actions/instance.actions';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {InstanceService} from '../services/instance.service';
import {of} from 'rxjs';

@Injectable()
export class InstanceEffects {

  loadInstances$ =  createEffect(() =>
    this.actions$.pipe(
      ofType<LoadInstancesAction>(InstanceActionTypes.LOAD_INSTANCES),
      mergeMap(
        () => this.instanceService.loadInstances()
          .pipe(
            map(data => new LoadInstancesSuccessAction(data)),
            catchError(error => of(new LoadInstancesFailureAction(error)))
          )
      )
    )
  );
  addInstance$ = createEffect(() =>
    this.actions$.pipe(
      ofType<AddInstanceAction>(InstanceActionTypes.ADD_INSTANCE),
      mergeMap(
        () => this.instanceService.addInstance('instanceNameToAdd', JSON.parse('{InstancePOSTItem}')) // TODO: correct parameters
          .pipe(
            map(data => new AddInstanceSuccessAction(data)),
            catchError(error => of(new AddInstanceFailureAction(error)))
          )
      )
    )
  );
  deleteInstance$ = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteInstanceAction>(InstanceActionTypes.DELETE_INSTANCE),
      mergeMap(
        () => this.instanceService.deleteInstance('instanceToDelete') // TODO: correct parameters
          .pipe(
            map(data => new DeleteInstanceSuccessAction(data)),
            catchError(error => of(new DeleteInstanceFailureAction(error)))
          )
      )
    )
  );

  constructor(private actions$: Actions, private instanceService: InstanceService) {

  }

}