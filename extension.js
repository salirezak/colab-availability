import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { SettingsManager } from './lib/settings.js';
import { ColabIndicator } from './lib/indicator.js';
import { ColabNetwork } from './lib/network.js';
import { ColabScheduler } from './lib/scheduler.js';



export default class ColabAvailabilityExtension extends Extension {
    enable() {
        this._settingsManager = new SettingsManager(this);
        this._indicator = new ColabIndicator(this);
        this._network = new ColabNetwork();
        this._scheduler = new ColabScheduler();

        Main.panel.addToStatusArea(this.uuid, this._indicator, 1, 'left');

        this._signalIds = [
            [
                this._settingsManager,
                this._settingsManager.connect('interval-changed', () => this._performCheck(false))
            ], [
                this._indicator,
                this._indicator.connect('check-clicked', () => this._performCheck(true))
            ], [
                this._network,
                this._network.connect('check-result', (_, state, statusText, detailText) => this._onCheckResult(state, statusText, detailText))
            ], [
                this._network,
                this._network.connect('internet-online', () => this._performCheck(true))
            ], [
                this._network,
                this._network.connect('internet-offline', () => this._onNoInternet())
            ], [
                this._scheduler,
                this._scheduler.connect('check-required', () => this._performCheck(false))
            ]
        ];

        this._performCheck(false);
    }

    _performCheck(force = false) {
        if (this._scheduler) {
            this._scheduler.stop();
        }
        if (!this._indicator || !this._network) {
            return;
        }
        if (!this._network.isInternetAvailable) {
            this._onNoInternet();
            return;
        }
        this._indicator.setProcessing(true);
        this._network.checkAvailability(force);
    }

    _onCheckResult(state, statusText, detailText) {
        if (this._scheduler && this._network.isInternetAvailable) {
            this._scheduler.start(this._settingsManager.getCheckInterval());
        }
        if (this._indicator) {
            this._indicator.setProcessing(false);
            this._indicator.setStatus(state, statusText, detailText);
        }

    }

    _onNoInternet() {
        if (this._scheduler) {
            this._scheduler.stop();
        }
        if (this._indicator) {
            this._indicator.setProcessing(false);
            this._indicator.setStatus('pending', 'No Internet', '');
        }

    }

    disable() {
        this._signalIds.forEach(([object, id]) => { if (object.is_connected(id)) object.disconnect(id) });
        this._signalIds = [];

        if (this._scheduler) {
            this._scheduler.destroy();
            this._scheduler = null;
        }
        if (this._network) {
            this._network.destroy();
            this._network = null;
        }
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        if (this._settingsManager) {
            this._settingsManager.destroy();
            this._settingsManager = null;
        }
    }
}