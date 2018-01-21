import {createRouter} from './router';
import {createStore} from "./store";
import {createApp} from "./app";

function promiseApp(context) {
    // поскольку могут быть асинхронные хуки маршрута или компоненты,
    // мы будем возвращать Promise, чтобы сервер смог дожидаться
    // пока всё не будет готово к рендерингу.
    return new Promise((resolve, reject) => {
        const router = createRouter();
        const store = createStore();
        const app = createApp({router, store});

        // устанавливаем маршрут для маршрутизатора серверной части
        router.push(context.url);

        // ожидаем, пока маршрутизатор разрешит возможные асинхронные компоненты и хуки
        router.onReady(() => {
            const matchedComponents = router.getMatchedComponents();
            // Если нет подходящих маршрутов...
            if (!matchedComponents.length) {
                return reject({code: 404})
            }

            Promise.all(matchedComponents.map(Component => {
                if(Component.asyncData) {
                    return Component.asyncData({
                        store,
                        route: router.currentRoute,
                        resources: context.resources
                    });
                }
            }))
                .then(()=>{
                    // После разрешения всех preFetch хуков, наше хранилище теперь
                    // заполнено состоянием, необходимым для рендеринга приложения.
                    // Когда мы присоединяем состояние к контексту, и есть опция `template`
                    // используемая для рендерера, состояние будет автоматически
                    // сериализовано и внедрено в HTML как `window.__INITIAL_STATE__`.
                    // context.state = store.state;
                    resolve({app, state: store.state});
                });
        }, reject);
    });
}

export {
    promiseApp
};