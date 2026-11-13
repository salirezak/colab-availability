import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';



export default class ColabAvailabilityPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({title: 'General', icon_name: 'preferences-system-symbolic'});
        const monitoringGroup = new Adw.PreferencesGroup({title: 'Monitoring', description: 'Configure availability check settings.'});
        const resetGroup = new Adw.PreferencesGroup({title: 'Reset Settings'});

        page.add(monitoringGroup);
        page.add(resetGroup);
        window.add(page);

        // Monitoring Settings
        const intervalRow = this._createSpinRow(settings, 'check-interval', 'Check interval', 'Time between automatic status checks, in seconds.', 1, 3600);
        monitoringGroup.add(intervalRow);
        // Reset Settings
        const resetRow = this._createResetRow(settings, ['check-interval']);
        resetGroup.add(resetRow);
    }

    _createSpinRow(settings, key, title, subtitle, min, max) {
        const adjustment = new Gtk.Adjustment({lower: min, upper: max, step_increment: 1, page_increment: 10});
        const row = new Adw.SpinRow({title: title, subtitle: subtitle, adjustment: adjustment});
        settings.bind(key, row, 'value', Gio.SettingsBindFlags.DEFAULT);
        return row;
    }

    _createResetRow(settings, keys) {
        const row = new Adw.ActionRow({title: 'Reset All Settings', subtitle: 'Restore all settings to their default values.'});
        const button = new Gtk.Button({label: 'Reset', valign: Gtk.Align.CENTER});
        row.add_suffix(button);
        row.set_activatable_widget(button);
        button.connect('clicked', () => keys.forEach(key => settings.reset(key)));
        return row;
    }
}