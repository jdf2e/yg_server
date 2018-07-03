const Router = require('koa-router');
const baseRouter = new Router();
const apiRouter = require('./api');
const shelljs = require("shelljs");
const path = require("path");
const config = require('../util/config');
const util = require('../util/util');

baseRouter.use("/api", apiRouter.interrupter);
baseRouter.use("/api", apiRouter.routes(), apiRouter.allowedMethods());


baseRouter.get('/download', async function (ctx, next) {
    await util.tarFolder(ctx.request.query.puuid);
    ctx.response.redirect("/" + ctx.request.query.puuid + ".tgz");
});

module.exports = baseRouter;