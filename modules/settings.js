export default class Settings {
    constructor(extension) {
        this._extension = extension;
        this._settings = this._extension.getSettings();
        this._indicator = null;
        this._scheduler = null;
        this._changedIds = [];
    }

    enable(indicator, scheduler) {
        this._indicator = indicator;
        this._scheduler = scheduler;
        this._changedIds = [
            this._settings.connect('changed::position', () => this._indicator._updatePosition()),
            this._settings.connect('changed::panel-box', () => this._indicator._updatePosition()),
            this._settings.connect('changed::display-mode', () => this._indicator._updateDisplayMode()),
            this._settings.connect('changed::icon-size', () => this._indicator._updateIconSize()),
            this._settings.connect('changed::font-size', () => this._indicator._updateFontSize()),

            this._settings.connect('changed::check-interval', () => this._scheduler.restart()),
            this._settings.connect('changed::request-timeout', () => this._scheduler.restart()),
        ];
    }

    disable() {
        for (const id of this._changedIds)
            this._settings.disconnect(id);
        this._changedIds = [];
        this._indicator = null;
        this._scheduler = null;
    }

    getInt(key) {return this._settings.get_int(key)}
    getString(key) {return this._settings.get_string(key)}
    setInt(key, value) {this._settings.set_int(key, value)}
    setString(key, value) {this._settings.set_string(key, value)}
}