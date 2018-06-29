const Koa = require('koa');
const path = require("path");
const static = require('koa-static');
const formidable = require('koa2-formidable')
const util = require('./util/util');
const config = require('./util/config');
const baseRouter = require('./router/base');
const websock = require("./websock/websock");

const app = new Koa();
app.use(formidable({
    uploadDir: config.YG_TMP_PATH,
}))
app.use(baseRouter.routes())
    .use(baseRouter.allowedMethods());

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);
io.on('connect', (socket) => {
    websock.init(socket);
});

server.listen(config.YG_PORT);
console.log("listen at", config.YG_PORT);