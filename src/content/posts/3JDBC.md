---
title: "JDBC"
published: 2026-07-28
description: "JDBC JDBC概念 Java连接数据库的标准规范，是有一套接口组成的。程序员面向 JDBC 接口的操作，就能对所有类型数据库进行增删改查的操作。 JDBC的编程步骤 向数据库Java2601 的employee表插入一条记录：tom123,8000,5001 1. 将MySQL数据库的驱动（jar包）添加到工程的类库中 mysql的驱动jar包拷贝到工程根目录的lib目录中 lib文件夹 右键"
image: ""
tags: ["MySQL", "Java", "JDBC", "数据库编程"]
category: "MySQL"
draft: false
featured: false
lang: ""
series: "MySQL基础"
seriesOrder: 3
status: verified
testedOn: ""
lastVerified: 2026-08-13
---

# JDBC

## JDBC概念

Java连接数据库的标准规范，是有一套接口组成的。程序员面向**JDBC**接口的操作，就能对所有类型数据库进行增删改查的操作。

## JDBC的编程步骤

向数据库Java2601 的employee表插入一条记录：tom123,8000,5001

1. 将MySQL数据库的驱动（jar包）添加到工程的类库中

   mysql的驱动jar包拷贝到工程根目录的lib目录中

   lib文件夹 右键 add as library

2. 将驱动中的类加载到内存中，只要加载Driver类即可

```java
 //加载Driver类
 try {
    Class.forName("com.mysql.cj.jdbc.Driver");
 } catch (ClassNotFoundException e) {
    throw new RuntimeException(e);
 }
```

3. 创建数据库的连接（创建一个Connection对象）

```java
//加载Driver类
       try {
           Class.forName("com.mysql.cj.jdbc.Driver");
           //MySQL8数据库URL中要有一个时区的参数
           String url =  "jdbc:mysql://localhost:3306/java2601?serverTimezone=UTC";
           String username = "root";
           String password = "root";
           Connection conn = DriverManager.getConnection(url,username,password);
       } catch (ClassNotFoundException e) {
           throw new RuntimeException(e);
       } catch (SQLException e) {
           throw new RuntimeException(e);
       }
```

4. 创建一个能够执行SQL语句的对象（Statement），编写SQL语句，调用Statement对象的executeUpdate方法执行SQL语句
5. 关闭连接

```java
//加载Driver类
       Connection conn = null;
try {
    Class.forName("com.mysql.cj.jdbc.Driver");
    //MySQL8数据库URL中要有一个时区的参数
    String url =  "jdbc:mysql://localhost:3306/java2601?serverTimezone=UTC";
    String username = "root";
    String password = "root";
    conn = DriverManager.getConnection(url,username,password);
    //创建Statement对象：能执行SQL语句
    Statement stmt = conn.createStatement();
    //编写SQL语句
    String sql = "insert into employee(first_name,salary,department_id) " +
            "values('张三',8000,5001)";
    //执行SQL语句 executeUpdate能执行insert、update、delete语句
    stmt.executeUpdate(sql);
} catch (ClassNotFoundException e) {
    throw new RuntimeException(e);
} catch (SQLException e) {
    throw new RuntimeException(e);
}finally {
    if(conn != null){
        conn.close();
    }
}
```

总结：

1. URL参数包括 :
1. user:用户名
1. password:密码
1. serverTimezone：时区
1. characterEncoding：字符集

2. 可能出现的异常：
   1. ClassNotFoundException
   2. SQLException

### 动态操作员工表的交互程序

