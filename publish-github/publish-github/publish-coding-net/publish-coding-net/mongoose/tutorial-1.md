## Mongoose 学习笔记一

---

Mongoose是在node.js异步环境下对mongodb进行便捷操作的优雅的对象模型工具。提供了直接的基于Schema的将应用数据模型化的解决方案。

### 连接数据库 

* #### uri

要对mongodb数据库进行相关操作,比如查询,新增,删除,更新,首先你需要通过一定的方式连接上数据库。mongoose 提供 connect 方法用来连接数据库实例。

> 方式一: ``mongoose.connect('mongodb://username:password@host:port/database?options...');`` </br>
> 方式二: ``mongoose.connect(uri,options)``

如我们想通过这种方法来连接运行在本地端口为默认端口(27017)的数据库实例的话,代码如下:

```javascript
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
```
通过上面的代码,我们连接到了本地test数据库,然后可以通过如下方法来判断数据库连接是否成功。

```javascript
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});
```
* #### options

在连接数据库的时候可以提供选项参数,这些选项参数最终都会被传给底层数据库驱动,通过参数形式传的选项,优先级高于uri中的参数。
如设置连接池大小和重连次数可以按照如下方式:

```javascript
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test',{
    server : {
        poolSize : 20, // 默认为5
        reconnectTries: Number.MAX_VALUE // 无限重连的节奏
    }
});
```

* #### callback

mongoose 提供的connect方法接受callback参数作为连接数据库的回调,整个方法返回promise。对于回调两种写法如下:

```javascript
mongoose.connect(uri, options, function(error) {
  // Check error in initial connection. There is no 2nd param to the callback.
});

// Or using promises
mongoose.connect(uri, options).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
  err => { /** handle initial connection error }
);
```

* #### 更多内容参考
1. [Connection String URI Format](https://docs.mongodb.com/manual/reference/connection-string/)
2. [mongoose Connections](http://mongoosejs.com/docs/connections.html)


## mongoose Schema & Model

* #### Schema 
在 mongoose 中,所有事都从 Schema 开始,Schema 是对 mongodb 数据库集合中的文档结构的一种映射,可以是文档的全部或者部分。Schema 不仅定义了文档结构和使用性能，还可以有扩展插件、实例方法、静态方法、复合索引、文档生命周期钩子,Schema可以定义插件，并且插件具有良好的可拔插性,Schema 不具备对数据库进行操作的能力,简单的说 Schema 就是描述集合中数据而存在的。mongoose 中通过如下方法创建Schema。

```javascript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
  title:  String,
  author: String,
  body:   String,
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
});
```

定义Schema相当于关系型数据库定义表结构一样。也有对应字段的类型,默认值,最大最小值等。更多类型内容参考[SchemaTypes](http://mongoosejs.com/docs/schematypes.html)

* #### Model

Model 由Schema创建具有抽象属性和行为的数据库操作对象。模型的实例代表着文档,可以保存或者从数据库中取出。读到这大家可能会有一个疑惑,Model怎么和mongodb中的collection名称对应起来呢,例如你通过``mongoose.model('User',new Schema({ name: String }))``,创建一个model对象,那么这个对象对应的是数据库中哪个collection呢,很多人可能会猜是 user, 但是实际上却是 users,``mongoose.model``规定,当你在创建 Model 对象的时候没有提供collection 参数,那么他就会将 Model 的名称小写并复数化作为 mongodb 数据库中对应的 collection 的名称。参考[Mongoose#model](http://mongoosejs.com/docs/api.html#utils_exports.toCollectionName)

> When no collection argument is passed, Mongoose produces a collection name by passing the model name to the utils.toCollectionName method. This method pluralizes the name. If you don't like this behavior, either pass a collection name or set your schemas collection name option.

可以通过如下方式自定义 collection 名称

```javascript
//方式一: 通过创建schema的时候定义
var schema = new Schema({ name: String }, { collection: 'actor' });

// or
//方式一: 通过创建schema的set方法进行定义
schema.set('collection', 'actor');

// or
//方式三: 通过在创建Model对象时指定第三个参数定义
var collectionName = 'actor'
var M = mongoose.model('Actor', schema, collectionName)
```


创建完Model对象后,就可以通过他进行数据库操作了,如保存一个文档(为Model对象的实例),如下:

```javascript
var schema = new mongoose.Schema({ name: 'string', size: 'string' });
var Tank = mongoose.model('Tank', schema);
var small = new Tank({ size: 'small' });
small.save(function (err) {
  if (err) return handleError(err);
  // saved!
})

// or

Tank.create({ size: 'small' }, function (err, small) {
  if (err) return handleError(err);
  // saved!
})
```

更多关于Model的内容参考[Models](http://mongoosejs.com/docs/models.html)



### 总结
在NodeJS中和mongodb打交道时,需要一个好用的数据库驱动,那么Mongoose是不错的选择,通过上面的学习了解,我们现在可以通过Mongoose,将文档插入和保存到数据库中,那么具体如何查询获得我们想要的数据集合,则需要接下来学习 Mongoose 的 queries 部分。

### 参考资料

1. [Mongoose 官方文档](http://mongoosejs.com/docs/guide.html)
2. [Mongoose学习参考文档——基础篇](https://cnodejs.org/topic/504b4924e2b84515770103dd)