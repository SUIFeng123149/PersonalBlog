---
title: Kafka集群部署
published: 2025-11-21
description: 'Kafka集群部署 的详细部署与配置文档。'
image: './Kafka部署.assets/cover.webp'
tags: [BigData, Kafka, Deployment]
category: 'BigData'
draft: false 
series: Big Data Deployment
seriesOrder: 9
status: verified
testedOn: See article prerequisites
lastVerified: 2026-07-28
---

# Kafka集群部署
## 系统配置调整
### 关闭防火墙
```bash
sudo systemctl stop ufw
sudo systemctl disable ufw
```
### 资源配置调整
编辑`/etc/security/limits.conf`文件

```bash
sudo vi /etc/security/limits.conf
```
添加以下内容：
```properties
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
```
## 安装与配置Kafka集群
### 下载并解压
```bash
cd /export/software
wget -P /export/software/ https://repo.huaweicloud.com/apache/kafka/3.4.0/kafka_2.12-3.4.0.tgz
tar -zxvf /export/software/kafka_2.12-3.4.0.tgz -C /export/servers/
cd /export/servers
mv /export/servers/kafka_2.12-3.4.0 /export/servers/kafka
```
### 配置Kafka服务器参数
编辑修改`/export/servers/kafka/config/server.properties`文件
```bash
sudo chown -R hadooper:hadooper /export/servers/kafka/
vi /export/servers/kafka/config/server.properties
```
hadoop01：
```properties
broker.id=1
listeners=PLAINTEXT://hadoop01:9092
advertised.listeners=PLAINTEXT://hadoop01:9092
log.dirs=/export/servers/kafka/kafka-logs
num.partitions=3
zookeeper.connect=hadoop01:2181,hadoop02:2181,hadoop03:2181
default.replication.factor=3
offsets.topic.replication.factor=3
```
```bash
vi /export/servers/kafka/bin/kafka-server-start.sh
```
添加如下内容于脚本开始处：
```bash
export JAVA_HOME=/export/servers/jdk
```
```bash
vi /export/servers/kafka/bin/kafka-server-stop.sh
```
添加如下内容于脚本开始处：
```bash
export JAVA_HOME=/export/servers/jdk
```
删除并替换hive中原有的kafka：
```bash
rm /export/servers/hive-4.0.1/lib/kafka-clients-2.5.0.jar
cp /export/servers/kafka/libs/kafka-clients-3.4.0.jar /export/servers/hive-4.0.1/lib/
```
于hadoop01节点分发至hadoop02、hadoop03节点
```bash
scp -r /export/servers/kafka hadoop02:/tmp/
scp -r /export/servers/kafka hadoop03:/tmp/
```
进入hadoop02:
```bash
sudo cp -r /tmp/kafka /export/servers/
rm -r /tmp/kafka
```
编辑修改`/export/servers/kafka/config/server.properties`文件
```bash
sudo chown -R hadooper:hadooper /export/servers/kafka/
vi /export/servers/kafka/config/server.properties
```
hadoop02:
```properties
broker.id=2
listeners=PLAINTEXT://hadoop02:9092
advertised.listeners=PLAINTEXT://hadoop02:9092
log.dirs=/export/servers/kafka/kafka-logs
num.partitions=3
zookeeper.connect=hadoop01:2181,hadoop02:2181,hadoop03:2181
default.replication.factor=3
offsets.topic.replication.factor=3
```
进入hadoop03:
```bash
sudo cp -r /tmp/kafka /export/servers/
rm -r /tmp/kafka
```
编辑修改/export/servers/kafka/config/server.properties文件
```bash
sudo chown -R hadooper:hadooper /export/servers/kafka/
vi /export/servers/kafka/config/server.properties
```
hadoop03:
```properties
broker.id=3
listeners=PLAINTEXT://hadoop03:9092
advertised.listeners=PLAINTEXT://hadoop03:9092
log.dirs=/export/servers/kafka/kafka-logs
num.partitions=3
zookeeper.connect=hadoop01:2181,hadoop02:2181,hadoop03:2181
default.replication.factor=3
offsets.topic.replication.factor=3
```
## 启动集群验证
### 启动ZooKeeper集群：在各节点上启动ZooKeeper服务
启动节点
```bash
zkServer.sh start
```
检查节点角色（Leader/Follower）
```bash
zkServer.sh status
```
### 启动Kafka集群
按顺序在每个Kafka节点上，使用以下命令启动Kafka服务：
```bash
cd /export/servers/kafka
mkdir -p /export/servers/kafka/logs
mkdir -p /export/servers/kafka/kafka-logs
/export/servers/kafka/bin/kafka-server-start.sh -daemon /export/servers/kafka/config/server.properties
```
### 测试
```bash
jps
```
出现同时出现QuorumPeerMain和Kafka则代表服务启动成功,如下图所示

![image-20260727222551750](./Kafka%E9%83%A8%E7%BD%B2.assets/image-20260727222551750.png)
#### 测试集群工作状态
在hadoop01上创建topic:
```bash
/export/servers/kafka/bin/kafka-topics.sh --create --bootstrap-server hadoop01:9092,hadoop02:9092,hadoop03:9092 --replication-factor 3 --partitions 3 --topic my-test-topic
```
#### 查看topic描述确认分区和副本分配情况
```bash
/export/servers/kafka/bin/kafka-topics.sh --describe --bootstrap-server hadoop01:9092 --topic my-test-topic
```
#### 验证生产消费端是否消息互通：
hadoop01(生产者):
```bash
/export/servers/kafka/bin/kafka-console-producer.sh --bootstrap-server hadoop01:9092 --topic my-test-topic
```
hadoop02(消费者):
```bash
/export/servers/kafka/bin/kafka-console-consumer.sh --bootstrap-server hadoop02:9092 --topic my-test-topic --from-beginning
```
hadoo03(消费者):
```bash
/export/servers/kafka/bin/kafka-console-consumer.sh --bootstrap-server hadoop03:9092 --topic my-test-topic --from-beginning
```
#### 测试集群状态

在hadoop01输入数据，在hadoop02、hadoop03查看数据，若全部互通则代表kafka集群正常运行，如下图所示

![image-20260727222719584](./Kafka%E9%83%A8%E7%BD%B2.assets/image-20260727222719584.png)

![image-20260727222722576](./Kafka%E9%83%A8%E7%BD%B2.assets/image-20260727222722576.png)

![image-20260727222727015](./Kafka%E9%83%A8%E7%BD%B2.assets/image-20260727222727015.png)
