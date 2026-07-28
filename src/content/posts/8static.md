---
title: static关键字
published: 2026-07-28
description: 'Java中static关键字的用法及静态属性和方法。'
tags: [Java, JavaSE, 面向对象, static]
category: 'JavaSE'
draft: false
series: Java SE
seriesOrder: 8
---

# static(静态)

static关键字能修饰属性、方法、游离块、内部类。

从面向对象的角度：类是用来描述对象的，也就是类中的属性和方法其实就是用来描述对象，静态的属性、方法是用来描述（修饰）类的。例如Person类中 人口数量这个属性、人类的文明、人类的进化，他们都是用来描述类的，而姓名、年龄等都是用来描述对象的。

从编程语法：**静态的属性对象之间是共享的**

```java
 public class Person {
    String name;
    //人口总数
    static int count;
    public Person(){
        count++;
    }
    public static void main(String[] args) {
        //Person类是JVM第一次使用
        //JVM 加载Person类
        Person p1 = new Person();
        Person p2 = new Person();
        System.out.println(p1.name);
        System.out.println(p2.name);
        System.out.println(p1.count);
        System.out.println(p2.count);
        p1.count = 10;
        System.out.println(p2.count);
    }
 }
```

当JVM第一次要使用某个类的信息时，JVM将这个类加载到内存（方法区），就开始初始化静态的属性。

**静态的属性、方法可以直接用类名来调用**，因为静态的属性和方法 与对象是无关的

静态方法：

```java
 //静态方法
 public static void jinhua(){
    System.out.println("人类的进化");
 }
 public static void main(String[] args) {
    Person.jinhua();
 }
```

**静态方法中不能使用this关键字**，意味着不能调用非静态的属性和方法 。可以调用静态的属性和方法。

## 游离块

在类中的{}就是游离块，**在执行任意某个构造器时，先执行游离块**。如果每个构造器中都要执行一些相同的过程，我们就可以将过程写在游离块中

```java
 public class Person {
    {
        System.out.println("cry....");
        System.out.println("Person的游离块");
    }
    public Person(){
        System.out.println("执行Person构造器");
    }
    public Person(String name){
        System.out.println("执行Person构造器(name)");
    }
    public static void wenming(){
        System.out.println("person wenming");
    }
    public static void main(String[] args) {
        Person p = new Person();
        Person p2 = new Person();
    }
 }
```

## 静态游离块

static修饰的游离块 ，**在类加载时执行，只会一次**，因此我们一般将只执行一次的代码写在静态游离块中。

父类、子类构造器、游离块、静态游离块的执行顺序：new子类对象

父类静态游离块、子类静态游离块、父类游离块、父类构造器、子类游离块、子类构造器

## 单例设计模式

设计模式：为了解决某些特定的问题，人们总结的一些方法

Java一共有23种设计模式

**单例设计模式：一个类只能创建同一个对象， 例如一些应用窗口，无论双击多少次应用，打开的是同一个窗口**

实现：

```java
 public class SingleTon {
    private static SingleTon st = new SingleTon();
    private SingleTon(){
    }
    public static SingleTon getInstance(){
        return st;
    }
 }
```

1. 构造器私有化
2. 定义静态变量存储创建好的对象
3. 定义方法返回这个对象

以上写法是单例的 饿汉写法

懒汉写法如下：

```java
 //懒汉写法
 public class SingleTon {
    private static SingleTon st ;
    private SingleTon(){
    }
    public static SingleTon getInstance(){
        if(st==null)
            st = new SingleTon();
        return st;
    }
 }
```

## abstract(抽象)

修饰类和方法

## 抽象类

1. 抽象类不能实例化
2. 抽象类中可以有抽象方法和非抽象方法，含有抽象方法的类，一定是抽象类。

## 抽象方法

没有方法体

**用一个类继承抽象类，类重写所有的抽象方法**

```java
public abstract class TestAbstract {
   String name;
   int age;
    //可以定义构造器
    public TestAbstract(){
    }
    public TestAbstract(String name, int age) {
        this.name = name;
        this.age = age;
    }
    public abstract void method();
}
public class TestSub extends TestAbstract{
    @Override
    public void method() {
    }
}
```

抽象类就可以了一些结构，编写子类的程序员补充结构中的内容

有时我们要让子类强制重写父类的方法，父类就可以定义为抽象类

```java
 //结构
 public abstract class Shape {
    public abstract double area();
    public double areaSum(Shape[] shapes){
        double sum = 0;
        for (int i = 0; i < shapes.length; i++) {
            sum += shapes[i].area();
        }
        return sum;
    }
 }
```

## final（最终的）关键字

final修饰变量(全局变量/局部变量) 、方法、类

最终类：final修饰的类不能被继承

最终方法：final修饰的方法不能被重写

最终变量：final修饰的变量值和引用不能改变，但是可以改变引用对象的属性。如果final修饰的是全局变量，在创建对象时系统不会初始化默认值，一定要指定其值。

```java
public class Person {
    String name;
    //final int age = 0;
    /*final int age ;
    public Person(){
        age = 0;
    }
    public Person(String name){
        age = 10;
    }*/
/*    final int age ;
    {
        age = 10;
    }*/
}
```

在类中定义常量通常都有 public static final修饰

```java
public class Person {
    public static final String birthAddr = "中国";
}
```

## 内部类

定义在类中的类就是**内部类**，**内部类**的作用就是为所在外部类提供服务的。

**成员内部类**

```java
 public class TestOuter {
    private String outerName;
    //成员内部类
    class TestInner{
        public void test(){
            outerName = "test";
        }
    }
 }
```

都是成员，在访问成员属性、方法时非常方便

但是我们很少在TestOuter之外创建TestInner:

```java
//创建TestInner对象
        TestOuter.TestInner inner =  new TestOuter().new TestInner();
```

## 方法内部类

```java
 //方法内部类
 public void method(){
    class TestInner{
        String innerName;
        public void test(){
            outerName = "test";
        }
    }
 }
```

很少见

## 静态内部类

```java
public class TestOuter {
    private static String outerName;
    //静态内部类
    static class TestInner{
        String innerName;
        public void test(){
            outerName = "test";
        }
    }
}
```

## 匿名内部类

当某个子类只用一次时（创建对象），使用匿名内部类

```java
public static void main(String[] args) {
       //创建的不是Person对象了，而是Person的一个子类对象
       //是一个匿名内部类对象
       Person p = new Person(){
           @Override
           public void eat() {
               System.out.println("test est");
           }
       };
       p.eat();
       //再创建一个这样的对象
       Person p2 = new Person(){
           @Override
           public void eat() {
               System.out.println("test est");
           }
       };
    class NoName extends Person{
        @Override
        public void eat() {
            System.out.println("test est");
        }
    }
    Person p1 = new NoName();
    Person p3 = new NoName();
}
```

计算器的简单例子：

```java
public class Cal {
    private JButton button1 = new JButton("1");
    private JButton button2 = new JButton("2");
    private JButton button3 = new JButton("3");
    private JButton buttonAdd = new JButton("+");
    public Cal(){
        buttonAdd.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                //实现相加功能
            }
        });
        button1.addActionListener(new NumberAction());
        button2.addActionListener(new NumberAction());
    }
    class NumberAction implements ActionListener{
        @Override
        public void actionPerformed(ActionEvent e) {
            //实现按钮的文字显示在 显示区
        }
    }
}
```
