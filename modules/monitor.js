import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';


export default class Monitor {
    constructor(extension) {
        this._extension = extension;
        this._settings = null;
        this._indicator = null;

        this._checkCancellable = null;
        this._isChecking = false;
        this._requestId = 0;
    }

    enable(settings, indicator) {
        this._settings = settings;
        this._indicator = indicator;
    }

    disable() {
        this._settings = null;
        this._indicator = null;

        this._checkCancellable?.cancel();
        this._checkCancellable = null;
        this._isChecking = false;
        this._requestId++;
    }

    async checkAvailability(force=false) {
        if (this._isChecking && !force)
            return;
        if (force)
            this._checkCancellable?.cancel();

        const requestId = ++this._requestId;
        const cancellable = new Gio.Cancellable();
        this._checkCancellable = cancellable;
        this._isChecking = true;

        try {
            this._indicator.setStatus('Checking', null);
            if (!Gio.NetworkMonitor.get_default().get_network_available()) {
                this._indicator.setStatus('No internet', this._indicator.errorIcon);
                return;
            }
            await this._requestAvailability(cancellable, requestId);
        } catch (err) {
            if (requestId !== this._requestId)
                return;
            console.error('[Colab availability][ERROR]:', err);
        } finally {
            if (requestId === this._requestId) {
                this._isChecking = false;
                this._checkCancellable = null;
            }
        }
    }

    async _requestAvailability(cancellable, requestId) {
        let code = null;
        let error = null;

        const session = new Soup.Session({timeout: this._settings.getInt('request-timeout')});
        const message = Soup.Message.new('GET', 'https://colab.research.google.com/');
        try {
            await session.send_and_read_async(message, GLib.PRIORITY_DEFAULT, cancellable);
            code = message.get_status();
        } catch (err) {
            error = err;
        } finally {
            session.abort();
        }

        if (requestId !== this._requestId)
            return;
        this._updateStatus(code, error);
    }

    _updateStatus(code=null, error=null) {
        let text = 'Unknown';
        let icon = null;

        if (code !== null) {
            if (code === 200) {
                text = 'Available';
                icon = this._indicator.validIcon;
            } else {
                text = `HTTP ${code}`;
                icon = this._indicator.errorIcon;
            }
        } else if (error !== null) {
            icon = this._indicator.errorIcon;
            if (error.matches?.(Gio.IOErrorEnum, Gio.IOErrorEnum.TIMED_OUT)) {
                text = 'Timeout';
            } else if (error.matches?.(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_CONNECTED)) {
                text = 'No internet';
            } else if (error.matches?.(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                return;
            } else {
                text = 'Error';
            }
        }
        this._indicator.setStatus(text, icon);
    }
}