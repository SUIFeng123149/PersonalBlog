---
title: "SpringSecurity6 安全框架"
published: 2026-08-13
description: "SpringSecurity是当下最主流的两种认证授权只框架之一，随着Springboot越来越流行，SpringSecurity也越来越流行，主要还是因为SpringSecurity的配置越来越简洁，不会像之前版本那样复杂。而Shiro是Apache 下的认证授权框架，典型特点事轻量易上手，使用起来也比较简洁。SpringSecurity则是相对来说重一些，不过同时可支持自定义的配置也会多一些，"
image: ""
tags: ["SpringSecurity", "安全", "认证", "授权"]
category: "SpringSecurity"
draft: false
featured: false
lang: ""
series: "SpringSecurity6"
seriesOrder: 1
status: verified
testedOn: ""
lastVerified: 2026-08-13
---

| 用户 | 操作 |
| --- | --- |
| 学生 | 查看课程 |
| 教师 | 发布课程 |
| 管理员 | 删除用户 |

# SpringSecurity6 企业级安全框架
## 第1章 SpringSecurity基础
## 1.1 什么是SpringSecurity
SpringSecurity是当下最主流的两种认证授权只框架之一，随着Springboot越来越流行，SpringSecurity也越来越流行，主要还是因为SpringSecurity的配置越来越简洁，不会像之前版本那样复杂。而Shiro是Apache 下的认证授权框架，典型特点事轻量易上手，使用起来也比较简洁。SpringSecurity则是相对来说重一些，不过同时可支持自定义的配置也会多一些，所以他的可扩展性要高于Shiro，随着Spring的发展，SpringSecurity在项目中的应用越来越广泛。

## 1.1.1 安全问题背景
在企业开发过程中，任何系统都需要解决两个核心安全问题：身份认证：验证当前用户是否是系统的合法用户。（你是谁？）权限控制：对合法用户进行权限授予，用户拥有授权信息方可正常访问系统资源。（你能干什么？）例如：在线教育平台：

## 1.2 SpringSecurity介绍
## 官方定义
Spring Security 是 Spring 官方提供的安全框架。

主要解决：1. 身份认证(Authentication)2. 权限授权(Authorization)3. 防止攻击防止攻击包括：CSRF攻击、XSS攻击、会话劫持、密码暴力破解、请求拦截等安全能力。

CSRF：跨站请求伪造，你登录了正规网站 A，浏览器保存了 A 网站的 Cookie； 你不小心点开恶意网站 B，B在后台悄悄发起一个请求访问网站 A 的接口； 浏览器会自动带上网站 A 有效的 Cookie，网站 A 误以为是你本人发起操作，最终被恶意执行操作。

XSS：跨站脚本攻击 ，攻击者向网页注入恶意 JS 代码，当其他用户访问页面时，浏览器执行这段恶意脚本，窃取信息、伪造操作。

## 1.3 传统Session模式 VS 前后端分离Token模式
SpringSecurity 默认是基于Session的有状态认证，不适用于前后端分离项目，这是核心改造点！

| 认证模式 | Session 有状态（传统项目） | Token 无状态（前后端分离） |
| --- | --- | --- |
| 存储位置 | 服务端存储Session，客户端存
Cookie | 服务端不存储状态，Token存在前端
LocalStorage |
| 扩展性 | 差，集群部署需共享Session | 强，天然适配分布式、微服务 |
| 跨域支持 | 差，Cookie跨域受限 | 友好，自定义请求头携带Token |
| 本课程适
配 | 废弃 | 全程采用 |

## 1.4 SpringSecurity核心架构
## 核心组件
| 组件 | 作用 |
| --- | --- |
| SecurityFilterChain | 安全过滤器链 |
| Authentication | 用户认证信息 |
| AuthenticationManager | 认证管理器 |
| UserDetailsService | 查询用户 |
| PasswordEncoder | 密码加密 |
| SecurityContext | 保存登录状态 |

