---
title: "MyBatisPlus 课件（SpringBoot整合版）"
published: 2026-08-13
description: "适用人群：已掌握 MyBatis 基础、SpringBoot 基础的开发者/学生课程环境：SpringBoot 3.2.x + MyBatisPlus 3.5.3.1 + MySQL 8.0 / 8.4课程目标：掌握 MyBatisPlus 核心特性、自动 CRUD、条件构造器精通分页、排序、逻辑删除、乐观锁等高级功能理解 MyBatisPlus 底层执行原理、自动注入机制搞定高频 MyBatis"
image: ""
tags: ["MyBatisPlus", "SpringBoot", "数据库", "ORM"]
category: "MyBatisPlus"
draft: false
featured: false
lang: ""
series: "MyBatisPlus基础"
seriesOrder: 1
status: verified
testedOn: ""
lastVerified: 2026-08-13
---

# MyBatisPlus
## 课程前置说明
适用人群：已掌握 MyBatis 基础、SpringBoot 基础的开发者/学生课程环境：SpringBoot 3.2.x + MyBatisPlus 3.5.3.1 + MySQL 8.0 / 8.4课程目标：掌握 MyBatisPlus 核心特性、自动 CRUD、条件构造器精通分页、排序、逻辑删除、乐观锁等高级功能理解 MyBatisPlus 底层执行原理、自动注入机制搞定高频 MyBatisPlus 面试原理题核心优势（对比原生 MyBatis）：原生 MyBatis 需要手动编写大量 XML/注解 SQL 实现增删改查，MyBatisPlus 基于 MyBatis 增强，无侵入、只增强，封装通用 CRUD，告别重复 SQL，大幅提升开发效率。

## 第一章 MyBatisPlus 快速入门
### 1.1 MyBatisPlus 核心简介
MyBatis-Plus（简称 MP）是一个 MyBatis 的增强工具，在 MyBatis 的基础上只做增强不做改变，为简化开发、提高效率而生。

核心特性：无侵入：仅增强，不修改原生 MyBatis 代码，兼容原有 MyBatis 项目低损耗：启动自动注入通用 CRUD，性能几乎无损耗强大 CRUD：内置通用 Mapper、通用 Service，单表操作零 SQL条件构造器：Wrapper 动态拼接 SQL，告别硬编码 SQL高级功能：分页、逻辑删除、乐观锁、主键自动生成、多租户等

### 1.2 环境搭建（SpringBoot + MP）
#### 1.2.1 引入核心依赖
pom.xml 核心依赖（SpringBoot 父工程已配置）

```xml
<!-- SpringBoot3 适配核心依赖 -->
<!-- MyBatisPlus 适配SpringBoot3 专属依赖 -->
<dependency>
<groupId>com.baomidou</groupId>
<artifactId>mybatis-plus-spring-boot3-starter</artifactId>
<version>3.5.6</version>
</dependency>

<!-- MySQL8+ 驱动（SpringBoot3 必须使用新驱动） -->
```

```xml
<dependency>
<groupId>com.mysql</groupId>
<artifactId>mysql-connector-j</artifactId>
<scope>runtime</scope>
</dependency>

<!-- lombok 简化实体类 -->
<dependency>
<groupId>org.projectlombok</groupId>
<artifactId>lombok</artifactId>
<optional>true</optional>
</dependency>

<!-- SpringBoot3 测试依赖 -->
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-test</artifactId>
<scope>test</scope>
</dependency>
```

#### 1.2.2 全局配置（application.yml）
```yaml
spring:
# 数据源配置
datasource:
url: jdbc:mysql://localhost:3306/java2601?useUnicode=true&characterEncoding=utf-
8&serverTimezone=UTC&allowMultiQueries=true
username: root
password: root
driver-class-name: com.mysql.cj.jdbc.Driver

# MyBatisPlus 全局配置
mybatis-plus:
# 映射文件路径
mapper-locations: classpath:mapper/*.xml
# 实体类别名包
type-aliases-package: com.mp.demo.entity
configuration:
# 开启下划线转驼峰自动映射
map-underscore-to-camel-case: true
# 开启SQL日志打印
log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
global-config:
db-config:
# 主键自增策略
id-type: auto
# 数据库表前缀（可选）
# table-prefix: tb_
# 逻辑删除全局配置
logic-delete-field: deleteFlag
```

