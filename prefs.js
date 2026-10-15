import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {
    ExtensionPreferences,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ColabAvailabilityPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        // Appearance
        const appearanceGroup = new Adw.PreferencesGroup({
            title: 'Appearance',
            description: "Customize the indicator's appearance.",
        });

        // Panel position
        const positionGroup = new Adw.PreferencesGroup({
            title: 'Panel Position',
            description: 'Choose where the indicator appears in the top bar.',
        });

        // Monitoring
        const monitoringGroup = new Adw.PreferencesGroup({
            title: 'Monitoring',
            description: 'Configure availability check settings.',
        });

        // Reset settings
        const resetGroup = new Adw.PreferencesGroup({
            title: 'Reset Settings',
        });

        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'preferences-system-symbolic',
        });

        // Mouse actions
        const mouseGroup = new Adw.PreferencesGroup({
            title: 'Mouse actions',
            description: 'Use these clicks on the Colab indicator in the top bar.',
        });

        const mouseLabel = new Gtk.Label({
            label:
                '• <b>Left click:</b> Check Colab availability.\n' +
                '• <b>Middle click:</b> Open Google Colab in your default browser.\n' +
                '• <b>Right click:</b> Open these preferences.',
            use_markup: true, xalign: 0, wrap: true, margin_top: 0,
        });
        mouseLabel.add_css_class('dim-label');
        mouseGroup.add(mouseLabel);

        // Display mode
        const displayOptions = ['icon-only', 'text-only', 'both'];
        const displayLabels = ['Icon only', 'Text only', 'Both'];

        const displayModel = new Gtk.StringList();

        for (const label of displayLabels)
            displayModel.append(label);

        const displayRow = new Adw.ComboRow({
            title: 'Display mode',
            subtitle: 'Show the icon, status text, or both.',
            model: displayModel,
        });

        const displayIndex = displayOptions.indexOf(
            settings.get_string('display-mode')
        );

        displayRow.selected = Math.max(0, displayIndex);

        displayRow.connect('notify::selected', () => {
            const selected = displayRow.selected;

            if (selected >= 0 && selected < displayOptions.length) {
                settings.set_string(
                    'display-mode',
                    displayOptions[selected]
                );
            }
        });

        // Icon size
        const iconSizeRow = new Adw.ActionRow({
            title: 'Icon size',
            subtitle: 'Size of the indicator icon, in pixels.',
        });

        const iconSizeScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 48,
                step_increment: 1,
                page_increment: 1,
                value: settings.get_int('icon-size'),
            }),
            draw_value: true,
            digits: 0,
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true,
        });

        iconSizeScale.set_size_request(180, -1);
        iconSizeScale.add_mark(24, Gtk.PositionType.BOTTOM, null);

        iconSizeRow.add_suffix(iconSizeScale);
        iconSizeRow.activatable_widget = iconSizeScale;

        iconSizeScale.connect('value-changed', () => {
            settings.set_int(
                'icon-size',
                Math.round(iconSizeScale.get_value())
            );
        });

        // Font size
        const fontSizeRow = new Adw.ActionRow({
            title: 'Font size',
            subtitle: 'Size of the status text, in pixels.',
        });

        const fontSizeScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 24,
                step_increment: 1,
                page_increment: 1,
                value: settings.get_int('font-size'),
            }),
            draw_value: true,
            digits: 0,
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true,
        });

        fontSizeScale.set_size_request(180, -1);
        fontSizeScale.add_mark(14, Gtk.PositionType.BOTTOM, null);

        fontSizeRow.add_suffix(fontSizeScale);
        fontSizeRow.activatable_widget = fontSizeScale;

        fontSizeScale.connect('value-changed', () => {
            settings.set_int(
                'font-size',
                Math.round(fontSizeScale.get_value())
            );
        });

        // Update sensitivity based on display mode
        const updateSizeSensitivity = () => {
            const mode = settings.get_string('display-mode');

            iconSizeRow.sensitive = mode !== 'text-only';
            fontSizeRow.sensitive = mode !== 'icon-only';
        };

        updateSizeSensitivity();

        const displayModeChangedId = settings.connect(
            'changed::display-mode',
            updateSizeSensitivity
        );

        window.connect('close-request', () => {
            settings.disconnect(displayModeChangedId);
            return false;
        });

        // Panel section
        const boxOptions = ['left', 'center', 'right'];
        const boxLabels = ['Left', 'Center', 'Right'];

        const boxModel = new Gtk.StringList();

        for (const label of boxLabels)
            boxModel.append(label);

        const boxRow = new Adw.ComboRow({
            title: 'Panel section',
            subtitle: 'Choose the left, center, or right section.',
            model: boxModel,
        });

        const boxIndex = boxOptions.indexOf(
            settings.get_string('panel-box')
        );

        boxRow.selected = Math.max(0, boxIndex);

        boxRow.connect('notify::selected', () => {
            const selected = boxRow.selected;

            if (selected >= 0 && selected < boxOptions.length) {
                settings.set_string(
                    'panel-box',
                    boxOptions[selected]
                );
            }
        });

        // Position
        const positionRow = new Adw.SpinRow({
            title: 'Position',
            subtitle: 'Order within the selected panel section.',
            adjustment: new Gtk.Adjustment({
                lower: -20,
                upper: 20,
                step_increment: 1,
                page_increment: 5,
            }),
        });

        positionRow.set_value(settings.get_int('position'));

        positionRow.connect('notify::value', () => {
            settings.set_int(
                'position',
                Math.round(positionRow.get_value())
            );
        });

        // Check interval
        const intervalRow = new Adw.SpinRow({
            title: 'Check interval',
            subtitle: 'Time between availability checks, in seconds.',
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 3600,
                step_increment: 1,
                page_increment: 10,
            }),
        });

        intervalRow.set_value(settings.get_int('check-interval'));

        intervalRow.connect('notify::value', () => {
            settings.set_int(
                'check-interval',
                Math.round(intervalRow.get_value())
            );
        });

        // Request timeout
        const timeoutRow = new Adw.SpinRow({
            title: 'Request timeout',
            subtitle: 'Maximum time to wait for a response, in seconds.',
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 120,
                step_increment: 1,
                page_increment: 5,
            }),
        });

        timeoutRow.set_value(settings.get_int('request-timeout'));

        timeoutRow.connect('notify::value', () => {
            settings.set_int(
                'request-timeout',
                Math.round(timeoutRow.get_value())
            );
        });

        // Reset settings
        const resetRow = new Adw.ActionRow({
            title: 'Restore defaults',
            subtitle: 'Restore all extension settings to their defaults.',
        });

        const resetButton = new Gtk.Button({
            label: 'Reset',
            valign: Gtk.Align.CENTER,
        });

        resetRow.add_suffix(resetButton);
        resetRow.activatable_widget = resetButton;

        resetButton.connect('clicked', () => {
            for (const key of settings.settings_schema.list_keys())
                settings.reset(key);

            displayRow.selected = Math.max(
                0,
                displayOptions.indexOf(
                    settings.get_string('display-mode')
                )
            );

            iconSizeScale.set_value(settings.get_int('icon-size'));
            fontSizeScale.set_value(settings.get_int('font-size'));

            boxRow.selected = Math.max(
                0,
                boxOptions.indexOf(
                    settings.get_string('panel-box')
                )
            );

            positionRow.set_value(settings.get_int('position'));
            intervalRow.set_value(settings.get_int('check-interval'));
            timeoutRow.set_value(settings.get_int('request-timeout'));
        });

        // Assemble groups
        appearanceGroup.add(displayRow);
        appearanceGroup.add(iconSizeRow);
        appearanceGroup.add(fontSizeRow);

        positionGroup.add(boxRow);
        positionGroup.add(positionRow);

        monitoringGroup.add(intervalRow);
        monitoringGroup.add(timeoutRow);

        resetGroup.add(resetRow);

        // Assemble page
        page.add(mouseGroup);
        page.add(appearanceGroup);
        page.add(positionGroup);
        page.add(monitoringGroup);
        page.add(resetGroup);

        window.add(page);
    }
}
