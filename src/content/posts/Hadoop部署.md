---
title: "Hadoop的部署"
published: 2025-11-11
description: "Hadoop的部署 hadoop的下载 解压压缩包 hadoop的配置 修改hadoop配置文件 修改hadoop env.sh 添加以下内容 修改core site.xml文件 在 <configuration 标签内新增以下配置（严格缩进，与原有配置同级） 修改hdfs site.xml文件 在 <configuration 标签内新增以下配置（严格缩进，与原有配置同级） 修改mapred s"
image: "https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Hadoop%E9%83%A8%E7%BD%B2.assets/cover.webp"
tags: ["BigData", "Hadoop", "Deployment"]
category: "BigData"
draft: false
featured: false
lang: ""
series: "Big Data Deployment"
seriesOrder: 5
status: verified
testedOn: "See article prerequisites"
lastVerified: 2026-07-28
---

# Hadoop的部署

## hadoop的下载

```bash
cd /export/software
wget -P /export/software/ https://repo.huaweicloud.com/apache/hadoop/common/hadoop-3.4.0/hadoop-3.4.0.tar.gz
```

解压压缩包

`````bash
tar -zxvf /export/software/hadoop-3.4.0.tar.gz -C /export/servers/
cd /export/servers
mv /export/servers/hadoop-3.4.0 /export/servers/hadoop
`````

## hadoop的配置

修改hadoop配置文件

```bash
cd /export/servers/hadoop/etc/hadoop
```

### 修改hadoop-env.sh

```bash
sudo vim /export/servers/hadoop/etc/hadoop/hadoop-env.sh
```

添加以下内容

```bash
export JAVA_HOME=/export/servers/jdk
```

### 修改core-site.xml文件

```bash
sudo vim /export/servers/hadoop/etc/hadoop/core-site.xml
```

在 <configuration> 标签内新增以下配置（严格缩进，与原有配置同级）

```xml
 <property>
        <name>fs.defaultFS</name>
        <value>hdfs://mycluster</value>
        <description>HDFS默认文件系统URI</description>
    </property>

    <property>
        <name>hadoop.tmp.dir</name>
        <value>/export/servers/hadoop/tmp</value>
        <description>Hadoop临时目录</description>
    </property>

    <property>
        <name>ha.zookeeper.quorum</name>
        <value>hadoop01:2181,hadoop02:2181,hadoop03:2181</value>
        <description>ZooKeeper仲裁地址，用于自动故障转移</description>
    </property>

    <!-- IO配置优化 -->
    <property>
        <name>io.file.buffer.size</name>
        <value>131072</value>
        <description>读写缓冲区大小</description>
    </property>
```

### 修改hdfs-site.xml文件

```bash
sudo vim /export/servers/hadoop/etc/hadoop/hdfs-site.xml
```

在 <configuration> 标签内新增以下配置（严格缩进，与原有配置同级）

