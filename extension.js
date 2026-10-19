import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Indicator from './modules/indicator.js';
import Settings from './modules/settings.js';
import Monitor from './modules/monitor.js';
import Scheduler from './modules/scheduler.js';


export default class ColabAvailabilityExtension extends Extension {
    enable() {
        this._settings = new Settings(this);
        this._indicator = new Indicator(this);
        this._monitor = new Monitor(this);
        this._scheduler = new Scheduler(this);

        this._settings.enable(this._indicator, this._scheduler);
        this._indicator.enable(this._settings, () => this._scheduler.restart());
        this._monitor.enable(this._settings, this._indicator);
        this._scheduler.enable(this._settings, this._monitor);
    }

    disable() {
        this._settings?.disable();
        this._indicator?.disable();
        this._monitor?.disable();
        this._scheduler?.disable();

        this._settings = null;
        this._indicator = null;
        this._monitor = null;
        this._scheduler = null;
    }
}
