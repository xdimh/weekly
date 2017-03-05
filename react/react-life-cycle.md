## React 的生命周期

对于React的生命周期,只要知道在整个生命周期里,有的生命周期函数只调用一次,有的在每次数据更新的时候会被反复调用。如下图:

![react-life-cycle](http://rainypin.qiniudn.com/git_imgs/react-life-cycle.png)

### React 生命周期的三个阶段

#### 1. 组件初始化
初始化阶段执行的生命周期函数(除了render)在整个生命周期中只会被执行一次。
* ``getDefaultProps`` 
    > 设置组件的初始属性,ES6写法和这里的ES5写法有所区别:
    
     ```
       static defaultProps = {
         defaultTxt : 'AA'
       };
     ```
    
* ``getInitialState``
    > 设置组件的初始状态,ES6写法和这里的ES5写法有所区别,是在ES6类的构造器中进行初始化:
    
    ```
     constructor(props) {
        super(props);
        this.state = {
          state1 : 'xxx'
        };
      }
    ```
    
* ``componentWillMount``
    > 组件即将被挂载前执行的生命周期函数,在这个函数里是组件挂载之前修改组件状态的最后机会。这个函数只会在第一次初始化的时候才会被执行到,后续组件存在期,组件状态的变更将不再被执行。
* ``render``
    > 将React Elements 渲染进DOM,整个生命周期被执行最多的函数,渲染的时候采用的是最小化增量更新,所以理论上React 会有不错的性能。
* ``componentDidMount``
    > React 组件以及成功挂载到DOM中的hooks函数。在这个函数内可以对组件进行DOM操作,在初始化阶段,只有在这个方法内才能够通过``this.refs.elementId``读取到组件的DOM节点。 
    
### 2. 组件存在期

组件的存在期,应该是整个生命周期中最长的一个阶段,也是组件响应用户的行为的一个阶段。

* ``componentWillReceiveProps(nextProps)``

    > 组件在存在期接受的父组件提供的属性发生变化,或者调用了setProps修改组件属性的时候将会被调用,开始一个组件更新的cycle。
    
* ``shouldComponentUpdate(nextProps,nextState)``

    > 这个生命周期方法只会在存在期阶段被调用,当组件的属性发生变化(父组件下发的属性改变,setProps被调用),组件的状态发生改变(setState被调用)该方法就会在一个cycle中被执行到且只有当该方法返回true,cycle中后续的函数才有机会被执行,不然后续函数将不会被执行,所以这个函数常常作为React性能优化的地方,省去不必要的渲染更新。

* ``componentWillUpdate(nextProps,nextState)``

    > 组件更新之前会被执行的函数。
* ``render``

    > 同初始阶段,但在componentWillUpdate之后componentDidUpdate之前执行。
    
* ``componentDidUpdate(prevProps,prevState)``

    > 组件成功更新后的hooks函数。当组件更新完成会被调用。
    
### 3. 组件销毁&清理 

当切换页面,或者切换组件的时候,组件就会被销毁,这个时候,往往需要对组件进行一些清理操作,释放一些资源。
* componentWillUnmount 

  > 这个方法用来在组件销毁前做一些清理,释放占用资源,解除事件绑定等操作。整个生命周期会被执行一次。