```xml
  <!-- ========== 基本HDFS配置 ========== -->
    <property>
        <name>dfs.replication</name>
        <value>3</value>
        <description>数据块副本数量，建议与DataNode数量匹配</description>
    </property>

    <!-- ========== 存储目录配置 ========== -->
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:///export/data/hadoop/hdfs/name</value>
        <description>NameNode元数据存储目录</description>
    </property>

    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:///export/data/hadoop/hdfs/data</value>
        <description>DataNode数据块存储目录</description>
    </property>

    <!-- ========== HA 高可用配置 ========== -->
    <property>
        <name>dfs.nameservices</name>
        <value>mycluster</value>
        <description>HDFS命名服务逻辑名称</description>
    </property>

    <property>
        <name>dfs.ha.namenodes.mycluster</name>
        <value>nn1,nn2,nn3</value>
        <description>NameNode逻辑标识列表</description>
    </property>

    <!-- NameNode RPC地址配置 -->
    <property>
        <name>dfs.namenode.rpc-address.mycluster.nn1</name>
        <value>hadoop01:8020</value>
    </property>
    <property>
        <name>dfs.namenode.rpc-address.mycluster.nn2</name>
        <value>hadoop02:8020</value>
    </property>
    <property>
        <name>dfs.namenode.rpc-address.mycluster.nn3</name>
        <value>hadoop03:8020</value>
    </property>

    <!-- NameNode HTTP地址配置 -->
    <property>
        <name>dfs.namenode.http-address.mycluster.nn1</name>
        <value>0.0.0.0:9870</value>
    </property>
    <property>
        <name>dfs.namenode.http-address.mycluster.nn2</name>
        <value>0.0.0.0:9870</value>
    </property>
    <property>
        <name>dfs.namenode.http-address.mycluster.nn3</name>
        <value>0.0.0.0:9870</value>
    </property>

    <!-- JournalNode集群配置 -->
    <property>
        <name>dfs.namenode.shared.edits.dir</name>
        <value>qjournal://hadoop01:8485;hadoop02:8485;hadoop03:8485/mycluster</value>
        <description>JournalNode仲裁地址，用于NameNode元数据同步</description>
    </property>

    <property>
        <name>dfs.journalnode.edits.dir</name>
        <value>/export/servers/hadoop/journalnode</value>
        <description>JournalNode编辑日志存储目录</description>
    </property>

    <!-- 故障转移配置 -->
    <property>
        <name>dfs.client.failover.proxy.provider.mycluster</name>
        <value>org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider</value>
        <description>故障转移代理提供者类</description>
    </property>

    <property>
        <name>dfs.ha.automatic-failover.enabled</name>
        <value>true</value>
        <description>启用自动故障转移</description>
    </property>

    <!-- 故障防护配置 -->
    <property>
        <name>dfs.ha.fencing.methods</name>
        <value>sshfence</value>
        <description>故障防护方法，防止脑裂</description>
    </property>

    <property>
        <name>dfs.ha.fencing.ssh.private-key-files</name>
        <value>/home/hadooper/.ssh/id_rsa</value>
        <description>SSH防护使用的私钥文件</description>
    </property>

    <!-- ========== 性能优化配置 ========== -->
    <property>
        <name>dfs.blocksize</name>
        <value>134217728</value>
        <description>HDFS块大小，默认128MB</description>
    </property>

    <property>
        <name>dfs.namenode.handler.count</name>
        <value>100</value>
        <description>NameNode处理线程数</description>
    </property>

    <!-- ========== Web UI 安全配置 ========== -->
    <property>
        <name>dfs.webhdfs.enabled</name>
        <value>true</value>
        <description>启用WebHDFS REST API</description>
    </property>
```

### 修改mapred-site.xml文件

```bash
sudo cp /export/servers/hadoop/etc/hadoop/mapred-site.xml /export/servers/hadoop/etc/hadoop/mapred-site.xml.template
sudo vim /export/servers/hadoop/etc/hadoop/mapred-site.xml
```

在 <configuration> 标签内新增以下配置（严格缩进，与原有配置同级）

```xml
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
    </property>
```

### 修改yarn-site.xml文件

```bash
sudo vim /export/servers/hadoop/etc/hadoop/yarn-site.xml
```

在 <configuration> 标签内新增以下配置（严格缩进，与原有配置同级）

