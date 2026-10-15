import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Indicator from './extension-indicator.js';
import Settings from './extension-settings.js';
import Monitor from './extension-monitor.js';
import Scheduler from './extention-scheduler.js';


export default class ColabAvailabilityExtension extends Extension {
    enable() {
        this._settings = new Settings(this);
        this._indicator = new Indicator(this);
        this._monitor = new Monitor(this);
        this._scheduler = new Scheduler(this);

        this._settings.enable(this._indicator, this._scheduler);
        this._indicator.enable(this._settings, () => this._monitor.checkAvailability(true));
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
