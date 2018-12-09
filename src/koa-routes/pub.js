import Router from 'koa-router';
import app from "../server-old";

const router = new Router();

router.get('/robots.txt', ctx => {


    req.backendResources.option.robotsGet()
        .then(robotsTxt => {
            if (robotsTxt && robotsTxt.content && robotsTxt.allowRobots) {
                res.type('text/plain');
                res.send(Buffer.from(robotsTxt.content));
            } else {
                res.status(404).end();
            }
        })
        .then(null, err => {
            res.status(404).end();
        });
});

export default router;