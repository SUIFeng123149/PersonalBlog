---
title: "SpringBoot"
published: 2026-08-13
description: "SpringBoot 第一个Springboot应用 在浏览器访问一个地址，服务响应回 HelloWorld显示在浏览器上1. 创建Springboot工程，可以使用官方的脚手架创建 2. 创建HelloController 在生产阶段部署springboot项目 1. 添加Springboot Maven的插件 2. 导出jar包 ，双击Maven窗口中的package ，在target中找到生"
image: ""
tags: ["SpringBoot", "Java", "后端开发"]
category: "SpringBoot"
draft: false
featured: true
lang: ""
series: "Java安全系列"
seriesOrder: 1
status: verified
testedOn: ""
lastVerified: 2026-08-13
---

# SpringBoot
## 第一个Springboot应用
在浏览器访问一个地址，服务响应回 HelloWorld显示在浏览器上1. 创建Springboot工程，可以使用官方的脚手架创建

```xml
<parent>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-parent</artifactId>
<version>3.3.4</version>
<relativePath/>
</parent>
<dependencies>
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-test</artifactId>
<scope>test</scope>
</dependency>
</dependencies>
```

2. 创建HelloController

```java
@RestController
public class HelloController {
@GetMapping("/test")
public String test(){
return "Hello World";
}
}
3. 访问http://localhost:8080/test 浏览器出现 Hello World
```

## 在生产阶段部署springboot项目
1. 添加Springboot Maven的插件

```xml
<build>
<plugins>
<plugin>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-maven-plugin</artifactId>
</plugin>
</plugins>
</build>
```

2. 导出jar包 ，双击Maven窗口中的package ，在target中找到生成的jar包3. 在cmd中用 java -jar jar包名字 运行

## Springboot的探究
### 1. pom.xml
查看一下 spring-boot-starter-parent

指定了 Springboot的配置文件 的位置和名字定义了各个可能使用到的依赖的版本 ，意味着我使用了Springboot的3.3.4的版本后，其他依赖的版本都已经定义好了。这样就可以减少版本冲突的问题。

查看spring-boot-starter-web , starter是场景启动器，只要导入了场景启动器，这个场景下的所有依赖就导入了尝试将Springboot默认的tomcat服务器 换成 jetty服务器

```xml
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-web</artifactId>
<exclusions>
<exclusion>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-tomcat</artifactId>
</exclusion>
</exclusions>
</dependency>
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
```

### 2. 引导类main方法
```java
public static void main(String[] args) {
//创建了Spring的容器对象
ApplicationContext application =SpringApplication.run(SpringbootDemoApplication.class, args);
System.out.println(application.getBean(HelloController.class));
}
```

### 3. @SpringBootApplication注解
1. 包含了 @ComponentScan的功能 ： 自动扫描引导类所在的包 、子包下的所有类 ，有@Component注解（@Controller、@Service、@Repository）就自动注册为Bean 。代替了<context:component-scan>自定义的Controller、Servlet、配置类都要放到引导类所在的包或子包中2. 包含了@SpringBootConfiguration注解 ，这个注解包含了@Configuration功能 ，引导类本身就是一个配置类，测试：

```java
@SpringBootApplication
public class SpringbootDemoApplication {

public static void main(String[] args) {
//创建了Spring的容器对象
ApplicationContext application =SpringApplication.run(SpringbootDemoApplication.class, args);
System.out.println(application.getBean(HelloController.class));
System.out.println(application.getBean(Person.class));
}

@Bean
public Person person(){
return new Person();
}
}
```

3. 包含了@EnableAutoConfiguration ，开启自动配置 。

tomcat中要配置默认的端口号 8080 ，Web项目的默认上下文路径是 /导入了Web启动器 ，Springboot就会自动注册 DispatcherServlet 、HandlerMapping 、视图解析器等，这些Bean都是通过配置类注册的，也就是说，Web场景启动器中包含了很多配置类，当Springboot在启动时，如果有@EnableAutoConfiguration，会开启自动配置，运行配置类，进行Bean的注册在yaml/yml/properties中配置的数据都是容器中某个bean的属性值因此今后用Springboot整合其他框架或工具时的步骤：1. 引入框架的场景启动器(starter)2. 如果有一些bean没有注册或要替换容器中注册的Bean，自己编写配置类进行Bean的注册3. 配置yaml配置文件

