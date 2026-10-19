import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';


export default class Indicator {
    constructor(extension) {
        this._extension = extension;
        this._settings = null;
        this._onClicked = null;
        this._isRegistered = false;

        const OK_ICON_PATH = GLib.build_filenamev([this._extension.path, 'icons', 'colab-ok.png',]);
        const ERROR_ICON_PATH = GLib.build_filenamev([this._extension.path, 'icons', 'colab-error.png',]);
        const BUSY_ICON_PATH = GLib.build_filenamev([this._extension.path, 'icons', 'colab-busy.png']);
        this.busyIcon = Gio.FileIcon.new(Gio.File.new_for_path(BUSY_ICON_PATH));
        this.errorIcon = Gio.FileIcon.new(Gio.File.new_for_path(ERROR_ICON_PATH));
        this.okIcon = Gio.FileIcon.new(Gio.File.new_for_path(OK_ICON_PATH));
        this._icon = new St.Icon({style_class: 'system-status-icon', style: 'padding: 0px; margin: 0px;', y_align: Clutter.ActorAlign.CENTER});

        const SUFFIX_TEXT = 'Colab: ';
        this._suffixLabel = new St.Label({text: SUFFIX_TEXT, y_align: Clutter.ActorAlign.CENTER});
        this._statusLabel = new St.Label({y_align: Clutter.ActorAlign.CENTER});
        this._label = new St.BoxLayout({y_align: Clutter.ActorAlign.CENTER});
        this._label.add_child(this._suffixLabel);
        this._label.add_child(this._statusLabel);

        this._box = new St.BoxLayout({style: 'spacing: 6px', y_align: Clutter.ActorAlign.CENTER, reactive: true});
        this._box.add_child(this._icon);
        this._box.add_child(this._label);

        this._indicator = new PanelMenu.Button(0.0, this._extension.metadata.name, false);
        this._indicator.add_child(this._box);
        this._box.connect('button-press-event', (_actor, event) => {
            const button = event.get_button();
            if (button === Clutter.BUTTON_PRIMARY)
                this._onClicked?.();
            else if (button === Clutter.BUTTON_MIDDLE) {
                Gio.AppInfo.launch_default_for_uri_async('https://colab.research.google.com/', null, null, (_source, result) => {
                    try {
                        Gio.AppInfo.launch_default_for_uri_finish(result);
                    } catch (error) {
                        log.error('[Colab availability] Could not open Colab:', error);
                    }
                });
            } else if (button === Clutter.BUTTON_SECONDARY) {
                this._extension.openPreferences();
            } else {
                return Clutter.EVENT_PROPAGATE;
            }
            return Clutter.EVENT_STOP;
        });
    }

    enable(settings, onClicked) {
        this._settings = settings;
        this._onClicked = onClicked;
        this.setStatus('Initializing', this.busyIcon);
        this._updatePosition();
        this._updateDisplayMode();
        this._updateIconSize();
        this._updateFontSize();
    }

    disable() {
        this._settings = null;
        this._onClicked = null;
        this._isRegistered = false;

        this.busyIcon = null;
        this.errorIcon = null;
        this.okIcon = null;
        this._icon = null;

        this._suffixLabel = null;
        this._statusLabel = null;
        this._label = null;

        this._box = null;
        this._indicator.destroy();
        this._indicator = null;
    }


    _updatePosition() {
        if (!this._indicator)
            return;
        if (this._isRegistered) {
            const container = this._indicator.container;
            const parent = container.get_parent();
            if (parent)
                parent.remove_child(container);
            delete Main.panel.statusArea[this._extension.uuid];
            this._isRegistered = false;
        }
        Main.panel.addToStatusArea(
            this._extension.uuid,
            this._indicator,
            this._settings.getInt('position'),
            this._settings.getString('panel-box')
        );
        this._isRegistered = true;
    }

    _updateDisplayMode() {
        if (!this._icon || !this._label)
            return;
        const MODE = this._settings.getString('display-mode');
        this._icon.visible = (MODE === 'icon-only' || MODE === 'both');
        this._label.visible = (MODE === 'text-only' || MODE === 'both');
        this._suffixLabel.visible = (MODE === 'text-only');
    }

    _updateIconSize() {
        if (!this._icon)
            return;
        this._icon.icon_size = this._settings.getInt('icon-size');
    }

    _updateFontSize() {
        if (!this._suffixLabel || !this._statusLabel)
            return;
        const STYLE = `font-size: ${this._settings.getInt('font-size')}px;`;
        this._suffixLabel.set_style(STYLE);
        this._statusLabel.set_style(STYLE);
    }

    setStatus(text=null, icon=null) {
        if (text !== null && this._statusLabel)
            this._statusLabel.set_text(text);
        if (icon !== null && this._icon)
            this._icon.gicon = icon;
    }
}
