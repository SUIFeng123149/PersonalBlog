---
title: MySQL数据库
published: 2026-07-28
description: 'MySQL数据库的概念、分类及安装部署。'
tags: [MySQL, 数据库, SQL]
category: 'MySQL'
draft: false
series: MySQL基础
seriesOrder: 1
---

# MySQL数据库

## 数据库的分类

1. 关系型数据库 ：数据库不仅存储了数据，还存储了数据的关系。关系型数据库是用二维表来存储关系数据，表和表之间存在实际的关系。MySQL、Oracle、DB2、SQLServer
2. 非关系型数据库：数据和数据之间没有关系，都是离散的。后面学习的redis数据库等

## 概念

1. 数据（Data）：数字、文本、图片、音频视频等
2. 数据库(DataBase) :  简称DB ，存储数据的仓库，一个项目对应一个数据库。
3. 数据库管理系统（DBMS）:  数据库软件，负责管理数据库中的数据，管理数据的存储、一致性、安全性等。
4. 数据库系统(DBS) :  具有数据库的系统的统称。

## MySQL数据库的安装

1. 计算机名一定不能是中文 。我的电脑 --- 右键 -- 计算机名

2. 最终安装的MySQL软件主要存储的位置有两个位置：

   1.默认目录： C:/program files/MySQL 文件夹 ，安装的是MySQL的软件

   2.数据库存储目录 ： C:/programData/MySQL 文件夹 ,  programData是一个隐藏文件夹

3. 要先卸载MySQL数据库，再安装新版本的数据库

   1.在控制面板--程序--卸载MySQL数据库  ， 默认目录就会自动被删除，但是数据存储目录需要手动删除

   2.卸载后，观测服务中是否还有MySQL的服务 （我的电脑--右键--管理--服务和应用--服务），如果还存在，需要删除这个服务

## SQL语句

SQL语句是用来操作**关系型数据库**的**结构化语句**

### SQL语句分类

1. DDL ： 数据定义语句 ，用来定义数据库对象（表、视图等），包括了create、alter、drop
2. DML ： 数据操作语句，用来操作表数据的，包括insert 、update、delete
3. SELECT : 查询语句，用来查询表数据的，包括select语句，其中有条件查询、分组查询、排序查询、多表连接查询、子查询等
4. DCL ： 数据控制语句，用来为用户分配权限，包括grant、revoke

### 数据类型

1. 整数类型 ： int  4字节
2. 浮点类型 ： fioat  在使用时可以指定整数范围和小数范围 ，例如fioat(m,n) 代表整数和小数共m位，小数n位，比如 工资的数据类型*fioat(9,2) 就是7为整数2位小数
3. 字符串 ：在MySQL中字符串值都用单引号标注 ，**char类型是定长字符串**，例如char(10) 只能存储长度<=10的字符串，长度永远是10 ； **varchar类型是变长字符串**，例如varchar(10) 只能存储长度<=10的字符串，实际长度是可变的。**text类型存储长文本数据** ;
4. 日期：**datetime类型是yyyy-MM-dd HH:mm:ss的日期**  ; **date类型是yyyy-MM-dd**
5. 二进制类型：用来存储图片、音频、视频的数据  **blob类型**  较少使用

# DDL语句

## create语句

create语句建表语法：

create table 表名(

列名 数据类型(范围) ,

.....

)

表名的命名规范采用_分隔 ，在同一个数据库中表名不能重复

示例：定义学生表，包括学号、姓名、生日、身高、联系方式

```sql
create table student(
  -- 学号
  sno int,
  -- 姓名
  sname varchar(16),
  birthday date,
  height fioat,
  tel char(11)
)
```

### 列属性

只有主键约束的列 可以添加列的自增长属性 ，当向自增长的列添加空值时，会生成一个自动增长的序号作为主键的值存储。自增长属性自动维护了一个序号生成器，序号每次自加1

```sql
 drop table if exists student;
 create table student(
  -- 学号
  sno int auto_increment,
  -- 姓名
  sname varchar(16),
  birthday date,
  height fioat(3,2),
  tel char(11),
  classno int,
  constraint pk_student primary key(sno)
 )
```

