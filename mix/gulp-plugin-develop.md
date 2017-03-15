## gulp 插件开发

最近在做老代码的迁移,说实话真是蛋都要碎了。老代码用过的技术栈简直快包含整个前端的技术了,有dom操作库,``kissy``,``zepto``,现在盛行的MVVM框架``vue``,``react``,较早的模块管理``requirejs``,还有现在常用的打包工具``gulp``,``webpack``,这个项目简直就是一个前端技术的练兵场。不仅如此,源码码和线上代码不一致,代码仓库中并没有一份最新的代码。除此之外,打包配置文件写法真的是有点非主流,很多地方需要手动配置。其中用到的gulp插件数量也是没得说的,在梳理老代码构建打包任务时,有些地方并不是特别明白到底做了些什么,比如:

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
局面再度尴尬起来,``through2``是什么,``trumpet``,``concat-stream``又是干嘛'屎'的。然后就涉及到了gulp插件的开发,如果不了解gulp插件的原理,是不可能搞懂哪些没有注释文档的自己开发的插件功能的。

### Node Stream 

``gulp``是一个基于流的构建工具,使得前端构建能够实现自动化,提高了整个开发的效率,那么什么是流呢,流又给gulp带来和别的构建工具哪些不一样呢? 对于什么是流参看[Node Stream 初窥]()


