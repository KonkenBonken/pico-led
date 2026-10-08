import { animationExists } from '../animations';
import getController from '../controller';
import { once } from 'events';

const Status = (status: number) => new Response(null, { status });

Bun.serve({
    port: 4000,
    idleTimeout: 0,
    routes: {
        '/': () => new Response(Bun.file('routes/dist/index.html')),
        '/assets/:file': req =>
            new Response(Bun.file('routes/dist/assets/' + req.params.file)),

        '/api/:strip/turnOff': (req) => {
            getController(req).turnOff();
            return Status(200);
        },

        '/api/:strip/status': (req) => Response.json(getController(req)),

        '/api/:strip/brightness/:value': req => {
            const value = +req.params.value;
            if (!Number.isInteger(value) || value < 0 || value >= 256)
                return Status(400);
            getController(req).brightness.value = value;
            return Status(200);
        },

        '/api/:strip/speed/:value': req => {
            const value = +req.params.value;
            if (!Number.isInteger(value) || value < 0 || value >= 256)
                return Status(400);
            getController(req).speed = value;
            return Status(200);
        },

        '/api/:strip/solidColor/:value': req => {
            const value = parseInt(req.params.value, 16);
            if (!Number.isInteger(value) || value < 0 || value >= 2 ** 32)
                return Status(400);
            getController(req).solidColor(value);
            return Status(200);
        },

        '/api/:strip/startFade/:value': req => {
            const value = parseInt(req.params.value);
            if (!Number.isInteger(value) || value < 0) return Status(400);
            getController(req).startFade(value);
            return Status(200);
        },

        '/api/:strip/wake/:value': req => {
            const value = parseInt(req.params.value);
            const date = new Date(value);
            const duration = 30 * 60e3;
            if (isNaN(+date)) return Status(400);
            const controller = getController(req);
            controller.fadeDuration = -duration;
            controller.fadeStart = +date;
            if (value === 0) controller.fadeDuration = Infinity;

            return Status(200);
        },

        '/api/:strip/startAnimation/:name': req => {
            const name = req.params.name;
            if (!animationExists(name)) return Status(400);
            getController(req).startAnimation(name);
            return Status(200);
        },

        '/api/:strip/frameStream': (req) =>
            new Response(
                (async function* () {
                    const controller = getController(req);
                    while (true) {
                        yield (await once(controller, 'frame'))[0];
                        await Bun.sleep(1000 / 30);
                    }
                })()
            ),
    },
});
