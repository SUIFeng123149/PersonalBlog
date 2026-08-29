---
title: "Shiro安全框架"
published: 2026-08-17
description: "Shiro 安全框架概述 第一章 Shiro 核心概述 1.1 Shiro 简介 Apache Shiro 是一款轻量级、灵活、开源的 Java 安全权限框架，相较于 Spring Security，Shiro 配置简单、上手门槛低、独立性强，不依赖任何容器和框架，专注于认证、授权、加密、会话管理四大核心功能。 在企业项目中，Shiro 多用于中小型项目、后台管理系统的权限控制，是 Java 后端"
image: ""
tags: []
category: "web"
draft: false
featured: false
lang: ""
series: ""
status: verified
testedOn: ""
lastVerified: 2026-08-17
---
# Shiro 安全框架概述
## 第一章 Shiro 核心概述
### 1.1 Shiro 简介
Apache Shiro 是一款轻量级、灵活、开源的 Java 安全权限框架，相较于 Spring Security，Shiro 配置简单、上手门槛低、独立性强，不依赖任何容器和框架，专注于认证、授权、加密、会话管理四大核心功能。

在企业项目中，Shiro 多用于中小型项目、后台管理系统的权限控制，是 Java 后端必备的权限框架技术。

### 1.2 Shiro 四大核心功能
Authentication（认证）：登录校验，判断用户是谁（验证用户名、密码）Authorization（授权）：权限校验，判断用户能做什么（角色、资源权限）Session Management（会话管理）：用户会话生命周期管理，前后端分离中适配 Token 会话Cryptography（加密）：密码加密、数据脱敏，内置 MD5、SHA、加盐加密工具

### 1.3 Shiro 核心架构
#### 1.3.1 架构分层
1. Subject（主体）：当前操作用户/程序，所有安全操作的入口，代码中直接操作 Subject2. SecurityManager（安全管理器）：Shiro 核心中枢，统一调度所有安全组件（类似 Spring 的 IOC 容器）3. Realm（域）：数据桥梁，Shiro 不会直接连数据库，通过 Realm 获取用户、角色、权限数据4. Authenticator（认证器）：负责登录认证逻辑校验5. Authorizer（授权器）：负责权限、角色校验逻辑6. SessionManager（会话管理器）：管理 Shiro 自定义会话7. CacheManager（缓存管理器）：缓存权限、角色数据，减少数据库查询8. Cryptography（加密组件）：提供密码加密、解密工具

## 第二章 环境搭建
### 2.1 核心依赖引入
pom.xml 配置如下：

```xml
<parent>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-parent</artifactId>
<version>2.7.18</version>
<relativePath/>
</parent>
```

```xml
<properties>
<java.version>17</java.version>
<jjwt.version>0.12.5</jjwt.version>
</properties>

<dependencies>
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Shiro -->
<dependency>
<groupId>org.apache.shiro</groupId>
<artifactId>shiro-spring-boot-web-starter</artifactId>
<version>1.13.0</version>
</dependency>

<!-- JWT -->
<dependency>
<groupId>io.jsonwebtoken</groupId>
<artifactId>jjwt-api</artifactId>
<version>${jjwt.version}</version>
</dependency>
<dependency>
<groupId>io.jsonwebtoken</groupId>
<artifactId>jjwt-impl</artifactId>
<version>${jjwt.version}</version>
<scope>runtime</scope>
```

```xml
</dependency>
<dependency>
<groupId>io.jsonwebtoken</groupId>
<artifactId>jjwt-jackson</artifactId>
<version>${jjwt.version}</version>
<scope>runtime</scope>
</dependency>

<dependency>
<groupId>cn.hutool</groupId>
<artifactId>hutool-all</artifactId>
<version>5.8.31</version>
</dependency>

<dependency>
<groupId>com.alibaba.fastjson2</groupId>
<artifactId>fastjson2</artifactId>
<version>2.0.52</version>
</dependency>

<dependency>
<groupId>org.projectlombok</groupId>
<artifactId>lombok</artifactId>
<optional>true</optional>
</dependency>

<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-test</artifactId>
<scope>test</scope>
</dependency>
</dependencies>
```

### 2.2 前后端分离核心适配说明
传统 Shiro 基于 Session 会话，前后端分离无 Session，需要手动适配改造：舍弃原生 Session，使用 自定义 Token 作为身份凭证自定义 Shiro 过滤器，拦截前端 Token 解析用户信息自定义 Realm，适配 Token 认证逻辑关闭 Shiro 原生 Session 会话机制

