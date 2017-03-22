## Redux 之我见

　　一个单页应用,最重要的在于应用的数据管理,状态维护,还有页面的路由管理。Redux作为一个JavaScript应用的可预测状态容器,不仅仅给你很爽的编程体验,而且让你写的应用在不同平台上有很好的一致性。

　　到目前为止,在两个项目中用到了Redux,一次是结合react框架,一次是结合网易的regular框架。对于一个比较复杂的系统,在开发之前我们往往会进行组件的划分,从顶层组件到底层的子组件,从容器组件到展示组件。在没有引进Redux之前,我们往往需要自己去维护整个系统的状态的管理,状态的一致性。一般我们会将子组件状态的变更通过emit事件到上层组件,然后再由上层组件emit事件告知顶层根组件,然后顶层根组件接收到事件和数据,变更状态,然后将新的状态数据一层一层的下发下去。如下图:

![没有引入redux之前](http://rainypin.qiniudn.com/git_imgs/no-redux.png)

这样会造成顶层更组件逻辑随着应用系统的逐渐复杂变成越来越庞大,即使对顶层逻辑进行拆分,整个系统的状态State的管理也不会很轻松,且组件直接的通信都需要通过事件的方式告知共同的父组件才能进行,随着系统的复杂度的提高,将会导致代码变得杂乱难以维护和扩展。所以Redux恰到好处的出现,作为整个系统状态State的管家,使得你可以专心的去关注业务逻辑代码,省去了很多状态管理上耗费的精力,使得代码也变得更清晰更容易扩展和维护。引入Redux之后的组件关系图如下:

![引入Redux之后](http://rainypin.qiniudn.com/git_imgs/with-redux.png)

底层组件状态变更或者与其他组件交互的时候不再需要一层一层的往上抛出事件,然后由上层组件去管理了,而是通过Redux,通过dispatch一个action给Redux,然后Redux进行相应的处理,告知顶层组件有部分状态已经发生变化,然后顶层组件告知相应的子组件进行状态变更,渲染页面。这样,你的状态处理的逻辑不再维护在顶层组件里,而且Redux可以很方便的看到action处理前的状态和action处理后的状态,一旦逻辑出现问题,可以很快的进行定位。同时组件的交互不再是杂乱无章的,而是通过Redux,再由顶层组件下发数据变更,使得数据交互变得更单一更清晰。

### 那么Redux内部用了什么黑科技?

　　Redux本身很简单,我们的应用系统的整个状态一般会表示成一个对象,对象中存放了应用系统的各个状态,而Redux就替我们接管了这个对象,管理着这个对象的变更。在Redux中,我们只能通过dispatch action来变更这个State对象,然后Redux会有相应的叫Reducer的函数去处理这个action,这个函数接受两个参数,当前State对象,和action对象,然后进行相应的处理返回新的State。Redux再把State的变更告诉整个应用,此时应用再去进行相应变更的渲染。那么这里提到的action,Reducer是什么? action 和 Reducer又是怎样对应起来的? Redux又是怎么样将整个应用状态数据变更告知应用的?

1. 黑科技之action
 
    Redux的三大原则其中之一就是:唯一改变State的方式是dispatch action。什么是action,action其实就是对发生的事情的一个描述对象。比如一次用户按钮点击,一次ajax请求,请求数据的返回等等这些在Redux中都可以用一个唯一对应的action去描述他们。在这个对象中必须包含一个key为type的字段,值为字符串常量,代表这个action的类型。这是用于后面Reducer处理的时候区分action的关键字段。比如这里的按钮点击,我们的action的type值可以是``XXX_BUTTON_CLICK``。因为是字符串常量,所以这里用大写进行区分。除了type字段之外,你还想在action中添加什么字段完全取决你自己,一般情况下我们有可能会带上需要传给Reducer的数据信息。所以完整的action可能会像下面一样:
   
   ```javascript
      //action 示例
      {
          type : "XXX_BUTTON_CLICK",
          payload : {
             data1 : "data1"
             ...
          }
      }
   ```
   
2. 黑科技之action creator 

   顾名思义,action creator即那些仅仅用来创建并返回action对象的函数。这些函数很简单,只做一件事情,所以很方便测试。如上action,我们就可以有一个action creator来生成并返回上面的``XXX_BUTTON_CLICK`` action,如下:
   
   ```javascript
    function xxxButtonClick() {
       return {
           type : 'XXX_BUTTON_CLICK',
           payload : {
               "data1" : "data1",
                ...
           }
       }
    }
   ```
   
3. 黑科技之Reducer

   前面的action定义并描述了发生的事件,但是并没有指定对应的处理方法,那么这里的Reducer就是用来处理action所描述的事件的函数。该函数接受两个参数,分别是previous state 和 action。然后返回新的state。之所以称为Reducer,主要是因为这个函数的行为和数组原型中的reduce方法很像,``Array.prototype.reduce()``。在应用最开始的时候,Redux在没有初始state的时候,就会给state赋值undefined,为了避免这种情况,所以在Reducer的时候应该设置一个初始化状态。如下:
   
   ```javascript
   function xxxButtonClickReducer(state = initialState,action) {
       // todo something
       return newState;   
    }
   ```
  
   在实践过程中,我们发现整个系统的State会变得比较大,而每一个Reducer需要关注的状态并不是全部的State,可能是其中的某一个状态数据,所以如果每次都将全部State传给只关注部分状态数据的Reducer,就会导致这个Reducer的处理逻辑变得复杂,你不得不在这个Reducer中通过action的type来处理特定的数据,这样就导致``switch case``变得冗长。所以Redux提供了一种拆分Reducer的方式,让某个Reducer只关注他需要关注的状态数据。最后在通过Redux的 combineReducers,将多个拆分的Reducers合成一个rootReducer,这个rootReducer会返回所有全部的state状态数据。代码如下:
  
   ```javascript
      function visibilityFilter(state = 'SHOW_ALL', action) {
        switch (action.type) {
          case 'SET_VISIBILITY_FILTER':
            return action.filter
          default:
            return state
        }
      }
      
      function todos(state = [], action) {
        switch (action.type) {
          case 'ADD_TODO':
            return [
              ...state,
              {
                text: action.text,
                completed: false
              }
            ]
          case 'COMPLETE_TODO':
            return state.map((todo, index) => {
              if (index === action.index) {
                return Object.assign({}, todo, {
                  completed: true
                })
              }
              return todo
            })
          default:
            return state
        }
      }
      
      import { combineReducers, createStore } from 'redux'
      let reducer = combineReducers({ visibilityFilter, todos })
      let store = createStore(reducer)
   ```

    在了解action 和 处理action的Reducer之后,我们来看下Redux是怎么将这两者结合起来的。

4. 黑科技之Store
 
   Redux的三大原则之一的第一个原则说的就是:单一数据源原则,整个应用的数据状态将被Redux的一个Store维护着。Store主要有以下功能:
   * 管理着整个应用的状态
   * 允许我们通过``getState()``来访问整个应用的状态
   * 允许我们通过``dispatch(action)``来更新应用的状态。
   * 注册应用状态变更事件监听函数``subscribe(listener)``。
   * 解绑状态变更事件监听函数,通过使用``subscribe(listener)``的返回值。
   
    我们通过调用Redux提供的``createStore``方法来创建一个``store`` 对象,第一个参数为``rootReducer``,第二个参数可以是``initialState``。``store`` 对象提供了几个方法,分别是``dispatch``,``subscribe``,用来让我们能够将 ``action`` 和 ``Reducer`` 关联在一起,将整个 ``store`` 维护的 ``state`` 的变更告知整个系统应用。通过调用``store.dispatch(action)``可以让对应的 ``Reducer`` 进行处理,从而响应action描述的事件,完成应用状态的变更。再通过``store.subscribe(fn)``在fn回调函数中通过``store.getState()``获取到变更后的应用状态``state``,然后从应用的顶层组件下发到底层的子组件更新相应的页面展示。


### 更进一步

　　在页面交互过程中存在着两种操作,同步操作和异步操作,对于同步操作页面需要等待完这个操作结束才能继续响应用户,而异步的操作页面可以继续响应用户的操作,待异步结果返回再相应的更新页面状态。那么作为描述这些事件的对象action,也存在同步和'异步',这里的异步指的是通过一个中间件,提供的类似语法糖的功能,可以让你的actionCreator返回的不是action对象而是一个function,在这个function中存在着异步操作,以及针对异步操作的每个阶段所dispatch的action。

　　我们举个栗子,对于ajax请求的操作,我们的页面往往有几种状态的变更,第一,请求发起(这个时候页面会出现loading状态,俗称转菊花),这个时候会有一个action表示开始请求事件。第二,请求成功响应,这个时候页面会获取到服务器返回的数据,更新UI,这个阶段会有一个action,描述请求成功事件,并会将成功的数据带上给Reducer处理更新相应的UI。第三,在没有第二的情况下,请求失败,这个时候的action代表的是请求失败事件,UI往往会弹出失败提示。所以在一次异步过程中,你将会进行三次dispatch。

 　　 面对一次异步操作就需要三次action,让事情变得繁琐,但Redux提供了对应的方法来解决这个问题,让你在需要异步请求的时候,只有触发封装好了三个异步请求的函数,就可以完成以上过程。如下:
 
 ```javascript
 const ImportRecordsActionCreators = {
     startLoadRecords : () => {
         return {
             type : 'START_LOAD_IMPORT_RECORDS'
         }
     },
     onRecordsLoad : (data) => {
         return {
             type : 'ON_IMPORT_RECORDS_LOAD',
             payload : data
         }
     },
     onRecordsFail : (err) => {
         return {
             type : 'ON_IMPORT_RECORDS_FAIL',
             payload : err
         }
     },
     getImportRecords : (params) => {
         params.id = '601';
         return function (dispatch) {
             dispatch(ImportRecordsActionCreators.startLoadRecords());
             $.ajax({
                 type: 'post',
                 url: '/slice/explore',
                 data: params,
                 dataType: 'json',
                 success: (data) => {
                     dispatch(ImportRecordsActionCreators.onRecordsLoad(data));
                 },
                 error: (err) => {
                     dispatch(ImportRecordsActionCreators.onRecordsFail(err))
                 }
             });
         }
     }
 };
 
 export default ImportRecordsActionCreators;
 ```
 
 为了使得store能够处理function形式的action,在创建store的过程中需要传入``redux-thunk``提供的中间件``thunkMiddleware``,对于中间件,我们后面会讲到。先来看下代码:
 
 ```javascript
 import thunkMiddleware from 'redux-thunk'
 import { createStore, applyMiddleware } from 'redux'
 import rootReducer from './reducers'
 
 const store = createStore(
   rootReducer,
   applyMiddleware(
     thunkMiddleware, // lets us dispatch() functions
   )
 )
 ```
 
 这样你的store就具备了dispatch异步action(函数)的能力。这样我们只要调用``dispatch(ImportRecordsActionCreators.getImportRecords)``就可以一次触发过程中所涉及到的action了。
 
 
 ### 中间件
 
　　中间件这个词对大家来说并不陌生,一般都是在输入和输出中间进行处理的那层插件,对于Express 和 Koa 用户来说,中间件就是请求之后和响应之前中间处理层,比如添加CORS headers, 日志记录, 压缩等。而对于Redux中间件来说,主要是一些第三方扩展,用在dispatch action之后和action 到达具体的Reducer进行处理之前的那层,用于日志记录,崩溃报告,处理异步action,路由等。Redux中间件的代码结构我们一redux-thunk为例子,代码如下:
  
  ```javascript
  //redux-thunk代码
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
  ```
 
 
Redux中间件的写法可以参考这个插件,通过一个函数创建返回如下形式的函数:

```javascript
({dispatch, getState}) => next => action => {
    //里面为这个中间件的处理逻辑
    //处理完后不要忘记将action交由下一个中间件处理
    //此时需要调用next(action)
    next(action);
}
```

### Reducer 处理逻辑拆分新思路

　　根据之前Reducer的介绍,如果系统应用的状态变得复杂,数据层次嵌套多的时候,必然需要我们去拆分Reducer的处理逻辑,让多个Reducer处理不同的,自己关心的状态数据,最后通过combineReducer进行整合。但是这也会突出新的问题,嵌套层数多的State就需要嵌套的combineReducer,可以参看[深入到源码：解读 redux 的设计思路与用法](http://div.io/topic/1309)这篇文章提出的针对复杂State的三种解决方案。这里我们提出一种新的方式,使得Reducer的逻辑能得以拆分。

　　在这种方案下我们会按业务拆分Reducer,相同业务的Reducers被拆分到一个单独的文件里,通过Map的形式代替switch case语句来组织相同业务的Reducers,其中Map的key为对应Reducer所要处理的action中的type,Map的值为对应的Reducer函数。然后我们会在一个名为``reducer.js``的文件中导入所有的Reducers,导出一个rootReducer用于创建store。如下:

* import-records-reducers.js

  ```javascript
  import {message} from 'antd';
  const immutable = require("object-path-immutable");
  
  export default {
      'START_IMPORT_RECORDS' : (state) => {
          return immutable(state).set('xxx.loading',true).value();
      },
      'ON_IMPORT_RECORDS_LOAD' : (state,payload) => {
          let immOp = immutable(state).set('xxx.loading',false);
          if(payload) {
             // todo something
          }
          return immOp.value();
      },
      'ON_IMPORT_RECORDS_FAIL' : (state,payload) => {
          return immutable(state).set('xxx.loading',false).value();
      }
  }
  ```
  
* reducer.js

  ```javascript
   import r1 from 'reducers/import-records-reducer';
   
   //初始State状态
   const initialState = {
       
   }
   
   //合并所有reducer Map
   const reducerMap = $.extend({}, r1/*, r2, r3, r4, r5, r6,r7,r8*/);
   
   //导出rootReducer
   export default function (state = initialState, action) {
       if (reducerMap[action.type]) {
           return reducerMap[action.type](state, typeof action.payload === 'undefined' ? null : action.payload);
       } else {
           return state
       }
   } 
  ```

这样我们的action也就可以根据业务进行划分到不同的文件里,这样使得代码更加便于维护和扩展。

### 最后

Redux固然好,但是我们需要根据我们自身项目的实际情况,从需要解决什么问题出发,去考虑是不是一定需要引入Redux,以及引入Redux利弊之间的权衡,以到达发挥工具所应有的作用。


### 参考资料

[Redux 官方文档](http://redux.js.org/docs/introduction/)