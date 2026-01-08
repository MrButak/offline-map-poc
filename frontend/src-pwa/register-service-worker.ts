import { Notify, QNotifyOptions } from 'quasar'
import { register } from 'register-service-worker';
import { refreshApp } from 'src/scripts/utils';

// register docs: https://github.com/yyx990803/register-service-worker
register(process.env.SERVICE_WORKER_FILE, {
    // The registrationOptions object will be passed as the second argument
    // to ServiceWorkerContainer.register()
    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

    // The ready(), registered(), cached(), updatefound() and updated()
    // events passes a ServiceWorkerRegistration instance in their arguments.
    // ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

    // registrationOptions: { scope: './' },

    ready(/* registration */) {
        console.log('Service worker is active.....')
        // Log storage quota estimate. Why here? I have no idea.
        try {
            navigator.storage.estimate().then((estimate) => {
                console.log(
                    // @ts-ignore
                    `You're currently using about ${(estimate.usage / estimate.quota) * 100}% of your estimated storage quota (${(estimate.quota / 1024 / 1024).toFixed(2)}MB)`
                )
            });

        } catch (err) {
            console.error(`Error attempting to log storage quota estimate:`, err);
        }

    },

    registered(/* registration */) {
        console.log('Service worker has been registered.')
    },

    cached(/* registration */) {
        console.log('Content has been cached for offline use.')
    },

    updated(/* registration */) {
        console.log('App update ready.')

        Notify.create({
            message: 'New version available',
            caption: 'Refresh to update',
            color: 'primary',
            position: 'top',
            timeout: 10000,
            progress: true,
            progressClass: 'pwa-pbar',
            actions: [
                {
                    icon: 'refresh',
                    'aria-label': 'Refresh',
                    color: 'white',
                    handler: () => {
                        refreshApp()
                    }
                }
            ]
        } as QNotifyOptions);
    },

    offline() {
        Notify.create({
            color: 'negative',
            position: 'top',
            message: 'Lost connction...',
            icon: 'announcement',
        })
        console.log('No internet connection found. Can not install.')
    },
    error(err) {
        console.error(`Error during service worker registration: ${err}`)
        Notify.create({
            color: 'warning',
            position: 'top',
            message: 'Error during app initialisation.',
            icon: 'report_problem',
        })
    },
});
