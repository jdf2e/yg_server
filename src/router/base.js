const Router = require('koa-router');
const baseRouter = new Router();
const apiRouter = require('./api');

baseRouter.use("/api", apiRouter.interrupter);
baseRouter.use("/api", apiRouter.routes(), apiRouter.allowedMethods());

module.exports = baseRouter;