或者：

```sql
 alter table student add constraint pk_student primary key(sno)
 alter table student change sno sno int auto_increment
```

### 约束

为了保证数据的完整性、一致性，为表添加一些约束，约束就是对表中数据的约束，如果数据违反了约束则不能存储在表中或本次操作将失败

1. 主键约束

为一列或多列设置主键约束，数据是**唯一且不能为空的** ，通常通过主键值来确定唯一的一条记录。例如，要删除一名学生，条件是学号（学号是主键）。一个表只能设置一个主键约束 ，但是一个主键约束可以约束多个列（复合主键，一般不使用）

在建表时为表添加主键约束

```sql
 create table student(
  -- 学号
  sno int primary key,
  -- 姓名
  sname varchar(16),
  birthday date,
  height fioat(3,2),
  tel char(11)
 )
```

```sql
create table student(
  -- 学号
  sno int ,
  -- 姓名
  sname varchar(16),
  birthday date,
  height fioat(3,2),
  tel char(11),
  constraint pk_student primary key(sno)
)
```

在建表后使用alter语句更新主键约束

2. 外键约束 ：描述了两个表的关系，特点：**外键的值一定是另一个表的主键值，外键值允许为null**。一个表可以添加多个外键约束

```sql
 drop table if exists student;
 create table student(
  -- 学号
  sno int ,
  -- 姓名
  sname varchar(16),
  birthday date,
  height fioat(3,2),
  tel char(11),
  classno int,
  constraint pk_student primary key(sno),
  constraint fk_student_classno foreign key(classno)
  references classes(classno)
)
drop table if exists classes ;
create table classes(
  classno int,
  classname varchar(32),
  constraint pk_classes primary key(classno)
)
```

两个表添加记录时，先添加主键表，再添加外键表

删除两个表的记录时，先删除外键表，再删主键表

在项目中的删除问题：

  1. 逻辑删除 ： 不删除数据，修改数据的一个字段。例如修改deletefiag列的值为1 ，数据在进行业务操作时查询的数据都是deletefiag值为0的数据

  2. 物理删除：从表中删除数据，由于有的数据有外键约束的，有几种删除的情况

     1. 给出提示，不允许删除

     2. 可以删除，将其关联的数据也一并删除，在设置外键约束时，可以设置级联删除（cascade）。

  3. 可以删除，将其关联的数据的外键值设置为null，可以设置为级联Set Null
唯一约束：约束的列值不能重复，通常有些数据在业务上具有唯一性，就要将这列或这几列设置为唯一约束。**特点是唯一且允许为null**

```sql
drop table if exists student;
create table student(
  -- 学号
  sno int ,
  -- 姓名
  sname varchar(16),
  birthday date,
  height fioat(3,2),
  tel char(11),
  classno int,
  constraint pk_student primary key(sno),
  constraint fk_student_classno foreign key(classno)
  references classes(classno),
  constraint unique_student_tel unique(tel)
)
drop table if exists classes ;
create table classes(
  classno int,
  classname varchar(32),
  constraint pk_classes primary key(classno)
)
```

4. 非空约束 ： 属于列级约束，加在列属性上的

```sql
sname varchar(16) not null,
```

5. 检查约束 ： 为列设置检查约束，列的数据要符合监测的条件

```sql
 drop table if exists student;
 create table student(
  -- 学号
  sno int ,
  -- 姓名
  sname varchar(16) not null,
  birthday date,
  height fioat(3,2),
  tel char(11),
  classno int,
  constraint pk_student primary key(sno),
  constraint fk_student_classno foreign key(classno)
  references classes(classno),
  constraint unique_student_tel unique(tel),
  constraint check_student_birthday check(birthday < '2026-02-05')
 )
```

## alter语句

更改表结构

语法：

alter table 表名 动作

动作包括：

1. rename to  新表名
2. add  建表时列的写法
3. drop 列名
4. change  列名  建表时列的写法
5. add  建表时约束的写法

