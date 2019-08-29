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

import { filterArray, mapArray } from './array-helpers';
import { DELAY_TIME, TICK, TIMELINE_LENGTH } from './config';
import { createElement } from './create-element';
import { getIdFactory } from './get-id';
import { handleDOM } from './handleDOM';

const getId = getIdFactory();
const getT = () => Date.now();

const getEvent = name => id => ({
  element: createElement(name, id),
  id,
  t: getT(),
});

const getTransformed = (source$, name) =>
  source$.pipe(
    map(getEvent(name)),
    scan((acc, value) => acc.concat(value), []),
    startWith([]),
    shareReplay(0),
  );

const unpack = ([_, values]) => values;
const isRecent = ({ t }) => getT() - t < TIMELINE_LENGTH;
const isSame = (a, b) => a === b || a.length === 0 && b.length === 0;
const toTimeLeft = value => ({ ...value, t: TIMELINE_LENGTH - getT() + value.t });
const decorateWithProgress = value => ({ ...value, progress: (value.t / TIMELINE_LENGTH * 100).toFixed(2) });

const visualize = (source$, name) => {
  time$.pipe(
    withLatestFrom(getTransformed(source$, name)),
    map(unpack),
    map(filterArray(isRecent)),
    distinctUntilChanged(isSame),
    map(mapArray(toTimeLeft)),
    map(mapArray(decorateWithProgress)),
  ).subscribe(handleDOM(name));
}

const time$ = new interval(TICK).pipe(map(() => null));
const clickedRaw$ = new fromEvent(document, 'click').pipe(map(getId));

const multi$ = clickedRaw$.pipe(multicast(() => new Subject()));

const clicked$ = multi$;
const debounced$ = multi$.pipe(debounceTime(DELAY_TIME));
const throttled$ = multi$.pipe(throttleTime(DELAY_TIME));

multi$.connect();

visualize(clicked$, 'clicked');
visualize(debounced$, 'debounce');
visualize(throttled$, 'throttle');