## 第三章 Shiro 核心组件自定义实现
本章为 Shiro 整合核心，依次实现：自定义Token、自定义过滤器、自定义Realm、Shiro全局配置类

### 3.1 自定义登录 Token（无 Session 适配）
实现 Shiro 认证凭证接口，替代原生 UsernamePasswordToken，适配前后端 Token 登录AuthenticationToken 是 Shiro 认证的标准凭证接口，封装用户登录时提交的身份与凭据信息，是subject.login(token) 的入参。

它只是一个数据载体，只存数据，不做校验逻辑。

官方实现类：UsernamePasswordToken（传统账号密码登录）；我们自己写的 ShiroToken 就是自定义实现。

```java
package com.hyxy.sdemo.shiro;

import org.apache.shiro.authc.AuthenticationToken;

/**
* 自定义 Token：前后端分离场景用 JWT 字符串代替 UsernamePasswordToken
*/
public class ShiroToken implements AuthenticationToken {

private final String token;

public ShiroToken(String token) {
this.token = token;
}

@Override
public Object getPrincipal() {
return token;
}

@Override
public Object getCredentials() {
return token;
}
}
```

### 3.2 自定义 Shiro 过滤器（全局请求拦截）
拦截所有前端请求，从 Header 中获取 Token，完成用户身份绑定，是前后端分离适配的核心过滤器

```java
package com.hyxy.sdemo.shiro;

import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson2.JSON;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.web.filter.authc.AuthenticatingFilter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
```

```java
import java.util.Map;

/**
* 自定义认证过滤器：从请求头取出 JWT，交给 Shiro 认证
*/
public class ShiroAuthFilter extends AuthenticatingFilter {

private static final String TOKEN_HEADER = "Authorization";
```

/** 从请求头创建 ShiroToken */

```java
@Override
protected AuthenticationToken createToken(ServletRequest request, ServletResponse response) {
String token = getRequestToken((HttpServletRequest) request);
if (StrUtil.isBlank(token)) {
return null;
}
return new ShiroToken(token);
}
```

/** 未登录 / Token 缺失时进入此方法 */

```java
@Override
protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws Exception {
String token = getRequestToken((HttpServletRequest) request);
if (StrUtil.isBlank(token)) {
responseJson(response, HttpStatus.UNAUTHORIZED.value(), "用户未登录，请先登录");
return false;
}
// 有 Token：执行登录（会走到 Realm 校验 JWT）
return executeLogin(request, response);
}
```

/** Token 校验失败时返回 JSON */

```java
@Override
protected boolean onLoginFailure(AuthenticationToken token, AuthenticationException e,
ServletRequest request, ServletResponse response) {
try {
String msg = e.getMessage() != null ? e.getMessage() : "认证失败";
responseJson(response, HttpStatus.UNAUTHORIZED.value(), msg);
} catch (IOException ignored) {
}
return false;
}
```

/** 读取 Authorization: Bearer xxx */

```java
private String getRequestToken(HttpServletRequest request) {
String token = request.getHeader(TOKEN_HEADER);
if (StrUtil.isNotBlank(token) && token.startsWith("Bearer ")) {
return token.substring(7);
}
return token;
}

private void responseJson(ServletResponse response, int code, String msg) throws IOException {
```

```txt
HttpServletResponse httpResp = (HttpServletResponse) response;
httpResp.setContentType("application/json;charset=UTF-8");
httpResp.setStatus(code);

Map<String, Object> result = new HashMap<>();
result.put("code", code);
result.put("msg", msg);
httpResp.getWriter().write(JSON.toJSONString(result));
}
```

/** 放行跨域预检 OPTIONS */

```java
@Override
protected boolean preHandle(ServletRequest request, ServletResponse response) throws Exception {
HttpServletRequest httpRequest = (HttpServletRequest) request;
if (RequestMethod.OPTIONS.name().equalsIgnoreCase(httpRequest.getMethod())) {
return true;
}
return super.preHandle(request, response);
}
}
```

### 3.3 自定义 Realm（权限数据核心）
Realm 是 Shiro 唯一的数据来源，负责登录认证校验和授权权限查询，需自定义实现两个核心方法

```java
package com.hyxy.sdemo.shiro;

import cn.hutool.core.util.StrUtil;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
* 自定义 Realm：认证（校验 JWT） + 授权（角色/权限）
*/
@Component
public class CustomShiroRealm extends AuthorizingRealm {

@Autowired
private JwtUtil jwtUtil;
```

