import controller from "../controller";

const Status = (status: number) => new Response(null, { status });

Bun.serve({
    port: 80,
    routes: {
        "/brighness/:value": req => {
            const value = +req.params.value;
            if (!Number.isInteger(value) || value < 0 || value >= 256)
                return Status(400);
            controller.brightness = value;
            return Status(200);
        }
    }
});