const Router = require('koa-router');
const path = require("path");
const wrapperJDF = require("./wrapper.jdf");
const wrapperNPM = require("./wrapper.npm");
const config = require('../util/config');
const util = require('../util/util');
const shelljs = require("shelljs");
const kill = require('tree-kill');
const apiRouter = new Router();

apiRouter.interrupter = async function (ctx, next) {
    ctx.set('Content-Type', 'application/json');
    let info = {
        id: ctx.request.body.id,
        platform: ctx.request.body.platform || "jdf",
        cmd: ctx.request.body.cmd || "output",
        projectPath: path.join(config.YG_BASE_PATH, ctx.request.body.id),
        file: ctx.request.files.file ? ctx.request.files.file.path : null,
    }
    if (!info.id) {
        ctx.body = {
            err: "id not found"
        }
        return;
    } else {
        ctx.info = info;
        ctx.body = {
            id: info.id,
            platform: info.platform,
            error: false,
        };
        await next();
    }
}

//{ id: 'xxx-xxx-xxx', platform: 'jdf', cmd: 'output', file: null }
apiRouter.post('/upload', async function (ctx, next) {
    shelljs.mkdir("-p", ctx.info.projectPath);
    await util.unZipTo(ctx.info.file, ctx.info.projectPath);
    shelljs.rm(ctx.info.file);
    await next();
});




apiRouter.post('/compile', async function (ctx, next) {
    let stdout;
    let stderror;
    switch (ctx.info.platform) {
        case "jdf":
            if (ctx.info.cmd == "output") {
                try {
                    stdout = await wrapperJDF.output(ctx.info.projectPath);
                    console.log(stdout);
                } catch (ex) {
                    console.error("error", ex);
                    ctx.body.error = true;
                    stderror = ex;
                }
            }

            if (ctx.info.cmd == "build") {
                try {
                    util.currentUsedPort++;
                    util.currentUsedPort = util.currentUsedPort % 20000 + 40000;
                    let remain = util.cpPool[ctx.info.id];
                    if (remain) {
                        kill(remain.cphandle.pid)
                        util.cpPool[ctx.info.id] = undefined;
                    }
                    stdout = [];
                    let cphandle = await wrapperJDF.build(ctx.info.projectPath, util.currentUsedPort);
                    util.cpPool[ctx.info.id] = {
                        cphandle,
                        port: util.currentUsedPort,
                    };
                    stdout = cphandle.stdoutString;
                    ctx.body.port = util.currentUsedPort;
                } catch (ex) {
                    console.error("error", ex);
                    ctx.body.error = true;
                    stderror = ex;
                }
            }
            break;
    }
    ctx.body.stdout = stdout;
    ctx.body.stderror = stderror;
    await next();
})

apiRouter.post('/custom', async function (ctx, next) {
    let stdout;
    let stderror;
    try {
        stdout = await wrapperNPM.custom(ctx.info.projectPath, ctx.info.cmd);
        console.log(stdout);
    } catch (ex) {
        console.error("error", ex);
        ctx.body.error = true;
        stderror = ex;
    }
    ctx.body.stdout = stdout;
    ctx.body.stderror = stderror;
    await next();
});

module.exports = apiRouter;