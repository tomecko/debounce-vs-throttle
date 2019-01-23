import { fromEvent, interval, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  multicast,
  scan,
  shareReplay,
  startWith,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import { DELAY_TIME, TICK, TIMELINE_LENGTH } from './config';
import { createElement } from './create-element';
import { getIdFactory } from './get-id';
import { handleDOM } from './handleDOM';

const getId = getIdFactory();
const getT = () => Date.now();

const time$ = new interval(TICK).pipe(map(() => null));
const clickedRaw$ = new fromEvent(document, 'click').pipe(map(getId));

const multi$ = clickedRaw$.pipe(multicast(() => new Subject()));

const clicked$ = multi$;
const debounced$ = multi$.pipe(debounceTime(DELAY_TIME));
const throttled$ = multi$.pipe(throttleTime(DELAY_TIME));

multi$.connect();

const visualize = (source$, name) => {
  const sourceTransformed$ = source$.pipe(
    map(id => ({
      element: createElement(name, id),
      id,
      t: getT(),
    })),
    scan((acc, value) => acc.concat(value), []),
    startWith([]),
    shareReplay(0),
  );
  time$.pipe(
    withLatestFrom(sourceTransformed$),
    map(([_, values]) => values),
    map(values => values.filter(({ t }) => getT() - t < TIMELINE_LENGTH)),
    distinctUntilChanged((a, b) => a === b || a.length === 0 && b.length === 0),
    map(values => values.map(value => ({ ...value, t: TIMELINE_LENGTH - getT() + value.t }))),
    map(values => values.map(value => ({ ...value, progress: (value.t / TIMELINE_LENGTH * 100).toFixed(2) }))),
  )
    .subscribe(handleDOM(name));
}

visualize(clicked$, 'clicked');
visualize(debounced$, 'debounce');
visualize(throttled$, 'throttle');

