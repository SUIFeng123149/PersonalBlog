---
title: Flume集群部署
published: 2025-11-24
description: 'Flume集群部署 的详细部署与配置文档。'
image: https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Flume%E9%83%A8%E7%BD%B2.assets/cover.webp
tags: [BigData, Flume, Deployment]
category: 'BigData'
draft: false 
series: Big Data Deployment
seriesOrder: 2
status: verified
testedOn: See article prerequisites
lastVerified: 2026-07-28
---

# Flume集群部署
## 安装Flume与基础环境
### 下载、解压Flume
```bash
cd /export/software
wget -P /export/software/ https://repo.huaweicloud.com/apache/flume/1.9.0/apache-flume-1.9.0-bin.tar.gz
sudo tar -zxvf /export/software/apache-flume-1.9.0-bin.tar.gz -C /export/servers/
cd /export/servers
sudo mv /export/servers/apache-flume-1.9.0-bin /export/servers/flume
```
### 配置环境变量
编辑 /etc/profile文件
```bash
sudo vim /etc/profile 
```
添加以下内容：
```bash
#Flume环境变量
export FLUME_HOME=/export/servers/flume
export PATH=$PATH:$FLUME_HOME/bin
```
使配置生效
```bash
source /etc/profile
```
### 配置flume-env.sh
```bash
sudo chown -R hadooper:hadooper /export/servers/flume/
cd $FLUME_HOME/conf
cp flume-env.sh.template flume-env.sh
sudo vi flume-env.sh
```
添加以下内容：
```bash
export JAVA_HOME=/export/servers/jdk
```
### 分发配置文件
```bash
scp -r /export/servers/flume hadoop02:/tmp/
scp /etc/profile hadoop02:/etc
scp -r /export/servers/flume hadoop03:/tmp/
scp -r /etc/profile hadoop03:/etc
```
#### 进入hadoop02:
```bash
sudo cp -r /tmp/flume /export/servers
cd /export/servers
sudo chown -R hadooper:hadooper /export/servers/flume/
rm -r /tmp/flume
```
#### 进入hadoop03:
```bash
sudo cp -r /tmp/flume /export/servers
cd /export/servers
sudo chown -R hadooper:hadooper /export/servers/flume/
rm -r /tmp/flume
```
#### 分发完成后进入两个节点中使配置生效
```bash
source /etc/profile
```
### 验证安装
每个节点上执行 flume-ng version。如果正确显示版本信息，则基础安装成功

![image-20260727223124167](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Flume%E9%83%A8%E7%BD%B2.assets/image-20260727223124167.png)
## 配置故障转移模式集群节点
> 故障转移模式和多层数据流模式二选一进行配置即可！

