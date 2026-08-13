---
title: "Knife4j 实战"
published: 2026-08-13
description: "Knife4j 是一款基于 Swagger3 二次开发的增强型接口文档工具，专为 Java Spring 生态设计，用于快速生成在线RESTful API 文档，支持接口调试、文档导出、接口分组、权限控制等功能。"
image: ""
tags: ["Knife4j", "接口文档", "Swagger", "OpenAPI3"]
category: "SpringBoot"
draft: false
featured: false
lang: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---

| 适配维度 | SpringBoot2 + Knife4j | SpringBoot3 + Knife4j |
| --- | --- | --- |
| 底层规范 | 兼容 Swagger2/Swagger3 | 仅支持 OpenAPI3（Swagger3），彻底废弃Swagger2 |
| 核心依赖 | 兼容低版本starter | 必须4.0+版本，适配Spring6底层 |
| 配置类 | 支持Docket+OpenAPI双配置 | 推荐纯OpenAPI3配置，规避Spring6兼容报错 |
| 静态资源 | 无需手动放行 | 需手动配置静态资源放行，否则doc.html 404 |
| JDK版本 | JDK8+ | 强制JDK17+ |

# Knife4j 实战
## 第一章：Knife4j 核心认知 & 版本适配说明
### 1.1 什么是 Knife4j？
Knife4j 是一款基于 Swagger3 二次开发的增强型接口文档工具，专为 Java Spring 生态设计，用于快速生成在线RESTful API 文档，支持接口调试、文档导出、接口分组、权限控制等功能。

简单来说：Knife4j = Swagger3 基础功能 + 增强 UI + 企业级扩展功能

### 1.2 SpringBoot2 与 SpringBoot3 整合核心区别（重点）
SpringBoot3 大幅升级底层依赖，废弃 SpringFox，全面原生兼容 OpenAPI3 规范，Knife4j 4.x 针对性做了适配，核心差异如下：

| 对比维度 | 原生 Swagger3 | Knife4j |
| --- | --- | --- |
| UI 界面 | 简陋、交互单一、无暗黑模式 | 极简美观、自适应布局、暗黑模式、层级清晰、一键折叠 |
| 接口调试 | 基础调试，无全局参数缓存 | 强大调试功能，支持全局Header、Token缓存、参数预设 |
| 文档导出 | 无原生导出能力 | 内置 Markdown、HTML、Word、PDF 离线导出 |
| 接口分组 | 配置繁琐，展示混乱 | 极简配置，多模块、多版本灵活分组排序 |
| 生产安全 | 无防护，易泄露接口信息 | 支持动态开关、密码访问、环境隔离、敏感接口隐藏 |

### 1.3 Knife4j 对比原生 Swagger3 优势
### 1.4 核心使用场景
前后端分离项目：SpringBoot3 微服务快速生成标准化接口文档，降低对接成本接口自测：无需Postman，在线一键调试接口、查看请求响应、参数校验微服务迭代维护：文档与代码注解强绑定，自动同步更新团队协作：统一接口规范，新人快速上手微服务项目

## 第二章：SpringBoot3 + Knife4j 环境搭建
### 2.1 新建 SpringBoot3 项目
通过 IDEA / Spring 官网创建 SpringBoot3.2.x/3.3.x 项目，必备依赖：Spring Web（必须，提供REST接口能力），JDK选择17及以上版本。

### 2.2 引入适配 SpringBoot3 的 Knife4j 依赖
SpringBoot3 必须使用 4.0+ 版本，推荐 4.5.0 稳定版，彻底适配 Spring6、OpenAPI3，无版本冲突。

```xml
<!-- Knife4j 适配SpringBoot3 核心依赖 -->
<dependency>
<groupId>com.github.xiaoymin</groupId>
<artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
<version>4.4.0</version>
</dependency>
```

核心依赖说明：该starter已内置 OpenAPI3 核心依赖，无需手动引入任何swagger依赖完全适配 Spring6 新特性，规避 SpringBoot2 升级后的类找不到、方法过期报错自动剔除过时的 SpringFox 依赖，无版本冲突

