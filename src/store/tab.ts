import { createState } from '../core/solid';
import type { RouteTab } from '../routes';

export const activeHomeTab = createState<RouteTab>('home');
