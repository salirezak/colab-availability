import GObject from 'gi://GObject';
import Soup from 'gi://Soup?version=3.0';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';



export const ColabNetwork = GObject.registerClass({
    GTypeName: 'ColabAvailabilityNetwork',
    Signals: {
        'internet-online': {},
        'internet-offline': {},
        'check-result': { param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING, GObject.TYPE_STRING] }
    }
}, class ColabNetwork extends GObject.Object {
    _init() {
        super._init();
        this._httpSession = new Soup.Session({timeout: 10});
        this._checkCancellable = null;
        this._requestId = 0;

        this._networkMonitor = Gio.NetworkMonitor.get_default();
        this._networkSignalId = this._networkMonitor.connect('network-changed', (_, isOnline) => {
            if (!isOnline) this.cancelCheck();
            this.emit(isOnline ? 'internet-online' : 'internet-offline');
        });
    }

    _emitResult(state, statusText, detailText) {
        this.emit('check-result', state, statusText, detailText);
    }

    get isInternetAvailable() {
        return this._networkMonitor.get_network_available();
    }

    cancelCheck() {
        this._requestId++;
        if (this._checkCancellable) {
            this._checkCancellable.cancel();
            this._checkCancellable = null;
        }
    }

    async checkAvailability(force = false) {
        if (this._checkCancellable && !force) {
            return;
        }
        if (this._checkCancellable && force) {
            this.cancelCheck();
        }

        const requestId = ++this._requestId;
        this._checkCancellable = new Gio.Cancellable();

        let state;
        let statusText;
        let detailText = '';

        try {
            const message = Soup.Message.new('GET', 'https://colab.research.google.com/');
            await this._httpSession.send_and_read_async(message, GLib.PRIORITY_DEFAULT, this._checkCancellable);
            const statusCode = message.get_status();

            if (statusCode === 200) {
                [state, statusText] = ['success', 'Available'];
            } else if (statusCode === 403) {
                [state, statusText] = ['failure', 'Unavailable'];
            } else {
                [state, statusText, detailText] = ['failure', `HTTP ${statusCode}`, Soup.Status.get_phrase(statusCode)];
            }
        } catch (e) {
            if (requestId !== this._requestId) {
                return;
            } else if (e.matches?.(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)) {
                return;
            } else if (e.matches?.(Gio.IOErrorEnum, Gio.IOErrorEnum.TIMED_OUT)) {
                [state, statusText] = ['failure', 'Timeout'];
            } else if (e.domain === Gio.ResolverError.quark() || e.matches?.(Gio.IOErrorEnum, Gio.IOErrorEnum.HOST_NOT_FOUND)) {
                [state, statusText, detailText] = ['failure', 'DNS error', e.message];
            } else if (e.domain === Gio.TlsError.quark()) {
                [state, statusText, detailText] = ['failure', 'TLS/certificate error', e.message];
            } else if (e.matches?.(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_CONNECTED) || e.matches?.(Gio.IOErrorEnum, Gio.IOErrorEnum.NETWORK_UNREACHABLE) || e.matches?.(Gio.IOErrorEnum, Gio.IOErrorEnum.HOST_UNREACHABLE)) {
                [state, statusText, detailText] = ['failure', 'No internet', e.message];
            } else {
                [state, statusText, detailText] = ['failure', 'Error', e.message];
            }
        } finally {
            if (requestId === this._requestId) {
                this._checkCancellable = null;
                this._emitResult(state, statusText, detailText);
            }
        }
    }

    destroy() {
        if (this._networkSignalId) {
            this._networkMonitor.disconnect(this._networkSignalId);
            this._networkSignalId = 0;
        }
        this._networkMonitor = null;

        this.cancelCheck();

        if (this._httpSession) {
            this._httpSession.abort();
            this._httpSession = null;
        }
    }
});