### 2.3 核心解决方案：静态资源放行（SpringBoot3 必配）
SpringBoot3 严格拦截静态资源，直接访问 doc.html 会报404，必须手动配置静态资源放行，这是SpringBoot3整合Knife4j的关键必配步骤。

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
* SpringBoot3 静态资源放行配置
* 解决 doc.html 404 问题
*/
@Configuration
public class WebResourceConfig implements WebMvcConfigurer {

/**
* 放行Knife4j所有静态资源路径
*/
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
// 放行knife4j核心资源
registry.addResourceHandler("/doc.html")
.addResourceLocations("classpath:/META-INF/resources/");
registry.addResourceHandler("/webjars/**")
.addResourceLocations("classpath:/META-INF/resources/webjars/");
}
```

```txt
}
```

### 2.4 Knife4j 专属配置类（SpringBoot3 纯OpenAPI3版）
摒弃SpringBoot2的Docket过期配置，采用纯OpenAPI3规范配置，适配Spring6底层，零报错、零警告。

```txt
package com.hyxy.demo3.config;
```

```java
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Knife4jOpenApiConfig {

/**
* 全局接口文档信息配置
*/
@Bean
public OpenAPI customOpenAPI() {
return new OpenAPI()
// 文档基础信息
.info(new Info()
.title("Xxx系统接口文档")
.version("3.0.0")
.description("基于SpringBoot3 + Knife4j4.5.0开发的标准化RESTful接口文档，支持在线调试、离线导出")
// 作者信息
.contact(new Contact()
.name("程序员")
.email("demo@163.com"))
// 开源协议
.license(new License()
.name("Apache 2.0")));
}
```

### 2.5 application.yml 完整配置（SpringBoot3 适配）
```yaml
# 服务端口配置
server:
port: 8080

# Spring基础配置
spring:
application:
name: knife4j-springboot3-demo
# 关闭SpringBoot3默认异常页面，适配接口调试
mvc:
```

| 功能场景 | 废弃Swagger2注解（禁止使用） | SpringBoot3 可用OpenAPI3注解 |
| --- | --- | --- |
| 控制器模块标注 | @Api | @Tag |
| 接口方法描述 | @ApiOperation | @Operation |
| 接口参数描述 | @ApiParam | @Parameter |
| 实体类/字段描述 | @ApiModel、@ApiModelProperty | @Schema |
| 隐藏接口/类 | @ApiIgnore | @Hidden |

```yaml
problemdetails:
enabled: true

# Knife4j 核心配置（SpringBoot3 通用）
knife4j:
# 开启增强模式（解锁全部高级功能，必开）
enable: true
# 生产环境开关（true=生产关闭文档，false=开发开启）
production: false
# UI个性化配置
setting:
# 开启暗黑模式
enable-dark-mode: true
# 开启接口搜索
enable-search: true
# 显示参数长度
enable-param-length: true
# 开启接口显示排序
enable-api-sort: true
```

### 2.6 项目启动 & 访问测试
启动 SpringBoot3 项目，无报错即为环境搭建成功，访问官方地址：

```txt
统一访问地址：http://localhost:8080/doc.html
```

成功访问后，可看到美化版Knife4j文档首页，支持暗黑模式、接口搜索等全部功能。

## 第三章：OpenAPI3 核心注解详解（SpringBoot3 专属）
SpringBoot3 彻底废弃Swagger2注解（@Api、@ApiOperation等），仅支持 OpenAPI3 全套注解，本章讲解企业开发必备注解，附带完整可运行代码示例。

### 3.1 核心注解对照表（避坑重点）
### 3.2 完整实战代码示例（实体类 + 控制器）
#### 第一步：用户实体类（@Schema 注解实战）
```java
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
* 用户信息实体类
* OpenAPI3 @Schema 注解专属适配
*/
@Data
@Schema(description = "用户信息查询实体，用于用户接口入参、出参统一封装")
public class User {

@Schema(description = "用户唯一主键ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "10001")
private Long id;

@Schema(description = "用户登录用户名", requiredMode = Schema.RequiredMode.REQUIRED, example =
"zhangsan")
private String username;

@Schema(description = "用户手机号码", requiredMode = Schema.RequiredMode.REQUIRED, example =
"13800138000")
private String phone;

@Schema(description = "用户年龄", requiredMode = Schema.RequiredMode.NOT_REQUIRED, example = "26")
private Integer age;

@Schema(description = "用户状态：0=禁用，1=正常", example = "1")
private Integer status;
}
```

#### 第二步：用户接口控制器（@Tag + @Operation 实战）
```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
* 用户管理模块接口
* SpringBoot3 OpenAPI3 注解标准写法
*/
@RestController
@RequestMapping("/user")
@Tag(name="用户模块",description = "提供用户增删改查功能")
public class UserController {

/**
* 根据ID查询用户详情
*/
@GetMapping("/get/{id}")
```

```java
@Operation(summary = "根据ID查询用户详情", description = "传入用户主键ID，查询对应用户完整信息，返回标准化
```

用户实体数据")

```java
public User getUserById(
@Parameter(name = "id", description = "用户唯一主键ID，不能为空", required = true, example = "10001")
@PathVariable Long id
) {
// 模拟业务数据返回
User user = new User();
user.setId(id);
user.setUsername("zhangsan");
user.setPhone("13800138000");
user.setAge(26);
user.setStatus(1);
return user;
}

/**
* 查询正常用户列表
*/
@GetMapping("/list")
@Operation(summary = "查询正常用户列表", description = "批量查询系统内状态正常的用户数据，支持后续分页扩
```

展")

```java
public String getUserList() {
return "SpringBoot3 + Knife4j 用户列表查询成功！";
}
}
```

### 3.3 效果验证
```txt
重启项目，访问 http://localhost:8080/doc.html，可实现：
```

模块、接口按自定义排序展示所有参数、字段自带说明、示例、必填标识支持在线调试、参数自动填充、响应结果可视化展示

## 第四章：SpringBoot3 进阶核心功能实战
### 4.1 全局Token请求头配置（认证接口通用）
SpringBoot3项目统一JWT认证，配置全局Authorization请求头，所有接口调试自动携带Token，无需重复配置。

```txt
package com.hyxy.demo3.config;
```

```java
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
```

```java
import org.springframework.context.annotation.Configuration;

@Configuration
public class Knife4jOpenApiConfig {
String securitySchemeName = "BearerToken";
/**
* 全局接口文档信息配置
*/
@Bean
public OpenAPI customOpenAPI() {
return new OpenAPI()
// 文档基础信息
.info(new Info()
.title("Xxx接口文档")
.version("3.0.0")
.description("基于SpringBoot3 + Knife4j4.5.0开发的标准化RESTful接口文档，支持在线调试、离线导出")
// 作者信息
.contact(new Contact()
.name("程序员")
.email("demo@163.com"))
// 开源协议
.license(new License()
.name("Apache 2.0")))
// ==========全局Token配置核心代码==========
.components(new Components()
.addSecuritySchemes(securitySchemeName,
new SecurityScheme()
// 类型：http认证
.type(SecurityScheme.Type.HTTP)
// bearer代表JWT
.scheme("bearer")
.bearerFormat("JWT")
.description("请输入Token，格式：Bearer 你的token值")
)
)
// 将安全方案应用到全部接口
.addSecurityItem(new SecurityRequirement().addList(securitySchemeName));
}

}
```

### 4.3 离线文档导出功能
SpringBoot3环境下Knife4j完全保留离线导出能力，支持 Markdown、HTML、Word、PDF 四种格式，操作无兼容问题。

操作步骤：文档页面左侧【文档】→ 选择对应格式 → 一键下载，可直接用于项目交付、接口归档。

### 4.4 敏感接口隐藏配置
针对密码修改、权限配置、后台管理等敏感接口，使用 @Hidden 注解隐藏，不展示在文档中，保障接口安全。

```java
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// 隐藏整个控制器所有接口
@Hidden
@RestController
@RequestMapping("/admin")
public class AdminController {

// 隐藏单个敏感接口
@Hidden
@PostMapping("/updatePwd")
public String updatePwd() {
return "密码修改成功";
}
}
```

## 第五章：SpringBoot3 生产环境安全优化（必学）
### 5.1 多环境动态开关（核心安全配置）
通过SpringBoot3多环境配置，实现开发环境开启文档，生产环境彻底关闭，杜绝接口信息泄露。

application-dev.yml（开发环境）

```yaml
knife4j:
enable: true
production: false
```

application-prod.yml（生产环境）

```yaml
knife4j:
enable: false
production: true
```

### 5.2 文档密码访问保护
部分内网项目需保留文档，可开启密码认证，仅授权人员可访问调试：

```yaml
knife4j:
enable: true
production: false
basic:
enable: true
username: admin
password: 123456
```