故障转移模式（建议配置）
hadoop01：agent-node，负责采集日志。
hadoop02：collector1-node，接收数据，高优先级。
hadoop03：collector2-node，接收数据，备用优先级。
### 故障转移模式配置 hadoop01 (agent-node)
```bash
cd /$FLUME_HOME/conf/
```
创建配置文件
```bash
touch agent-failover.conf
vi /$FLUME_HOME/conf/agent-failover.conf
```
内容如下：
```properties
# 定义组件名称 
agent1.sources = r1 
agent1.channels = c1 
agent1.sinks = k1 k2 
agent1.sinkgroups = g1 
 
# 配置 Source：监控日志文件 
agent1.sources.r1.type = exec 
agent1.sources.r1.command = tail -F /export/servers/flume/weblog.log 
agent1.sources.r1.channels = c1 
 
# 配置 Channel：使用内存通道 
agent1.channels.c1.type = memory 
agent1.channels.c1.capacity = 10000 
agent1.channels.c1.transactionCapacity = 10000 
 
# 配置第一个 Sink（指向主 Collector） 
agent1.sinks.k1.type = avro 
agent1.sinks.k1.hostname = hadoop02 
agent1.sinks.k1.port = 52020 
agent1.sinks.k1.channel = c1 
 
# 配置第二个 Sink（指向备用 Collector） 
agent1.sinks.k2.type = avro 
agent1.sinks.k2.hostname = hadoop03 
agent1.sinks.k2.port = 52021 
agent1.sinks.k2.channel = c1 
 
# 配置 Sink Group 和故障转移策略 
agent1.sinkgroups.g1.sinks = k1 k2 
agent1.sinkgroups.g1.processor.type = failover 
agent1.sinkgroups.g1.processor.priority.k1 = 10  
agent1.sinkgroups.g1.processor.priority.k2 = 5 
agent1.sinkgroups.g1.processor.maxpenalty = 10000
```
### 故障转移模式配置 hadoop02、hadoop03
分别在每个 Collector 节点上创建配置文件
```bash
cd $FLUME_HOME/conf/
touch collector-hdfs.conf
vi /$FLUME_HOME/conf/collector-hdfs.conf
```
添加内容如下：
故障转移模式hadoop02:
```properties
# 定义组件 
collector1.sources = r1 
collector1.channels = c1 
collector1.sinks = k1 
 
# 配置 Source：监听 Avro 端口 
collector1.sources.r1.type = avro 
collector1.sources.r1.bind = 0.0.0.0  
collector1.sources.r1.port = 52020 
collector1.sources.r1.channels = c1 
 
# 配置 Channel 
collector1.channels.c1.type = memory 
collector1.channels.c1.capacity = 10000 
collector1.channels.c1.transactionCapacity = 10000 
 
# 配置 Sink：写入 HDFS 
collector1.sinks.k1.type = hdfs 
collector1.sinks.k1.channel = c1 
collector1.sinks.k1.hdfs.path = hdfs://mycluster/flume/events/%Y-%m-%d/ 
collector1.sinks.k1.hdfs.filePrefix = events- 
collector1.sinks.k1.hdfs.fileType = DataStream 
collector1.sinks.k1.hdfs.writeFormat = Text 
collector1.sinks.k1.hdfs.rollInterval = 3600 
collector1.sinks.k1.hdfs.rollSize = 0 
collector1.sinks.k1.hdfs.rollCount = 0 
collector1.sinks.k1.hdfs.useLocalTimeStamp = true
```
故障转移模式hadoop03:
```properties
# 定义组件 
collector2.sources = r1 
collector2.channels = c1 
collector2.sinks = k1 
 
# 配置 Source：监听 Avro 端口 
collector2.sources.r1.type = avro 
collector2.sources.r1.bind = 0.0.0.0 
collector2.sources.r1.port = 52021 
collector2.sources.r1.channels = c1 
 
# 配置 Channel 
collector2.channels.c1.type = memory 
collector2.channels.c1.capacity = 10000 
collector2.channels.c1.transactionCapacity = 10000 
 
# 配置 Sink：写入 HDFS 
collector2.sinks.k1.type = hdfs 
collector2.sinks.k1.channel = c1 
collector2.sinks.k1.hdfs.path = hdfs://mycluster/flume/events/%Y-%m-%d/ 
collector2.sinks.k1.hdfs.filePrefix = events- 
collector2.sinks.k1.hdfs.fileType = DataStream 
collector2.sinks.k1.hdfs.writeFormat = Text 
collector2.sinks.k1.hdfs.rollInterval = 3600 
collector2.sinks.k1.hdfs.rollSize = 0 
collector2.sinks.k1.hdfs.rollCount = 0 
collector2.sinks.k1.hdfs.useLocalTimeStamp = true
```
## 启动故障转移模式集群与测试
注：此步骤为故障转移模式的启动与测试！
故障转移模式:
### 故障转移模式启动 Collector 服务
在hadoop02和hadoop03上执行：
hadoop02:
```bash
cd $FLUME_HOME
$FLUME_HOME/bin/flume-ng agent -n collector1 -c conf -f $FLUME_HOME/conf/collector-hdfs.conf -Dflume.root.logger=INFO,console &
```
hadoop03:
```bash
cd $FLUME_HOME
$FLUME_HOME/bin/flume-ng agent -n collector2 -c conf -f $FLUME_HOME/conf/collector-hdfs.conf -Dflume.root.logger=INFO,console &
```
### 故障转移模式启动 Agent 服务
在hadoop01上执行：
```bash
cd $FLUME_HOME
$FLUME_HOME/bin/flume-ng agent -n agent1 -c conf -f $FLUME_HOME/conf/agent-failover.conf -Dflume.root.logger=INFO,console &
```
### 故障转移模式测试数据流
在 hadoop01 上创建测试日志文件
```bash
echo "Test message 1 - $(date)" >> /export/servers/flume/weblog.log

echo "Test message 2 - $(date)" >> /export/servers/flume/weblog.log
```
Agent 日志：应该显示事件被采集和发送
Collector1 (hadoop02) 日志：应该显示接收到数据并写入 HDFS
Collector2 (hadoop03) 日志：作为备用，暂时不应接收数据
检查 HDFS 上是否生成了数据文件
```bash
hdfs dfs -ls hdfs://mycluster/flume/events/
echo "=== 最新数据内容 ==="
hdfs dfs -cat hdfs://mycluster/flume/events/*/*.tmp | tail -10
```
### 故障转移模式测试故障转移功能
在 hadoop02 上停止 Flume Collector
```bash
ps aux | grep flume | grep collector1
kill [进程ID]
```
在 hadoop01 上创建测试日志文件
```bash
echo "Test message 1 - $(date)" >> /export/servers/flume/weblog.log

echo "Test message 2 - $(date)" >> /export/servers/flume/weblog.log
```
观察 Agent 日志是否显示切换到 k2 (hadoop03) 
确认 hadoop03 开始接收数据并写入 HDFS
## 配置多层数据流模式集群节点
>故障转移模式和多层数据流模式二选一进行配置即可！

