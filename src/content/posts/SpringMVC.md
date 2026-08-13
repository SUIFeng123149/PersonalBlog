---
title: "SpringMVC"
published: 2026-08-13
description: "DispatcherServlet : 核心控制器 ，用来接收所有Controller请求的，进行请求的分发HandlerMapper ： 存储了所有地址和控制器的映射HandlerAdapter : 处理请求参数的适配器，将处理后的参数注入到Controller方法的参数中Hanlder： 控制器ModelAndView ： 是一个封装了响应数据和跳转地址的一个对象ViewResolver : "
image: ""
tags: ["SpringMVC", "Java", "Web"]
category: "SpringMVC"
draft: false
featured: false
lang: ""
status: verified
testedOn: ""
lastVerified: 2026-08-13
---

# SpringMVC
DispatcherServlet : 核心控制器 ，用来接收所有Controller请求的，进行请求的分发HandlerMapper ： 存储了所有地址和控制器的映射HandlerAdapter : 处理请求参数的适配器，将处理后的参数注入到Controller方法的参数中Hanlder： 控制器ModelAndView ： 是一个封装了响应数据和跳转地址的一个对象ViewResolver : 视图解析器，为跳转的视图地址添加前缀和后缀View ： 视图

## 1. SpringMVC搭建
1. 创建Maven的Web工程2. 导入SpringMVC的pom依赖

```xml
<dependency>
<groupId>org.springframework</groupId>
<artifactId>spring-webmvc</artifactId>
<version>5.2.4.RELEASE</version>
</dependency>
```

3. 配置DispatcherServlet : 在web.xml中配置

```xml
<servlet>
<servlet-name>spring</servlet-name>
<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
<load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
<servlet-name>spring</servlet-name>
<url-pattern>/*</url-pattern>
</servlet-mapping>
```

也指定配置文件的位置和名字：

```xml
<!-- 自定义配置文件的位置和名字 -->
<init-param>
<param-name>contextConfigLocation</param-name>
<param-value>classpath:spring-servlet.xml</param-value>
</init-param>
```

4. 在WEB-INF目录中创建 spring-servlet.xml 配置文件

```xml
<context:component-scan base-package="com.hyxy.controller"></context:component-scan>
```

5. 创建 com.hyxy.controller.TestController类

```java
@Controller
public class TestController {
@RequestMapping("/test")
public void test(){
System.out.println("test");
}
}
```

启动服务器 访问 /test 控制台输出 test

## 2. SpringMVC的注解
1. @RequestMapping注解 ： 修饰类和方法修饰类，代表访问地址的前缀注解属性：value属性 ： 映射的地址method属性 ： 映射的请求方法params属性 ： 请求中必需要有什么请求参数的名字 ，才能访问这个方法

```java
@Controller
@RequestMapping("/test")
public class TestController {
@RequestMapping(value = "/add", method = RequestMethod.POST)
public void add() {
System.out.println("add");
}
}
```

2. 入参 ： 通过controller方法的参数获得请求参数值1. 方法参数的名字和请求参数的名字一致 ，体现的是基本类型和字符串的参数参数的类型一定要是封装类类型@RequestParam 修饰参数的属性：value属性 ： 指定将哪个请求参数名字的 值 注入到 修饰的参数中required属性 ： 请求参数是必须有的defaultValue属性 ： 设置参数的默认值@PathVariable注解 ： 将地址中变量的值 注入到 参数中

```java
@Controller
@RequestMapping("/test")
public class TestController {
@RequestMapping("/add/{name}/{pwd}")
public void add(@PathVariable("name") String username,
@PathVariable("pwd") String password){
//http://localhost:8088/mvc/test/add/tom/123
System.out.println("add");
System.out.println("username:"+username); //tom
System.out.println("password:"+password); //123
}
}

@RequestHeader
```

可以将请求头中的属性值注入到参数中

```java
@CookieValue
```

将请求中的Cookie数据注入到参数中

```java
@RequestMapping("/add")
public void add(@RequestHeader("Accept") String accept,
@CookieValue(value="username",defaultValue = "rose") String username, Emp emp,
HttpServletRequest request){
System.out.println(request.getMethod());
HttpSession session = request.getSession();
System.out.println(emp.getEmpno());
System.out.println(emp.getEname());
System.out.println(emp.getDept().getDeptname());
System.out.println(accept);
}
```

1. 注入对象的属性值 ：参数是一个对象，请求参数的名字和对象的属性名相同，就能将请求参数的值注入到对象的属性中。

```java
@Controller
@RequestMapping("/test")
public class TestController {
@RequestMapping("/add")
public void add(User user, Emp emp){
System.out.println(user.getUsername());
System.out.println(user.getPassword());
System.out.println(emp.getEmpno());
System.out.println(emp.getEname());
System.out.println(emp.getUsername());
}
}
```

注入关联关系对象

```java
public class Emp {
private String empno;
private String ename;
private String username;
private Dept dept;

public Dept getDept() {
return dept;
}

public void setDept(Dept dept) {
this.dept = dept;
}

public String getUsername() {
return username;
}

public void setUsername(String username) {
```

```java
this.username = username;
}

public String getEmpno() {
return empno;
}

public void setEmpno(String empno) {
this.empno = empno;
}

public String getEname() {
return ename;
}

public void setEname(String ename) {
this.ename = ename;
}
}
public class Dept {
private String deptname;

public String getDeptname() {
return deptname;
}

public void setDeptname(String deptname) {
this.deptname = deptname;
}
}
@Controller
@RequestMapping("/test")
public class TestController {
@RequestMapping("/add")
public void add(Emp emp){
System.out.println(emp.getEmpno());
System.out.println(emp.getEname());
System.out.println(emp.getDept().getDeptname());
}
}
```