### 面试问题1：SpringSecurity主要作用是什么？
## 标准答案
SpringSecurity主要用于解决应用系统中的认证和授权问题。

认证：判断用户身份是否合法。

授权：判断用户是否具有访问资源的权限。

除此之外：密码加密CSRF防护Session管理OAuth2支持

## 第2章 SpringBoot3整合SpringSecurity
## 2.1 创建项目
环境：

```txt
SpringBoot 3.3+
Java 17+
SpringSecurity 6
Maven
Vue3
```

依赖：

```xml
pom.xml
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

## 2.2 第一个Security程序
创建Controller：

```java
@RestController
@RequestMapping("/user")
public class UserController {

@GetMapping("/hello")
public String hello(){
return "hello security";
}
}
```

启动项目。

```txt
访问：http://localhost:8080/user/hello
```

出现：原因：SpringSecurity默认开启安全保护。

## 2.3 默认用户
SpringSecurity启动时：自动创建用户：

```yaml
username: user
```

password: 随机生成控制台：

## 2.4 自定义用户名密码
```yaml
application.yml
spring:
security:
user:
name: admin
password: 123456
```

重新启动，再次登录

## 为什么启动后自动出现登录页面？
启动流程：SpringBoot启动 → 加载Security自动配置 → 创建SecurityFilterChain → 注册过滤器 → 拦截所有请求→ 发现未认证 → 跳转/login

### 面试问题2：为什么SpringSecurity不用Controller拦截请求？
答案：因为SpringSecurity基于Servlet Filter实现。执行优先级是 Filter → Interceptor → ControllerFilter比 Interceptor、Controller更早执行，安全控制更加底层。

## 第3章 SpringSecurity核心原理
## 学习目标
通过本章学习，学生能够：1. 理解 SpringSecurity 的整体执行流程2. 掌握 SecurityFilterChain 工作机制3. 理解认证(Authentication)核心流程4. 掌握 AuthenticationManager 认证体系5. 理解 SecurityContext 用户状态保存机制6. 能够分析 SpringSecurity 登录源码流程

## 3.1 SpringSecurity核心执行流程
### 3.1.1 为什么SpringSecurity基于Filter实现？
在 Java Web 中，请求执行顺序： 浏览器请求 → Servlet Filter → Interceptor → Controller → Service → Dao →

```txt
Database
```

SpringSecurity选择 Filter 作为入口。

原因 ：Filter执行优先级最高 ，安全检查必须发生在业务代码之前。

例如：用户访问：GET /api/user/delete/1执行过程： 请求 → Security Filter → 判断用户是否登录 → 判断是否有删除权限 → Controller如果没有权限：直接结束请求，Controller根本不会执行。

## 3.2 SecurityFilterChain原理
### 3.2.1 什么是FilterChain？
FilterChain：过滤器链。SpringSecurity并不是一个Filter。而是一组Filter。

请求必须依次经过这些Filter。

### 3.2.2 FilterChainProxy
SpringSecurity真正注册到Servlet容器中的Filter：DelegatingFilterProxy执行： DelegatingFilterProxy → FilterChainProxy → SecurityFilterChain → 各种Security Filter结构：1. DelegatingFilterProxy是一个特殊的过滤器，Servlet容器（如Tomcat）在启动时会加载自己的过滤器，DelegatingFilterProxy也是定义在Servlet容器中的，它不实现过滤逻辑，仅仅做代理，去 Spring 容器里面找真正的 Filter Bean，调用它的 doFilter() 。DelegatingFilterProxy作为桥梁，将请求转发给Spring应用上下文中的Filter Bean实例，这样Spring就可以管理这些过滤器的生命周期和依赖注入。

2. FilterChainProxy是关键组件，它负责协调各个SecurityFilterChain。当请求到达FilterChainProxy时，它会根据请求的URL决定使用哪个SecurityFilterChain。一旦选择了对应的链，就会按顺序执行该链中的所有过滤器。

3. 每个SecurityFilterChain内部有一系列的过滤器。这些过滤器按照顺序执行，每个过滤器负责特定的安全任务，比如身份验证、授权、处理会话等。

其中在SecurityFilterChain过滤器链中主要有如下几个过滤器：UsernamePasswordAuthenticationFilter：验证用户密码，进行授权DefaultLoginPageGeneratingFilter：提供默认登录页DefaultLogoutPageGeneratingFilter：提供默认登出页FilterSecurityInterceptor：授权

## 3.3 Authentication认证核心机制
### 3.3.1 Authentication是什么？
Authentication表示：当前用户认证信息。

源码：

| 方法 | 作用 |
| --- | --- |
| getPrincipal() | 当前用户 |
| getCredentials() | 凭证(密码) |
| getAuthorities() | 权限集合 |

```java
public interface Authentication
extends Principal, Serializable {
Object getPrincipal();
Object getCredentials();
Collection<? extends GrantedAuthority> getAuthorities();
}
```

三个核心方法：

## 3.3.2 Authentication对象状态变化
UsernamePasswordAuthenticationToken 是 Authentication 最重要的实现类登录前：

```txt
UsernamePasswordAuthenticationToken
{
username:"admin",
password:"123456",
authenticated:false
}
```

经过认证：

```txt
UsernamePasswordAuthenticationToken
{
username:"admin",
authorities:[
ROLE_ADMIN
],
authenticated:true
}
```

变化过程：未认证对象 → AuthenticationManager → 已认证对象

## 3.4 AuthenticationManager认证管理器
### 3.4.1 作用
AuthenticationManager负责：接收认证请求，并完成认证。

核心方法：

```txt
Authentication authenticate(Authentication authentication);
```

AuthenticationManager认证流程： Authentication → AuthenticationManager → AuthenticationProvider →

```txt
UserDetailsService → Databae

