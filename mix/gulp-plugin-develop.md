## gulp 插件开发

最近在做老代码的迁移,说实话真是蛋都要碎了。老代码用过的技术栈简直快包含整个前端的技术了,有dom操作库,``kissy``,``zepto``,现在盛行的MVVM框架``vue``,``react``,较早的模块管理``requirejs``,还有现在常用的打包工具``gulp``,``webpack``,这个项目简直就是一个前端技术的练兵场。不仅如此,源代码和线上代码不一致,代码仓库中并没有一份最新的代码。除此之外,打包配置文件写法真的是有点非主流,很多地方需要手动配置。其中用到的gulp插件数量也是没得说的,在梳理老代码构建打包任务时,有些地方并不是特别明白到底做了些什么,比如:

```javascript
 return gulp.src(config[dist].views + '/*.*')
      .pipe(LinkRemove())
      .pipe(gulp.dest(config[dist].views));
```
 其中``LinkRemove``,这个东西到底对源代码干了什么,作者并没有很清晰的给出,所以只能去看看这个gulp插件到底做了什么,却发现这个插件是作者自己写的,并没有上传到npm上,局面一度很尴尬,找到源代码,并没有很好的注释说明这是干什么的,可能作者觉得自己的代码即注释吧,虽然代码的确挺短的,但是我看到了这些:
 
 ```javascript
'use strict';
var through = require('through2'),
    fs = require('fs'),
    trumpet = require("trumpet"),
    concat = require("concat-stream"); 
    
module.exports = function() {
    return through.obj(function(file, enc, cb) {
        //todo something
    });
}
```
局面再度尴尬起来,``through2``是什么,``trumpet``,``concat-stream``又是干嘛'屎'的。然后就涉及到了gulp插件的开发,如果不了解gulp插件的原理,是不可能搞懂那些没有注释文档的自己开发的插件功能的。``gulp``又是一个基于流的构建工具,打开[插件编写文档](http://www.gulpjs.com.cn/docs/writing-a-plugin/),看到了这些关键词``Buffer``,``Stream``,``vinyl File object``,``though``,``transform stream``。如果你不了解这些那么也就不能很好的理解读懂别人写的插件源码或者编写自己的gulp插件。所以我们从Node Stream开始看起,毕竟gulp是基于流的一个工具。

### Node Stream 

``gulp``是一个基于流的构建工具,将各个处理流链接起来达到前端构建的目的,使得前端构建能够实现自动化,自动的完成那些耗时费力又非常重要的构建任务,从而提高了整个开发的效率。那么什么是流呢,流又给gulp带来和别的构建工具哪些不一样呢? 对于什么是流参看[Node Stream 初窥](https://weekly.js.org/node/node-stream.html),相比之前流行的前端构建工具grunt来说:
  1. gulp可以使你将不同的任务通过流的方式链接起来,比如css预处理,css url中的链接修改, css合并压缩等任务,你只需在最开始输入要处理的文件,在最后输出的就是你需要的处理完成的文件。
  2. 每个任务,每个插件都是处理其中一部分处理,非常符合单一职责的原则。
  3. 其次gulp任务编写更加符合大家的习惯,和写正常的逻辑代码别无一二。

看完Stream,来来看看Buffer,毕竟很多插件是只处理Buffer数据的。

### Node Buffer 

在Node.js中Buffer是一个可以在任何模块中被利用的全局类,可以通过以下方式创建buffer对象。

1. 通过构造函数指定buffer大小创建buffer对象
   
   ```javascript
   var buffer =  new Buffer(size);
   ```
2. 通过传入数组创建buffer对象
    
   ```javascript
   var buffer = new Buffer(array);
   // eg: var buffer = new Buffer([1,2,3]);
   ```
3. 通过传入字符串创建Buffer对象
    
   ```javascript
   var buffer = new Buffer(string,[encoding]);
   //encoding 参数可选,默认编码方式为'utf8'
   ```

Buffer对象可以通过toString方法转成字符串,toString方法有三个参数分别是encoding,start,end。``buffer.toString([encoding],[start],[end])``。

更多关于Buffer的内容可以参看node的文档,下面来看下在gulp中非常重要的一直virtual file format。

### [vinyl](https://github.com/gulpjs/vinyl)
vinyl是一种虚拟文件的格式,用来描述一个文件的简单元数据对象, 对一个文件我们能想到的就是文件的路径和文件内容,这些都是vinyl 对象的主要的属性。那么这个和gulp有什么联系,其实gulp就是一个Vinyl Adapter,一个Vinyl Adapter需要提供src(globs) 和 dest(folder)方法,每个方法都返回对应的stream,src 返回的Stream 会产生Vinyl对象,用于后续使用,如gulp的插件。而dest会使用这些对象,并生成文件到指定的目录。

#### vinyl 对像方法

1. ``file.isBuffer()``

    > 判断文件内容是否是Buffer格式的,如果是返回true,反之返回false。

2. ``file.isStream()``
    
    > 判断文件内容是否是stream形式的,如果是返回true,反之返回false.

3. ``file.isNull()``

    > 判断文件内容是否为空。如果是返回true,反之返回false.
     
更多的对象方法[参看github上的文档](https://github.com/gulpjs/vinyl)。
 
 #### vinyl 对象的属性
 
 1. ``file.cwd``
 
    > 当前工作目录,最后的斜杠会被删除,通过``file.cwd = newCwd`` 可以设置新的值。
    
 2. ``file.base``
    
    > 文件基础目录。值应该等于``path.dirname(file.path)``

 3. ``file.path``
    
    > 文件的绝对路径。
    
 4. ``file.relative``
    
    > 文件的相对路径,值等于``path.resolve(file.base,file.path)``
    
 更多属性[参看github上的文档](https://github.com/gulpjs/vinyl)。
 
### [vinyl-fs](https://github.com/gulpjs/vinyl-fs)

vinyl-fs 是 vinyl adapter, 具体使用可以参考[github上的文档](https://github.com/gulpjs/vinyl-fs)。一些gulp插件中会使用到这个vinyl adapter。


### [though2](https://github.com/rvagg/through2)

though2 是Node ``streams.Transform `` 的一个简单的包装,更方便大家去创建transform流。 对于gulp插件总是会返回一个 object mode 形式的 tranform stream 来做这些事情。所以though2在插件中用的很频繁,简直就是标配。通过though2创建对象模式的transform方式如下:

```javascript
//method-1 :
const though2 = require('though2');
though2({objectMode: true},function(chunk,enc,cb) {
    //todo something 
},[flushFunction]);
//method-2 :
though2.obj(function(chunk,enc,cb) {
   //todo something
},[flushFunction]);
```

基于though2,有人写了[though-gulp](https://github.com/bornkiller/through-gulp),使得编写gulp插件变得更加简单。


### gulp 插件编写
gulp插件的基本代码架子如下:

```javascript
// PLUGIN_NAME: sample
var through = require('through-gulp');

// exporting the plugin 
module.exports = sample;

function sample() {
  // creating a stream through which each file will pass
  var stream = through(function(file, encoding,callback) {
  	// do whatever necessary to process the file
  	// 这里file为vinyl对象。
    if (file.isNull()) {
        // 如果file的内容为空 
    }
    if (file.isBuffer()) {
        // 如果file的内容为Buffer
    }
    if (file.isStream()) {
        // 如果file的内容为stream
    }
    // just pipe data next, or just do nothing to process file later in flushFunction
    // never forget callback to indicate that the file has been processed.
      //确保文件进入下一个 gulp 插件
      this.push(file);
      //告诉 stream 引擎，我们已经处理完了这个文件
      callback();
      //上面两行等价于 callback(null,file);
    }, function(callback) {
      // just pipe data next, just callback to indicate that the stream's over
      //由下一个gulp执行
      this.push(something);
      callback(); //告诉 stream 引擎，我们已经处理完了
    });

  // returning the file stream
  return stream;
};
```
你需要做的是根据的自己的需求,编写相应的逻辑代码。我们可以看下一些插件的源码,这里以gulp-prefix举个例子,具体源码解读可以参看[gulp-prefix插件源码阅读](/source-code-read/gulp-prefix.md)


### gulp 插件测试

可以参看[gulp 测试](http://www.gulpjs.com.cn/docs/writing-a-plugin/testing/) 在写测试之前,需要了解mocha 测试框架和chai 或者 shoud.js断言库。


