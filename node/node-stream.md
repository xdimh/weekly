## Node Stream 初窥

Node 将几乎所有 IO 操作都抽象成了 Stream 的操作。Stream 是一个抽象的概念，可以将Stream 想象成水流管道,管道有只用于输出的,有只接收的,有负责中间过渡的(既有输入的一端,也有输出的一端)。总之就是生产东西,或者消费东西,这个东西可以是Buffer,可以是String,甚至是可以Object。从Node 官方文档对Stream的定义,

>A stream is an abstract interface implemented by various objects in Node. For example a request to an HTTP server is a stream, as is stdout. Streams are readable, writable, or both. All streams are instances of EventEmitter

我们可以了解到 :
* Stream是Node中一个非常重要的概念，被大量对象实现，尤其是Node中的I/O操作
* Stream是一个抽像的接口，一般不会直接使用，需要实现内部的某些抽象方法(例如_read、_write、_transform)
* Stream是EventEmitter的子类，实际上Stream的数据传递内部依然是通过事件(data)来实现的

那为什么会需要流。看下面这段代码:

```javascript
var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {
    // req is an http.IncomingMessage, which is a Readable Stream
    // res is an http.ServerResponse, which is a Writable Stream
    fs.readFile(__dirname + '/data.txt', function (err, data) {
        res.end(data);
    });
});
server.listen(8000);
```

> 每次当请求过来,程序都会接收到这个请求,然后去读``data.txt``文件,并把内容返回。但是每次读的时候都会把``data.txt``整个读入内存,在响应大量用户的并发请求时，程序可能会消耗大量的内存，这样很可能会造成用户连接缓慢的问题。其次，上面的代码可能会造成很不好的用户体验，因为用户在接收到任何的内容之前首先需要等待程序将文件内容完全读入到内存中。所以更好的办法就是需要多少给多少,而不是一股脑的将整个数据放到内存中,通过流可以实现这一的效果。

```
var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {
    // req is an http.IncomingMessage, which is a Readable Stream
    // res is an http.ServerResponse, which is a Writable Stream
    var stream = fs.createReadStream(__dirname + '/data.txt');
    stream.pipe(res);
});
server.listen(8000);
```

### Node 中Stream的类型

在Node.js中,有四种基本的流类型,他们分别是:``Readable`` ,``Writable``,``Duplex ``,``Transform ``。流一般处理的数据类型都是String 和 Buffer的,但是你可以通过在创建流的时候指定选项参数``objectMode``,创建对象流,不过需要注意的是,尝试将已存在的流的模式切换成对象流是一种不安全的不被建议的操作。

不管是``Readable`` 还是 ``Writable`` 流,工作的过程都会将数据保存在内部的一个缓冲区中,可以分别通过``readable._readableState.buffer`` , ``writable._writableState.getBuffer()`` 取出buffer内容。我们可以通过选项参数``highWaterMark``控制缓冲区的大小,对于String 或者 Buffer流来说,highWaterMark 控制的字节数,对于对象流,highWaterMark控制的是对象的个数。

#### 1. ``Readable`` 

可读流,是输出流,通过``readable.push(chunk)``将数据读入流的缓冲区以供读取,消费者可以通过``readable.read()``读取流中的数据,如果缓冲区中的数据一直没有被消费掉,一旦到达 ``highWaterMark`` 设置的阈值,那么输出流就会停止往缓冲区中放数据,知道有消费者消耗掉这些数据。

> Once the total size of the internal read buffer reaches the threshold specified by highWaterMark, the stream will temporarily stop reading data from the underlying resource until the data currently buffered can be consumed (that is, the stream will stop calling the internal readable._read() method that is used to fill the read buffer).

Readable 有两种模式,分别是 flowing 和 paused 模式。flowing 模式,会自动的从源读取数据通过事件的方式提供给应用消费,而paused 模式需要显示手动调用readable.read()方法,从流中读取数据。所有的Readable流一开始都是paused模式,但是可以通过下面的几种方法切换成flowing 模式:
> 1. 添加``data``事件处理器。
> 2. 调用 `` readable.resume()`` 方法。 
> 3. 调用 ``readable.pipe() `` 方法发送数据到Writeable 流。 

只要监听了``data``事件或者是调用`` readable.resume()``,``readable.pipe() ``方法,都会将``readable._readableState.flowing`` 设置为true。使得Readable当数据生成时不断的触发data事件。流程图大致如下:

![Readable 流程](http://tech.meituan.com/img/stream-how-data-comes-out.png)

同样可以通过一些方式将模式从 flowing 切换回 paused。 具体方法参考官方文档。
 
#### 2. ``Writable`` 

可写流,输入流,是对数据写入目标的一个抽象,将内容通过`` writable.write(chunk) ``存入流缓冲区中,如果没有超出限制,则返回true,如果超出限制,则返回false。

* 实现自己的``Writable`` 
  
  > 继承``Writable`` ,重写方法``_write``,``_writev``,任何的可写流都必须提供方法``_write``,用于将数据写入底层资源(如某个文件)。实现自己的``Writable``代码如下:
  
  ```javascript
    //写法1: 
    const Writable = require('stream').Writable;
    
    class MyWritable extends Writable {
      constructor(options) {
        // Calls the stream.Writable() constructor
        super(options);
      }
    }
  
    //写法2:
    const Writable = require('stream').Writable;
    
    const myWritable = new Writable({
      write(chunk, encoding, callback) {
        // ...
      },
      writev(chunks, callback) {
        // ...
      }
    });
  ```
  Writeable 与 Readable 的关系大致如下图:
  
  ![Writeable 与 Readable 的关系](https://segmentfault.com/img/bVoLre)
 
#### 3. ``Duplex`` & ``Transform``

``Duplex`` & ``Transform`` 既是可读流也是可写流,类比水流管道中间部分,既有输入也有输出,输入输出分别都有各自的缓冲区。经常会有一种情况,就是输入和输出的速率不一样的情况,所以两端应该相对独立,可以为另一端调节速率。Transform 是一种特殊的 Duplex, Transform的输出以某种方式和输入相联系。Transform 内部流程图大致如下:

![Transform 内部工作流程图](https://segmentfault.com/img/bVoLri)

gulp插件就是通过through2创建一个Transform,并执行一些操作然后返回创建的流。


### 参考资料
1. [streamify-your-node-program](https://github.com/zoubin/streamify-your-node-program)
2. [node源码解析 -- Stream探究](https://segmentfault.com/a/1190000003479884)
3. [Node.js Stream - 进阶篇](http://tech.meituan.com/stream-internals.html)
4. [Node Stream](https://nodejs.org/api/stream.html)
5. [stream-handbook](https://github.com/substack/stream-handbook)
6. [源码](https://github.com/nodejs/node/blob/master/lib/_stream_readable.js)