3.4.2 ProviderManager
```

ProviderManager管理多个Provider ，主要的包括DaoAuthenticationProvider、JwtAuthenticationProvider、

```txt
OAuth2Provider
```

ProviderManager按顺序寻找支持的Provider

## 3.5 UserDetailsService用户查询机制
### 3.5.1 为什么需要UserDetailsService？
SpringSecurity不知道：你的用户在哪里。可能在：MySQL、Redis、LDAP所以定义接口：

```txt
public interface UserDetailsService {

UserDetails loadUserByUsername(String username);

}
```

## 3.5.2 自定义数据库认证
示例：

```java
@Service
public class UserService implements UserDetailsService {
@Override
public UserDetails loadUserByUsername(String username){
User user=userMapper.findByUsername(username);

return User.builder()
.username(user.getUsername())
.password(user.getPassword())
.roles("USER")
.build();
}
}
```

## 3.6 SecurityContext核心原理
### 3.6.1 SecurityContext是什么？
SecurityContext 用来保存当前请求的认证对象 Authentication，简单讲就是保存当前登录用户信息。

SecurityContext 本身只是接口，它不负责存储，真正控制存放在哪里的是 SecurityContextHolder。

默认策略：ThreadLocal每个请求是一个独立线程，ThreadLocal 把 SecurityContext 绑定到当前请求线程，同一个线程内任意地方都可以拿到当前登录用户。

### 面试问题
### SecurityContext为什么使用ThreadLocal？
答案：因为Web请求通常由独立线程处理。

ThreadLocal可以：1. 保存当前线程用户信息2. 避免参数层层传递3. 保证线程之间数据隔离

## 3.7 SpringSecurity登录源码流程
完整流程： Vue登录 → POST /login请求 → UsernamePasswordAuthenticationFilter →创建UsernamePasswordAuthenticationToken → AuthenticationManager → ProviderManager →DaoAuthenticationProvider → UserDetailsService → 查询数据库 → PasswordEncoder密码比较→认证成功 → SecurityContextHolder保存用户 → 返回JWT Token

## 3.8 本章重点总结
| 组件 | 作用 |
| --- | --- |
| SecurityFilterChain | 安全过滤器链 |
| FilterChainProxy | 管理Filter |
| Authentication | 认证信息 |
| AuthenticationManager | 认证入口 |
| ProviderManager | 认证调度 |
| AuthenticationProvider | 认证实现 |
| UserDetailsService | 查询用户 |
| PasswordEncoder | 密码验证 |
| SecurityContext | 保存登录状态 |

### 本章面试重点
### 高频问题
### 1. SpringSecurity执行流程？
### 2. Authentication和UserDetails区别？
Authentication：代表当前认证状态。

UserDetails：代表数据库用户信息。

### 3. SecurityContext如何保存用户？
默认：SecurityContextHolder保存当前请求的认证对象 Authentication ，ThreadLocal 把 SecurityContext 绑定到当前请求线程

## 第4章 实现前后端分离模式的身份认证
## 4.1 环境搭建
1. 导入数据库表结构

```txt
-- ----------------------------
-- Table structure for t_menu
```

```sql
-- ----------------------------
DROP TABLE IF EXISTS `t_menu`;
CREATE TABLE `t_menu` (
`id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
`name` varchar(255) DEFAULT NULL COMMENT '菜单名称',
`icon` varchar(255) DEFAULT NULL COMMENT '菜单图标',
`url` varchar(255) DEFAULT NULL COMMENT '菜单url',
`pid` bigint(20) DEFAULT NULL COMMENT '菜单父id',
`remark` varchar(255) DEFAULT NULL COMMENT '菜单备注',
`level` varchar(255) DEFAULT NULL COMMENT '菜单等级',
`is_link` int(255) DEFAULT NULL COMMENT '是否有链接',
PRIMARY KEY (`id`),
UNIQUE KEY `id_index` (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_menu
-- ----------------------------
BEGIN;
INSERT INTO `t_menu` VALUES (1, '系统设置', 'layui-icon-fire', '123', -1, 'sdf', NULL, 0);
INSERT INTO `t_menu` VALUES (2, '分类管理', 'layui-icon-name', 'category/list', 1, '', NULL, 1);

INSERT INTO `t_menu` VALUES (3, '商品管理', 'layui-icon-service', NULL, -1, '', NULL, 0);
INSERT INTO `t_menu` VALUES (4, '商品管理', 'layui-icon-rate', 'asset-info/list', 3, '', NULL, 1);

-- ----------------------------
-- Table structure for t_menu_role
-- ----------------------------
DROP TABLE IF EXISTS `t_menu_role`;
CREATE TABLE `t_menu_role` (
`id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
`menu_id` bigint(20) DEFAULT NULL COMMENT '菜单id',
`role_id` bigint(20) DEFAULT NULL COMMENT '角色id',
PRIMARY KEY (`id`),
UNIQUE KEY `id_index` (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=495 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_menu_role
-- ----------------------------
BEGIN;
INSERT INTO `t_menu_role` VALUES (1, 1, 1);
INSERT INTO `t_menu_role` VALUES (2, 2, 1);
INSERT INTO `t_menu_role` VALUES (3, 3, 1);
INSERT INTO `t_menu_role` VALUES (4, 4, 1);
INSERT INTO `t_menu_role` VALUES (5, 3, 2);
INSERT INTO `t_menu_role` VALUES (6, 4, 2);

-- ----------------------------
-- Table structure for t_permission
-- ----------------------------
DROP TABLE IF EXISTS `t_permission`;
CREATE TABLE `t_permission` (
```

```sql
`id` bigint(20) NOT NULL AUTO_INCREMENT,
`permission_name` varchar(255) DEFAULT NULL,
`permission_key` varchar(255) DEFAULT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_permission
-- ----------------------------
BEGIN;
INSERT INTO `t_permission` VALUES (1, '查询', 'permission:query');
INSERT INTO `t_permission` VALUES (2, '新增', 'permission:insert');
INSERT INTO `t_permission` VALUES (3, '修改', 'permission:update');
INSERT INTO `t_permission` VALUES (4, '删除', 'permission:delete');
-- ----------------------------
-- Table structure for t_role
-- ----------------------------
DROP TABLE IF EXISTS `t_role`;
CREATE TABLE `t_role` (
`id` bigint(20) NOT NULL AUTO_INCREMENT,
`role_name` varchar(255) DEFAULT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_role
-- ----------------------------
BEGIN;
INSERT INTO `t_role` VALUES (1, '系统管理员');
INSERT INTO `t_role` VALUES (2, '普通用户');
```

```sql
-- ----------------------------
-- Table structure for t_user
-- ----------------------------
DROP TABLE IF EXISTS `t_role_permission`;
CREATE TABLE `t_role_permission` (
`id` bigint(20) NOT NULL AUTO_INCREMENT,
`role_id` bigint(20) DEFAULT NULL,
`permission_id` bigint(20) DEFAULT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_role_permission
-- ----------------------------

INSERT INTO `t_role_permission` VALUES (50, 1, 1);
INSERT INTO `t_role_permission` VALUES (51, 1, 2);
INSERT INTO `t_role_permission` VALUES (52, 1, 3);
INSERT INTO `t_role_permission` VALUES (53, 1, 4);
INSERT INTO `t_role_permission` VALUES (61, 2, 1);
```

```sql
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
`id` bigint(20) NOT NULL AUTO_INCREMENT,
`username` varchar(255) DEFAULT NULL,
`password` varchar(255) DEFAULT NULL,
`role_id` bigint(20) DEFAULT NULL,
`nickname` varchar(255) DEFAULT NULL,
`email` varchar(255) DEFAULT NULL,
`phone` varchar(255) DEFAULT NULL,
`freeze` int(255) DEFAULT NULL,
`dept_id` bigint(20) DEFAULT NULL,
`remark` varchar(255) DEFAULT NULL,
`insert_time` datetime DEFAULT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_user
-- ----------------------------

INSERT INTO `t_user` VALUES (1, 'admin',
'$2a$10$t9BSP6hInmZm5RJocXVMdOLXzVXh4wgiBaYrM6iUslsrb.5z.eYce', 1, '超级管理员', NULL, NULL, NULL, 9,
'', '2021-05-26 14:41:06');
INSERT INTO `t_user` VALUES (2, 'normal',
'$2a$10$Mv1ruD0gHy9Uq73SbfH80ep1McuJNZiJCjM3BpxAJVr9pt34iwWlS', 2, '普通用户', NULL, NULL, NULL, 4,
'', NULL);
```

2. 后端依赖引入

```xml
<dependencies>
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
<groupId>com.baomidou</groupId>
<artifactId>mybatis-plus-spring-boot3-starter</artifactId>
<version>3.5.6</version>
</dependency>
<dependency>
<groupId>com.mysql</groupId>
<artifactId>mysql-connector-j</artifactId>
<scope>runtime</scope>
</dependency>
<dependency>
<groupId>org.projectlombok</groupId>
<artifactId>lombok</artifactId>
<optional>true</optional>
</dependency>
```

```xml
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-test</artifactId>
<scope>test</scope>
</dependency>
<dependency>
<groupId>io.jsonwebtoken</groupId>
<artifactId>jjwt-api</artifactId>
<version>0.12.5</version>
</dependency>
<dependency>
<groupId>io.jsonwebtoken</groupId>
<artifactId>jjwt-impl</artifactId>
<version>0.12.5</version>
<scope>runtime</scope>
</dependency>
<dependency>
<groupId>io.jsonwebtoken</groupId>
<artifactId>jjwt-jackson</artifactId>
<version>0.12.5</version>
<scope>runtime</scope>
</dependency>
<!-- SpringSecurity 核心依赖 -->
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-security</artifactId>
</dependency>
</dependencies>
```

3. 前端核心逻辑：登录成功后，后端返回Token，前端存储在LocalStorage所有请求请求头携带 Token：Authorization: Bearer xxx未登录、Token过期、权限不足，接收后端统一错误码，跳转登录页前端Axios全局拦截基础配置（核心代码）：

```javascript
// src/utils/request.js
import axios from 'axios'

const service = axios.create({
baseURL: 'http://localhost:8080',
timeout: 5000
})

// 请求拦截：携带Token
service.interceptors.request.use(
config => {
const token = localStorage.getItem('token')
if (token) {
config.headers.Authorization = `Bearer ${token}`
}
```

```javascript
return config
},
error => Promise.reject(error)
)

// 响应拦截：统一处理权限错误
service.interceptors.response.use(
res => res.data,
error => {
const code = error.response.data.code
// 未登录/Token失效
if (code === 401) {
localStorage.removeItem('token')
window.location.href = '/login'
}
return Promise.reject(error)
}
)

export default service
```

4. Security核心配置类

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
private static final String[] WHITE_LIST = {
"/login",
"/doc.html",
"/webjars/**",
"/favicon.ico",
"/druid/**",
"/public/**"
};
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
http
// 关闭CSRF（前后端分离无Cookie，无需防护）
.csrf(AbstractHttpConfigurer::disable)
// 开启跨域
.cors(cors -> cors.configurationSource(corsConfigurationSource()))
// 无状态认证：不创建、不使用Session（核心！前后端分离必备）
.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
/*.exceptionHandling(ex -> ex
.authenticationEntryPoint(authenticationEntryPoint)
.accessDeniedHandler(accessDeniedHandler))*/
//接口放行规则
.authorizeHttpRequests(auth -> auth
.requestMatchers(WHITE_LIST).permitAll()
.anyRequest().authenticated());
//.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
return http.build();
```

```java
}
@Bean
public CorsConfigurationSource corsConfigurationSource() {
CorsConfiguration config = new CorsConfiguration();
config.setAllowedOriginPatterns(List.of("*"));
config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
config.setAllowedHeaders(List.of("*"));
config.setAllowCredentials(true);
config.setExposedHeaders(List.of("Authorization"));
UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
source.registerCorsConfiguration("/**", config);
return source;
}
@Bean
public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
throws Exception {
return configuration.getAuthenticationManager();
}
}
```

@EnableWebSecurity注解：开启 Spring Security 针对 Servlet Web 应用的安全过滤器链，自动注册一整套安全过滤器（登录校验、session、csrf、跨域、权限拦截等）5. 逆向工程6. 创建UserItem

```java
@Data
public class UserItem implements UserDetails {
private final User user;
private final List<String> permissions;
private final Collection<? extends GrantedAuthority> authorities;

public UserItem(User user, List<String> permissions) {
this.user = user;
this.permissions = permissions;
// ROLE_ 前缀用于角色认证，权限 key 直接作为 authority
this.authorities = Stream.concat(
Stream.of(new SimpleGrantedAuthority("ROLE_" + user.getRoleId())),
permissions.stream().map(SimpleGrantedAuthority::new)
).collect(Collectors.toList());
}

@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
return authorities;
}

@Override
public String getPassword() {
return user.getPassword();
}
```

```java
@Override
public String getUsername() {
return user.getUsername();
}

@Override
public boolean isAccountNonExpired() {
return true;
}

@Override
public boolean isAccountNonLocked() {
return user.getFreeze() == null || user.getFreeze() == 0;
}

@Override
public boolean isCredentialsNonExpired() {
return true;
}

@Override
public boolean isEnabled() {
return true;
}
}
```

7. 实现UserDetailsService

```java
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

private final UserMapper userMapper;
private final PermissionMapper permissionMapper;

@Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
.eq(User::getUsername, username)
.last("limit 1"));
if (user == null) {
throw new UsernameNotFoundException("账号不存在");
}
List<String> permissions = permissionMapper.selectPermissionListByRoleId(user.getRoleId())
.stream()
.map(Permission::getPermissionKey)
.collect(Collectors.toList());
return new UserItem(user, permissions);
}
}
```

8. 密码加密原理

使用 BCryptPasswordEncoder单向哈希加密，不可逆，无法解密每次加密生成不同密文，自带随机盐值校验密码时自动比对哈希值，无需比对明文测试加密工具代码：

```java
@Test
public void testPassword(){
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
// 加密明文密码
String encode = encoder.encode("123456");
System.out.println(encode);
// 密码校验
boolean matches = encoder.matches("123456", encode);
System.out.println(matches); // true
}
@Bean
public BCryptPasswordEncoder getPasswordEncoder(){
return new BCryptPasswordEncoder();
}
```

9. 定义Result

```java
@Data
public class Result {

private int code;
private Object data;
private String msg;
private long count;

public Result(int code, Object data, String msg, long count) {
this.code = code;
this.data = data;
this.msg = msg;
this.count = count;
}

public static Result end(int code, Object data, String msg, long count) {
return new Result(code, data, msg, count);
}

public static Result ok(Object data, String msg) {
return new Result(200, data, msg, 0);
}

public static Result ok(String msg) {
return new Result(200, null, msg, 0);
```

```java
}

public static Result fail(String msg) {
return new Result(500, null, msg, 0);
}

public static Result fail(int code, String msg) {
return new Result(code, null, msg, 0);
}
}
```

10. 自定义登录接口 LoginController

```java
@RestController
public class LoginController {
@Autowired
private AuthenticationManager authenticationManager;
@Autowired
private MenuService menuService;
@Autowired
private JwtUtil jwtUtil;
@PostMapping("/login")
public Result login(String username, String password) {
try {
Authentication authentication;
try {
authentication = authenticationManager.authenticate(
new UsernamePasswordAuthenticationToken(username, password));
} catch (BadCredentialsException e) {
throw new BadCredentialsException("用户名或密码错误");
} catch (DisabledException e) {
throw new DisabledException("账号已被冻结");
}
UserItem userItem = (UserItem) authentication.getPrincipal();
User user = userItem.getUser();
//测试数据，实质应该是通过userid查询的角色的权限
List<String> permissions = new ArrayList<>();
Collections.addAll(permissions,"ROLE:admin_permission:query","ROLE:normal_permission:insert");
//测试数据，实质应该是通过userid查询的菜单
List<Menu> menuList = menuService.list();
String token = jwtUtil.createToken(user.getId(), user.getUsername(), user.getRoleId(), permissions);
//返回响应数据
Map<String, Object> map = new HashMap<>();
map.put("token",token);
map.put("user",user);
map.put("menuList",menuList);
map.put("permissions",permissions);
return Result.ok(map, "登陆成功");
} catch (BadCredentialsException e) {
return Result.fail(400, "用户名或密码错误");
} catch (Exception e) {
return Result.fail(e.getMessage() != null ? e.getMessage() : "登录失败");
```

```txt
}
}
}
```

11. 接口测试

## 第六章 权限控制实战（角色+接口权限）
## 6.1 权限注解使用（常用4种）
需要开启注解支持：在启动类添加@EnableMethodSecurity（Security6 新注解）

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity // 开启权限注解
public class SecurityApplication {
public static void main(String[] args) {
SpringApplication.run(SecurityApplication.class, args);
}
}
```

## 6.2 权限注解实战代码
```java
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PermissionController {

// 拥有admin角色才能访问
@PreAuthorize("hasRole('admin')")
@GetMapping("/admin")
public String admin() {
return "管理员接口访问成功";
}

// 拥有user权限才能访问
@PreAuthorize("hasAuthority('system:user:list')")
@GetMapping("/user/list")
public String userList() {
return "用户列表接口访问成功";
}

// 多权限满足其一即可
@PreAuthorize("hasAnyRole('admin','user')")
@GetMapping("/common")
public String common() {
return "通用接口访问成功";
}
}
```

## 6.3 面试题：@PreAuthorize 执行原理？
原理剖析：基于AOP动态代理，在接口方法执行前，拦截方法，获取当前登录用户的权限集合，校验注解中的角色/权限是否包含在用户权限中，不匹配则抛出 AccessDeniedException 权限异常。
