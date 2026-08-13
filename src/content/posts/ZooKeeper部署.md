---
title: ZooKeeper的配置
published: 2025-01-15
description: 'ZooKeeper的配置 的详细部署与配置文档。'
image: https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/ZooKeeper%E9%83%A8%E7%BD%B2.assets/cover.webp
tags: [BigData, ZooKeeper, Deployment]
category: 'BigData'
draft: false 
series: Big Data Deployment
seriesOrder: 12
status: verified
testedOn: See article prerequisites
lastVerified: 2026-07-28
---

# ZooKeeper的配置

## 编辑配置文件

```bash
cd /export/servers/zookeeper/conf
```
复制模板为正式配置文件
```bash
sudo cp /export/servers/zookeeper/conf/zoo_sample.cfg /export/servers/zookeeper/conf/zoo.cfg

sudo vim zoo.cfg
```
然后输入ggdG(删除全部内容，大小写严格遵守)，输入以下配置
```bash
# 数据同步的基本时间单位（毫秒），默认2000
tickTime=2000

#  follower初始化连接到leader的最大心跳数（tickTime的倍数）
initLimit=10

#  follower与leader之间发送消息的最大心跳数（超过则认为连接失效）
syncLimit=5

# ZooKeeper数据存储目录（需与HBase的hbase.zookeeper.property.dataDir一致）
dataDir=/export/servers/zookeeper/data

# 客户端连接ZooKeeper的端口（默认2181，HBase会通过此端口连接）
clientPort=2181

# 集群节点配置（格式：server.编号=主机名:通信端口:选举端口）
# 编号需与每个节点的myid文件内容一致
server.1=hadoop01:2888:3888
server.2=hadoop02:2888:3888
server.3=hadoop03:2888:3888

# 允许客户端连接的最大数量（默认60，按需调整）
maxClientCnxns=60

# 自动清理事务日志的时间（小时），默认0表示不自动清理
autopurge.purgeInterval=1
```
![img](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/ZooKeeper%E9%83%A8%E7%BD%B2.assets/wps71.jpg) 

## 在hadoop01上创建数据目录并写入myid

```bash
mkdir -p /export/servers/zookeeper/data

sudo vim /export/servers/zookeeper/data/myid
```
写入以下内容
```txt
1
```
![img](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/ZooKeeper%E9%83%A8%E7%BD%B2.assets/wps72.jpg) 

## ZooKeeper的分发

### 环境变量的分发

```bash
scp /etc/profile hadoop02:/tmp/profile

ssh hadoop02 "sudo cp /tmp/profile /etc/profile && sudo rm /tmp/profile"

scp /etc/profile hadoop03:/tmp/profile

ssh hadoop03 "sudo cp /tmp/profile /etc/profile && sudo rm /tmp/profile"
```
### ZooKeeper的分发
```bash
scp -r /export/servers/zookeeper hadoop02:/tmp/

ssh hadoop02 "sudo cp -r /tmp/zookeeper/ /export/servers/ && sudo rm -rf /tmp/zookeeper"

scp -r /export/servers/zookeeper hadoop03:/tmp/

ssh hadoop03 "sudo cp -r /tmp/zookeeper/ /export/servers/ && sudo rm -rf /tmp/zookeeper"
```
### 分别编辑另2个服务器的myid

进入到hadoop02：
```bash
sudo vim /export/servers/zookeeper/data/myid
```
![img](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/ZooKeeper%E9%83%A8%E7%BD%B2.assets/wps73.jpg) 
进入到hadoop03
```bash
sudo vim /export/servers/zookeeper/data/myid
```
![img](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/ZooKeeper%E9%83%A8%E7%BD%B2.assets/wps74.jpg) 

### 重新加载环境变量

```bash
ssh hadoop02 "bash -c 'source /etc/profile'"

ssh hadoop03 "bash -c 'source /etc/profile'"
```
## ZooKeeper的运行

### 查看端口是否占用

```bash
sudo netstat -tunlp | grep 2181
```
如若有，使用sudo kill pid 进行强制结束该进程

### 为ZooKeeper文件夹赋权

```bash
sudo chown -R hadooper /export/servers/zookeeper

sudo chmod -R 755 /export/servers/zookeeper

ssh hadoop02 "sudo chown -R hadooper /export/servers/zookeeper && sudo chmod -R 755 /export/servers/zookeeper"

ssh hadoop03 "sudo chown -R hadooper /export/servers/zookeeper && sudo chmod -R 755 /export/servers/zookeeper"
```
关闭防火墙
```bash
sudo ufw disable

ssh hadoop02 "sudo ufw disable"

ssh hadoop03 "sudo ufw disable"
```
### 执行ZooKeeper运行指令

执行以下指令，然后执行jps以查看zookeeper是否正常启动，如若正常启动，则如下图所示
```bash
$ZOOKEEPER_HOME/bin/zkServer.sh start

ssh hadoop02 "bash -c 'source /etc/profile && $ZOOKEEPER_HOME/bin/zkServer.sh start'"

ssh hadoop03 "bash -c 'source /etc/profile && $ZOOKEEPER_HOME/bin/zkServer.sh start'"
```
![img](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/ZooKeeper%E9%83%A8%E7%BD%B2.assets/wps75.jpg) 

### 查看选举结果

```bash
$ZOOKEEPER_HOME/bin/zkServer.sh status

ssh hadoop02 "bash -c 'source /etc/profile && $ZOOKEEPER_HOME/bin/zkServer.sh status'"

ssh hadoop03 "bash -c 'source /etc/profile && $ZOOKEEPER_HOME/bin/zkServer.sh status'"
```
>leader出现在哪个节点都可以

![img](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/ZooKeeper%E9%83%A8%E7%BD%B2.assets/wps76.jpg)