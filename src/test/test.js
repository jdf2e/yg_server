 const fs = require("fs");
 const path = require("path");
 const inx = require("./index");
 let txt = fs.readFileSync("index.js", "utf-8");




 console.log(inx.dev);

 function webpackInjector(currentFolder, port) {
   let packageJSONFile = path.join(currentFolder, "package.json");
   if (fs.existsSync(packageJSONFile)) {
     let isUseWebpackDevServer = fs.readFileSync(packageJSONFile, "utf-8").includes("webpack-dev-server");
     if (isUseWebpackDevServer) {
       let cfgFile = path.join(currentFolder, "config", "index.js");
       if (fs.existsSync(cfgFile)) {
         let cfgIdx = require(cfgFile);
         if (cfgIdx.dev) {
           let txt = fs.readFileSync(cfgFile, "utf-8");
           txt = txt.replace(/dev\s*:\s*\{/ig, d => {
             return `dev: { disableHostCheck:true,`
           });
           txt = txt.replace(/host\s*:.*?,/ig, d => {
             return `host:"0.0.0.0",`
           });
           txt = txt.replace(/port\s*:.*?,/ig, d => {
             return `port:${port},`
           });
           fs.writeFileSync(cfgFile, txt, "utf-8");
         }
       }
     }

   }

 }


 //PATH=/root/.nvm/versions/node/v8.11.3/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin



 // let cpHandle = cp.exec(`docker ps -a`);

 // cpHandle.stdout.on('data', (data) => {
 //     console.log("stdout", data);
 // });

 // cpHandle.stderr.on('data', (data) => {
 //     console.log("stderr", data);
 // });


 // cpHandle.on('close', (data) => {
 //     console.log("11111");
 // });

 // docker.run("yg", ['bash', '-c', 'uname -a'], process.stdout).then(function(container) {
 //     console.log(container.output.StatusCode);
 //     return container.remove();
 //   }).then(function(data) {
 //     console.log('container removed');
 //   }).catch(function(err) {
 //     console.log(err);
 //   });



 // docker.listContainers({all:true}).then(d=>{
 //     console.log(d);
 // });

 // docker.listContainers({ps_args:"aux"},function (err, containers) {
 //     console.log(containers);
 //     containers.forEach(function (containerInfo) {
 //         //console.log(containerInfo);

 //     });
 //   });




 // function runCMD(id, socket, cmd) {
 //   let containerId = socket.containerId = "yg_c_id_" + id;
 //   class MyWritable extends Stream.Writable {
 //     constructor(options) {
 //       super(options);
 //     }
 //     _write(chunk, encoding, callback) {
 //       let stringData = chunk.toString();
 //       //socket.emit("msg", stringData);
 //       console.log(stringData)
 //       callback();
 //     }
 //   }
 //   docker.run('yg', cmd, new MyWritable, {
 //     name: containerId,
 //     Env: ["PATH=/root/.nvm/versions/node/v8.11.3/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"],
 //   }).then(container => {
 //     return container.remove({
 //       force: true
 //     });
 //   });
 // }

 //runCMD("xxxx-xxx-xxx-xx", {}, ["node", "-e", "setInterval(d=>{console.log(121)},1000)"]);






 // function removeContainerByName(name) {
 //   let containerId = "yg_c_id_" + name;
 //   docker.listContainers({
 //     all: true
 //   }).then(list => {
 //     list.map(containerInfo => {
 //       containerInfo.Names.map(name => {
 //         if (name.includes(containerId)) {
 //           docker.getContainer(containerInfo.Id).remove({
 //             force: true
 //           });
 //         }
 //       });
 //     });
 //   });
 // }

 //removeContainerByName("xxxx-xxx-xxx-xx");


 // class MyWritable extends Stream.Writable {
 //   constructor(options) {
 //     super(options);
 //   }
 //   _write(chunk, encoding, callback) {
 //     let stringData = chunk.toString();
 //     //socket.emit("msg", stringData);
 //     console.log(stringData)
 //     callback();
 //   }
 // }
 // let s = new MyWritable //fs.createWriteStream("/tmp/wwww");

 // docker.run('yg', ['node', '-e', 'console.log(121)'], s, {
 //   name: "xx1",
 //   Env: ["PATH=/root/.nvm/versions/node/v8.11.3/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"],
 // }).then(container => {

 // });

 // docker.createContainer({
 //     //name:"qw11qw",
 //     Image: 'yg',
 //     AttachStdin: false,
 //     AttachStdout: true,
 //     AttachStderr: true,
 //     Tty: true,
 //     Env:[
 //       "PATH=/root/.nvm/versions/node/v8.11.3/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
 //     ],
 //     Cmd: ['node',"-e",`"setInterval(d=>{console.log(121)},1000)"`],
 //     OpenStdin: false,
 //     StdinOnce: false
 //   }).then(function(container) {
 //     container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
 //       //dockerode may demultiplex attach streams for you :)
 //       container.modem.demuxStream(stream, process.stdout, process.stderr);
 //     });
 //     return container;
 //     // return new Promise((resolve,reject)=>{
 //     //   container.attach({stream: true, stdout: true, stderr: true}).then(stream=>{
 //     //     container.stdoutStream = new EchoStream();
 //     //     container.stderrStream = new EchoStream();
 //     //     container.modem.demuxStream(stream,process.stdout, process.stderr);
 //     //     resolve(container);
 //     //   })
 //     // });
 //   }).then(container=>{


 //     return container.start();
 //   })



 // .then(function(container) {
 //   return container.stop({
 //     t :10
 //   });
 // }).then(container=>{
 //   return container.remove({
 //     force :true
 //   });
 // })

 // .then(function(container) {
 //   return container.stop();
 // }).then(function(container) {
 //   return container.remove();
 // }).then(function(data) {
 //   console.log('container removed');
 // }).catch(function(err) {
 //   console.log(err);
 // });