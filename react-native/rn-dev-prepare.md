## Mac上搭建RN开发环境

## 安装依赖 
在针对特定平台开发环境建立之前,你需要先安装``node``,``watchman``,``react-native-cli``。在Mac上我们可以通过[HomeBrew](https://brew.sh/)进行相应的安装。
> brew install node <br />
> brew install watchman <br />
> brew install flow <br />
> npm install -g react-native-cli

### ios 开发环境搭建
对于ios 只需要从app store中安装xcode即可,安装xcode会自动安装ios 模拟器以及一些构建app所需要的工具。通过react-native 命令初始化一个项目然后测试ios开发环境是否成功建立。

> react-native init AwesomeProject <br />
> cd AwesomeProject

在ios模拟器中启动应用,两种方式:
1. 通过命令行直接唤起模拟器打开app

    >  react-native run-ios
    
    执行完该命令,正常情况下,会打开ios模拟器,然后启动应用以供调试。

2. 进入目录``AwesomeProject``,打开``ios``目录下的文件``AwesomeProject.xcodeproj``,如果xcode成功安装,默认会打开xcode。然后直接
![xcode-run](http://rainypin.qiniudn.com/git_imgs/xcode-run.png)

### android 开发环境搭建 

对于android开发环境要稍微复杂一些。

1. 安装安卓模拟器[genymotion](https://www.genymotion.com/download/)
   > 安装完成后需要去官网注册一个账户并激活,后续创建虚拟设备将会用到。
2. 安装[virtual box](http://rj.baidu.com/soft/detail/25850.html?ald)

3. 安装最新版JDK

4. 安装安卓Android Studio 
* 打开sdk manager 安装的Android sdk
  
  ![android studio](http://rainypin.qiniudn.com/git_imgs/android-studio.png)
  
* 选择需要安装的内容

  ![android sdk](http://rainypin.qiniudn.com/git_imgs/android-sdk.png)
  
5. 打开genymotion 创建安卓模拟器

    * 先设置好正确的android sdk路径 
    
        ![settings](http://rainypin.qiniudn.com/git_imgs/settings.png)
    
    * 添加相应的虚拟设备
    
        ![virtual-device](http://rainypin.qiniudn.com/git_imgs/virtual-device.png)
    
6. 打开对应的虚拟设备测试安卓开发环境是否成功建立

    打开对于的虚拟设备后,在项目根目录执行命令启动应用:
    > react-native run-android 
    
    这一步可能发送报错``java.io.EOFException: SSL peer shut down incorrectly``,解决方案在后面。
    
    这个时候如果build successfully 则在模拟器上可以看到对于app的页面,如果模拟器上出现如下报错:
    ![dev-settings](http://rainypin.qiniudn.com/git_imgs/dev-settings.png)
    
    需要设置对应的debug host为当前电脑的ip地址,如下图:
    
    ![debug-host](http://rainypin.qiniudn.com/git_imgs/debug-host.png)
    
 
## 环境配置过程报错解决
 
 * 对于安卓开发环境步骤6中运行``react-native run-android``所报错误解决方法
    > 下载gradle-2.4-all.zip到本地 <br />
      本地启动对于的服务 <br />
      修改``android/gradle/wrapper``下gradle-wrapper.properties文件中的``distributionUrl``为本地地址,重新执行``react-native run-android``
      
## 参考资料

1. [React Native Android（Genymotion） 环境搭建 for mac](http://www.jianshu.com/p/38cb29cdb77d)
2. [学习 React Native for Android：环境搭建](http://hahack.com/codes/learn-react-native-for-android-01/)
3. [Getting Started with Building An App with React Native, Genymotion, and Watchman](http://amiraanuar.com/step-by-step-guide-to-building-an-android-app-using-react-native-and-genymotion/)
4. [react native getting started](https://facebook.github.io/react-native/releases/next/docs/getting-started.html)
5. [react-native run-android 报错解决](http://bbs.reactnative.cn/topic/310/react-native-run-android-%E6%8A%A5%E9%94%99-java-io-eofexception-ssl-peer-shut-down-incorrectly)
6. [React Native For Android初体验](http://www.jianshu.com/p/847a54e0c385)