```xml
  <!-- ========== ResourceManager 核心配置 ========== -->
    
    <!-- 指定ResourceManager运行的主机 -->
    <property>
        <name>yarn.resourcemanager.hostname</name>
        <value>hadoop01</value>
        <description>ResourceManager运行的主机名，通常设置为主节点</description>
    </property>
    <!-- ResourceManager Web UI地址，设置为0.0.0.0允许外部访问 -->
    <property>
        <name>yarn.resourcemanager.webapp.address</name>
        <value>0.0.0.0:8088</value>
        <description>ResourceManager的Web界面地址，用于监控和管理集群</description>
    </property>
    <!-- ResourceManager对客户端服务的地址 -->
    <property>
        <name>yarn.resourcemanager.address</name>
        <value>0.0.0.0:8032</value>
        <description>客户端提交应用程序和查询应用程序状态的RPC地址</description>
    </property>
    <!-- ResourceManager调度器地址 -->
    <property>
        <name>yarn.resourcemanager.scheduler.address</name>
        <value>0.0.0.0:8030</value>
        <description>ApplicationMaster与调度器通信以请求资源的地址</description>
    </property>
    <!-- ResourceManager资源追踪器地址 -->
    <property>
        <name>yarn.resourcemanager.resource-tracker.address</name>
        <value>0.0.0.0:8031</value>
        <description>NodeManager向ResourceManager注册和发送心跳的地址</description>
    </property>
    <!-- ========== NodeManager 核心配置 ========== -->
    <!-- NodeManager的辅助服务，必须设置为mapreduce_shuffle -->
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
        <description>NodeManager的辅助服务列表，mapreduce_shuffle是MapReduce必需的</description>
    </property>
    <!-- 指定shuffle处理的类 -->
    <property>
        <name>yarn.nodemanager.aux-services.mapreduce_shuffle.class</name>
        <value>org.apache.hadoop.mapred.ShuffleHandler</value>
        <description>shuffle服务的实现类</description>
    </property>
    <!-- ========== 资源管理配置 ========== -->
    <!-- NodeManager可用的物理内存资源 -->
    <property>
        <name>yarn.nodemanager.resource.memory-mb</name>
        <value>8192</value>
        <description>NodeManager可分配给容器的物理内存总量（MB）</description>
    </property>
    <!-- NodeManager可用的CPU核心数 -->
    <property>
        <name>yarn.nodemanager.resource.cpu-vcores</name>
        <value>4</value>
        <description>NodeManager可分配给容器的虚拟CPU核心数</description>
    </property>
    <!-- 单个容器可申请的最小内存 -->
    <property>
        <name>yarn.scheduler.minimum-allocation-mb</name>
        <value>1024</value>
        <description>调度器分配给每个容器请求的最小内存（MB）</description>
    </property>
    <!-- 单个容器可申请的最大内存 -->
    <property>
        <name>yarn.scheduler.maximum-allocation-mb</name>
        <value>8192</value>
        <description>调度器分配给每个容器请求的最大内存（MB）</description>
    </property>
    <!-- ========== 日志聚合配置 ========== -->
    <!-- 启用日志聚合功能 -->
    <property>
        <name>yarn.log-aggregation-enable</name>
        <value>true</value>
        <description>是否启用日志聚合，启用后容器日志会汇总到HDFS</description>
    </property>
    <!-- 日志在HDFS中的保留时间 -->
    <property>
        <name>yarn.log-aggregation.retain-seconds</name>
        <value>2592000</value>
        <description>聚合日志在HDFS中的保留时间（秒），默认30天</description>
    </property>
    <!-- ========== NodeManager Web UI配置 ========== -->
    <!-- NodeManager Web UI地址 -->
    <property>
        <name>yarn.nodemanager.webapp.address</name>
        <value>0.0.0.0:8042</value>
        <description>NodeManager的Web界面地址</description>
    </property>
    <!-- 远程日志目录 -->
    <property>
        <name>yarn.nodemanager.remote-app-log-dir</name>
        <value>/tmp/logs</value>
        <description>应用程序日志在HDFS中的存储目录</description>
    </property>
```

### 修改workers文件

```bash
sudo vim /export/servers/hadoop/etc/hadoop/workers
```

更改为如下内容

```txt
hadoop01
hadoop02
hadoop03
```

## hadoop的分发

### 配置hadoop环境变量

分别配置3个服务器hadoop系统环境变量

```bash
sudo bash -c 'cat >> /etc/profile << "EOF"
export HADOOP_HOME=/export/servers/hadoop
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin
EOF'

ssh hadoop02 "sudo tee -a /etc/profile << 'EOF'
export HADOOP_HOME=/export/servers/hadoop
export PATH=\$PATH:/export/servers/hadoop/bin:/export/servers/hadoop/sbin
EOF"

ssh hadoop03 "sudo tee -a /etc/profile << 'EOF'
export HADOOP_HOME=/export/servers/hadoop
export PATH=\$PATH:/export/servers/hadoop/bin:/export/servers/hadoop/sbin
EOF"
```

### 分发hadoop配置文件

```bash
scp -r /export/servers/hadoop hadoop02:/tmp/
ssh hadoop02 "sudo cp -r /tmp/hadoop/ /export/servers/ && sudo rm -rf /tmp/hadoop"
scp -r /export/servers/hadoop hadoop03:/tmp/
ssh hadoop03 "sudo cp -r /tmp/hadoop/ /export/servers/ && sudo rm -rf /tmp/hadoop"
```

### 验证hadoop是否成功安装