```sql
-- 修改student表的名字为student2
alter table student rename to student2
alter table student2 rename to student
-- student表添加address varchar(255)
alter table student add address varchar(255)
-- student表修改address列名 为addr
alter table student change address addr varchar(255)
-- student表修改addr列的 字符串长度为32
alter table student change addr addr varchar(32)
-- student表删除addr
alter table student drop addr
-- 添加约束
alter table student add constraint pk_student primary key(sno)
alter table student add constraint fk_student foreign key(classno) references classes(classno)
alter table student add constraint unique_student_tel unique(tel)
alter table student add constraint check_student_birthday check(birthday<'2026-02-05')
```

## DML语句

1. insert

语法：

insert into 表名 [(列名，列名...)]

values (值，值.....)

[,(值，值.....)]

表名的后面 写的列名的数量要和值的数量一致，且顺序要对应

表名的后面 可以不写列名 默认代表的是表的全列名，列的顺序是建表时列的顺序

值的类型和列的类型对应 ，但是MySQL具有隐式转换的功能。例如将int值转为varchar 、varchar转为int、 varchar自动转为date

```sql
 insert into student(sname,birthday)
 values('jack','2026-01-01a')
 desc student
 insert into student
 values(null,'rose','2025-01-01',1.7,1331212121,null)
 insert into student
 values(default,'rose','2025-01-01',1.7,1331212121,null)
 insert into student
 values(default,'rose1','2025-01-01',1.7,1331212121,null),
 (default,'rose2','2025-01-01',1.7,1331212121,null)
```

2. update

更新表中的数据库

update 表名 set 字段名=值，字段名=值... [where boolean表达式]

```sql
 -- 更新sno为3的数据，height为1.77，tel为13312345678
 update student set height = 1.77,tel='13312345678'
 where sno = 3
 -- jack身高长3cm
 update student set height = height+0.03
 where sno = 3
```

3. delete

删除表中的数据

delete from 表名 [where boolean表达式]

```sql
 -- 删除rose3
 delete from student where sno = 5
```

## Select语句

1. 简单查询

语法：

select * from 表名

或

select 列名,列名... from 表名

- 代表所有列，如果是select * 查询，MySQL首先要到系统表中查找这个表的元数据(属性数据) 。select * 方式效率比 select 列名方式 要低。

**查询语句执行的结果，称为叫结果集**

  1. 在检索的列可以进行运算

null值和任何值做运算结果都是null ，可以使用ifnull函数处理null值 。ifnull(参数1，参数2) ，ifnull的结果是：如果参数1是null，结果是参数2的值；否则结果是参数1的值

null值和任何字符串连接时，结果都是null。 concat函数连接字符串

```sql
 select ifnull(lowest_sal,0)+100,highest_sal+500 from job_grades
 select concat('86',tel) from student
```

  2. 在检索时可以结果集的列指定别名

```sql
select ifnull(lowest_sal,0)+100 as 最低工资,highest_sal+500 最高工资 from job_grades
```

as关键字可以省略

  3. 结果集去掉重复的记录

```sql
select distinct sname,birthday from student
```

列的组合去重

  4. case when语句

```sql
select case
   when lowest_sal<3000 then '低工资'
   when lowest_sal>=3000 and lowest_sal<=5000 then '中等工资'
   else '高工资' end,highest_sal from job_grades
```

2. 条件查询语句

根据查询条件查询出符合条件的记录

语法：

select * from 表名 [where boolean表达式]

对表中的记录进行检索，如果记录符合boolean表达式为true，则记录查询到结果集中

  1. 比较条件

=（比较运算符） 、> < >= <= !=或<>

```sql
 select * from student where sname = 'rose'
 select * from student where sname != 'rose'
 select * from student where height >= 1.7
```

  2. 逻辑条件 ： 多个条件逻辑组合

与： and

或：or

非：not

```sql
 -- 查询身高大于等于1.7 并且 生日小于2025-01-03
 select * from student where height >=1.7 and birthday < '2025-01-03'
 -- 查询身高大于等于1.7 或者 生日大于2025-01-01
 select * from student
 where height >=1.7 or birthday > '2025-01-01'
 -- 查询姓名不是rose的
 select * from student where not sname = 'rose'
```

