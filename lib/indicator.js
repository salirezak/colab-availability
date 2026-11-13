import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import Clutter from 'gi://Clutter';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';



export const ColabIndicator = GObject.registerClass({
    GTypeName: 'ColabAvailabilityIndicator',
    Signals: {
        'check-clicked': {},
    }
}, class ColabIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.5, 'Colab Availability Indicator');
        this._extension = extension;

        this._setupIcon();
        this._setupMenu();
    }

    _setupIcon() {
        const gicon = Gio.icon_new_for_string(`${this._extension.path}/icons/pending.svg`);
        this._icon = new St.Icon({gicon: gicon, style_class: 'system-status-icon', icon_size: 24});
        this.add_child(this._icon);
    }

    _setupMenu() {
        const topItem = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
        const topBox = new St.BoxLayout({vertical: true, x_expand: true});

        const statusBox = new St.BoxLayout({vertical: false, x_expand: true, y_align: Clutter.ActorAlign.CENTER, style: 'spacing: 0px;'});
        this._statusLabel = new St.Label({text: 'Initializing', y_align: Clutter.ActorAlign.CENTER, x_expand: true, style: 'font-weight: bold;'});
        const checkBtn = new St.Button({style_class: 'button', y_expand: true, y_align: Clutter.ActorAlign.CENTER, style: 'padding: 4px 8px;'});
        checkBtn.set_child(new St.Icon({icon_name: 'view-refresh-symbolic', icon_size: 16}));
        checkBtn.connect('clicked', () => this._onCheckClicked());
        statusBox.add_child(this._statusLabel);
        statusBox.add_child(checkBtn);

        this._detailLabel = new St.Label({text: '', x_expand: true, visible: false, style: 'font-size: 11pt; opacity: 0.8; margin-top: 6px; max-width: 250px; text-align: justify;'});
        this._detailLabel.clutter_text.line_wrap = true;
        this._detailLabel.clutter_text.line_wrap_mode = Pango.WrapMode.WORD_CHAR;

        topBox.add_child(statusBox)
        topBox.add_child(this._detailLabel)
        topItem.add_child(topBox);
        this.menu.addMenuItem(topItem);
        // -----------------
        const separatorStyle = 'padding-top: 2px; padding-bottom: 2px;';
        const Separator = new PopupMenu.PopupSeparatorMenuItem();
        Separator.style = separatorStyle;
        this.menu.addMenuItem(Separator);
        // -----------------
        const actionsItem = new PopupMenu.PopupBaseMenuItem({reactive: false, can_focus: false});
        const actionsBox = new St.BoxLayout({vertical: false, x_expand: true, style: 'spacing: 6px;'});
        const websiteBtn = new St.Button({label: 'Open Colab', style_class: 'button', x_expand: true, style: 'min-height: 34px;'});
        const settingsBtn = new St.Button({label: 'Preferences', style_class: 'button', x_expand: true, style: 'min-height: 34px;'});
        websiteBtn.connect('clicked', () => this._onWebsiteClicked());
        settingsBtn.connect('clicked', () => this._onSettingsClicked());
        actionsBox.add_child(websiteBtn);
        actionsBox.add_child(settingsBtn);
        actionsItem.add_child(actionsBox);
        this.menu.addMenuItem(actionsItem);
    }

    _onSettingsClicked() {
        this.menu.close();
        this._extension.openPreferences();
    }

    _onWebsiteClicked() {
        this.menu.close();
        Gio.AppInfo.launch_default_for_uri('https://colab.research.google.com/', null);
    }

    _onCheckClicked() {
        this.menu.close();
        this.emit('check-clicked');
    }

    setProcessing(isProcessing) {
        if (!this._icon) {
            return;
        }

        if (isProcessing) {
            const transition = new Clutter.PropertyTransition({property_name: 'opacity'});
            transition.set_from(255);
            transition.set_to(100);
            transition.set_duration(200);
            transition.set_repeat_count(-1);
            transition.set_auto_reverse(true);
            transition.set_progress_mode(Clutter.AnimationMode.EASE_IN_OUT);
            this._icon.add_transition('processing', transition);
        } else {
            this._icon.remove_transition('processing');
            this._icon.opacity = 255;
        }
    }

    setStatus(state, statusText, detailText = '') {
        if (this._icon) {
            const newGicon = Gio.icon_new_for_string(`${this._extension.path}/icons/${state}.svg`);
            this._icon.set_gicon(newGicon);
        }
        if (this._statusLabel) {
            this._statusLabel.set_text(statusText);
        }
        if (this._detailLabel) {
            this._detailLabel.set_text(detailText);
            this._detailLabel.visible = detailText.length > 0;
        }
    }

    destroy() {
        this.setProcessing(false);
        if (this._icon) {
            this._icon.destroy();
            this._icon = null;
        }
        if (this._statusLabel) {
            this._statusLabel.destroy();
            this._statusLabel = null;
        }
        if (this._detailLabel) {
            this._detailLabel.destroy();
            this._detailLabel = null;
        }
        this._extension = null;
        super.destroy();
    }
});