/** 只处理自定义 ShiroToken */

```java
@Override
public boolean supports(AuthenticationToken token) {
return token instanceof ShiroToken;
}
```

/** 授权：访问带权限注解的接口时触发（教学示例写死） */

```java
@Override
protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
String username = (String) principals.getPrimaryPrincipal();

SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
// 模拟：admin 拥有角色和权限
if ("admin".equals(username)) {
Set<String> roles = new HashSet<>();
roles.add("admin");
info.setRoles(roles);

Set<String> permissions = new HashSet<>();
permissions.add("order:list");
permissions.add("order:add");
info.setStringPermissions(permissions);
}
return info;
}
```

/** 认证：登录或过滤器校验 Token 时触发 */

```java
@Override
protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token)
throws AuthenticationException {
String jwt = (String) token.getPrincipal();
if (StrUtil.isBlank(jwt) || !jwtUtil.verify(jwt)) {
throw new AuthenticationException("Token 无效或已过期，请重新登录");
}

String username = jwtUtil.getUsername(jwt);
// principal 存用户名，credentials 存 jwt
return new SimpleAuthenticationInfo(username, jwt, getName());
}
}
```

### 3.4 Shiro 全局配置类（核心配置）
整合所有组件，注册过滤器、安全管理器、关闭原生Session、配置权限拦截规则

```java
package com.hyxy.sdemo.config;

import com.hyxy.sdemo.shiro.CustomShiroRealm;
import com.hyxy.sdemo.shiro.ShiroAuthFilter;
import org.apache.shiro.mgt.DefaultSessionStorageEvaluator;
import org.apache.shiro.mgt.DefaultSubjectDAO;
```

```java
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.servlet.Filter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
* Shiro 核心配置（教学版：无状态 JWT）
*/
@Configuration
public class ShiroConfig {
```

/** 安全管理器：绑定 Realm，并关闭 Session */

```java
@Bean
public DefaultWebSecurityManager securityManager(CustomShiroRealm customShiroRealm) {
DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
securityManager.setRealm(customShiroRealm);

// 前后端分离：关闭 Shiro Session
DefaultSubjectDAO subjectDAO = new DefaultSubjectDAO();
DefaultSessionStorageEvaluator evaluator = new DefaultSessionStorageEvaluator();
evaluator.setSessionStorageEnabled(false);
subjectDAO.setSessionStorageEvaluator(evaluator);
securityManager.setSubjectDAO(subjectDAO);

return securityManager;
}
```

/** 过滤器链：放行登录，其余走自定义 auth */

```java
@Bean
public ShiroFilterFactoryBean shiroFilterFactoryBean(DefaultWebSecurityManager securityManager) {
ShiroFilterFactoryBean factoryBean = new ShiroFilterFactoryBean();
factoryBean.setSecurityManager(securityManager);

Map<String, Filter> filterMap = factoryBean.getFilters();
filterMap.put("auth", new ShiroAuthFilter());

// LinkedHashMap 保证拦截规则按顺序匹配
Map<String, String> filterRuleMap = new LinkedHashMap<>();
filterRuleMap.put("/login", "anon");
filterRuleMap.put("/**", "auth");
factoryBean.setFilterChainDefinitionMap(filterRuleMap);

return factoryBean;
}
```

/** 开启 @RequiresPermissions 等注解 */

```java
@Bean
public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(
```

```txt
DefaultWebSecurityManager securityManager) {
AuthorizationAttributeSourceAdvisor advisor = new AuthorizationAttributeSourceAdvisor();
advisor.setSecurityManager(securityManager);
return advisor;
}
}
```

## 第四章 Shiro 认证体系
### 4.1 认证核心原理
Shiro 认证核心流程：用户提交账号密码 → 后端校验生成Token → 前端存储Token → 后续请求携带Token认证核心对象：Subject.login(token) 触发 Realm 中 doGetAuthenticationInfo 认证方法

### 4.2 登录接口代码实现
```java
package com.hyxy.sdemo.controller;

import cn.hutool.core.util.StrUtil;
import com.hyxy.sdemo.shiro.JwtUtil;
import com.hyxy.sdemo.shiro.ShiroToken;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
* 登录接口（教学示例）
* POST /login?username=admin&password=123456
* 或 form-urlencoded：username=admin&password=123456
*/
@RestController
public class LoginController {

@Autowired
private JwtUtil jwtUtil;

@PostMapping("/login")
public Map<String, Object> login(@RequestParam String username,
@RequestParam String password) {
if (StrUtil.isBlank(username) || StrUtil.isBlank(password)) {
return result(400, "账号密码不能为空", null);
}

// 模拟数据库校验（示例写死）
```

