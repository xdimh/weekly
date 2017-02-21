## base64的编码和解码

base64编码在各种编码中应该算是比较简单的一种了,在前端中很多地方有被应用到,小图片base64后内联,与客户端交互的jsBridge中数据的base64编码传输,小程序中字体图标base64后内联等等。这次在项目中用到了base64的编码和解码,网上搜了一把有很多base64操作的js实现,之前一直对base64编码半知半解,看着代码中的各种位操作也是云里雾里,所以借这次项目机会稍微深入的了解了下base64这个东西。


### 什么是base64编码?
对于base64 我们首先需要先看下ASCII编码,想必大家都知道在计算机内部所有的信息数据都表现为二进制的形式,就是那些0101数字串,每一个二进制位(bit)有0和1两种状态，因此八个二进制位就可以组合出256种状态，这被称为一个字节(byte)。也就是说，一个字节一共可以用来表示256种不同的状态，每一个状态对应一个符号，就是256个符号，从0000000到1111111。ASCII码就是用后7位二进制表示了128个字符,这对英语来说是够用了,所需要的字母都能在这后7位中表现出来。那么base64编码的规则又是什么,base64就是选出64个字符作为一个基本的字符集,然后在将其他文字符号都转换成这个字符集中的字符以予表示。这64个字符分别是``a-z``,``A-Z`` ,``0-9``,符号``+``、``-``,除了前面几位还有``=``占位符,不属于所表示的内容。

### 字符base64编码的几个步骤
> 1. 将待转换的字符串用二进制的形式表示出来。<br/>
> 2. 然后每三个字节一组,也就是24个二进制位分成一组。
> 3. 再将这24个二进制位分成6组,每四个一组,每组6位二进制位。
> 4. 在每一组最前面添加两个00补全成八位,使得24位变成32位刚好凑成4个字节。
> 5. 然后计算每个字节所表示的数值(10进制),根据下表查表拼装转换后的字符形成最后base64字符。

|    数值    | 符号   | 数值 | 符号 | 数值 | 符号 | 数值 | 符号 |
|:---------:|:-----:|:-----:| :-----:|:-----:| :-----:|:-----:| :-----:|
| 0 | A | 17 | R | 34 | i | 51 | z |
| 1 | B | 18 | S | 35 | j | 52 | 0 |
| 2 | C | 18 | T | 36 | k | 53 | 1 |
| 3 | D | 20 | U | 37 | l | 54 | 2 |
| 4 | E | 21 | V | 38 | m | 55 | 3 |
| 5 | F | 22 | W | 39 | n | 56 | 4 |
| 6 | G | 23 | X | 40 | o | 57 | 5 |
| 7 | H | 24 | Y | 41 | p | 58 | 6 |
| 8 | I | 25 | Z | 42 | q | 59 | 7 |
| 9 | J | 26 | a | 43 | r | 60 | 8 |
| 10| K | 27 | b | 44 | s | 61 | 9 |
| 11| L | 28 | c | 45 | t | 62 | + |
| 12| M | 29 | d | 46 | u | 63 | / |
| 13| N | 30 | e | 47 | v |    |   |
| 14| O | 31 | f | 48 | w |    |   |　　
| 15| P | 32 | g | 49 | x |    |   |
| 16| Q | 33 | h | 50 | y |    |   |

在转换的过程中可以发现,并不是所有的带转换字符串最后表示的二进制串所含的字节数都是3的倍数。所以针对这些不到3个字节的情况,会有相应的处理方式。
1. 最后剩两个字节的情况
    > 分成三组,前两组最前面加``00``组成两个字节,后面剩下的4位最前面加两个0,最后面加两个0,组成一个字节,最后补上一个``=``构成四个字节。
2. 最后只剩一个字节的情况
    > 分成两组,第一组6位最前面添加两位0,后面还剩2位,在最前面添加两个0,然后在最后面添加四个0构成两个字节,补上两个``=``,构成四个字节。(为什么前面要补两个00,这样计算二进制一个字节所表示的数值才能一一映射到64个字符中)

