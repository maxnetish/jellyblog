import {createApp} from "./app";

function promiseApp(context) {
    // поскольку могут быть асинхронные хуки маршрута или компоненты,
    // мы будем возвращать Promise, чтобы сервер смог дожидаться
    // пока всё не будет готово к рендерингу.

    return createApp({resources: context.resources, language: context.language})
        .then(({app, router, store}) => {
            // устанавливаем маршрут для маршрутизатора серверной части
            router.push(context.url);
            // ожидаем, пока маршрутизатор разрешит возможные асинхронные компоненты и хуки
            return new Promise((resolve, reject) => {
                router.onReady(() => {
                    const matchedComponents = router.getMatchedComponents();
                    // Если нет подходящих маршрутов...
                    if (!matchedComponents.length) {
                        return reject({code: 404})
                    }

                    // Now wait when all asyncData calls resolves
                    Promise.all(matchedComponents.map(Component => {
                        if (Component.asyncData) {
                            return Component.asyncData({
                                store,
                                route: router.currentRoute,
                                resources: context.resources
                            });
                        }
                    }))
                    // Now store has been filled, app ready to sync server rendering
                        .then(() => resolve({app, store}, reject));
                })
            });
        })
        .then(({app, store}) => {
            return {app, state: store.state};
        });
}

export {
    promiseApp
};