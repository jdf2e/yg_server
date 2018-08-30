const Router = require('koa-router');
const path = require("path");
const wrapperJDF = require("./wrapper.jdf");
const wrapperNPM = require("./wrapper.npm");
const config = require('../util/config');
const util = require('../util/util');
const shelljs = require("shelljs");
const fs = require("fs");
const kill = require('tree-kill');
const apiRouter = new Router();

apiRouter.interrupter = async function (ctx, next) {
    ctx.set('Content-Type', 'application/json');
    let info = {
        puuid: ctx.request.body.puuid,
        projectPath: path.join(config.YG_BASE_PATH, ctx.request.body.puuid),
        file: ctx.request.files.file ? ctx.request.files.file.path : null,
    }
    if (!info.puuid) {
        ctx.body = {
            err: "puuid not found"
        }
        return;
    } else {
        ctx.info = info;
        ctx.body = {
            puuid: info.puuid,
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
    // 注入scripts begin
    // TODO 除了prerun.sh,还要在install，uninstall等npm命令
    // Place an executable file at node_modules/.hooks/{eventname} may use this
    console.log('注入scripts')
    const scriptspath = path.join(ctx.info.projectPath, 'scripts')
    console.log(ctx.info.projectPath)
    shelljs.mkdir("-p", scriptspath);
    let sh = fs.readFileSync(path.join(__dirname, '../shell/interLn.sh')).toString();
    sh = sh.replace('#projPath#', ctx.info.projectPath);
    const shname = 'prerun.sh';
    fs.writeFileSync(path.join(scriptspath, shname), sh);
    fs.chmodSync(path.join(scriptspath, shname), 0o755);
    shelljs.exec(path.join(scriptspath, shname));
    // 注入scripts end
    await next();
});




module.exports = apiRouter;
