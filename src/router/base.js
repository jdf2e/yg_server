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
    let puuid = ctx.request.query.puuid;
    let downloadFolder = ctx.request.query.folder;
    if (!puuid) {
        ctx.body = {
            err: "puuid not found"
        }
        await next();
        return;
    }
    await util.tarFolder(puuid, downloadFolder);
    ctx.response.redirect("/" + ctx.request.query.puuid + ".tgz");
});

baseRouter.get('/savetpl', async function (ctx, next) {
    ctx.set('Content-Type', 'application/json');
    console.log(ctx.request.query);
    const {puuid, tplname} = ctx.request.query;
    let result = await util.saveTemplate(puuid, tplname);
    ctx.body = {
        code: result
    };
})

module.exports = baseRouter;
