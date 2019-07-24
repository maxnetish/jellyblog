import App from './admin-vue-app.vue';
import OptionsPage from './pages/options/options.vue';
import PostsPage from './pages/posts/posts.vue';
import PostPage from './pages/post/post.vue';
import FilesPage from './pages/files/files.vue';
import Log from './pages/log/log.vue';
import Vue from 'vue';
import VueRouter from "vue-router";

const routes = [
        {
            path: '/',
            component: App,
            children: [
                {
                    path: '',
                    name: 'root_entry',
                    redirect: {
                        name: 'options'
                    }
                },
                {
                    path: 'options',
                    name: 'options',
                    component: OptionsPage
                },
                {
                    path: 'posts',
                    name: 'posts',
                    component: PostsPage
                },
                {
                    path: 'post-details.ts',
                    name: 'post-details.ts',
                    component: PostPage
                },
                {
                    path: 'files',
                    name: 'files',
                    component: FilesPage
                },
                {
                    path: 'log',
                    name: 'log',
                    component: Log
                }
            ]
        }
    ];

Vue.use(VueRouter);

function createRouter() {
    const router = new VueRouter({routes});
    return router;
}

export {
    createRouter
};
