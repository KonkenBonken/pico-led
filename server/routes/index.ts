import { animationExists } from '../animations';
import controller from '../controller';
import { Frame } from '../Frame';
import { once } from 'events';

const Status = (status: number) => new Response(null, { status });

Bun.serve({
    port: 80,
    idleTimeout: 0,
    routes: {
        '/': () => new Response(Bun.file('routes/dist/index.html')),
        '/assets/:file': req =>
            new Response(Bun.file('routes/dist/assets/' + req.params.file)),

        '/api/turnOff': () => {
            controller.turnOff();
            return Status(200);
        },

        '/api/status': () => Response.json(controller),

        '/api/brightness/:value': req => {
            const value = +req.params.value;
            if (!Number.isInteger(value) || value < 0 || value >= 256)
                return Status(400);
            controller.brightness = value;
            return Status(200);
        },

        '/api/speed/:value': req => {
            const value = +req.params.value;
            if (!Number.isInteger(value) || value < 0 || value >= 256)
                return Status(400);
            controller.speed = value;
            return Status(200);
        },

        '/api/solidColor/:value': req => {
            const value = parseInt(req.params.value, 16);
            if (!Number.isInteger(value) || value < 0 || value >= 2 ** 24)
                return Status(400);
            controller.solidColor(value);
            return Status(200);
        },

        '/api/startFade/:value': req => {
            const value = parseInt(req.params.value);
            if (!Number.isInteger(value) || value < 0) return Status(400);
            controller.fadeDuration = value;
            controller.fadeStart = Date.now();
            if (value === 0) controller.fadeDuration = Infinity;

            return Status(200);
        },

        '/api/startAnimation/:name': req => {
            const name = req.params.name;
            if (!animationExists(name)) return Status(400);
            controller.startAnimation(name);
            return Status(200);
        },

        '/api/framebuffer': {
            POST: async req => {
                const buffer = Frame.fromBuffer(await req.arrayBuffer());
                console.log(buffer);
                if (buffer.length !== controller.FRAME_SIZE) return Status(400);
                controller.frameGenerator = (function* () {
                    while (true) yield buffer;
                })();
                controller.beginLoop();
            },
        },

        '/api/frameStream': () =>
            new Response(
                (async function* () {
                    while (true) yield (await once(controller, 'frame'))[0];
                })()
            ),
    },
});
