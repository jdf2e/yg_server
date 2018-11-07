const Koa = require('koa');
const path = require("path");
const koastatic = require('koa-static');
const formidable = require('koa2-formidable')
const util = require('./util/util');
const config = require('./util/config');
const baseRouter = require('./router/base');
const websock = require("./websock/websock");

const app = new Koa();
app.use(koastatic(path.join(__dirname, "../", "static")));
app.use(formidable({
  uploadDir: config.YG_TMP_PATH
}));
app.use(baseRouter.routes())
  .use(baseRouter.allowedMethods());

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, {
  transports: ['websocket']
});
io.on('connect', (socket) => {
  websock.init(socket);
});

let port = process.env.YG_PORT || config.YG_PORT;
server.listen(~~port);
console.log("listen at", ~~port);