```java
if (!"admin".equals(username) || !"123456".equals(password)) {
return result(400, "账号或密码错误", null);
}

// 1. 生成 JWT
String token = jwtUtil.createToken(username);

// 2. 交给 Shiro 登录（走 Realm 校验）
Subject subject = SecurityUtils.getSubject();
try {
subject.login(new ShiroToken(token));
} catch (Exception e) {
return result(400, "登录失败：" + e.getMessage(), null);
}

Map<String, String> data = new HashMap<>();
data.put("token", token);
return result(200, "登录成功", data);
}

@PostMapping("/logout")
public Map<String, Object> logout() {
Subject subject = SecurityUtils.getSubject();
subject.logout();
return result(200, "退出成功", null);
}

private Map<String, Object> result(int code, String msg, Object data) {
Map<String, Object> res = new HashMap<>();
res.put("code", code);
res.put("msg", msg);
res.put("data", data);
return res;
}
}

package com.hyxy.sdemo.controller;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
* 受保护接口示例：需要登录，且需要 order:list 权限
*/
@RestController
@RequestMapping("/order")
```

```java
public class OrderController {

@GetMapping("/list")
@RequiresPermissions("order:list")
public Map<String, Object> list() {
Map<String, Object> res = new HashMap<>();
res.put("code", 200);
res.put("msg", "查询订单成功");
res.put("data", "订单列表数据");
return res;
}
}
```

访问OrderController:

### 4.3 Vue3 前端适配登录
前端核心逻辑：登录成功存储 Token，请求头携带 Token 发起请求

```javascript
// Vue3 登录核心代码
const login = async () => {
const res = await axios.post('/api/login', {
username: 'admin',
password: '123456'
})
if(res.code === 200){
// 本地存储Token
localStorage.setItem('token', res.data.token)
ElMessage.success('登录成功')
}
}

// Axios 请求拦截器 统一携带Token
axios.interceptors.request.use(config => {
const token = localStorage.getItem('token')
if(token){
config.headers.Authorization = `Bearer ${token}`
}
return config
})
```

## 从数据库认证
```txt
CustomerShiroRealm :
```

```java
@Override
protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token)
throws AuthenticationException {
String username = (String) token.getPrincipal();
User user = userService.selectByUserName(username);
return new SimpleAuthenticationInfo(user.getUserName(),user.getPassword(),user.getName());

}
LoginController:
@PostMapping("/login")
public Map<String, Object> login(@RequestParam String username,
@RequestParam String password) {
UsernamePasswordToken token = new UsernamePasswordToken(username, password);
Subject subject = SecurityUtils.getSubject();
try {
subject.login(token);
}catch (UnknownAccountException e) {
// 账号不存在
throw new RuntimeException("账号不存在", e);
}catch (AuthenticationException e) {
// 其他所有认证相关异常兜底
throw new RuntimeException("登录认证失败", e);
}

String createToken = jwtUtil.createToken(username);

Map<String, String> data = new HashMap<>();
data.put("token", createToken);
return result(200, "登录成功", data);
}
```

## 第五章 Shiro 授权体系（权限控制实战）
### 5.1 授权核心原理
用户登录成功后，访问需要权限的接口时，Shiro 自动触发 Realm 的 doGetAuthorizationInfo 方法，加载用户角色和权限，完成接口拦截校验。

授权分为两种模式：注解式授权（常用）、配置文件授权

### 5.2 常用权限注解
@RequiresAuthentication：必须登录认证后才能访问@RequiresGuest：游客模式，未登录可访问@RequiresRoles("admin")：必须拥有指定角色

@RequiresPermissions("sys:user:list")：必须拥有指定资源权限

### 5.3 注解权限实战代码
```java
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

/**
* 需要 sys:user:list 权限
*/
@GetMapping("/list")
@RequiresPermissions("sys:user:list")
public Map<String, Object> userList() {
Map<String, Object> res = new HashMap<>();
res.put("code", 200);
res.put("msg", "查询用户列表成功");
res.put("data", "用户列表数据");
return res;
}

/**
* 需要 admin 角色
*/
@GetMapping("/delete")
@RequiresRoles("admin")
public Map<String, Object> deleteUser() {
Map<String, Object> res = new HashMap<>();
res.put("code", 200);
res.put("msg", "删除用户成功");
return res;
}
}
```