多层数据流模式
hadoop01：agent1-node，负责采集日志。
hadoop02：agent2-node, collector1-node，负责采集日志,接收1，2节点数据， 
hadoop03：agent3-node, collector2-node，负责采集本节点日志,接收本节点数据
### 多层数据流模式配置hadoop02、hadoop03
多层数据流模式hadoop02:
在/export/servers/flume/conf路径下创建一个collector-hdfs.conf文件 
```bash
cd /export/servers/flume/conf
touch collector-hdfs.conf
vi collector-hdfs.conf
```
并添加以下内容：
```properties
# 定义组件
collector1.sources = r1
collector1.channels = c1
collector1.sinks = k1
 
# 配置 Source：监听 Avro 端口
collector1.sources.r1.type = avro
collector1.sources.r1.bind = 0.0.0.0 
collector1.sources.r1.port = 52020
collector1.sources.r1.channels = c1
 
# 配置 Channel
collector1.channels.c1.type = memory
collector1.channels.c1.capacity = 10000
collector1.channels.c1.transactionCapacity = 10000
 
# 配置 Sink：写入 HDFS
collector1.sinks.k1.type = hdfs
collector1.sinks.k1.channel = c1
collector1.sinks.k1.hdfs.path = hdfs://mycluster/flume/events/%Y-%m-%d/
collector1.sinks.k1.hdfs.filePrefix = events-
collector1.sinks.k1.hdfs.fileType = DataStream
collector1.sinks.k1.hdfs.writeFormat = Text
collector1.sinks.k1.hdfs.rollInterval = 3600
collector1.sinks.k1.hdfs.rollSize = 0
collector1.sinks.k1.hdfs.rollCount = 0
collector1.sinks.k1.hdfs.useLocalTimeStamp = true
```
多层数据流模式hadoop03:
在/export/servers/flume/conf路径下创建一个collector-hdfs.conf文件 
```bash
cd /export/servers/flume/conf
touch collector-hdfs.conf
vi collector-hdfs.conf
```
并添加以下内容：
```properties
# 定义组件
collector2.sources = r1 
collector2.sinks = k1 
collector2.channels = c1 
 
# 配置 Avro Source - 使用不同的端口（如 52021） 
collector2.sources.r1.type = avro 
collector2.sources.r1.bind = 0.0.0.0 
collector2.sources.r1.port = 52021 
collector2.sources.r1.channels = c1
# 添加时间戳拦截器
collector2.sources.r1.interceptors = i1
collector2.sources.r1.interceptors.i1.type = timestamp
collector2.sources.r1.interceptors.i1.preserveExisting = false
 
# 配置 HDFS Sink - 使用不同的 HDFS 路径 
collector2.sinks.k1.type = hdfs 
collector2.sinks.k1.channel = c1 
collector2.sinks.k1.hdfs.path = hdfs://mycluster/flume/events/%Y-%m-%d/ 
collector2.sinks.k1.hdfs.filePrefix = events- 
collector2.sinks.k1.hdfs.round = true 
collector2.sinks.k1.hdfs.roundValue = 10 
collector2.sinks.k1.hdfs.roundUnit = minute 
collector2.sinks.k1.hdfs.rollInterval = 3600 
collector2.sinks.k1.hdfs.rollSize = 0 
collector2.sinks.k1.hdfs.rollCount = 0 
collector2.sinks.k1.hdfs.batchSize = 1000 
collector2.sinks.k1.hdfs.fileType = DataStream 
 
# 配置 Memory Channel 
collector2.channels.c1.type = memory 
collector2.channels.c1.capacity = 1000 
collector2.channels.c1.transactionCapacity = 1000
```
### 多层数据流模式为每个 Agent 节点创建单独的配置文件
多层数据流模式hadoop01:
进入/export/servers/flume/conf/目录
```bash
cd /export/servers/flume/conf/
```
创建新配置文件
```bash
touch agent-node1.conf
vim agent-node1.conf
```
并添加以下内容:
```properties
# 定义组件名称
agent1.sources = r1
agent1.channels = c1
agent1.sinks = k1

# 配置 Source：监控日志文件
agent1.sources.r1.type = exec
agent1.sources.r1.command = tail -F /export/servers/flume/weblog-hadoop01.log
agent1.sources.r1.channels = c1

# 配置 Channel：使用内存通道
agent1.channels.c1.type = memory
agent1.channels.c1.capacity = 10000
agent1.channels.c1.transactionCapacity = 10000

# 配置第一个 Sink（指向主 Collector）
agent1.sinks.k1.type = avro
agent1.sinks.k1.hostname = hadoop02
agent1.sinks.k1.port = 52020
agent1.sinks.k1.channel = c1
```
分别进入hadoop02、hadoop03修改配置文件：