logic-delete-value: 1 # 已删除logic-not-delete-value: 0 # 未删除

#### 1.2.3 启动类注解
必须添加 @MapperScan 扫描 Mapper 接口，替代原生 MyBatis 繁琐配置

```java
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// SpringBoot3 启动类无任何兼容问题，注解完全通用
@SpringBootApplication
@MapperScan("com.mp.demo.mapper")
public class MpDemoApplication {
public static void main(String[] args) {
SpringApplication.run(MpDemoApplication.class, args);
}
}
```

### 1.3 基础工程结构
```txt
com.mp.demo
├── entity // 数据库实体类
├── mapper // Mapper接口（继承BaseMapper）
├── service // 业务层
│ └── impl // 业务实现类（继承ServiceImpl）
└── controller // 控制层
```

## 第二章 核心基础：实体类注解与主键策略
### 2.1 数据库表准备
```sql
CREATE TABLE `user` (
`id` bigint NOT NULL COMMENT '主键ID',
`name` varchar(30) DEFAULT NULL COMMENT '姓名',
`age` int DEFAULT NULL COMMENT '年龄',
`email` varchar(50) DEFAULT NULL COMMENT '邮箱',
`delete_fiag` tinyint(1) DEFAULT 0 COMMENT '逻辑删除标识 0-未删除 1-已删除',
`create_time` datetime DEFAULT NULL COMMENT '创建时间',
`update_time` datetime DEFAULT NULL COMMENT '更新时间',
PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 2.2 实体类核心注解详解
MP 通过实体类注解完成 实体与数据库表、字段的映射，替代原生 MyBatis 手动映射配置。

```java
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
```

| 主键类型 | 说明 | 适用场景 |
| --- | --- | --- |
| AUTO | 数据库自增主键，依赖数据库 auto_increment | 单机项目、MySQL 自增场景 |
| NONE | 无主键策略，手动赋值 | 自定义主键值场景 |
| INPUT | 插入前手动设置主键值 | 业务自定义主键 |
| ASSIGN_ID | MP 3.5+默认，雪花算法生成Long类型ID | 分布式项目、全局唯一ID |

```java
import java.time.LocalDateTime;