```bash
source /etc/profile
hadoop version
ssh hadoop02 "bash -c 'source /etc/profile && hadoop version'"
ssh hadoop03 "bash -c 'source /etc/profile && hadoop version'"
```

## hadoop的运行

### hadoop运行环境变量的更改

```bash
sudo bash -c 'cat >> /etc/profile << EOF
# Hadoop环境变量配置
# 配置HDFS相关进程的运行用户
export HDFS_NAMENODE_USER=hadooper
export HDFS_DATANODE_USER=hadooper
export HDFS_SECONDARYNAMENODE_USER=hadooper
# 配置YARN相关进程的运行用户
export YARN_RESOURCEMANAGER_USER=hadooper
export YARN_NODEMANAGER_USER=hadooper
EOF'

ssh hadoop02 "sudo bash -c 'cat >> /etc/profile << \"EOF\"
# Hadoop环境变量配置
# 配置HDFS相关进程的运行用户
export HDFS_NAMENODE_USER=hadooper
export HDFS_DATANODE_USER=hadooper
export HDFS_SECONDARYNAMENODE_USER=hadooper
# 配置YARN相关进程的运行用户
export YARN_RESOURCEMANAGER_USER=hadooper
export YARN_NODEMANAGER_USER=hadooper
EOF'"

ssh hadoop03 "sudo bash -c 'cat >> /etc/profile << \"EOF\"
# Hadoop环境变量配置
# 配置HDFS相关进程的运行用户
export HDFS_NAMENODE_USER=hadooper
export HDFS_DATANODE_USER=hadooper
export HDFS_SECONDARYNAMENODE_USER=hadooper
# 配置YARN相关进程的运行用户
export YARN_RESOURCEMANAGER_USER=hadooper
export YARN_NODEMANAGER_USER=hadooper
EOF'"
```

### 重新加载环境变量

```bash
source /etc/profile
ssh hadoop02 "bash -c 'source /etc/profile'"
ssh hadoop03 "bash -c 'source /etc/profile'"
```

最终的环境变量配置如下图

![image-20260727211056788](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Hadoop%E9%83%A8%E7%BD%B2.assets/image-20260727211056788.png)

### 首次启动hadoop

创建必要文件夹

```bash
sudo mkdir -p /export/servers/hadoop/logs
sudo chown -R hadooper /export/servers/hadoop/
sudo chmod -R 755 /export/servers/hadoop/
sudo mkdir -p /export/data/hadoop/
sudo chown -R hadooper /export/data/hadoop/
sudo chmod -R 755 /export/data/hadoop/
ssh hadoop02 "sudo mkdir -p /export/servers/hadoop/logs && sudo chown -R hadooper /export/servers/hadoop/ && sudo chmod -R 755 /export/servers/hadoop/ && sudo mkdir -p /export/data/hadoop/ && sudo chown -R hadooper /export/data/hadoop/ && sudo chmod -R 755 /export/data/hadoop/"
ssh hadoop03 "sudo mkdir -p /export/servers/hadoop/logs && sudo chown -R hadooper /export/servers/hadoop/ && sudo chmod -R 755 /export/servers/hadoop/ && sudo mkdir -p /export/data/hadoop/ && sudo chown -R hadooper /export/data/hadoop/ && sudo chmod -R 755 /export/data/hadoop/"
```

启动ZooKeeper

```bash
$ZOOKEEPER_HOME/bin/zkServer.sh start
ssh hadoop02 "bash -c 'source /etc/profile && $ZOOKEEPER_HOME/bin/zkServer.sh start'"
ssh hadoop03 "bash -c 'source /etc/profile && $ZOOKEEPER_HOME/bin/zkServer.sh start'"
```

启动journalnode

```bash
hdfs --daemon start journalnode
ssh hadoop02 "bash -c 'source /etc/profile && hdfs --daemon start journalnode'"
ssh hadoop03 "bash -c 'source /etc/profile && hdfs --daemon start journalnode'"
```

该步骤需要在服务器hadoop01上运行，当且仅当在第一次启动hadoop前进行初始化文件系统

```bash
hdfs namenode -format
```

> 该代码只能在第一次启动hdfs集群时进行操作！

启动namenode