```java
 import java.sql.Connection;
 import java.sql.DriverManager;
 import java.sql.SQLException;
 import java.sql.Statement;
 import java.util.Scanner;
 public class MainOption {
    public static void main(String[] args) {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
    throw new RuntimeException(e);
}
Connection conn = null;
try {
    conn = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/java2601?serverTimezone=UTC&characterEncoding=utf8",
            "root",
            "root"
    );
//控制台和用户交互，实现动态添加、修改、删除员工数据
Scanner sc=new Scanner(System.in);
while(true){
    System.out.println("----------输入操作编号-----------");
    System.out.println("1.新增员工");
    System.out.println("2.修改员工");
    System.out.println("3.删除员工");
    System.out.println("----------输入操作编号-----------");
    System.out.println("请输入编号：");
    int opNum =  sc.nextInt();
    switch (opNum){
        case 1:
            System.out.println("请输入员工姓名：");
            String firstName = sc.next();
            System.out.println("请输入员工岗位：");
            String job = sc.next();
            System.out.println("请输入员工的工资：");
            String salary = sc.next();
            System.out.println("请输入员工的部门：");
            String department = sc.next();
            Statement stmt = conn.createStatement();
            String sql = "insert into employee(first_name,job_id,salary,department_id) " +
                    "values('"+firstName+"','"+job+"',"+salary+","+department+")";
            stmt.executeUpdate(sql);
            System.out.println("新增完成！");
            break;
        case 2:
            System.out.println("请输入员工编号：");
            String employeeId = sc.next();
            System.out.println("请输入员工姓名：");
            firstName = sc.next();
            System.out.println("请输入员工岗位：");
            job = sc.next();
            System.out.println("请输入员工的工资：");
            salary = sc.next();
            System.out.println("请输入员工的部门：");
            department = sc.next();
            stmt = conn.createStatement();
            sql = "update employee set first_name = '"+firstName+"'," +
                    "job_id='"+job+"',salary="+salary+",department_id="+department+" " +
                    "where employee_id = "+employeeId;
            stmt.executeUpdate(sql);
            System.out.println("更新完成");
                    break;
                case 3:
                    System.out.println("请输入员工编号：");
                    employeeId = sc.next();
                    stmt = conn.createStatement();
                    sql = "delete from employee where employee_id = "+employeeId;
                    stmt.executeUpdate(sql);
                    System.out.println("删除完成");
                    break;
            }
        }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
```

## ResultSet

在查询数据时，通过调用Statement对象的executeQuery方法获得一个ResultSet对象

ResultSet ：结果集 ，这个对象可以抽象为查询出来的二维结果集

ResultSet 的方法：

next方法：行指针向下移动一行，结果集的下一行如果有记录返回true否则返回false getXxx方法： Xxx代表String、Int、Double等 ，获取行上的列数据时，获取出来的数据是什么类型的，就调用相应的getXxx方法。有两种获取列数据方式：1. 通过行号（从1开始） 2. 通过结果集的列名