@Data
// 对应数据库表名（若实体类名与表名一致可省略）
@TableName("user")
public class User {

// 主键ID
@TableId(type = IdType.AUTO)
private Long id;

// 姓名（字段名与数据库一致可省略注解）
@TableField("name")
private String name;

// 年龄
private Integer age;

// 邮箱
private String email;

// 逻辑删除字段
@TableLogic
@TableField(fill = FieldFill.INSERT)
private Integer deleteFlag;

// 创建时间（自动填充）
@TableField(fill = FieldFill.INSERT)
private LocalDateTime createTime;

// 更新时间（插入+更新自动填充）
@TableField(fill = FieldFill.INSERT_UPDATE)
private LocalDateTime updateTime;
}
```

主键不是 id 时，必须加 @TableId

### 2.3 主键生成策略（IdType 全解析）
面试高频：MP 主键生成策略原理、区别

| 主键类型 | 说明 | 适用场景 |
| --- | --- | --- |
| ASSIGN_UUID | 生成UUID字符串主键 | 字符串主键场景 |

#### 2.3.1 雪花算法原理（面试重点）
ASSIGN_ID 底层采用雪花算法（Snowfiake），生成 64 位 Long 型唯一ID，结构如下：1位符号位 + 41位时间戳 + 10位机器ID + 12位序列号符号位：固定0，保证正数时间戳：毫秒级，可使用69年机器ID：区分不同服务器、集群节点序列号：同一毫秒内自增，解决并发重复问题优势：有序、唯一、高性能、可分布式部署雪花算法结构原理示意图64位Long类型唯一ID整体结构：┌─────────┬────────────────────┬────────────┬────────────┐│ 1位符号位 │ 41位时间戳(毫秒级) │ 10位机器ID │ 12位序列号 │└─────────┴────────────────────┴────────────┴────────────┘字段解析：1. 符号位：固定 0，保证ID为正数，无负数ID2. 时间戳：当前时间 - 基准时间，可使用约69年，全局时序有序3. 机器ID：集群节点唯一标识，支持最多1024台服务器4. 序列号：单毫秒内自增(0-4095)，解决单节点并发ID重复问题

#### 2.3.2 UUID 生成原理与使用详解（ASSIGN_UUID）
UUID（通用唯一识别码）是128位全局唯一标识符，MP中 ASSIGN_UUID 主键策略基于JDK原生API生成，无需依赖时间、机器节点，是常用字符串类型主键方案。

1、UUID核心生成原理Java开发、MyBatisPlus 默认使用UUID v4 版本，也是企业最常用版本：生成规则：完全基于安全随机数生成，不依赖服务器MAC地址、系统时间、硬件信息数据结构：128位二进制随机数，固定少量位数标记版本与变体，保证格式统一标准格式：36位字符串（含4个分隔横线），例：550e8400-e29b-41d4-a716-446655440000其他版本简单区分（了解即可）：UUID v1：基于时间+MAC地址生成，存在硬件信息泄露风险，业务开发极少用UUID v3/v5：基于指定字符串哈希生成，固定文本生成固定UUID，不适用于主键2、JDK原生生成代码

| 对比维度 | 雪花算法（ASSIGN_ID） | UUID v4（ASSIGN_UUID） |
| --- | --- | --- |
| 数据类型 | Long 数值型 | String 字符串型 |
| 有序性 | 时间有序，递增排布 | 完全无序，随机生成 |
| 索引性能 | 优秀，适配MySQL主键索引 | 较差，易引发索引页分裂 |
| 信息安全 | 包含时间、机器信息，可解析 | 纯随机数，无信息泄露 |
| 存储占用 | 8字节，占用极小 | 36字符，占用更大 |
| 适用场景 | 分布式核心业务表、大数据量表 | 小型表、无需排序、隐私要求高场景 |

```java
import java.util.UUID;

public class UUIDTest {
public static void main(String[] args) {
// 生成标准UUID v4（MP ASSIGN_UUID底层实现）
UUID uuid = UUID.randomUUID();
System.out.println("标准UUID：" + uuid);

// 企业常用：去除横线，精简存储长度
String simpleUuid = uuid.toString().replace("-", "");
System.out.println("无横线UUID：" + simpleUuid);
}
}
```

3. MyBatisPlus 中使用UUID主键实体类指定主键策略为 ASSIGN_UUID，MP会自动生成UUID主键，无需手动赋值。

```java
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;

@Data
public class User {
// 自动生成UUID字符串主键
@TableId(type = IdType.ASSIGN_UUID)
private String id;

// 其他字段省略
}
```

注意事项：数据库主键字段必须设置为 VARCHAR(36)，不可使用数值类型。

4. UUID 与 雪花算法ID 核心对比（面试重点）5、核心优缺点总结

优点：无需配置机器ID、无时钟回拨问题、无服务器信息泄露、使用简单。

缺点：无序导致数据库索引性能差、存储空间占用高、大批量数据插入效率低。

企业规范：MySQL核心业务表优先使用雪花算法ID，仅特殊场景使用UUID。

## 第三章 通用CRUD 零SQL操作
MP 内置 BaseMapper（数据层）、IService+ServiceImpl（业务层）两套通用CRUD，无需写任何SQL。

### 3.1 BaseMapper 数据层CRUD（核心）
#### 3.1.1 Mapper接口定义
```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mp.demo.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
// 无需编写任何代码，继承BaseMapper即可拥有所有CRUD方法
}
```

#### 3.1.2 常用CRUD方法代码示例
```java
import com.mp.demo.entity.User;
import com.mp.demo.mapper.UserMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.List;

