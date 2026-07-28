---
title: Flink部署
published: 2026-05-09
description: 'Flink部署 的详细部署与配置文档。'
image: './Flink部署.assets/cover.webp'
tags: [BigData, Flink, Deployment]
category: 'BigData'
draft: false 
---

# Flink部署文档

>  注：Flink部署需要提前将hadoop集群和zookeeper部署完成并启动

## 环境准备

### 下载 Flink 安装包

```bash
cd /export/software

wget -P /export/software/ https://mirrors.huaweicloud.com/apache/flink/flink-1.18.0/flink-1.18.0-bin-scala_2.12.tgz
```
### 解压Flink

```bash
tar -zxvf flink-1.18.0-bin-scala_2.12.tgz -C /export/servers/

cd /export/servers

mv flink-1.18.0 flink
```
### 配置环境变量

```bash
sudo vim /etc/profile
```
在文件末尾添加：
```bash
#Flink环境变量
export FLINK_HOME=/export/servers/flink **2**export PATH=$PATH:$FLINK_HOME/bin
```

### 刷新环境变量

```bash
source /etc/profile
```
## 配置Flink

### 配置 Hadoop 环境

```bash
cd $FLINK_HOME

mkdir -p conf/hadoop 

cp /export/servers/hadoop/etc/hadoop/core-site.xml conf/hadoop/ 

cp /export/servers/hadoop/etc/hadoop/hdfs-site.xml conf/hadoop/
```
### 配置 flink-conf.yaml

```bash
vim conf/flink-conf.yaml
```
在文件末尾添加（复制粘贴会将内容全部在原有的基础上再加一层#，注意删除多余#）：
```bash
# 1.指定高可用模式为 ZooKeeper (利用现有的 zk 集群)
high-availability: zookeeper

# 2. 指定 ZooKeeper 集群地址 (参考文档中 ZooKeeper 章节的配置)
high-availability.zookeeper.quorum: hadoop01:2181,hadoop02:2181,hadoop03:2181

# 3. Flink 元数据在 HDFS 上的存储路径 (注意: mycluster 是你的 HDFS 逻辑名称)
high-availability.storageDir: hdfs://mycluster/flink/ha/

# 4. JobManager 的内存 (根据你的机器配置调整，文档中建议最低 4G 内存)
jobmanager.memory.process.size: 2048m

# 5. TaskManager 的内存和槽位
taskmanager.memory.process.size: 4096m
taskmanager.numberOfTaskSlots: 4

# 6. 指定 Hadoop 配置路径 (指向上面复制的文件夹)
env.java.opts: "-Dhadoop.user.group.static.mapping.overrides=hadooper:hadooper"
```
## 在 HDFS 上创建目录

>注：先按照文档的启动方式启动Hadoop集群再输入下面的指令
```bash
hdfs dfs -mkdir -p /flink/ha

hdfs dfs -chown -R hadooper:hadooper /flink
```
## 启动与提交任务

### 模式一（Per-Job 模式）：

#### 启动 Flink Session (在 YARN 上)

```bash
cd $FLINK_HOME

./bin/yarn-session.sh -d -jm 1024 -tm 4096 -s 4 -nm flink-on-yarn-session
```

#### 提交作业

```bash
./bin/flink run ./examples/streaming/WordCount.jar
```

### 模式二（Application 模式）

直接将作业提交给 YARN，无需预先启动 Session
```bash
./bin/flink run-application -t yarn-application ./examples/streaming/WordCount.jar
```
## 验证

### 查看 YARN Web UI

打开浏览器访问 http://(hadoop01的IP):8088。
你应该能看到一个状态为 RUNNING 的 Application，名字是你在启动命令中指定的（如 flink-on-yarn-session）

 ![image-20260727192555944](./Flink%E9%83%A8%E7%BD%B2.assets/image-20260727192555944.png)

### 查看 Flink Web UI

>这个UI界面在所有任务均完成时是无法打开的，只要YARN中显示正常即可

![image-20260727192603218](./Flink%E9%83%A8%E7%BD%B2.assets/image-20260727192603218.png) 
在浏览器中输入hadoop01的IP加上控制台中显示的端口号访问
例如：192.168.1.1:39491
