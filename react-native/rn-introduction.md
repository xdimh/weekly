{% raw %}

## 用JavaScript来写客户端 — React Native

> LEARN ONCE, WRITE ANYWHERE!

React Native让开发者可以使用``JavaScript``编写native应用，利用相同的核心代码就可以创建基于``Web``，``iOS``和``Android``平台的原生应用。React Native除了性能体验上比H5更好外,相比用原生来开发页面React Native还是有些优势:
* 热更新
* 开发页面速度会更快一些,页面布局相对更加容易一些



对于前端的开发同学来说``React Native = React + 封装的Native组件``,所以从``React`` 切换到 ``React Native`` 学习成本主要在于React Native 环境的搭建,学习React Native 所封装的一套组件,如何用有限的CSS样式子集来完成UI的布局以及最后React Native代码的调试。

### React 生命周期

React提出重新思考UI开发过程，其实不是面向浏览器，而是所有的前端，因为对前端开发而言我们需要涉及的领域已经开始包括了Web与Native,React定义了组件的生命周期,让开发者只需关心组件的状态变更,从组件的角度去思考一个app。让代码的扩展性,重用性都有了很大的提高,简化了应用的开发。React Native 组件沿用了React的生命周期,如下图:

![react-life-cycle](http://rainypin.qiniudn.com/git_imgs/react-life-cycle.png)

[参考React生命周期](/react/react-life-cycle.html)
### React Native 代码组织

```
.
├── README.md*
├── android/
├── app/
│   ├── components/
│   ├── config.js
│   ├── containers/
│   ├── images/
│   ├── lib/
│   ├── network/
│   ├── screens/
│   └── styles/
├── bin/
│   └── bundle*
├── build/
│   ├── android/
│   ├── android-inline.zip
│   ├── android.zip
│   ├── ios/
│   ├── ios-inline.zip
│   └── ios.zip
├── gulpfile.js
├── index.android.js
├── index.ios.js
├── ios/
├── mock/
│   ├── async/
│   └── uploads/
├── ngrok.cfg*
├── package/
│   ├── core/
│   └── lib/
└── package.json
```
#### 1. ``app``目录 
React Native 源代码目录,其中:
* ``components`` 目录

    > 该目录是组件目录,单独抽离封装可被重用的组件存在该目录底下,每个组件单独管理组件的逻辑,样式,和组件所依赖的图片资源。
    
* ``containers``目录

   > 容器组件目录/基类存放目录,目前整个React Native中的页面都会继承该目录底下的Base类,这个基类用来同步React Native的生命周期给Native端。并定义一些通用的方法或者绑定和解绑全局事件。

* ``lib``目录

    > 该目录存放了整个React Native项目中用到的基础工具方法。如:base64编码解码,cdn图片的尺寸裁剪,封装好的异步请求接口(会根据RN运行环境选择使用客户端提供的请求和使用RN自带的请求方法),Strorage本地存储,环境选择等工具方法。

* ``screens`` 目录
    > 该目录存放React Native页面的入口文件,一个页面对应一个入口文件。
    
* ``styles``目录
    > 该目录存放全局的样式配置和不同平台不同屏幕大小的样式兼容处理方法mixin。

* ``images`` 目录
    > 本地图片存放目录

* ``network``目录 
    > 测试资源存放目录 

* ``config.js``文件 
    > 项目全局配置文件,包括平台判断,全局字体颜色,背景颜色,屏幕的高宽等等。

#### 2. ``package``目录
该目录存放了前端构建任务代码,包括前端数据mock,上传七牛,git版本校验等。

* ``core`` 目录

    > 存放核心任务代码,任务命名规则``'core.' + 任务文件名 + ':具体任务名'``,例如``qiniu.js``里的上传任务名称``core.qiniu:upload``。这样的命名好处在于能够在``gulpfile.js``文件中通过任务名称快速的定位到任务逻辑代码所在的具体文件。
    
* ``lib`` 目录
    
    > 前端打包体系所依赖的一些工具方法所在的目录。
    
#### 3. ``mock``目录 
异步数据mock文件所在的目录
* ``async``目录
   > 异步数据mock文件存放目录,文件内容格式如下:
   
   ```javascript
    module.exports = {
      /*
        异步请求接口定义方式
        'request_method inteface_name' : request handle function
      */
      'get /rest/user' : function(req,res) {
      
       },
      /*
        文件上传mock
        'request_method inteface_name file' : request handle function
      */
      'post /api/contact/import/ file' : function(req,res) {
      
       } 
    }
   ```
* ``upload``目录 

    > 上传后的文件所在目录。

#### 4. ``bin``目录
React Native打包命令所在的目录,打包后的文件存放在build目录中。[参考RN打包工具](https://github.com/xdimh/react-native-bundle)

### React Native 与 Native的通信
在RN和Native的一个混合应用场景下,RN和Native的通信必不可少,具体形式如下:
1. Native -> RN 
    * 方式一: Native 通过一定的方式[[参考在原生和React Native间通信]](https://reactnative.cn/docs/0.41/communication-ios.html#content)
将需要传给RN的数据作为RN页面初始化属性注入,在RN中可以通过``this.props.properties``进行访问。
    * 方式二: Native 通过emit事件的方式将数据传递给RN端。RN端通过``DeviceEventEmitter.addListener('reloadPageEvent', this.reloadPage.bind(this));``绑定事件,Native端emit对应的事件。
    * 方式三:Callback,RN调用Native提供的桥接方法,并传入相应的Callback,最终Native会调用这个回调,并传递相应的数据给RN端。
    
2. RN -> Native

    > 通过Native提供的桥接方法,RN使用Native的功能并把Native需要的参数传递个Native,最后通过Callback的方式或者事件的方式将结果告知RN。

    ```javascript
    // Native Bridges
    const RNView = NativeModules.IMYRNView || {};
    const RNBridgeManager = NativeModules.IMYRNBridgeManager || {};
    //然后可以通过RNBridgeManager.method直接调用。
    ```

### React Native 代码调试
``React Native`` 的代码调试相比纯web来说要没那么方便些,特别是在和Native对接代码调试那块。对于RN自己这边的代码相比web调试起来差别不是特别大。具体方式ios模拟器(android类似)``command + d``,打开设置项:

![React Native代码调试](http://rainypin.qiniudn.com/git_imgs/rn_debug.png)

启动远程JS调试,启动远程代码调试,可以对代码设置断点,进行断点调试:

![React Native 代码断点调试](http://rainypin.qiniudn.com/git_imgs/rn_debug_breakpoint.png)

同时你可以打开hot reload 功能,这样代码修改,界面就能自动reload,实时看到效果,提高开发调试效率。这个过程对前端开发同学来说比较熟悉,一般出现的问题也很好定位和修改。

对于React Native 和 Native 进行联调就相对来说就要复杂些,由于业务需要,RN 往往需要 Native提供相应的桥接方法,让RN可以使用Native的某些功能。但调试起来却不太方便,在项目开发阶段,这个过程算是比较费时的,如下两种方式正是我们现在所使用的方式:
* 方式一
    > RN这边将写好的代码打包成bundle,然后交给Native同学去看,如果有问题(RN这边往往需要console.log输出信息),Native的同学断点定位,判断问题出现在Native端还是RN端,再由接锅的一方修改,然后重复此过程直到功能正常。
* 方式二
    > Native给出一个分支,这个分支专门用于和RN进行联调,Native的同学往往需要在这个分支上做一些特殊配置,比如RN的bundle包读取位置不在是本地而是一个url如:``http://192.168.199.115:8081/index.ios.bundle?platform=ios``,RN端只需要通过``node node_modules/react-native/local-cli/cli.js start``启动服务。然后开启Xcode,debug模式启动项目,这样就可以在RN这边单独进行联调,问题的定位,如果确实是Native的问题,再告知Native同学进行修改。
    
其中方式二还是从一定程度上提高了React Native 和 Native 端联调的效率。

### React Native 代码打包
[参考RN打包工具](https://github.com/xdimh/react-native-bundle)

### React Native Zip包下发
让React Native实现app真正的热更新功能就需要RN的代码每次版本更新时可以通过网络下发到app上,从而不用app重新打包发布。Native获取到新的React Native包逻辑大致如下图:

![Native获取zip包大致逻辑](http://rainypin.qiniudn.com/git_imgs/zip-load-flow.png)

局限性: 如果RN端的修改需要依赖到Native提供新的bridge,这样客户端也不得不重新进行打包发布。

RN版本更新需要对door开关进行配置,具体格式如下:
```javascript
{
    "list" : [{
        "rnname": "projectName1", //RN项目名称 
        "rnversion": "1.0.1", //RN版本
        "rnurl": "https://hostname/projectName1/path/1.0.1/ios.zip" //RN最新zip包路径
    }, {
        "rnname": "projectName2",
        "rnversion": "1.0.1",
        "rnurl": "https://hostname/projectName1/path/1.0.1/ios.zip"
    }]
}
```
发版的时候只需更新``rnversion``字段就行,通过数组方式支持多个bundle包,不同的bundle包通过rnname进行区分,这种方式还可以更新特定的bundle而不会影响到其他RN页面。

### React Native 版本升级方案【待做】
React Native现在几乎是一个月出一个小版本,当前版本已经是``0.41``,可见社区还是很活跃的,也可以看到React Native还是逐渐在完善,有些功能甚至一些参数选项都不太稳定,没准在下一个版本某个组件的选项就会被废弃,某个方法参数就有可能被调整,所以对于版本升级来说,这会照成一些代码兼容性的问题,升级后原有的代码不一定就能跑通,但从新版RN代码更完善的功能,更少的bug,以及以后开源的RN的组件都可能是基于高版本RN而开发的情况,我们都应该有个理想的版本的升级方法,在需要的时候进行版本的升级。

{% endraw %}