```bash
hdfs namenode -initializeSharedEdits
hdfs --daemon start namenode
ssh hadoop02 "bash -c 'source /etc/profile && hdfs namenode -bootstrapStandby'"
ssh hadoop03 "bash -c 'source /etc/profile && hdfs namenode -bootstrapStandby'"
```

执行运行脚本

```bash
cd /export/servers/hadoop/sbin
bash /export/servers/hadoop/sbin/start-all.sh
```

启动ZKFC

```bash
hdfs zkfc -formatZK
hdfs --daemon start zkfc
ssh hadoop02 "bash -c 'source /etc/profile && hdfs --daemon start zkfc'"
ssh hadoop03 "bash -c 'source /etc/profile && hdfs --daemon start zkfc'"
```

启动JobHistory

```bash
mapred --daemon start historyserver
ssh hadoop02 "bash -c 'source /etc/profile && mapred --daemon start historyserver'"
ssh hadoop03 "bash -c 'source /etc/profile && mapred --daemon start historyserver'"
```

验证各部分是否成功启动

```bash
jps
ssh hadoop02 "bash -c 'source /etc/profile && jps'"
ssh hadoop03 "bash -c 'source /etc/profile && jps'"
```

![image-20260727211309354](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Hadoop%E9%83%A8%E7%BD%B2.assets/image-20260727211309354.png)

### 后续启动与关闭hadoop

启动ZooKeeper

```bash
$ZOOKEEPER_HOME/bin/zkServer.sh start
ssh hadoop02 "bash -c 'source /etc/profile && $ZOOKEEPER_HOME/bin/zkServer.sh start'"
ssh hadoop03 "bash -c 'source /etc/profile && $ZOOKEEPER_HOME/bin/zkServer.sh start'"
```

启动hadoop

```bash
bash /export/servers/hadoop/sbin/start-all.sh
```

启动JobHistory

```bash
mapred --daemon start historyserver
ssh hadoop02 "bash -c 'source /etc/profile && mapred --daemon start historyserver'"
ssh hadoop03 "bash -c 'source /etc/profile && mapred --daemon start historyserver'"
```

![image-20260727211353085](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Hadoop%E9%83%A8%E7%BD%B2.assets/image-20260727211353085.png)

关闭JobHistory

```bash
mapred --daemon stop historyserver
ssh hadoop02 "bash -c 'source /etc/profile && mapred --daemon stop historyserver'"
ssh hadoop03 "bash -c 'source /etc/profile && mapred --daemon stop historyserver'"
```

关闭hadoop

```bash
bash /export/servers/hadoop/sbin/stop-all.sh
```

关闭ZooKeeper

```bash
$ZOOKEEPER_HOME/bin/zkServer.sh stop
ssh hadoop02 "bash -c 'source /etc/profile && $ZOOKEEPER_HOME/bin/zkServer.sh stop'"
ssh hadoop03 "bash -c 'source /etc/profile && $ZOOKEEPER_HOME/bin/zkServer.sh stop'"
```

![image-20260727211441610](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Hadoop%E9%83%A8%E7%BD%B2.assets/image-20260727211441610.png)

## 测试

浏览器访问下列网址(IP需替换)

DataNode Information

```txt
http://10.1.100.20:9864
http://10.1.100.21:9864
http://10.1.100.22:9864
```

![image-20260727211546833](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Hadoop%E9%83%A8%E7%BD%B2.assets/image-20260727211546833.png)

NodeManager information

```txt
http://10.1.100.20:8042
http://10.1.100.21:8042
http://10.1.100.22:8042
```

![image-20260727211558832](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Hadoop%E9%83%A8%E7%BD%B2.assets/image-20260727211558832.png)

Namenode information

```txt
http://10.1.100.20:9870/
```

![image-20260727211609571](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Hadoop%E9%83%A8%E7%BD%B2.assets/image-20260727211609571.png)

Nodes of the cluster

```txt
http://10.1.100.20:8088/
```

![image-20260727211621884](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Hadoop%E9%83%A8%E7%BD%B2.assets/image-20260727211621884.png)

JobHistory

```txt
http://10.1.100.20:19888/jobhistory/
http://10.1.100.21:19888/jobhistory/
http://10.1.100.22:19888/jobhistory/
```

![image-20260727211635601](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Hadoop%E9%83%A8%E7%BD%B2.assets/image-20260727211635601.png)

访问成功且有内容即代表成功启动