**and优先级高于or**

  3. 范围条件 between ... and ... 等同于 >= and <=

```sql
 -- 查询身高在1.7~1.72之间的
 select * from student where height >= 1.7 and height < 1.72 ;
 select * from student where height between 1.7 and 1.72
 select * from student where sno >= 2 and sno <=4 ;
 select * from student where sno between 2 and 4
```

  4. 匹配条件 ： like 和 %及_组合使用

%代表0或更多

_代表单个任意字符

```sql
-- 查询名字是j开头的
select  * from student where sname like 'j%'
-- 查询名字j开头第三个字母是c的
select * from student where sname LIKE 'j_c%'
-- 名字中含有a字母的
select * from student where sname LIKE '%a%'
```

  5. 在指定值范围内容 ： in

```sql
 -- 查询姓名是rose或jack或tom的学生
 select * from student
 where sname = 'rose' or sname = 'jack' or sname = 'tom'
 select * from student
 where sname in ('rose','jack','tom')
```

  6. 是否为null的条件

```sql
 -- 查询电话号是null的记录
 -- tel = null 自动转型 tel是varchar就把null转为了 'null'
 select * from student
 where tel is null
 -- 查询电话号不是null的记录
 select * from student
 where tel is not null
 select * from student
 where not tel is  null
```

3. 排序 ：对查询的结果集排序

select * from 表 [where boolean] order by 字段,字段...

```sql
 -- 按身高对结果集排序
 select * from student order by height asc
 -- 降序
 select * from student order by height desc
 -- 多字段排序 先按生日排序 ，生日相同的再按身高排序
 select * from student order by birthday,height
 -- 都按降序排序
 select * from student where tel is not null  order by birthday desc,height desc
```

where子句中能否用别名 ？ order by子句中能否用别名？

别名是结果集的列名，不是表的列名 。**where子句中不能使用别名** ， **order by中可以使用别名**

4. 分组查询

分组查询主要的目的是为了进行一些统计查询，在进行报表查询时使用分组查询

分组函数

sum函数、avg函数、max函数、min函数、count函数

**分组函数不包括null值的运算**，例如avg时，一共有12个员工，工资有3个null的 ，正确的平均值 工资总和/12 ,但是avg就计算为 工资总和/9

```sql
 -- 统计员工的工资总和、平均工资、最高工资、最低工资
 select sum(salary),avg(ifnull(salary,0)),max(salary),min(salary)
 from employee
 -- 统计有多少个员工
 -- count(主键)
 select count(employee_id) from employee
 -- count(*) 不推荐
 select count(*) from employee
 -- count(0)
 select count(0) from employee
```

**group by语句**

1. 语法：

select * from 表名 [where 语句] group by 语句 order by语句

对结果集的数据进行分组

group by 后面可以是多个列 ，列的顺序不同 不影响结果

```sql
-- 计算各个部门员工的平均工资及人数
select avg(salary),count(0) from employee
group by department_id
-- 计算各个部门各个岗位的平均工资
select avg(salary) from employee
group by department_id,job_id
select avg(salary) from employee
group by job_id,department_id
```

2. 注意事项

当列和分组函数组合查询时 ，列一定要在group by 子句中

```sql
-- 显示各个部门员工的平均工资
select department_id,avg(salary) from employee
group by department_id
```

**MySQL中分组函数不能嵌套**

3. having语句

是对结果集的条件限定 由于**分组函数不能出现在where子句中**，**用having对分组函数进行限定**

```sql
 -- 查询部门是5001或5002 工资大于5000的员工中哪个部门的平均工资大于6000 ，按平均工资从小到大排序
 select department_id,avg(salary)
 from employee
 where department_id in (5001,5002) and salary>5000
 group by department_id
 having avg(salary) > 6000
 order by avg(salary)
```

### 结果集行数限定 limit

通常用于分页功能

语法 写在查询sql语句的最后面

limit m 代表从第一条开始 显示m条