@SpringBootTest
public class MapperCrudTest {

@Autowired
private UserMapper userMapper;

// 新增
@Test
void testInsert() {
User user = new User();
user.setName("张三");
user.setAge(20);
user.setEmail("zhangsan@163.com");
// 返回受影响行数
int insert = userMapper.insert(user);
System.out.println("新增ID：" + user.getId());
}

// 根据ID查询
@Test
```

```java
void testSelectById() {
User user = userMapper.selectById(1L);
System.out.println(user);
}

// 查询所有
@Test
void testSelectList() {
List<User> userList = userMapper.selectList(null);
userList.forEach(System.out::println);
}

// 根据ID更新
@Test
void testUpdateById() {
User user = new User();
user.setId(1L);
user.setAge(22);
user.setEmail("update@163.com");
int rows = userMapper.updateById(user);
System.out.println("更新行数：" + rows);
}

// 根据ID删除
@Test
void testDeleteById() {
int rows = userMapper.deleteById(1L);
System.out.println("删除行数：" + rows);
}
}
```

### 3.2 Service 业务层CRUD
业务层封装了更便捷的批量操作、链式查询方法，开发中优先使用Service层。

#### 3.2.1 业务层接口与实现类
```java
// 接口
import com.baomidou.mybatisplus.extension.service.IService;
import com.mp.demo.entity.User;
public interface UserService extends IService<User> {
}

// 实现类
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mp.demo.entity.User;
import com.mp.demo.mapper.UserMapper;
import com.mp.demo.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
```

```txt
}
```

#### 3.2.2 Service 核心方法示例
```java
@SpringBootTest
public class ServiceCrudTest {

@Autowired
private UserService userService;

// 批量新增
@Test
void testBatchSave() {
List<User> list = new ArrayList<>();
list.add(new User(null, "李四", 25, "lisi@163.com", null, null, null));
list.add(new User(null, "王五", 28, "wangwu@163.com", null, null, null));
// 批量插入
boolean batch = userService.saveBatch(list);
System.out.println("批量新增结果：" + batch);
}

// 新增或更新（ID存在则更新，不存在则新增）
@Test
void testSaveOrUpdate() {
User user = new User(2L, "李四", 26, "lisi_new@163.com", null, null, null);
boolean result = userService.saveOrUpdate(user);
}

// 批量删除
@Test
void testBatchDelete() {
userService.removeByIds(Arrays.asList(3L,4L));
}
}
```

## 第四章 核心重点：条件构造器 Wrapper
Wrapper 是 MP 核心功能，用于动态拼接 SQL 条件，彻底解决原生 MyBatis 动态SQL繁琐的 if 判断问题。

### 4.1 Wrapper 体系结构
QueryWrapper：查询、删除条件构造器（无set字段）UpdateWrapper：更新条件构造器（支持set字段+条件）LambdaQueryWrapper：Lambda查询构造器（杜绝硬编码字段名，推荐）LambdaUpdateWrapper：Lambda更新构造器

### 4.2 QueryWrapper 条件查询示例
| 方法 | SQL对应 | 说明 |
| --- | --- | --- |
| eq | = | 等于 |
| ne | != | 不等于 |

```java
// 条件：年龄大于20，姓名包含"李"，按年龄降序
@Test
void testQueryWrapper() {
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.gt("age", 20) // age > 20
.like("name", "李") // name like '%李%'
.orderByDesc("age");// order by age desc

List<User> userList = userMapper.selectList(wrapper);
userList.forEach(System.out::println);
}
```

### 4.3 LambdaQueryWrapper（推荐，无硬编码）
通过 Lambda 表达式获取字段，避免字段名写错、后续字段修改导致的BUG，企业开发首选。

```java
// 等价上述条件，无硬编码字段
@Test
void testLambdaQueryWrapper() {
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.gt(User::getAge, 20)
.like(User::getName, "李")
.orderByDesc(User::getAge);

List<User> userList = userMapper.selectList(wrapper);
}
```

### 4.4 UpdateWrapper 动态更新
```java
// 条件：年龄=25，更新邮箱和姓名
@Test
void testUpdateWrapper() {
LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
wrapper.eq(User::getAge, 25)
.set(User::getName, "小李")
.set(User::getEmail, "xiaoli@163.com");

userMapper.update(null, wrapper);
}
```

### 4.5 常用条件方法汇总
| 方法 | SQL对应 | 说明 |
| --- | --- | --- |
| gt/lt | >/< | 大于/小于 |
| ge/le | >=/<= | 大于等于/小于等于 |
| like | like '%xx%' | 模糊查询 |
| in | in (xx,xx) | 包含查询 |
| isNull/isNotNull | is null / is not null | 空值判断 |

## 第五章 MP 核心高级功能
### 5.1 自动填充功能（创建/更新时间）
业务场景：所有表都有创建时间、更新时间，无需手动赋值，自动填充

#### 5.1.1 实现 MetaObjectHandler 填充处理器
```java
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.refiection.MetaObject;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

