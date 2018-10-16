yg-container
====
yg-container

## 代码逻辑梳理

### server端
重构后，所有功能均基于socket，那么在server端，从app.js的`websock.init(socket);`入口分析即可。

websock.init方法中有四条语句，三个socket监听事件注册和一个版本检查语句。其中`runshell`事件是重构前的，并没有用到这个事件，可以删除。

当客户端和服务端的版本不匹配时，将通知client端不匹配，由client端来处理不匹配逻辑。

由`clientEvent`事件来监听客户端发出的命令行命令，每个命令都有一个handler来处理。handler接收两个参数，一个当前socket实例，一个`ProtocolModel`对象。

PM对象总是包含三个属性，cmd：在`eventconsts.js`中定义的命令，options：命令行解析后的对象，args：自定义数据。

以`yg template`命令为例。

template的handler方法根据protocol.cmd进行分流，比如当前执行的`yg template list`，那么就会执行list方法。在list方法中，会进一步解析options来细分功能。当读取到模板列表后，无论执行正确还是错误，都会emit protocol.cmd事件给client端，参数也是一个`ProtocolModel`对象。client接收后再根据PM对象处理。

当没有handler处理client传过来的命令时，直接断开socket链接。


### client端
client端入口在`bin/cli.js`，require都放在命令的回调函数里，因此命令和命令之间是独立的。

同样以`yg template`命令为例。

可以看到目前实现的命令有clone和list。

在`template.js`的list方法中，emit了`clientEvent`方法，这也是所有命令行命令执行时通知到server端的方式。同时注册了一个cmd `eventconsts.template.list`监听事件，监听服务端的反馈。在监听回调里做后续操作。

比较复杂的就是clone方法了。先不看监听事件，clone方法也是会emit`clientEvent`方法通知server端。不同的是它有两个监听事件，一个是类似list的服务端反馈监听事件，另一个是用于接收服务端的数据传输。数据传输是`ss(socket)`，不过他们都共同绑定`eventconsts.template.clone`事件名。

在数据传输完毕后，server端会emit `eventconsts.template.clone`事件，client端接收后根据PM对象做后续处理。

## ygconfig
ygconfig在client端由`saveYgConfig.js`来组装，并挂载在`config.js`上。

## package.json
云构编译器名写在package.json中，因此接入云构必须包含这个文件。模板名只有参考作用，因此并没有定义名称。
```JSON
{
  "name": "yg-container",
  "yg": {
    "parser":"编译器名"
  }
}

```
