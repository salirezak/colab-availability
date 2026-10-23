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

        const VALID_ICON_PATH = GLib.build_filenamev([this._extension.path, 'icons', 'valid.svg',]);
        const ERROR_ICON_PATH = GLib.build_filenamev([this._extension.path, 'icons', 'error.svg',]);
        const CHECK_ICON_PATH = GLib.build_filenamev([this._extension.path, 'icons', 'check.svg',]);
        const VALID_LOADING_ICON_PATH = GLib.build_filenamev([this._extension.path, 'icons', 'valid-loading.svg',]);
        const ERROR_LOADING_ICON_PATH = GLib.build_filenamev([this._extension.path, 'icons', 'error-loading.svg',]);
        const CHECK_LOADING_ICON_PATH = GLib.build_filenamev([this._extension.path, 'icons', 'check-loading.svg',]);

        this.checkIcon = Gio.FileIcon.new(Gio.File.new_for_path(CHECK_ICON_PATH));
        this.errorIcon = Gio.FileIcon.new(Gio.File.new_for_path(ERROR_ICON_PATH));
        this.validIcon = Gio.FileIcon.new(Gio.File.new_for_path(VALID_ICON_PATH));
        this.checkLoadingIcon = Gio.FileIcon.new(Gio.File.new_for_path(CHECK_LOADING_ICON_PATH));
        this.errorLoadingIcon = Gio.FileIcon.new(Gio.File.new_for_path(ERROR_LOADING_ICON_PATH));
        this.validLoadingIcon = Gio.FileIcon.new(Gio.File.new_for_path(VALID_LOADING_ICON_PATH));
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
        this._tooltip = new St.Label({
            style: [
                'padding: 7px 11px;',
                'border-radius: 8px;',
                'background-color: rgba(30, 30, 30, 0.96);',
                'color: #ffffff;',
                'font-size: 0.95em;',
                'font-weight: 500;',
                'box-shadow: 0 3px 12px rgba(0, 0, 0, 0.28);',
            ].join(' '),
            visible: false,
            reactive: false,
        });
        Main.uiGroup.add_child(this._tooltip);
        this._indicator.connect('enter-event', this._onHover.bind(this));
        this._indicator.connect('leave-event', this._onHoverLeave.bind(this));
        this._box.connect('button-press-event', this._onPress.bind(this));
    }

    enable(settings, onClicked) {
        this._settings = settings;
        this._onClicked = onClicked;
        this.setStatus('Initializing', this.checkIcon);
        this._updatePosition();
        this._updateDisplayMode();
        this._updateIconSize();
        this._updateFontSize();
    }

    disable() {
        this._settings = null;
        this._onClicked = null;
        this._isRegistered = false;

        this.checkIcon = null;
        this.errorIcon = null;
        this.validIcon = null;
        this._icon = null;

        this._suffixLabel = null;
        this._statusLabel = null;
        this._label = null;

        this._box = null;
        this._tooltip?.destroy();
        this._tooltip = null;
        this._indicator.destroy();
        this._indicator = null;
    }

    _onPress(_actor, event) {
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
    }

    _onHover() {
        this._showTooltip();
        return Clutter.EVENT_PROPAGATE;
    }

    _onHoverLeave() {
        this._tooltip.hide();
        return Clutter.EVENT_PROPAGATE;
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

    _showTooltip() {
        if (!this._icon || !this._tooltip || !this._statusLabel)
            return;

        this._tooltip.set_text(this._statusLabel.text);
        const [x, y] = this._indicator.get_transformed_position();
        const [width, height] = this._indicator.get_transformed_size();
        const [, tooltipWidth] = this._tooltip.get_preferred_width(-1);
        this._tooltip.set_position(
            Math.round(x + (width - tooltipWidth) / 2),
            Math.round(y + height + 6)
        );
        this._tooltip.show();
    }

    setStatus(text=null, icon=null) {
        if (text !== null && this._statusLabel) {
            this._statusLabel.set_text(text);
            if (this._indicator?.hover)
                this._showTooltip();
        }
        if (icon !== null && this._icon)
            this._icon.gicon = icon;
    }
}