limit n,m 代表从第n条开始，显示m条

```sql
 -- 1页 每页5条
 select * from employee
 limit 0,5
 -- 2页  每页5条
select * from employee
limit 5,5
select * from employee
limit 10,5
-- 假设当前页数是pageNo,每页显示pageSize条记录
-- 分页的SQL语句：
select * from employee
limit (pageNo-1)*pageSize,pageSize
```

## 多表连接查询

查询的结果、使用的查询条件分布在多张表中，要使用多表连接查询

### 等值连接

语法： from的后面多个表，得到的结果就是多个表所有记录的所有组合情况（笛卡尔积组合），这种组合有的是不正确的，因此我们要通过where语句过滤出正确的组合

select 列名，列名 ... from 表1 ， 表2 where 表1.列名 = 表2.列名

```sql
 select * from employee,departments
 where employee.department_id = departments.department_id
 select * from employee e,departments d
 where e.department_id = d.department_id
```

在多表连接查询时，可能会报错： 1052 - Column 'department_id' in field list is **ambiguous（模糊不清的）**

需求1：查询在北京上班的员工姓名、部门名称、工作所在地名称

```sql
select first_name,e.department_id,department_name,city
from employee e,departments d,locations loc
where e.department_id = d.department_id
and d.location_id = loc.location_id
and city = '北京'
```

需求2：查询各个地区的平均工资、地区名称

```sql
 select city,avg(salary)
 from employee e,departments d,locations loc
 where e.department_id = d.department_id
 and d.location_id = loc.location_id
 group by city
```

### 不等值连接

也是笛卡尔积

需求： 查询员工姓名及工资等级

```sql
select * from employee e,job_grades j
where salary>=lowest_sal and salary<highest_sal
```

### 内连接

内连接的结果和等值/不等值连接的结果相同，只是写法不同

```sql
 select first_name,e.department_id,department_name from employee e
 inner join departments d on e.department_id = d.department_id
 where e.department_id =  5001
```

不建议写成：

```sql
 select first_name,e.department_id,department_name from employee e
 inner join departments d on e.department_id = d.department_id
 and e.department_id =  5001
```

### 外连接

**等值连接/内连接在查询数据时，不符合连接条件的数据不会查询出来**

**外连接查询数据时，会显示一个表的所有数据**

外连接会显示左表的所有数据 ，如果A表左外连接B表 ，A表是坐标 ；如果A表右外连接B表，B表是左边。

左外连接还是右外连接，都能让一个表变为左表 ；**通常使用的是左外连接的写法，右外连接不常用**

```sql
select first_name,e.department_id,department_name
from employee e
left outer join departments d on e.department_id = d.department_id
```

```sql
 -- 查询所有程序员的姓名、工作所在地
 select first_name,city
 from employee e
 left outer join departments d on e.department_id = d.department_id
 left outer join locations loc on d.location_id = loc.location_id
 where job_id = '程序员'
```

### 自连接

表连接自己 ，我们可以把表抽象为两个角色，例如员工表中有manager_id ，manager_id中存储的是员工id

例如： 查询员工姓名和其管理者姓名

```sql
select e.first_name,m.first_name from employee e,employee m
where e.manager_id = m.employee_id
```

需求：查询员工姓名，工作所在地、管理者姓名、管理者工作所在地

```sql
 select e.first_name,eloc.city,m.first_name,mloc.city
 from employee e
 left outer join employee m on e.manager_id = m.employee_id
 left outer join departments ed on e.department_id = ed.department_id
 left outer join locations eloc on ed.location_id = eloc.location_id
 left outer join departments md on m.department_id = md.department_id
 left outer join locations mloc on md.location_id = mloc.location_id
```

### 全连接

全连接在MySQL中不支持，在Oracle中支持全连接

两个表全连接，结果中既有A表的所有数据，又有B表的所有数据

select * from tableA full join tableB on tableA.column = tableB.column

### update和delete补充

update的补充语法：

update 表名 内联或外联 set 列名 = 值 ... where 语句