### Unicode
> Unicode（中文：万国码、国际码、统一码、单一码）是计算机科学领域里的一项业界标准。它对世界上大部分的文字系统进行了整理、编码，使得电脑可以用更为简单的方式来呈现和处理文字。但并没有规定具体在计算机中的存储方式。Unicode的实现方式不同于编码方式。一个字符的Unicode编码是确定的。但是在实际传输过程中，由于不同系统平台的设计不一定一致，以及出于节省空间的目的，对Unicode编码的实现方式有所不同。Unicode的实现方式称为Unicode转换格式（Unicode Transformation Format，简称为UTF）。

UTF-8就是其中的一种实现方式。后面会讲Unicode的编码方式如何转换成UTF-8实现方式的。Unicode有17个code plane,其中0x0000 ~ 0xffff 称为基本多语言平面,0x10000 ~ 0x10ffff 16个为辅助平面。其中基本多语言平面已经涵盖了大部分常用字，如大部分的汉字,所以只需要对这个范围进行处理已经够用。[参考Unicode字符平面映射](https://zh.wikipedia.org/wiki/Unicode%E5%AD%97%E7%AC%A6%E5%B9%B3%E9%9D%A2%E6%98%A0%E5%B0%84)

### UTF-8 和 Unicode之间的转换关系 
首先,UTF-8是一种针对Unicode的可变长度字符编码，也是一种前缀码。它可以用来表示Unicode标准中的任何字符，且其编码中的第一个字节仍与ASCII兼容，这使得原来处理ASCII字符的软件无须或只须做少部分修改，即可继续使用。因此，它逐渐成为电子邮件、网页及其他存储或发送文字的应用中，优先采用的编码,是在互联网上使用最广的一种Unicode的实现方式。特点就是一种变长的编码方式,可以使用1~4个字节表示一个符号，根据不同的符号而变化字节长度。
> 1. 128个US-ASCII字符只需一个字节编码（Unicode范围由U+0000至U+007F）。
> 2. 带有附加符号的拉丁文、希腊文、西里尔字母、亚美尼亚语、希伯来文、阿拉伯文、叙利亚文及它拿字母则需要两个字节编码（Unicode范围由U+0080至U+07FF）。
> 3. 其他基本多文种平面（BMP）中的字符（这包含了大部分常用字，如大部分的汉字）使用三个字节编码（Unicode范围由U+0800至U+FFFF）。
> 4. 其他极少使用的Unicode 辅助平面的字符使用四字节编码

具体的转换对应关系如下表:

| code point | UTF-8字节流 | 
|:---------:|---------:|
| U+00000000 – U+0000007F | 0xxxxxxx |
| U+00000080 – U+000007FF | 110xxxxx 10xxxxxx |
| U+00000800 – U+0000FFFF | 1110xxxx 10xxxxxx 10xxxxxx |
| U+00010000 – U+001FFFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx |

由上表可见,转换后的字节数由第一个字节二进制串从左到右1的位数决定,``0``表示一个字节,``110``表示两个字节,``1110``对应三个字节,``11110``四个字节,后续字节都以``10``开始。根据这个规律我们就可以在代码实现上进行对Unicode和UTF-8之间进行转换。

### JavaScript内部使用的编码方式
> JavaScript 引擎内部是自由的使用 UCS-2 或者 UTF-16。大多数引擎使用的是 UTF-16，无论它们使用什么方式实现，它只是一个具体的实现，这不会影响到语言的特性。然后对于 ECMAScript/JavaScript 语言本身，实现的效果是通过 UCS-2，而非 UTF-16。[参考:JavaScript 的内部字符编码是 UCS-2 还是 UTF-16](https://www.w3ctech.com/topic/1869)

所以对于JavaScript,无论是UCS-2还是UTF-16都是一样,采用的是两个字节来存储字符。

>ECMAScript source text is represented as a sequence of characters in the Unicode character encoding,version 3.0 or later. ... ... ECMAScript source text is assumed to be a sequence of 16-bit code units for the purposes of this specification. Such a source text may include sequences of 16-bit code units that are not valid UTF-16 character encodings. If an actual source text is encoded in a form other than 16-bit code units it must be processed as if it was first converted to UTF-16. [参考:ECMA-262 5.1 Edition](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf)

为了在加密解密中文字符不出现乱码,所以需要在将中文字符编码成``base64``之前,先将``UCS-2/UTF-16`` 转换成 ``UTF-8`` (这里只考虑中文字符是UTF-8的情况),然后再应用``base64``编码规则进行编码得到最终结果。同样在解码的时候需要按照``base64``编码规则反向操作转成``UTF-8``格式,然后再将UTF-8转回成``UCS-2/UTF-16``。

### UTF-8 和 JavaScript 内部编码互相转换实现。
首先,了解JavaScript中几个方法``String.charCodeAt``,``String.fromCharCode()``,``Number.prototype.toString``。
* [String.charCodeAt](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt)
  > charCodeAt() 方法返回0到65535之间的整数，表示给定索引处的UTF-16代码单元 (在 Unicode 编码单元表示一个单一的 UTF-16 编码单元的情况下，UTF-16 编码单元匹配 Unicode 编码单元。但在——例如 Unicode 编码单元 > 0x10000 的这种——不能被一个 UTF-16 编码单元单独表示的情况下，只能匹配 Unicode 代理对的第一个编码单元) 。如果你想要整个代码点的值，使用 codePointAt()。
  ```javascript
  '中'.charCodeAt(0);
  20013
  ```
* [String.fromCharCode](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode)
  > charCodeAt的反向操作
  ```javascript
  String.fromCharCode(20013);
  "中"
  ```
* [Number.prototype.toString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString)
  > 将十进制码点转换成2进制。
  ```javascript
  var code = 20013;
  code.toString(2);
  "100111000101101"
  ```
互相转换源代码如下:
* UTF-16 -> UTF-8
  ```javascript
  const Base64 = {
      ...,
       _utf8_encode: function(str) {
          // 将换行符统一成\n
          str = str.replace(/\r\n/g, "\n");
          let out = "";
          for (var n = 0; n < str.length; n++) {
            let unicode = str.charCodeAt(n);
            if ((unicode >= 0x0001) && (unicode <= 0x007f)) {
              //在这个范围内的是ASCII字符,只需一个字节。
              out += str.charAt(n);
            } else if (unicode > 0x07ff) {
              //将16位unicode前四位和1110xxxx 进行拼接
              out += String.fromCharCode(0xe0 | ((unicode >> 12) & 0x0f));
              //将接下来的6位和10xxxxxx进行拼接
              out += String.fromCharCode(0x80 | ((unicode >>  6) & 0x3f));
              //将接下来的6位和10xxxxxx进行拼接
              out += String.fromCharCode(0x80 | ((unicode >>  0) & 0x3f));
            } else {
              //将16位unicode前5位和110xxxxx 进行拼接
              out += String.fromCharCode(0xc0 | ((unicode >>  6) & 0x1f));
              //将接下来的6位和10xxxxxx进行拼接
              out += String.fromCharCode(0x80 | ((unicode >>  0) & 0x3f));
            }
          }
          return out;
        },
      ...
  }
  ```
* UTF8 -> UTF-16
  ```javascript
  const Base64 = {
    ...,
     _utf8_decode: function(str) {
        let out = "",n = 0, c1,c2,c3;
        c1 = c2 = c3 = 0;
        while (n < str.length) {
          c1 = str.charCodeAt(n);
          if (c1 < 0x80) {
            //编码为0xxxxxxx 表示utf8 一个字节
            out += String.fromCharCode(c1);
            n++
          } else if (c1 > 0xc0 && c1 < 0xe0) {
            //编码为110xxxxx 10xxxxxx 表示2个字节
            c2 = str.charCodeAt(n + 1);
            out += String.fromCharCode((c1 & 0x1f) << 6 | c2 & 0x3f);
            n += 2
          } else {
            //编码为1110xxxx 10xxxxxx 0xxxxxxx 表示utf8 三个字节
            c2 = str.charCodeAt(n + 1);
            c3 = str.charCodeAt(n + 2);
            out += String.fromCharCode((c1 & 0x0f) << 12 | (c2 & 0x3f) << 6 | c3 & 0x3f);
            n += 3
          }
        }
        return out
      },
    ...
  }
  ```
  
### base64编码和解码的实现
* base64编码 
  ```javascript
  const Base64 = {
    ...,
    //base64 所用的64个字符和其中的一个补位符'='
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(str) {
      //base64转换算法就是根据具体的规则将3个字符变成四个字符。
      let out = "",c1,c2,c3,
        outC1,outC2,outC3,outC4,i = 0;
      str = Base64._utf8_encode(str); //将utf16 转换成utf8,因为JavaScript内部采用的是utf16存储所以要进行一步转换。
      while (i < str.length) {
        // 三个三个字符一组进行转换
        c1 = str.charCodeAt(i++);
        c2 = str.charCodeAt(i++);
        c3 = str.charCodeAt(i++);
        outC1 = c1 >> 2; //第一个字符最前面添加两个0,剩余2位用作后面拼接
        outC2 = (c1 & 0x03) << 4 | c2 >> 4; // 第一个字符剩下两位和第二个字符前四位拼接,并在前面添加2个0拼成一个字符
        outC3 = (c2 & 0x0f) << 2 | c3 >> 6; //第二个字符剩余4位和第三个字符的前两位,并在前面添加2个0拼接成一个字符
        outC4 = c3 & 0x3f; //第三个字符剩下的6位前面添加两个0 拼接成一个字符
        //如果c2为不存在则最后两个字符为补位符'=' 如果c3不存在 则转换后最后一位为补位'='
        if (isNaN(c2)) { outC3 = outC4 = 64 } else if (isNaN(c3)) { outC4 = 64 }
        out = out + this._keyStr.charAt(outC1) + this._keyStr.charAt(outC2) + this._keyStr.charAt(outC3) + this._keyStr.charAt(outC4)
      }
      return out
    },
    ...
  }
  ```
* base64 解码
  ```javascript
  const Base64 = {
      ...,
      decode: function(str) {
          let out = '',c1,c2,c3,c4,outC1,outC2,outC3,i = 0;
          //去掉非base64字符
          str = str.replace(/[^A-Za-z0-9+/=]/g, "");
          //循环处理进行解码
          while (i < str.length) {
            //4个base64字符一组,解码后将转换成3个字符
            c1 = this._keyStr.indexOf(str.charAt(i++));
            c2 = this._keyStr.indexOf(str.charAt(i++));
            c3 = this._keyStr.indexOf(str.charAt(i++));
            c4 = this._keyStr.indexOf(str.charAt(i++));
            //每个字符前面都会有两个前导0
            outC1 = c1 << 2 | c2 >> 4; //第一个base64字符去掉两个0后和第二个字符的开头两个字符拼成一个字节
            outC2 = (c2 & 0x0f) << 4 | c3 >> 2; //第二个剩下的4位和第三个开始的四位拼成一个字节
            outC3 = (c3 & 0x03) << 6 | c4; // 第三个剩下的2位和第四个6位拼成一个字节
            out = out + String.fromCharCode(outC1);
            //如果倒数第二个不是补位符'='
            if (c3 != 64) { out = out + String.fromCharCode(outC2) }
            //如果倒数第一个不是补位符'='
            if (c4 != 64) { out = out + String.fromCharCode(outC3) }
          }
          out = Base64._utf8_decode(out); // 将utf8转成utf16
          return out
        },
      ...
  }
  ```
  
### [完整代码](https://github.com/xdimh/jsTools/blob/master/base64_with_comment.js)

### 参考资料

1. [维基百科UTF-8](https://zh.wikipedia.org/wiki/UTF-8)
2. [维基百科Unicode](https://zh.wikipedia.org/wiki/Unicode)
3. [字符编码笔记：ASCII，Unicode和UTF-8 —— 阮一峰](http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html)
4. [Base64笔记 —— 阮一峰](http://www.ruanyifeng.com/blog/2008/06/base64.html)
5. [Unicode与JavaScript详解 —— 阮一峰](http://www.ruanyifeng.com/blog/2014/12/unicode.html)
6. [Unicode编码及其实现：UTF-16、UTF-8，and more](http://blog.csdn.net/thl789/article/details/7506133)
7. [通过javascript进行UTF-8编码](https://segmentfault.com/a/1190000005794963)