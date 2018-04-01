import {Post} from '../../models';
import pubSettings from '../../../config/pub-settings.json';
import {createSitemap} from 'sitemap';

function fetch() {
    let self = this;

    const conditions = {
        status: 'PUB',
        allowRead: 'FOR_ALL'
    };
    const projection = {
        updateDate: true,
        hru: true
    };
    const sitemapOpts = {
        hostname: pubSettings.hostname,
        cacheTime: 600000, // непонтяно зачем это
        urls: [{
            url: '/',
            changefreq: 'weekly'
        }]
    };

    return Post.find(conditions, projection)
        .cursor()
        .eachAsync(doc => {
            sitemapOpts.urls.push({
                url: doc.url,
                changefreq: 'monthly',
                lastmodISO: doc.updateDate.toISOString()
            });
        })
        .then(res => {
            let sitemap = createSitemap(sitemapOpts);
            return new Promise((resolve, reject)=>{
                sitemap.toXML((err, xml)=>{
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve({content: xml});
                });
            });
        });
}


export default fetch;