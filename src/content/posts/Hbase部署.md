---
title: Hbase的部署
published: 2025-11-13
description: 'Hbase的部署 的详细部署与配置文档。'
image: './Hbase部署.assets/cover.webp'
tags: [BigData, HBase, Deployment]
category: 'BigData'
draft: false 
series: Big Data Deployment
seriesOrder: 7
status: verified
testedOn: See article prerequisites
lastVerified: 2026-07-28
---

# Hbase的部署
## 部署Hbase
### Habase的部署及配置（根据实际情况修改路径）
下载Hbase
```bash
wget -P /export/software/ https://repo.huaweicloud.com/apache/hbase/2.6.0/hbase-2.6.0-bin.tar.gz
tar -zxvf /export/software/hbase-2.6.0-bin.tar.gz -C /export/servers/
mv /export/servers/hbase-2.6.0 /export/servers/hbase
```
修改文件夹所有者
```bash
sudo chown -R hadooper:hadooper /export/servers/hbase/
```
配置环境变量便于随时调用
```bash
sudo vim /etc/profile 
```
在文件末尾添加以下内容：
```bash
export PATH=$PATH:/export/servers/hbase/bin
```
刷新终端的环境变量
```bash
source /etc/profile
```
验证安装
```bash
hbase version
```

![image-20260727213916831](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727213916831.png)
配置hbase-env.sh
```bash
sudo vim /export/servers/hbase/conf/hbase-env.sh
```
添加下面配置
```bash
export JAVA_HOME=/export/servers/jdk
export HBASE_CLASSPATH=/export/servers/hbase/conf
export HBASE_MANAGES_ZK=false
export HBASE_USER_CLASSPATH_FIRST=true
export HBASE_DISABLE_HADOOP_CLASSPATH_LOOKUP="true" 
```

![image-20260727213946974](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727213946974.png)
配置hbase-site.xml并替换所有内容
```bash
sudo vim /export/servers/hbase/conf/hbase-site.xml
```
```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <!-- 核心：HBase存储路径指向Hadoop HA集群逻辑名称（与core-site.xml一致） -->
    <property>
        <name>hbase.rootdir</name>
        <value>hdfs://mycluster/hbase</value>
    </property>

    <!-- 启用分布式模式（集群/HA模式必须为true） -->
    <property>
        <name>hbase.cluster.distributed</name>
        <value>true</value>
    </property>

    <!-- ZooKeeper集群地址（与Hadoop core-site.xml的ha.zookeeper.quorum一致） -->
    <property>
        <name>hbase.zookeeper.quorum</name>
        <value>hadoop01,hadoop02,hadoop03</value>
    </property>

    <!-- ZooKeeper客户端端口（默认2181，与集群配置一致） -->
    <property>
        <name>hbase.zookeeper.property.clientPort</name>
        <value>2181</value>
    </property>

    <!-- ZooKeeper数据目录（仅HBase内置ZooKeeper生效，独立ZooKeeper忽略此配置） -->
    <property>
        <name>hbase.zookeeper.property.dataDir</name>
        <value>/export/servers/zookeeper/data</value>
    </property>

    <!-- HA模式必需：禁用HDFS流能力强制检查 -->
    <property>
        <name>hbase.unsafe.stream.capability.enforce</name>
        <value>false</value>
    </property>

    <!-- 可选优化：HBase临时目录 -->
    <property>
        <name>hbase.tmp.dir</name>
        <value>/export/servers/hbase/tmp</value>
    </property>
<!-- 禁用异步 WAL -->
<property>
  <name>hbase.wal.async.enabled</name>
  <value>false</value>
</property>

<!-- 禁用异步 HDFS 写入（关键！）-->
<property>
  <name>hbase.fs.async.impl</name>
  <value></value>
</property>
</configuration>
```
主要修改如图所示

![image-20260727214026923](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214026923.png)
### 配置子节点
#### 配置regionservers文件（指定 RegionServer 节点）
```bash
sudo vi /export/servers/hbase/conf/regionservers
```
#### 删除原有内容，添加所有节点的主机名：
```txt
hadoop01
hadoop02
hadoop03
```

![image-20260727214125612](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214125612.png)
#### 拷贝文件
hadoop的core-site.xml文件和hdfs-site.xml文件到hbase的conf目录以便于Hbase能够读取hadoop的运行配置
```bash
sudo cp /export/servers/hadoop/etc/hadoop/core-site.xml /export/servers/hbase/conf
sudo cp /export/servers/hadoop/etc/hadoop/hdfs-site.xml /export/servers/hbase/conf
```
#### 分发配置文件
将主节点中配置好的文件和hadoop目录copy给子节点
```bash
scp -r /etc/profile hadoop02:/tmp
scp -r /etc/profile hadoop03:/tmp
scp -r /export/servers/hbase hadoop02:/tmp
scp -r /export/servers/hbase hadoop03:/tmp
```
#### 进入子节点
分别在各个节点执行以下指令
```bash
sudo mv /tmp/hbase /export/servers
sudo mv /tmp/profile /etc/
```
### 启动
#### 启动HBase 集群（主节点启动即可）
```bash
start-hbase.sh
```

![image-20260727214246810](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214246810.png)
#### 启动剩余节点
在 hadoop02 启动第2个 HMaster
刷新终端的环境变量
```bash
source /etc/profile
hbase-daemon.sh start master
```

![image-20260727214314896](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214314896.png)
在 hadoop03 启动第3个 HMaster
刷新终端的环境变量
```bash
source /etc/profile
hbase-daemon.sh start master
```

![image-20260727214331493](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214331493.png)
查找程序
```bash
jps | grep -E 'HMaster|HRegionServer' 
```
hadoop01

![image-20260727214408276](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214408276.png)

hadoop02

![image-20260727214411733](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214411733.png)

hadoop03

![image-20260727214415761](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214415761.png)
### 测试结果
#### 查看选举结果
浏览器访问 主节点ip:16010

![image-20260727214440468](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214440468.png)
#### 连接hbase并测试
```bash
hbase shell
```

![image-20260727214503947](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214503947.png)
#### list查询测试
```bash
list
```

![image-20260727214527697](./Hbase%E9%83%A8%E7%BD%B2.assets/image-20260727214527697.png)
若出现以上结果且不报错即为部署完成
然后按ctrl+D或输入exit回车退出
## 错误分析
Hbase出现的问题较多且复杂，请每次运行前强制杀死Hbase原有进程(所有节点)，清理logs目录(所有节点)，先运行主节点的start-hbase.sh，查看主节点的logs目录的logs文件中是否出现error,未出现error后再运行子节点的hbase-daemon.sh start master，若子节点的logs目录里的logs文件也无error,再进行hbase shell的测试，并观察终端是否正确输出，若没有请再次查看各节点的logs日志

正常关闭Hbase命令(主节点运行)
```bash
stop-hbase.sh
```
强制杀死Hbase命令(每个节点都要运行)
```bash
kill -9 $(jps | grep -E "HMaster|HRegionServer" | awk '{print $1}')
```