3. 入参 request对象 ： 如果要在Controller中使用Request对象，声明在参数中即可

```java
@RequestMapping("/add")
public void add(Emp emp, HttpServletRequest request){
System.out.println(request.getMethod());
HttpSession session = request.getSession();
System.out.println(emp.getEmpno());
System.out.println(emp.getEname());
System.out.println(emp.getDept().getDeptname());
}
```

## 3. 跳转模型数据传递
由于核心控制器拦截了所有的请求，包括了静态页面、图片、样式、javascript等静态资源，导致这些静态资源无法访问，解决的方式两种：1. 核心控制器只拦截 *.do的请求，控制器的映射地址都应该是带.do的2. 在SpringMVC的配置文件中 添加过滤静态资源的地址配置：

```xml
<mvc:annotation-driven/>
<mvc:resources mapping="/html/**" location="/html/"></mvc:resources>
```

SpringMVC的跳转方式：1. 方法返回String ，就是跳转页面的地址2. 方法返回ModelAndView对象，将跳转的地址封装到ModeAndView对象中

## 前后端分离开发的两个注解
1. @RequestBody 修饰参数 ，SpringMVC在入参时，如果有这个注解修饰，读取请求体中的json数据，将其自动解析到参数对象中只要请求体中是json数据并且Content-Type是application/json ，SpringMVC就会自动调用json的解析器，进行解析，解析时要求对象的属性名和json中的属性名相同，也就是结构相同首先添加依赖

```xml
<dependency>
<groupId>com.fasterxml.jackson.core</groupId>
<artifactId>jackson-databind</artifactId>
<version>2.14.2</version>
</dependency>
```

编写Controller

```java
@Controller
@RequestMapping("/test")
public class TestController {
@RequestMapping("/emp")
//入参一个Emp对象的数据，数据是json格式的数据存在于请求体中的
public void test(@RequestBody Emp emp){
System.out.println(emp.toString());
}
}
```

使用测试工具模拟前端发送请求2. @ResponseBody注解修饰的是方法，将方法返回的对象自动解析为json，写入到响应体中（响应回了浏览器）；如果返回的不是对象（基本类型数据、字符串）将基本类型数据、字符串直接写到响应体中测试Controller:

```java
@RequestMapping("/get")
@ResponseBody
public String get(){
return "Hello World";
}
```

测试Controller：

```java
@RequestMapping("/get")
@ResponseBody
public User get(){
User user = new User();
user.setUsername("jack");
user.setPassword("123456");
return user;
}
3. @RestController
```

等同于 @Controller + @ResponseBody 修饰类4. 后端都会有一个 Result类 ： 响应json的格式 ，也就是每个Controller的方法返回的对象都是Result对象，Result类如下：

## 前后端分离模式的图书管理系统
## 跨域问题
是浏览器的一种限制，在一个域的程序中不能向另一个域发送请求，域是由 协议+IP+端口组成的解决跨域问题1. 服务器端解除一些跨域限制 （一般情况不这么做）

```java
@RestController
@RequestMapping("/book")
@CrossOrigin(origins = "http://localhost:8081")
public class BookController {

}
@Component
public class WebConfig implements WebMvcConfigurer {
@Override
public void addCorsMappings(CorsRegistry registry) {
registry.addMapping("/**")
.allowedOrigins("http://localhost:8081")
.allowedMethods("*")
.allowedHeaders("*")
.allowCredentials(true)
.maxAge(3600);

}
}
```

2. 前端解决跨域问题1. 开发阶段Vue中配置 代理 ，在前端访问后台服务使用的地址是相对地址，例如 /book/list ，发送请求时发给node.js 的请求地址不会出现跨域问题的，node.js再对地址进行处理 ，变成服务器的id端口号的地址 ，请求后台服务。

2. 生产阶段因为Vue代码进行打包后，生成了html+css+javascript ，没有node.js ，利用Nginx反向代理服务，访问后端的服务，前端程序都是部署在Nginx中。

将html版的图书管理系统的页面部署到Nginx中1. html中的所有Ajax请求的地址 带 /back

2. 解压Nginx ，查看conf文件夹中的Nginx.config文件3. 在d盘创建book文件夹，将生成的html代码报备到这个位置

```txt
4. 启动Nginx.exe服务，访问http://localhost:10002/view/bookList.html
```

## 文件上传
1. 配置MultipartResolver的Bean，作用是能将上传文件的二进制数据封装为MultipartFile对象，调用这个对象的方法直接进行存储（不用写IO流操作）

```xml
spring-servlet.xml :
<bean id="multipartResolver"
class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
<property name="maxUploadSize" value="5242880"></property>
<property name="defaultEncoding" value="UTF-8"></property>
</bean>
```

2. pom导入FileUpload的依赖

```xml
<dependency>
<groupId>commons-fileupload</groupId>
<artifactId>commons-fileupload</artifactId>
<version>1.4</version>
</dependency>
```

3. 前端的要求： post请求 ，采用AJax的文件上传

4. 后端Controller ，参数是MultipartFile类型，进行入参了

```java
@RestController
public class FileUploadController {
@RequestMapping("/upload")
public Result upload(MultipartFile file){
// D:\\Lession\\uploadFile
File saveDir = new File("D:\\Lession\\uploadFile");
if(!saveDir.exists()){
saveDir.mkdirs();
}
try {
file.transferTo(new File("D:\\Lession\\uploadFile\\" + file.getOriginalFilename()));
} catch (IOException e) {
e.printStackTrace();
return new Result(false,null,e.getMessage());
}
return new Result(true,null,null);
}
}
```

使用接口测试工具进行测试：