// 插入时自动填充
@Override
public void insertFill(MetaObject metaObject) {
this.strictInsertFill(metaObject, "createTime", LocalDateTime::now, LocalDateTime.class);
this.strictInsertFill(metaObject, "updateTime", LocalDateTime::now, LocalDateTime.class);
this.strictInsertFill(metaObject, "deleteFlag", () -> 0, Integer.class);
}

// 更新时自动填充
@Override
public void updateFill(MetaObject metaObject) {
this.strictUpdateFill(metaObject, "updateTime", LocalDateTime::now, LocalDateTime.class);
}
}
```

配合实体类 @TableField(fill = xxx) 注解，实现全自动填充，无需代码赋值。

### 5.2 逻辑删除
原理：不真实删除数据库数据，通过字段标记删除状态，查询时自动过滤已删除数据

#### 5.2.1 全局配置
```txt
# 已迁移至上方全局 mybatis-plus.global-config.db-config 统一配置
# SpringBoot3 推荐全局配置，无需单独注解配置，统一规范
```

#### 5.2.2 实体类标记
字段添加 @TableLogic 注解，配置完成后：调用 delete 方法 → 自动执行 update 语句，修改删除标识所有查询方法 → 自动拼接 where delete_fiag=0面试原理：MP 通过拦截器拦截CRUD请求，动态修改SQL语句，实现逻辑删除，无业务代码侵入。

逻辑删除底层拦截原理图客户端调用CRUD方法

```txt
│
▼
```

┌─────────────────────────┐│ MybatisPlusInterceptor │ 全局拦截器（核心）└───────────┬─────────────┘

```txt
│
┌───────┴───────┐
│ │
▼ ▼
```

查询请求 删除请求

```txt
（select） （delete）
│ │
▼ ▼
```

自动拼接条件 改写SQL语句

```txt
where delete_fiag=0 delete → update set delete_fiag=1
│ │
└───────┬───────┘
│
▼
```

执行改造后SQL返回业务结果

### 5.3 分页插件（必备）
MP 内置分页功能，只需注册分页插件，即可实现高性能分页查询。

#### 5.3.1 分页插件配置类
```java
import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.OptimisticLockerInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
```

```java
/**
* SpringBoot3 专属 MP 插件配置类
* 兼容3.x版本，无过时方法、无依赖冲突
*/
@Configuration
public class MpConfig {

/**
* 注册MP核心插件：分页插件 + 乐观锁插件
*/
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
// 分页插件（适配MySQL8+）
interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
// 乐观锁插件
interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
return interceptor;
}
}
```

#### 5.3.2 分页查询代码示例
```java
@Test
void testPage() {
// 参数1：当前页，参数2：每页条数
Page<User> page = new Page<>(1, 2);
// 分页查询条件
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.gt(User::getAge, 18);

Page<User> userPage = userMapper.selectPage(page, wrapper);

// 分页结果参数
System.out.println("当前页：" + userPage.getCurrent());
System.out.println("每页条数：" + userPage.getSize());
System.out.println("总条数：" + userPage.getTotal());
System.out.println("总页数：" + userPage.getPages());
System.out.println("数据列表：" + userPage.getRecords());
}
```

### 5.4 乐观锁（解决并发更新问题）
业务场景：多用户同时修改同一条数据，防止数据覆盖丢失

#### 5.4.1 原理
通过 version 版本号字段控制：更新时校验版本号，版本号一致则更新并版本号+1，不一致则更新失败。

#### 5.4.2 实现步骤
1. 数据库添加 version 字段

```sql
ALTER TABLE `user` ADD COLUMN `version` int DEFAULT 1 COMMENT '乐观锁版本号';
```

2. 实体类添加版本号注解

```java
@Version
private Integer version;
```

3. 开启乐观锁插件（在MybatisPlusInterceptor中添加）

```txt
interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
```

执行原理SQL：update user set age=22,version=version+1 where id=1 and version=1乐观锁执行原理流程图正常更新流程（无并发冲突）┌─────────┐ 1.查询数据 ┌──────────┐│ 客户端 │─────────────▶│ 数据库 │

```txt
└─────────┘ └────┬─────┘
│ │
```

│ 2.返回version=1 │

```txt
│◀────────────────────┘
│
▼
```

┌────────────────────────────┐│ 3.提交更新：携带id+version │└──────────────┬─────────────┘

```txt
│
▼
```

┌────────────────────────────┐│ 4.校验version一致，执行更新 ││ 5.自动version+1 → version=2 │└──────────────┬─────────────┘

```txt
│
▼
```

更新成功并发冲突流程（多线程同时更新）┌─────线程1─────┐ ┌─────线程2─────┐查询version=1 查询version=1

```txt
│ │
```

更新携带version=1 更新携带version=1

```txt
│ │
▼ ▼
```

执行更新、版本变为2 校验version≠1，更新失败

## 第六章 MyBatisPlus 底层原理与面试精讲
### 6.1 核心原理：通用CRUD自动注入原理（面试必问）
#### 6.1.1 整体执行流程
1. 项目启动时，@MapperScan 扫描所有继承 BaseMapper 的接口 2. MP 通过 MapperScannerConfigurer 扫描Mapper接口，生成动态代理对象 3. 通过 AutoSqlInjector 自动注入所有通用CRUD的SQL语句（insert/select/update/delete） 4. 调用Mapper方法时，直接执行预注入的SQL，无需手动编写MP 自动CRUD注入执行流程图项目启动阶段（仅执行一次）

```txt
┌─────────────┐ ┌─────────────────────┐ ┌─────────────────┐
```

│ @MapperScan │────▶│ MapperScannerConfig │────▶│ 扫描BaseMapper ││ 扫描包路径 │ │ urer扫描配置器 │ │ 所有子接口 │

```txt
└─────────────┘ └─────────────────────┘ └────────┬────────┘
│
▼
┌─────────────┐ ┌─────────────────────┐ ┌─────────────────┐
```

│ 预加载完成 │◀────│ AutoSqlInjector │◀────│ 生成Mapper代理 ││ 所有CRUD SQL│ │ SQL自动注入器 │ │ 实例 │

```txt
└──────┬──────┘ └─────────────────────┘ └─────────────────┘
│
▼
```

业务调用阶段（实时执行）

```txt
┌─────────────┐ ┌─────────────────────┐ ┌─────────────────┐
```

│ 调用Mapper │────▶│ 执行预注入原生SQL │────▶│ 数据库返回结果 ││ 通用方法 │ │ 无运行时拼接损耗 │ │ │

```txt
└─────────────┘ └─────────────────────┘ └─────────────────┘
```

核心结论：MP 不是运行时拼接SQL，是启动时预加载所有通用SQL，性能无损耗。

### 6.2 Wrapper 动态SQL原理
Wrapper 所有条件方法，最终会拼接成 SQL 字符串 + 参数集合，通过 MyBatis 的 BoundSql 机制执行，底层依然是原生 MyBatis 的SQL执行流程，完全兼容原生机制。

Wrapper动态SQL拼接原理流程图开发者编码阶段

```txt
┌─────────────┐ ┌─────────────────────┐
```

│ 编写Lambda │────▶│ 链式调用条件方法 │

```txt
│ /QueryWrapper│ │ eq/like/gt/orderBy │
└─────────────┘ └──────────┬──────────┘
│
▼
```

MP框架处理阶段┌──────────────────────────────────────────────┐│ 1.解析Wrapper条件，拼接SQL Where子句 │

│ 2.封装SQL参数，防止SQL注入 ││ 3.生成完整BoundSql对象（原生MyBatis对象） │└──────────────────────────┬───────────────────┘

```txt
│
▼
```

底层执行阶段

```txt
┌─────────────┐ ┌─────────────────────┐
```

│ MyBatis原生 │────▶│ JDBC执行SQL &返回结果││ 执行流程 │ │ │

```txt
└─────────────┘ └─────────────────────┘
```

### 6.3 高频面试题汇总+原理解析
#### 面试题1：MyBatis 和 MyBatisPlus 的区别？是否冲突？
答案**（适配SpringBoot3）**：1\. 无冲突，MP 是**增强工具**，基于 MyBatis 原生源码开发，不修改原生代码，完美兼容SpringBoot2/32\. 原生 MyBatis 需要手动写SQL，MP 封装通用CRUD，零SQL开发3\. MP 保留所有原生MyBatis特性，自定义XML SQL、注解SQL完全兼容4\. MP 新增分页、逻辑删除、乐观锁、自动填充等原生无的高级功能5\. SpringBoot3 环境仅需替换新版依赖、适配插件配置，核心原理完全不变

#### 面试题2：MP 主键雪花算法为什么能保证唯一？
原理解析：1\. 时间戳：毫秒级递增，保证时序唯一2\. 机器ID：分布式环境区分不同节点，避免跨机器重复3\. 序列号：同一毫秒内自增，解决单节点并发重复问题整体结构无重复可能，适配分布式集群环境。

#### 面试题3：逻辑删除的底层实现？
原理：

1\. MP 启动时读取全局逻辑删除配置与实体类注解2\. 通过**SQL拦截器**拦截所有 delete、select 语句3\. 删除操作：将 delete 语句改写为 update 语句，修改删除标识4\. 查询操作：自动拼接 where 条件过滤已删除数据全程无业务代码侵入，框架层自动实现。

#### 面试题4：MP 分页为什么必须配置插件？不配置会怎样？
答案：1\. 分页插件是 MP 实现分页语法的核心拦截器，不同数据库分页语法不同（MySQL limit、Oracle rownum）2\. 不配置插件，分页方法不会报错，但**不会分页**，会查询全量数据，手动封装分页参数，导致分页失效、数据溢出。

#### 面试题5：乐观锁失效的场景有哪些？
常见问题：1\. 未注册乐观锁插件2\. 实体类version字段未添加@Version注解3\. 更新时未携带version参数4\. 批量更新操作，乐观锁不生效（仅单条更新生效）

## 第七章 常见坑与解决方案
字段自动填充失效：未注册 MetaObjectHandler 组件、字段未配置fill属性分页总数为0/分页失效：SpringBoot3未注册新版插件、数据库类型配置错误、依赖版本不匹配逻辑删除查询不到数据：全局配置与实体字段不匹配Lambda字段报错：实体类字段名与数据库字段映射异常主键重复：分布式环境未配置机器ID，雪花算法冲突
