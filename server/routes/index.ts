import Animations, { animationExists } from '../animations';
import controller from '../controller';

const Status = (status: number) => new Response(null, { status });

Bun.serve({
    port: 80,
    routes: {
        '/': () => new Response(Bun.file('routes/dist/index.html')),
        '/assets/:file': req =>
            new Response(Bun.file('routes/dist/assets/' + req.params.file)),

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

        '/api/animations': () => Response.json(Object.keys(Animations)),
        '/api/startAnimation/:name': req => {
            const name = req.params.name;
            if (!animationExists(name)) return Status(400);
            controller.startAnimation(name);
            return Status(200);
        },
    },
});
