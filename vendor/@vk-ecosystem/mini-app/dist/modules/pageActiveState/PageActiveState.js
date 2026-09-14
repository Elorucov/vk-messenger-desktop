import { Hook } from '../hook/Hook.js';
import { PageActiveStateEventNames, PageLeaveEventNames } from './types.js';

class PageActiveStateShared{destroy(){Object.values(this.eventHooks).forEach(e=>e.clear());window.removeEventListener("visibilitychange",this.onVisibilityChange.bind(this));window.removeEventListener("pagehide",this.onPageHide.bind(this));}activate(){this.eventHooks[PageActiveStateEventNames.ACTIVATE].fire();}deactivate(){this.eventHooks[PageActiveStateEventNames.DEACTIVATE].fire();}onVisibilityChange(){if(document.hidden){this.deactivate();}else {this.activate();}}onPageHide(){this.eventHooks[PageLeaveEventNames.BEFORE_LEAVE].fire();}constructor(){this.eventHooks={[PageActiveStateEventNames.ACTIVATE]:new Hook(PageActiveStateEventNames.ACTIVATE),[PageActiveStateEventNames.DEACTIVATE]:new Hook(PageActiveStateEventNames.DEACTIVATE),[PageLeaveEventNames.BEFORE_LEAVE]:new Hook(PageLeaveEventNames.BEFORE_LEAVE)};window.addEventListener("visibilitychange",this.onVisibilityChange.bind(this));window.addEventListener("pagehide",this.onPageHide.bind(this));}}

export { PageActiveStateShared };