```java
package com.hyxy;
import java.sql.*;
public class TestJDBC {
    public static void main(String[] args) {
        Connection connection = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String url = "jdbc:mysql://localhost:3306/java2601?serverTimezone=UTC&characterEncoding=utf8";
            String username = "root";
            String password = "root";
            connection = DriverManager.getConnection(url,username,password);
            Statement stmt = connection.createStatement();
            String sql = "select employee_id eid,first_name,job_id,salary from employee";
            ResultSet rs = stmt.executeQuery(sql);
            while(rs.next()){
                System.out.println(rs.getInt("eid")+
                        "\t"+rs.getString("first_name")+
                        "\t"+rs.getString("job_id")+
                        "\t"+rs.getDouble("salary"));
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

使用ResultSet进行登录功能应用：

控制台输入用户名和密码，到数据库的db_users表中验证用户名和密码，提示登录成功/失败

```java
 package com.hyxy;
 import java.sql.*;
 import java.util.Scanner;
 public class TestLogin {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入用户名：");
        String username = scanner.next();
        System.out.println("请输入密码：");
        String password = scanner.next();
        Connection connection = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String url = "jdbc:mysql://localhost:3306/java2601?serverTimezone=UTC&characterEncoding=utf8";
            String user = "root";
            String pw = "root";
            connection = DriverManager.getConnection(url,user,pw);
            Statement stmt = connection.createStatement();
            String sql = "select * from db_users where username = '"+username+"' and password='"+password+"'";
            //判断是否找到数据
            ResultSet rs = stmt.executeQuery(sql);
            if(rs.next()){
                System.out.println("登录成功");
            }else{
                System.out.println("登录失败");
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
 }
```

上面的代码中存在 SQL注入的Bug ： 用户输入的数据中含有一个SQL语句的片段，能和程序中的SQL语句进行组合，进行一些非法的SQL操作

## PreparedStatement

是一个具有预编译、执行SQL语句功能的接口 ，能对SQL语句进行预编译，再设置预编译的参数值 ，再执行SQL语句，能解决SQL注入的问题

```java
 package com.hyxy;
 import java.sql.*;
 import java.util.Scanner;
 public class TestLogin {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入用户名：");
        String username = scanner.nextLine();
        System.out.println("请输入密码：");
        String password = scanner.nextLine();
        Connection connection = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String url = "jdbc:mysql://localhost:3306/java2601?serverTimezone=UTC&characterEncoding=utf8";
            String user = "root";
            String pw = "root";
            connection = DriverManager.getConnection(url,user,pw);
            //Statement stmt = connection.createStatement();
            String sql = "select * from db_users where username = ? and password=? ";
            //获得PreparedStatement对象 同时 预编译SQL语句
            PreparedStatement pstmt = connection.prepareStatement(sql);
            //设置预编译参数值
            pstmt.setString(1,username);
            pstmt.setString(2,password);
            //执行SQL语句
            ResultSet rs = pstmt.executeQuery();
            if(rs.next()){
                System.out.println("登录成功");
            }else{
                System.out.println("登录失败");
            }
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
 }
```

Statement 和 PreparedStatement 的区别

## 5. JDBC的API

1. Connection接口

要进行事务控制时，在JDBC中使用Connection来控制事务，**多条SQL语句要实现本地事务，一定要在同一个** **Connection中执行SQL语句**

Connection控制事务步骤：

  1. 设置手动提交（取消自动提交）

     conn.setAutoCommit(false) ;

  2. 可以设置保存点

     SavePoint savepoint = conn.setSavePoint() ;

  3. 可以回滚事务

     conn.rollback();

     conn.rollback(savepoint);

  4. 提交事务

     conn.commit();

**获得数据库元数据对象 : 例如获得数据库的产品名称、版本、驱动名称版本等**

DataBaseMetaData dbmd = conn.getMetaData();

2. PreparedStatement
3. ResultSet

**获得结果集元数据对象： ResultSetMetaData**

## JDBC封装

将JDBC的实现过程封装到类中，要访问数据库（操作数据库时）调用这个封装类的方法

1. 对JDBC实现步骤的封装（把Connection、PreparedStatment、ResultSet等），调用时需要提供SQL语句

   优点：灵活 ，sql语句还是由程序员提供（编写）

   缺点：SQL语句会出现在上层程序(调用封装类的程序)中，如果底层数据库的结构发生了改变，上层程序中的SQL语句都要进行修改 。 可维护性非常差

2. 把SQL语句封装到类中

   概念：

   DAO类 ： Data Access Object 将对数据库的操作（增删改查CURD）封装到类中，调用DAO的方法实现数据库的增删改查 。**DAO类提供了统一的数据访问接口** 降低了业务处理层和数据存储层的耦合

   VO类 ： Value Object 存储数据库操作数据的对象，通常VO类的结构和表的结构一致

## DBUtils工具类的使用

核心类QueryRunner，调用insert、update、query方法，需要提前创建Connection对象

1. 第一步：封装一个DBUtil类，主要功能是获取连接

```java
package com.hyxy;
pgyy;
import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
//封装创建连接的过程
public class DBUtil {
    static{
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
    //封装一个获得连接的方法
    public static Connection getConnection(){
        String url = "jdbc:mysql://localhost:3306/java2601?serverTimezone=UTC&characterEncoding=utf8";
        String user = "root";
        String pwd = "root";
        try {
            return DriverManager.getConnection(url,user,pwd);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

2. 使用DBUtils工具实现增、删、改、查功能

向员工表中新增一条记录：

```java
public static void main(String[] args) {
    QueryRunner runner = new QueryRunner();
    //预编译型的SQL语句
    String sql = "insert into employee(first_name,job_id) " +
            "values(?,?)";
    Connection conn = DBUtil.getConnection();
    try {
        runner.update(conn,sql,"smith","财务总监");
    } catch (SQLException e) {
        e.printStackTrace();
    }
}
```

向员工表插入一条记录并且获得这条记录的主键自增长值 ，要使用insert方法

```java
//预编译型的SQL语句
       String sql = "insert into employee(first_name,job_id) " +
               "values(?,?)";
       Connection conn = DBUtil.getConnection();
       try {
           BigInteger pk = runner.insert(conn,sql,new ScalarHandler<BigInteger>(),"smith2","财务总监2");
           System.out.println(pk);
       } catch (SQLException e) {
           e.printStackTrace();
       }
```

在一个事务中删除两条数据

```java
QueryRunner runner = new QueryRunner();
        //预编译型的SQL语句
        String sql1 = "delete from employee where employee_id = ?";
        String sql2 = "delete from employee where employee_id = ?";
        Connection conn = DBUtil.getConnection();
        try {
            conn.setAutoCommit(false);
            runner.update(conn,sql1,125);
            runner.update(conn,sql2,124);
            conn.commit();
        } catch (SQLException e) {
            e.printStackTrace();
        }
```

查询员工表的数据

1. 创建员工的VO类 ： Employee类（尽量与表结构一致）
2. 查询所有员工的数据：

```java
QueryRunner runner = new QueryRunner();
       //查询结果是List<Employee>
       String sql = "select * from employee";
       Connection conn = DBUtil.getConnection();
       try {
           List<Employee> list = runner.query(conn, sql, new BeanListHandler<>(Employee.class));
           for (Employee e:list) {
               System.out.println(e);
           }
       } catch (SQLException e) {
           e.printStackTrace();
       }
```

3. 按条件查询员工数据 ：部门是5001的，工资大于3000的员工

```java
QueryRunner runner = new QueryRunner();
       //查询结果是List<Employee>
       String sql = "select * from employee where department_id = ? and salary>=?";
       Connection conn = DBUtil.getConnection();
       try {
           List<Employee> list = runner.query(conn, sql, new BeanListHandler<>(Employee.class),5001,3000);
           for (Employee e:list) {
               System.out.println(e);
           }
       } catch (SQLException e) {
           e.printStackTrace();
       }
```

  4. 按id查询

```java
QueryRunner runner = new QueryRunner();
//查询结果是 Employee
String sql = "select * from employee where employee_id = ?";
Connection conn = DBUtil.getConnection();
try {
    Employee employee = runner.query(conn, sql, new BeanHandler<>(Employee.class),101);
    System.out.println(employee);
} catch (SQLException e) {
    e.printStackTrace();
}
```

作业实例：

1. 创建t_user表

```sql
 DROP TABLE IF EXISTS `t_user`;
 CREATE TABLE `t_user`  (
  `id` int NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `pwd` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
 ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;
 -- ----------------------------
 -- Records of t_user
 -- ----------------------------
 INSERT INTO `t_user` VALUES (2, 'jerry', '888888', 'jerry@126.com');
```

2. 创建t_user的VO类

```sql
package com.hyxy.vo;
public class User {
    private int id;
    private String username;
    private String pwd;
    private String email;
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getPwd() {
        return pwd;
    }
    public void setPwd(String pwd) {
        this.pwd = pwd;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", pwd='" + pwd + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
```

3. 定义UserService类 ：封装了对用户处理的业务功能

```java
package com.hyxy.service;
import com.hyxy.dao.DBUtil;
import com.hyxy.vo.User;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import javax.management.Query;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
public class UserService {
    //注册用户：新增用户
    static void register(User user){
        QueryRunner runner = new QueryRunner();
        String sql = "insert into t_user " +
                "values (default,?,?,?)";
        Connection conn = DBUtil.getConnection();
        try {
            runner.update(conn,sql,user.getUsername(),user.getPwd(),user.getEmail());
        } catch (SQLException e) {
            e.printStackTrace();
        }finally{
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    static boolean logi(String username,String password){
        Connection conn = DBUtil.getConnection();
        QueryRunner runner = new QueryRunner();
        String sql = "select * from t_user where username = ? and pwd = ?";
        try {
            List<User> list = runner.query(conn,sql,new BeanListHandler<>(User.class),
                    username,password);
            if(list.size()>0) return true;
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return false;
    }
    static void update(User user){
        Connection conn = DBUtil.getConnection();
        QueryRunner runner = new QueryRunner();
        String sql = "update t_user set username=?,pwd=?,email=? where id=?";
        try {
            runner.update(conn,sql,user.getUsername(),user.getPwd(),user.getEmail(),user.getId());
        } catch (SQLException e) {
            e.printStackTrace();
        }finally {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    static void delete(String username){
        Connection conn = DBUtil.getConnection();
        QueryRunner runner = new QueryRunner();
        String sql = "delete from t_user where username=?";
        try {
            runner.update(conn,sql,username);
        } catch (SQLException e) {
            e.printStackTrace();
        }finally {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    static List<User> listUsers(){
        Connection conn = DBUtil.getConnection();
        QueryRunner runner = new QueryRunner();
        String sql = "select * from t_user";
        try {
            List<User> list = runner.query(conn,sql,new BeanListHandler<>(User.class));
            return list;
        } catch (SQLException e) {
            e.printStackTrace();
        }finally {
            try {
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return null;
    }
}
```

4. 定义Main类，实现Scanner交互，（密码MD5加盐处理）

```java
package com.hyxy;
import com.hyxy.service.UserService;
import com.hyxy.vo.User;
import java.util.List;
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        while(true) {
            System.out.println("请输入用户名：");
            String user = scanner.next();
            System.out.println("请输入密码：");
            String pwd = scanner.next();
            if (UserService.logi(user, pwd)) {
                System.out.println("登录成功");
                while(true) {
                    System.out.println("请输入操作的编号：");
                    System.out.println("1.注册");
                    System.out.println("2.修改用户");
                    System.out.println("3.删除用户");
                    System.out.println("4.查询所有用户");
                    int op = scanner.nextInt();
                    switch (op){
                        case 1:
                            System.out.println("请输入注册的用户名：");
                            String rname = scanner.next();
                            System.out.println("请输入注册的密码：");
                            String rpwd = scanner.next();
                            System.out.println("请输入注册的邮箱");
                            String remail = scanner.next();
                            User u = new User();
                            u.setUsername(rname);
                            u.setPwd(rpwd);
                            u.setEmail(remail);
                            UserService.register(u);
                            System.out.println("注册成功！");
                            break;
                        case 2:
                            System.out.println("请输入修改的用户名：");
                            String mname = scanner.next();
                            System.out.println("请输入修改的密码：");
                            String mpwd = scanner.next();
                            System.out.println("请输入修改的邮箱");
                            String memail = scanner.next();
                            System.out.println("请输入修改用户的id");
                            int mid = scanner.nextInt();
                            u = new User();
                            u.setUsername(mname);
                            u.setPwd(mpwd);
                            u.setEmail(memail);
                            u.setId(mid);
                            UserService.update(u);
                            System.out.println("修改成功！");
                            break;
                        case 3:
                            System.out.println("请输入删除用户的用户名：");
                            String dusername = scanner.next();
                            UserService.delete(dusername);
                            System.out.println("删除成功！");
                            break;
                        case 4:
                            List<User> list = UserService.listUsers();
                            for(User user1:list){
                                System.out.println(user1);
                            }
                            break;
                    }
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            } else {
                System.out.println("登录失败，重写登录");
            }
        }
    }
}

