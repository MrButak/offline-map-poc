import { copyToClipboard, Notify, QNotifyOptions } from 'quasar';

export function isPWA(): boolean {
	return (
		!!window.matchMedia('(display-mode: standalone)').matches
	);
}

export function refreshApp() {
    window.location.reload();
};