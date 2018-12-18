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

const MARK_WIDTH = '2px';
const TICK = 15;
const TIMELINE_LENGTH = 20 * 1000;
const DELAY_TIME = 2000;

const getT = () => Date.now();

const time$ = new interval(TICK).pipe(map(() => null));
const clickedRaw$ = new fromEvent(document, 'click');

const multi$ = clickedRaw$.pipe(multicast(() => new Subject()));

const clicked$ = multi$;
const debounced$ = multi$.pipe(debounceTime(DELAY_TIME));
const throttled$ = multi$.pipe(throttleTime(DELAY_TIME));

multi$.connect();

const getStyle = color => percentages => percentages.length === 0 ?
  '' :
  `background: linear-gradient(90deg, ${percentages.map(percentage => `
transparent ${percentage}%,
${color} ${percentage}%,
${color} calc(${percentage}% + ${MARK_WIDTH}),
transparent calc(${percentage}% + ${MARK_WIDTH})`).join(', ')});`.replace('\n', ' ');

const visualize = (source$, elementId, color) => {
  const $element = document.getElementById(elementId);
  const sourceTransformed$ = source$.pipe(
    map(getT),
    scan((acc, t) => acc.concat(t), []),
    startWith([]),
    shareReplay(0),
  );
  time$.pipe(
    withLatestFrom(sourceTransformed$),
    map(([_, ts]) => ts),
    map(ts => ts.filter(t => getT() - t < TIMELINE_LENGTH)),
    distinctUntilChanged((a, b) => a === b || a.length === 0 && b.length === 0),
    map(ts => ts.map(t => TIMELINE_LENGTH - getT() + t)),
    map(ts => ts.map(t => (t / TIMELINE_LENGTH * 100).toFixed(5))),
    map(getStyle(color))
  )
    .subscribe(style => {
      $element.setAttribute('style', style);
    });
}

visualize(clicked$, 'clicked-timeline', 'gray');
visualize(debounced$, 'debounce-timeline', 'red');
visualize(throttled$, 'throttle-timeline', 'green');