## yaml配置文件写法
示例代码：

```yaml
person:
last-name: tom
age: 20
marr: false
birth: 1995-03-23
maps:
name1: jack
name2: rose
friends:
- zhangsan
- lisi
dog:
name: dog
age: 2
```

@ConfigurationProperties注解

```java
@ConfigurationProperties(prefix = "person")
@Component
public class Person {
private String lastName;
private int age;
private boolean marr;
@DateTimeFormat(pattern = "yyyy-MM-dd")
private Date birth;
private Map maps;
private String[] friends;
private Dog dog;

public String getLastName() {
```

```java
return lastName;
}

public void setLastName(String lastName) {
this.lastName = lastName;
}

public int getAge() {
return age;
}

public void setAge(int age) {
this.age = age;
}

public boolean isMarr() {
return marr;
}

public void setMarr(boolean marr) {
this.marr = marr;
}

public Date getBirth() {
return birth;
}

public void setBirth(Date birth) {
this.birth = birth;
}

public Map getMaps() {
return maps;
}

public void setMaps(Map maps) {
this.maps = maps;
}

public String[] getFriends() {
return friends;
}

public void setFriends(String[] friends) {
this.friends = friends;
}

public Dog getDog() {
return dog;
}

public void setDog(Dog dog) {
this.dog = dog;
```

```txt
}
}
```

其他注解：@PropertySource 和 @ImportResource

## 多环境支持
1. 第一种配置：多文件方式： 每套环境配置都是一个配置文件2. 第二种配置：文档块方式

## 手动热部署
### 自动热部署
### Lombok注解
```java
@ConfigurationProperties(prefix = "person")
@Component
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class Person {
private String lastName;
private int age;
private boolean marr;
@DateTimeFormat(pattern = "yyyy-MM-dd")
private Date birth;
```

```java
private Map maps;
private String[] friends;
private Dog dog;

}
```

### WebMVCConfigurer 配置拦截器
```java
public class MyInterceptor implements HandlerInterceptor {
@Override
public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws
Exception {
System.out.println("preHandle");
return true;
}

@Override
public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
ModelAndView modelAndView) throws Exception {
System.out.println("postHandle");
}
}
@Component
public class MyMvcConfig implements WebMvcConfigurer {
@Override
public void addInterceptors(InterceptorRegistry registry) {
registry.addInterceptor(new MyInterceptor())
.addPathPatterns("/**");
}

}
```

### Springboot整合Durid连接池
pom.xml配置：

```xml
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
<groupId>com.alibaba</groupId>
<artifactId>druid</artifactId>
<version>1.2.23</version>
</dependency>
```

```xml
<dependency>
<groupId>com.alibaba</groupId>
<artifactId>druid-spring-boot-3-starter</artifactId>
<version>1.2.23</version>
</dependency>
<dependency>
<groupId>mysql</groupId>
<artifactId>mysql-connector-java</artifactId>
<version>8.0.22</version>
</dependency>
```

yaml配置：

```yaml
spring:
datasource:
type: com.alibaba.druid.pool.DruidDataSource
druid:
url: jdbc:mysql://localhost:3306/java2601?serverTimezone=UTC&characterEncoding=utf8
username: root
password: root
driver-class-name: com.mysql.cj.jdbc.Driver
max-active: 10
min-idle: 3
initial-size: 2
max-wait: 10000
```

测试类：

```sql
@SpringBootTest
class SpringbootDemoApplicationTests {
@Autowired
private JdbcTemplate jdbcTemplate;

@Test
void testJDBCTemplate(){
List<Map<String,Object>> list = jdbcTemplate.queryForList("select * from t_user");
System.out.println(list);
System.out.println(jdbcTemplate.getDataSource());
}
}
```



