vsearcher
=========
### VSearcher is a new project about dom elements!

### VSearcher是一个有关于dom元素的项目。
     一个优秀的功能必然是一点一滴做起来的，所以，本项目在运行的过程中，必然存在这样或者那样的问题，在功能完善之前，在性能方便必然没有考虑到太多，所以，如果有这样或者那样的优化或者修改建议，欢迎提交~~~

从名字就可以看出，这个项目是有关查询功能。

###  下面先介绍一下该项目目前支持的查询功能组:

     1.支持单层次id,class,tagName查询

     2.支持多层次id,class,tagName查询

     3.支持部分结构筛选器(eq,gt,lt,first(first-child),last(last-child),parent,next,prev)

     4.支持部分二级属性筛选器(checked,selected,disabled)

     5.同级元素筛选(>,+)

     6.实现了同级别不同元素分别筛选(,)

     7.实现了定值属性筛选(例如:input[type=checkbox])
     
     8.实现了定值非属性筛选(例如:input[type^=checkbox])

###  上面每条查询功能组的举例: 
     1. VSearcher(".container")|VSearcher("#body")|VSearcher("div")

     2. VSearcher("#body #navGroup li.active")

     3. VSearcher("#body #navGroup li:eq(0) a")

     4. VSearcher("#body option:selected")|VSearcher("input:checked")

     5. VSearcher("#body li.active>a")

     6. VSearcher("li,div")

     7. VSearcher("li.active:next , input[type=checkbox]:first")
     
     8. VSearcher("input[type^=checkbox]")

###  下面列举一个比较"变态"的查询条件: 
     VSearcher("#body li:nth-child(1),li.active,li:first,li:last,li:eq(2),li:gt(0),input[type=checkbox],input[id=checkbox],li[class=active]>a,input[type=text]:eq(0),li.active:parent,li:next,li:prev,option:selected,li:gt(3)");
