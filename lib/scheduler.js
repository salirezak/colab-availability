import GObject from 'gi://GObject';
import GLib from 'gi://GLib';



export const ColabScheduler = GObject.registerClass({
    GTypeName: 'ColabAvailabilityScheduler',
    Signals: {
        'check-required': {},
    }
}, class ColabScheduler extends GObject.Object {
    _init() {
        super._init();
        this._timeoutId = 0;
    }

    start(intervalSeconds) {
        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, intervalSeconds * 1000, () => {
            this.emit('check-required');
            return GLib.SOURCE_CONTINUE;
        });
    }

    stop() {
        if (this._timeoutId > 0) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = 0;
        }
    }

    destroy() {
        this.stop();
    }
});