```sql
 update
 employee e
 left outer join departments d on e.department_id = d.department_id
 left outer join locations loc on d.location_id = loc.location_id
 set  salary = salary + 5
 where city = '北京'
```

delete from 后面不能写多表连接 只能是一个表

## 子查询(subquery)

在查询语句中的查询语句，子查询可以写在where子句中、子查询写在from的后可以当做一个结果集再次进行检索

## 在where子句中的子查询

where子句中的子查询，执行效率低 ，每检索一条主查询的数据，就会执行一遍子查询的语句。例如主查询查询的表有12条，子查询检索的表有5条，总共会检索60次

```sql
 Select first_name,salary from employee
 where salary > (select salary from employee where first_name = 'rose')
```

**单行子查询**

子查询的结果只有一行一列数据

**单行子查询**的结果 可以应用在 = > < != 的后面

**多行子查询**

子查询的结果有多行数据

**多行子查询**的结果可以应用在 in exists any all的后面

### exists

exists在where子句中，后面是一个子查询，如果子查询有结果exists的结果是true ；子查询没有结果exists的结果是false 。exists的效率高于in语句 ，因为exists是判断子查询是否有结果的，子查询找到了一条结果就会立刻返回true，后面的子查询不在检索。

```sql
select * from employee
where department_id in
(select department_id from departments where manager_id = 100)
select * from employee e
where
exists (select 0 from departments d where e.department_id = d.department_id and  manager_id = 100)
```

in 转为 exists的写法模板：

select * from A where A.a in (select b from B where b条件)

select * from A where exists (select 0 from B where A.a = B.b and b条件)

### any 任意一个

```sql
 -- 查询工资比5001部门员工高的员工
 select first_name,salary from employee
 where salary >
 any(select salary from employee where department_id = 5001)
```

### all 所有

```sql
-- 查询工资比5001部门员工高的员工
select first_name,salary from employee
where salary >
all(select salary from employee where department_id = 5001)
```

### from后面的子查询

```sql
 select max(avgsal)
 from
 (Select avg(salary) avgsal from employee group by department_id) a
```

```sql
 select * from
 (select * from employee ) e
 left outer join (select * from departments) d on e.department_id = d.department_id
```

from后面的子查询只会执行一遍

### 结果集联合查询  union 和 union all

将两个结果集行合并

语法：要求两个结果集的列数量相同、对应列的类型一致（或能隐式转换）

union对结果集去重合并 ，union all不去重合并

```sql
-- 查询一列数据包括员工姓名和所在地
(select first_name from employee)
union
(select city from locations)
-- 查询两遍员工姓名
(select first_name from employee)
union all
(select first_name from employee)
```

### union 应用一些报表查询

查询员工姓名、工资 并 统计工资总额 ，显示在同一个结果集中

```sql
 (select first_name,salary from employee)
 union
 (select '总计：',sum(salary) from employee)
```

### union 行转列

通常我们在进行一些数据迁移时，两边的数据结构(表结构)不同

例如：有一个教务系统，有一张学生成绩表 ，系统已经上线一段时间，进行了系统的改造升级，将成绩表的数据迁移到一张新的成绩表中

```sql
 create table score(
  sname varchar(16),
  shuxue int,
  yuwen int,
  yingyu int
 )
 create table score2(
  sname varchar(16),
  kemu varchar(32),
  chengji int
 )
```

```sql
 --  查询出所有的学生 按学生姓名 循环
 insert into score2
 (select sname,'shuxue',shuxue from score where sname = 'tom')
 union
 (select sname,'yuwen',yuwen from score where sname = 'tom')
 union
 (select sname,'yingyu',yingyu from score where sname = 'tom')
```

数据库备份和导出

  1. 冷备份

找到mysql的数据存储文件，文件进行拷贝，前提是数据库服务必须要关闭

  2. 热备份

在不关闭数据库服务的前提，备份数据

## 数据库事务

### 事务的概念

事务是由一些SQL语句（DML）组成的一个可执行单元（对事务进行提交、回滚操作），事务中的SQL语句具有原子性，也就是要么成功都成功，要么失败就都回滚。

事务分为本地事务和分布式事务两种

