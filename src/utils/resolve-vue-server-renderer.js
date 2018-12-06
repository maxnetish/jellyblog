import memoize from 'lodash/memoize';
import fs from 'fs';
import {createRenderer as createVueServerRenderer} from "vue-server-renderer"
import hashOf from 'object-hash';

const promiseMemoizedVueServerRenderer = memoize(promiseVueServerRenderer, memoizeResolveFunc);

function memoizeResolveFunc({rendererOptions, templateFileName}) {
    return hashOf({rendererOptions, templateFileName})
}

function promiseVueServerRenderer({rendererOptions, templateFileName}) {
    return new Promise((resolve, reject) => {
        fs.readFile(templateFileName, (err, templateBuffer) => {
            if(err){
                reject(err);
                return;
            }
            resolve(templateBuffer.toString());
        })
    })
        .then(template => {
            const actualOptions = Object.assign({
                runInNewContext: 'once',
                inject: false
            }, rendererOptions, {
                template
            });
            return createVueServerRenderer(actualOptions);
        });
}

export default promiseMemoizedVueServerRenderer;
