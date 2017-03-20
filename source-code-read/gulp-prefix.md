## gulp-prefix插件源码阅读

为什么会阅读这个插件的源码呢,因为在维护老项目的时候看到这个插件并没有给所有需要加前缀的url加上前缀,并因为ios需要支持https,而安卓客户端却不需要,为了能够自适应不同的客户端系统,则需要给url添加以双斜杠(``//``)开头的url,但是该插件却将双斜杠替换成了单斜杠,所以打算阅读下源代码看这个插件内部到底做了什么。

先列出[gulp-prefix的源码](https://github.com/007design/gulp-prefix/blob/master/index.js)如下:

```javascript
'use strict';
var through = require('through2'),
    url = require("url"),
    urljoin = require("url-join"),
    trumpet = require("trumpet"),
    concat  = require("concat-stream"),
    _prefixer;

_prefixer = function(prefix, attr, invalid) {
  return function(node) {
    node.getAttribute(attr, function(uri) {

      uri = url.parse(uri, false, true);

      if(uri.host || !uri.path)
        return;
      
      if (!/^[!#$&-;=?-\[\]_a-z~\.\/\{\}]+$/.test(uri.path)) {
        return;
      }

      if (invalid && new RegExp(invalid).test(uri.path)){
        return;
      }

      var file_prefix = (typeof prefix === 'function') ? prefix(uri) : prefix;

      node.setAttribute(attr, urljoin(file_prefix, uri.path));
    });
  };
};

module.exports = function(prefix, selectors, ignore) {

  return through.obj(function(file, enc, cb) {

    if (!selectors) {
      selectors = [
      { match: "script[src]", attr: "src" },
      { match: "link[href]", attr: "href"},
      { match: "img[src]", attr: "src"},
      { match: "input[src]", attr: "src"},
      { match: "img[data-ng-src]", attr: "data-ng-src"}
      ];
    }
    
    if(!prefix)
      cb(null, file);

    else {
      var tr = trumpet();
      
      for (var a in selectors)
        tr.selectAll(selectors[a].match, _prefixer(prefix, selectors[a].attr, ignore))

      tr.pipe(concat(function (data) {
        if (Array.isArray(data) && data.length === 0) data = null;
        file.contents = data;
        cb(null, file);
      }));

      file.pipe(tr);
    } 
  });
};
```

代码的开头是依赖模块的引入和一些变量的定义,这个插件主要依赖了``url``,``though2``,``url-join``,``trumpet``,``concat-stream``等模块。

* [url](https://nodejs.org/api/url.html) 模块

  > url模块是node内置模块,用来对url进行解析处理并生成由url各个部分组成的解析结果对象。
  
* [though2](https://github.com/rvagg/through2)

  > 用来生成transform stream。 具体stream的一些概念参看[Node Stream初窥](/node/node-stream.md),though2的具体使用参看文档。
  
* [url-join](https://github.com/jfromaniello/url-join/blob/master/lib/url-join.js)
  
  > 作用将url的各个部分链接起来,形成合法的url。
  
* [trumpet](https://github.com/substack/node-trumpet)
  
  > 使用css 选择器解析处理stream 形式的html。
  
  ```javascript
  //使用方法
  var trumpet = require('trumpet');
  //Create a new trumpet stream. This stream is readable and writable. Pipe an html stream into tr and get back a transformed html stream.
  var tr = trumpet(); 
  
  //将html 可读流和tr链接
  var fs = require('fs');
  fs.createReadStream(__dirname + '/html/read_all.html').pipe(tr);
  //将产生的transformed html stream,选择其中满足css selector,创建一个可读流链接到输出流
  //这里如果span.createReadStream() 不加任何参数的话,默认取得是标签内的内容,不带标签,如果要获取到完整的html片段,则需要调用时增加选项参数{outer:true}
  tr.selectAll('.b span', function (span) {
        span.createReadStream().pipe(process.stdout);
  });

  ```
* [concat-stream](https://github.com/maxogden/concat-stream)
  
  > 从名字可以猜这个模块应该是用来连接什么的,文档介绍说如果你有将stream中的所有buffer连接成一个buffer,然后再进行处理的需求的话,那么这个模块就是你想要的,由于stream的特性,导致每次得到的数据只是一个chunk buffer,所以有时你需要得到全部的数据你才能进行某些操作,那么就可以通过这个模块到达想要的结果。
  
  ```
  //使用例子
  var fs = require('fs')
  var concat = require('concat-stream')
  
  function gotPicture(imageBuffer) {
    // imageBuffer is all of `cat.png` as a node.js Buffer
  }
  
  function handleError(err) {
    // handle your error appropriately here, e.g.:
    console.error(err) // print the error to STDERR
    process.exit(1) // exit program with non-zero exit code
  }
  
  var readStream = fs.createReadStream('cat.png')
  var concatStream = concat(gotPicture)
  
  readStream.on('error', handleError)
  readStream.pipe(concatStream)
  ```

在了解了上面gulp-prefix所依赖的插件后,我们就可以开始看这个插件到底做了什么事情了。首先看``module.exports``,导出一个函数这个函数可以接受三个参数:
* prefix

  > 字符串或者用于生成url前缀的函数。
   
* selectors

  > 对象数组,需要被替换的html标签,以及标签属性。具体格式如下:
  
  ```javascript
  [
    { match: "script[src]", attr: "src" },
    { match: "link[href]", attr: "href"},
    { match: "img[src]", attr: "src"},
    { match: "input[src]", attr: "src"},
    { match: "img[data-ng-src]", attr: "data-ng-src"}
  ]
  ```
  
* ignore
 
 > 要被过滤的路径,new Regex(ignore).test(path) 为true的话,则不进行添加前缀操作。
 

再来看这段代码:

```javascript
if(!prefix)
  cb(null, file);

else {
  var tr = trumpet();
  
  for (var a in selectors)
    tr.selectAll(selectors[a].match, _prefixer(prefix, selectors[a].attr, ignore))

  tr.pipe(concat(function (data) {
    if (Array.isArray(data) && data.length === 0) data = null;
    file.contents = data;
    cb(null, file);
  }));

  file.pipe(tr);
} 
```
对prefix进行判断,如果为空,则将file交给下一个插件进行处理,如果不为空,则进行如下处理,创建tr,用于和file链接,遍历selectors,然后选择匹配选择器的元素交由_prefixer的方法进行处理,这个方法会返回一个回调函数,这个回调函数的参数node就是匹配选择器的元素。然后在将tr处理后的file流向concat创建的流,当整个文件处理完,调用传入concat的回调,然后设置file内容为处理后的内容,流向下个插件。

其中_prefixer,是真正修改url的地方,我们看下代码内容:

```javascript
function(prefix, attr, invalid) {
  return function(node) {
    node.getAttribute(attr, function(uri) {

      uri = url.parse(uri, false, true);

      if(uri.host || !uri.path)
        return;
      
      if (!/^[!#$&-;=?-\[\]_a-z~\.\/\{\}]+$/.test(uri.path)) {
        return;
      }

      if (invalid && new RegExp(invalid).test(uri.path)){
        return;
      }

      var file_prefix = (typeof prefix === 'function') ? prefix(uri) : prefix;

      node.setAttribute(attr, urljoin(file_prefix, uri.path));
    });
  };
};

```

从代码中看出返回的回调函数,从node中取出attr属性值(url路径),然后通过url模块进行解析,url.parse的参数含义参考文档[url.parse](https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost),最后一个参数设置为true,考虑了路径为双斜杠开头的情况,那么后面// 到 /之间的值就是host了。如果存在host或者path不存在,则认为这种情况不需要添加前缀了。如果是合法path则接下去进行处理,如果path匹配ignore(invalid),则不处理,最后进行前缀添加,如果prefix是函数,执行函数并返回file_prefix文件前缀。然后通过url-join模块合并前缀和path,重新设置node(节点)的属性值。

当读到这里的时候,发现img标签中的data-lazyload-src没有被加前缀的原因是默认的selectors中没有对应的selector,添加后修复了这个问题。但是双斜杠的问题还是存在,从整个代码来看,最可能出问题的地方就是urljoin这里了,后来看了url-join模块的源码,才发现gulp-prefix用的是很早的版本,从package.json中可以看出:

```javascript
 "dependencies": {
    "through2": "~1.0.0",
    "url": "~0.10.1",
    "trumpet": "~1.7.0",
    "concat-stream": "~1.4.5",
    "url-join": "0.0.1" //这里版本为0.0.1,现在已经是v1.1.0
}
```

0.0.1版本的url-join源代码如下:

```javascript
function normalize (str) {
  return str
          .replace(/[\/]+/g, '/')
          .replace(/\/\?/g, '?')
          .replace(/\/\#/g, '#')
          .replace(/\:\//g, '://');
}

module.exports = function () {
  var joined = [].slice.call(arguments, 0).join('/');
  return normalize(joined);
};
```
很明显这个地方将双斜杠给替换成了单斜杠,给作者提了pull request,作者并没有鸟,尝试自己升级了url-join最后解决了双斜杠被删成单斜杠的问题。

### gulp-prefix 可以改进的地方
* selectors 参数格式,数组的话作者并没有增量合并,而是需要自己枚举所有情况。
* url-join 在package.json中写死了版本,导致双斜杠变单斜杠的问题。

查了一波MIT证书的限制,对于MIT证书来说,只要用户在项目副本中包含了版权声明和许可声明,你可以拿这个代码做任何事情。所以决定对代码略作修改使其更好的用在自己的平常构建任务中。改造后重命名为``gulp-prefix-url``,并写了测试用例进行测试。插件的GitHub地址为:https://github.com/xdimh/gulp-prefix-url。 


### 参考

1. [各种 License](https://segmentfault.com/a/1190000002397061)
2. [choosealicense](https://choosealicense.com/)