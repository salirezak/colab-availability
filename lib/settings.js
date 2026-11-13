import GObject from 'gi://GObject';



export const SettingsManager = GObject.registerClass({
    GTypeName: 'ColabAvailabilitySettingsManager',
    Signals: {
        'interval-changed': {},
    }
}, class SettingsManager extends GObject.Object {
    _init(extension) {
        super._init();
        this._settings = extension.getSettings();
        this._settingsSignalIds = [
            this._settings.connect('changed::check-interval', () => {this.emit('interval-changed')}),
        ]
    }

    getCheckInterval() {
        return this._settings.get_uint('check-interval')
    }

    destroy() {
        if (!this._settings) return;
        this._settingsSignalIds.forEach(id => this._settings.disconnect(id));
        this._settingsSignalIds = [];
        this._settings = null;
    }
});