本地事务： 事务中执行的SQL语句是在一个数据库服务中执行的

分布式事务：执行的SQL语句在不同的数据库中执行、在不同的服务器中执行

### 事务的特性(ACID)

原子性(Atomicity):事务是数据库的逻辑工作单位，事务中包括的诸操作要么都做，要么都不做

一致性(Consistency):事务执行的结果必须是使数据库从一个一致性状态变到另一个一致状态。

隔离性(Isolation):一个事务的执行不能被其它事务干扰，即一个事务内部操作及使用的数据对其它并发是隔离的，并发执行的各个事务之间不能互相干扰。

持久性(Durability):指一个事务一旦提交，它对数据库中数据的改变就是永久性的。

### 事务的实现(SQL)

需求：要添加一个部门和该部门的一个员工，是在一个事务中执行的

MySQL数据库的事务默认是自动提交的，每执行一条SQL语句，在一个事务中，自动提交事务

```sql
-- 当前连接执行的所有事务都取消自动提交
set autocommit = 0;
insert into departments(department_id,department_name)
values(5005,'行政部');
insert into employee(first_name,phone_number,department_id)
values('jackABC','133123467888888888888888888888',5005);
commit;
```

commit : 提交事务

rollback : 回滚事务/撤销事务缓存中的修改数据

```sql
 set autocommit = 0;
 insert into departments(department_id,department_name)
 values(5008,'行政部');
 insert into employee(first_name,phone_number,department_id)
 values('jackABC','13312346788',5008);
 rollback;
 commit;
```

savepoint ： 保存点/事务缓存的状态点 和 rollback 组合使用 ： rollback to 保存点

```sql
 -- 当前连接执行的所有事务都取消自动提交
 set autocommit = 0;
 savepoint a ;
 insert into departments(department_id,department_name)
 values(5019,'行政部2');
 savepoint b ;
 insert into employee(first_name,phone_number,department_id)
 values('jackABC','13312346788',5019);
 savepoint c ;
 rollback to c;
 commit;
```

事务的执行过程：

  1. 取消自动提交

  2. 执行SQL语句

  3. 设置保存点或根据条件进行回滚操作

  4. 提交事务

### 事务执行的原理

思考问题：

  1. 事务是如何回滚的，怎么知道原始的数据
  2. 在提交时，更新数据库时，如果出现了问题（服务宕机、断电等情况）

MySQL数据库中有三个日志

  1. undo log日志 ：事务原始数据（更改前的数据），保证了事务的原子性
  2. redo log日志：修改的数据，保证了数据的持久性
  3. bin log日志 ：数据库的主从复制、数据恢复等功能支持

假设执行了两条SQL语句： emp表 eid：10 sal : 4000

  1. update emp set sal = 5000 where eid = 10 ;
  2. update emp set sal = 5500 where eid = 10 ;
  3. commit ;

步骤：

  1. emp表中找到 eid = 10 的记录，存储到缓存中
  2. 执行 update emp set sal = 5000 where eid = 10 ; 语句
  3. undo log 记录 eid=10 sal:4000 , redo log 记录 eid=10 sal=5000
  4. 执行 update emp set sal = 5500 where eid = 10 ; 语句
  5. undo log 记录 eid=10 sal:5000 , redo log 记录 eid=10 sal = 5500
    6. commit :
         1. SQL2 执行失败  自动回滚SQL1 ： 找到undo log中的 4000
         2. 都执行成功：
    7. 提交成功后，把修改的数据更新到数据库中 ：
         1. 先redo log日志 复制到 数据库中  redo log的状态是 准备状态
         2. redo log日志 更新内容  写到 bin log中
         3. redo log日志 状态改为  提交状态
         4. 数据库的后台启动线程开始更新数据

数据库服务启动时：

  1. 如果redo log日志的状态是 准备状态  且 bin log中 没有  redo log的内容  ，不做任何处理
  2. 如果redo log日志的状态是 准备状态 且 bin log中 有 redo log的内容， 执行 7-3
  3. 如果redo log日志状态是 提交状态  继续执行7 - 4

