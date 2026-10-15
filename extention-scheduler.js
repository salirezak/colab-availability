import GLib from 'gi://GLib';

export default class Scheduler {
    constructor(extension) {
        this._extension = extension;
        this._settings = null;
        this._monitor = null;
        this._timeoutId = 0;
    }

    enable(settings, monitor) {
        this._settings = settings;
        this._monitor = monitor;
        this.restart();
    }

    disable() {
        this._settings = null;
        this._monitor = null;
        this._clearTimer();
    }

    restart() {
        this._clearTimer();

        if (!this._settings || !this._monitor)
            return;
        this._monitor.checkAvailability(true);

        const interval = this._settings.getInt('check-interval');
        if (interval <= 0)
            return;

        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            interval,
            () => {
                this._monitor?.checkAvailability();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    _clearTimer() {
        if (this._timeoutId === 0)
            return;

        GLib.Source.remove(this._timeoutId);
        this._timeoutId = 0;
    }
}