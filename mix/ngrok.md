## 使用ngrok让你的本地mock可以提供给外网访问
> __问题：__  前端开发往往需要在本地启动mock服务提供模拟数据进行代码调试和自测。简单的mock已经足够满足本地代码调试和自测。然而开发过程中往往需要和其他端进行联调或者将代码作为demo给别人展示，例如：在开发完react-native页面，需要将页面嵌入到原生代码中，和native的同学对接，这个时候本地的mock接口往往是这样的接口地址``http://localhost:9000/getData``不能成功被请求，如果处于同一个内网这个时候可以通过写死接口ip地址来解决，如果不在同一个内网则（远程协作等情况）的时候，往往需要对接代码的人在本地也同样mock一份数据，过程较为复杂。

## ngrok 介绍
[ngrok](https://ngrok.com/) 可以让本地地址穿透nat,firewall映射到能够在外网被访问的某个域名地址。这样本地请求可以改成使用这个统一的域名地址去请求，从而对接的时候不用手动去修改代码中的请求地址，提高了对接联调的效率。然后天下没有免费的午餐，自定义子域名这个功能只有付费的用户才能使用，但国内已经有人无私贡献了ngrok服务，造福于开发者，网站地址[ngrok 国内](http://qydev.com/)

## ngrok 安装使用
- 下载对对应平台的ngrok (eg: mac osx)
- 解压ngrok
  官方版本只有一个ngrok可执行文件 ，国内版本有两个文件一个ngrok（后续需要手动添加可执行权限）和 ngrok.cfg 配置文件。国内重命名为ngrok2并添加可执行权限  ``mv ngrok ngrok2 && chmod u+x ngrok2 ``
- ``mv unzip-path/ngrok unzip-path/ngrok2 /usr/local/bin``  或者 再path环境变量中添加解压后的目录路径。
- 使用
  1. 配置ngrok 配置文件 （国内版本不需要）
      ```
       authtoken: youtoken 
       json_resolver_url: ""
       dns_resolver_ips: []
       tunnels:
           dev:
               addr: 9000
               auth: username:paswd
               proto: http
         #    subdomain: xxxxx 付费用户才能用
      ```
      [token获取](https://dashboard.ngrok.com/auth)
  2.  启动本地mock 

      ```
       [SUCCESS] 16:52:38 mock 服务启动成功: http://:::9000
      ```

  3.  启用ngrok
       ```
        国内 : ngrok2 --config=ngrok.cfg -subdomain xxx 9000 
        官方: ngrok start --config=ngrok.yml --all
       ```
    访问地址分别是: ``http://xxx.tunnel.qydev.com/getData`` 和 ``http://b79fb37b.ngrok.io/getData``

## alias 命令
设置别名:在~/.bashrc 或者 ~/.bash_profile 中添加``alias ngrok2="ngrok2 --config=/usr/local/opt/config/ngrok2.cfg"`` 就可以直接使用ngrok2 -subdomain xxx 9000 启动服务
![ngrok 运行结果](http://rainypin.qiniudn.com/git_imgs/ngrok01.png)__