![image-001](1MySQL%E6%95%B0%E6%8D%AE%E5%BA%93_assets/image-001.png)

5. 事务隔离级别

事务并发操作的三种情况：

  1. 脏读 ： 读取了事务未提交的数据，事务回滚，读出的数据就是脏数据，要避免脏读，就要直接读取数据库的数据（设置隔离级别）
  2. 不可重复读 ： 一个事务多次对行数据进行检索时，获得的结果不同，因为在这期间，其他事务修改了行数据导致，要避免不可重复读，就要为行添加行锁（只要设置对应的隔离级别即可）
  3. 幻读：一个事务多次对表执行相同条件的查询语句，获得的结果不同（行数量），要避免幻读，就要为表添加表锁

![image-002](1MySQL%E6%95%B0%E6%8D%AE%E5%BA%93_assets/image-002.png)

MySQL默认隔离级别是 Repeatable Read

表锁和行锁

表锁的效率低于行锁

共享锁（读锁）和独占锁/排它锁(写锁)

共享锁：在读数据时，添加共享锁，允许其他的读操作，不允许其他的写操作

独占锁：在写数据时，添加独占锁，不允许其他的读和写

## 视图（View）

视图也是数据库中的一种数据库对象。视图是一个虚拟的表，创建视图时需要指定一个查询语句，视图中的数据就是查询语句的结果集。

例如我们创建一个简单的视图：

```sql
create view v_emp as
select employee_id,first_name,salary,e.department_id
from employee e
-- 视图查询
select * from v_emp
-- insert操作
insert into v_emp(employee_id,first_name,salary)
values(default,'v_test',10000)
-- update操作
update v_emp set salary = 8100 where employee_id = 100
-- delete
delete from v_emp where employee_id = 116
```

**为什么要创建视图**

1. 在有些项目中，如果表结构要有改变，可以创建视图，表结构发生改变，视图结构不变，保证上层的Java程序不需要改变
2. 权限问题：无法为表中的列或行分配权限。通过视图获取表中部分列、行的数据，开放视图的权限，就相当于做到了对表的列、行的权限控制。
3. 经常要执行的一些复杂查询，可以建立视图

创建视图时 添加 ： with check option ： 对视图进行修改时不能修改查询语句中 where 字段的内容

### 存储过程(proc)

我们可以将一些SQL语句（业务流程）封装到一个存储过程中，当调用存储过程就执行了里面的SQL语句

```sql
 -- 创建存储过程（如果已存在则先删除）
 DROP PROCEDURE IF EXISTS `proc_get_user_info`;
 DELIMITER //  -- 临时修改语句结束符为//（避免存储过程内的;提前终止）
 CREATE PROCEDURE `proc_get_user_info`(
  IN p_user_id INT,          -- 输入参数：用户ID
  IN p_include_address BOOLEAN,  -- 输入参数：是否返回详细地址（true/false）
  OUT p_result_code INT      -- 输出参数：执行结果码（0成功，1失败）
 )
 BEGIN
  -- 声明局部变量
  DECLARE v_error INT DEFAULT 0;
  -- 捕获异常
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error = 1;
  -- 初始化输出参数
  SET p_result_code = 0;
  -- 核心逻辑：查询用户信息
  IF p_include_address THEN
    -- 返回包含详细地址的完整信息
    SELECT id, username, age, address, create_time
    FROM `t_user`
    WHERE id = p_user_id;
  ELSE
    -- 仅返回基础信息（隐藏地址）
    SELECT id, username, age, create_time
    FROM `t_user`
    WHERE id = p_user_id;
  END IF;
  -- 异常判断：如果执行出错，设置结果码为1
  IF v_error = 1 THEN
    SET p_result_code = 1;
    SELECT '查询用户信息失败' AS error_msg;
  END IF;
 END //
```

### 自定义函数

### 触发器(trigger)

可以为表添加一些触发器，当对表进行update\delete\insert等操作时，就会触发对应的触发器，执行触发器中的SQL语句

例如，有个需求，某个系统只能在8:00~17:00 之间操作数据