多层数据流模式hadoop02:
```bash
cd /export/servers
sudo chown -R hadooper:hadooper /export/servers/flume/
cd /export/servers/flume/conf
vi agent-node2.conf
```
文件内容如下：
```properties
# 定义组件名称
agent2.sources = r1
agent2.channels = c1
agent2.sinks = k1

# 配置 Source：监控日志文件
agent2.sources.r1.type = exec
agent2.sources.r1.command = tail -F /export/servers/flume/weblog-hadoop02.log
agent2.sources.r1.channels = c1

# 配置 Channel：使用内存通道
agent2.channels.c1.type = memory
agent2.channels.c1.capacity = 10000
agent2.channels.c1.transactionCapacity = 10000

# 配置第一个 Sink（指向主 Collector）
agent2.sinks.k1.type = avro
agent2.sinks.k1.hostname = hadoop02
agent2.sinks.k1.port = 52020
agent2.sinks.k1.channel = c1
```
多层数据流模式hadoop03:
```bash
cd /export/servers
sudo chown -R hadooper:hadooper /export/servers/flume/
cd /export/servers/flume/conf
vi agent-node3.conf
```
文件内容如下：
```properties
# 定义组件名称
agent3.sources = r1
agent3.channels = c1
agent3.sinks = k1

# 配置 Source：监控日志文件
agent3.sources.r1.type = exec
agent3.sources.r1.command = tail -F /export/servers/flume/weblog-hadoop03.log
agent3.sources.r1.channels = c1

# 配置 Channel：使用内存通道
agent3.channels.c1.type = memory
agent3.channels.c1.capacity = 10000
agent3.channels.c1.transactionCapacity = 10000

# 配置第一个 Sink（指向主 Collector）
agent3.sinks.k1.type = avro
agent3.sinks.k1.hostname = hadoop03
agent3.sinks.k1.port = 52021
agent3.sinks.k1.channel = c1
```
## 启动集群与测试
> 此步骤为多层数据流模式的启动与测试！

多层数据流模式:
### 多层数据流模式启动 Collector 服务
在hadoop02和hadoop03上执行：
多层数据流模式hadoop02:
```bash
cd $FLUME_HOME
$FLUME_HOME/bin/flume-ng agent -n collector1 -c conf -f $FLUME_HOME/conf/collector-hdfs.conf -Dflume.root.logger=INFO,console &
```
多层数据流模式hadoop03:
```bash
cd $FLUME_HOME
$FLUME_HOME/bin/flume-ng agent -n collector2 -c conf -f $FLUME_HOME/conf/collector-hdfs.conf -Dflume.root.logger=INFO,console &
```
### 多层数据流模式启动 Agent 服务：
多层数据流模式hadoop01:
```bash
cd $FLUME_HOME
$FLUME_HOME/bin/flume-ng agent -n agent1 -c conf -f $FLUME_HOME/conf/agent-node1.conf -Dflume.root.logger=INFO,console &
```
多层数据流模式hadoop02:
```bash
cd $FLUME_HOME
$FLUME_HOME/bin/flume-ng agent -n agent2 -c conf -f $FLUME_HOME/conf/agent-node2.conf -Dflume.root.logger=INFO,console &
```
多层数据流模式hadoop03:
```bash
cd $FLUME_HOME
$FLUME_HOME/bin/flume-ng agent -n agent3 -c conf -f $FLUME_HOME/conf/agent-node3.conf -Dflume.root.logger=INFO,console &
```
### 多层数据流模式测试数据流
#### 在 hadoop01 上测试​ (发送到 hadoop02:52020)
```bash
echo "Agent1 to Collector1 测试 - $(date)" >> /export/servers/flume/weblog-hadoop01.log
```
#### 在 hadoop02 上测试​ (发送到 hadoop02:52020)
```bash
echo " Agent2 to Collector1 测试 - $(date) " >> /export/servers/flume/weblog-hadoop02.log
```
#### 在 hadoop03 上测试​ (发送到本地 hadoop03:52021)
```bash
echo " Agent3 to Collector2 测试 - $(date) " >> /export/servers/flume/weblog-hadoop03.log
```
#### 验证 HDFS 数据写入
```bash
hdfs dfs -ls hdfs://mycluster/flume/events/
echo "=== 最新数据内容 ==="
hdfs dfs -cat hdfs://mycluster/flume/events/*/*.tmp | tail -10
```