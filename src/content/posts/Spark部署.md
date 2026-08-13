---
title: Spark集群部署
published: 2025-01-15
description: 'Spark集群部署 的详细部署与配置文档。'
image: './Spark部署.assets/cover.webp'
tags: [BigData, Spark, Deployment]
category: 'BigData'
draft: false 
series: Big Data Deployment
seriesOrder: 11
status: verified
testedOn: See article prerequisites
lastVerified: 2026-07-28
---

# Spark集群部署
## Spark的安装并配置启动

### 下载Spark安装包

```bash
wget -P /export/software/ https://repo.huaweicloud.com/apache/spark/spark-3.4.3/spark-3.4.3-bin-hadoop3.tgz
```

### 解压Spark安装包

```bash
tar -zxvf /export/software/spark-3.4.3-bin-hadoop3.tgz -C /export/servers
# 重命名:
cd /export/servers
mv /export/servers/spark-3.4.3-bin-hadoop3 /export/servers/spark
```

### 修改配置文件

进入`spark/conf`目录修改Spark的配置文件`spark-env.sh`,将`spark-env.sh.template`配置模板文件复制一份并命名为`spark-env.sh`,命令如下:

```bash
cd /export/servers/spark/conf
sudo cp /export/servers/spark/conf/spark-env.sh.template /export/servers/spark/conf/spark-env.sh
```

#### 修改spark-env.sh文件

```bash
sudo vim /export/servers/spark/conf/spark-env.sh
```

在该文件中添加以下内容:

```bash
#配置java环境变量
export JAVA_HOME=/export/servers/jdk
#指定Master的IP
export SPARK_MASTER_HOST=hadoop01
#指定Master的端口
export SPARK_MASTER_PORT=7077
export SPARK_MASTER_WEBUI_PORT=8082
```

#### 复制workers.template文件，并重命名为workers

```bash
sudo cp /export/servers/spark/conf/workers.template /export/servers/spark/conf/workers
```

#### 编辑workers配置文件

```bash
sudo vim /export/servers/spark/conf/workers
```

```txt
hadoop01
hadoop02
hadoop03
```

### 分发文件

```bash
scp -r /export/servers/spark/ hadoop02:/tmp/
scp -r /export/servers/spark/ hadoop03:/tmp/
```

进入hadoop02:

```bash
sudo cp -r /tmp/spark /export/servers
rm -r /tmp/spark
```

进入hadoop03:

```bash
sudo cp -r /tmp/spark /export/servers
rm -r /tmp/spark
```

### 启动Spark集群

#### 分别添加权限

```bash
cd /export/servers
sudo chown -R hadooper:hadooper /export/servers/spark/
```

#### 分步启动Spark

hadoop01:

`````bash
cd /export/servers/spark/sbin/
/export/servers/spark/sbin/start-master.sh
`````

hadoop02,hadoop03:

```bash
cd /export/servers/spark/sbin/
/export/servers/spark/sbin/start-slave.sh spark://hadoop01:7077
```

> 此步的hadoop02和hadoop03启动时如若出现问题，首先检查主机名是否正确！如若不正确，按照网络上的教程进行修改，此处不做过多赘述

输入`$SPARK_HOME/sbin/start-all.sh`启动(上述步骤也是启动，为按服务器逐步启动，该启动指令为批量启动),如下如所示即为成功,进一步验证打开本机浏览器输入`（hadoop01的IP地址）:8082`如果界面正常打开如下所示即代表成功

![image-20260727213203995](./Spark%E9%83%A8%E7%BD%B2.assets/image-20260727213203995.png)

![image-20260727213211805](./Spark%E9%83%A8%E7%BD%B2.assets/image-20260727213211805.png)

## 使Spark适配YARN
### 配置Spark以识别YARN
进入配置目录/export/servers/spark/conf修改spark-env.sh文件
```bash
cd /export/servers/spark/conf
sudo vim /export/servers/spark/conf/spark-env.sh
```
添加如下内容:
```bash
# 设置Hadoop配置文件目录（请根据你的实际路径修改）
export HADOOP_CONF_DIR=/export/servers/hadoop/etc/hadoop
```
将以下内容注释掉（用#注释）：
```bash
export SPARK_MASTER_HOST=hadoop01
export SPARK_MASTER_PORT=7077
export SPARK_MASTER_WEBUI_PORT=8082
```
### 调整YARN配置
进入配置目录
```bash
cd /export/servers/hadoop/etc/hadoop
```
修改yarn-site.xml文件
```bash
sudo vim /export/servers/hadoop/etc/hadoop/yarn-site.xml
```
添加内容如下(注意缩进要与文件中其他内容保持一致):
```xml
  <property>
        <name>yarn.nodemanager.pmem-check-enabled</name>
        <value>false</value>
    </property>
    <property>
        <name>yarn.nodemanager.vmem-check-enabled</name>
    <value>false</value>
    </property>
```
### 分发文件
hadoop01:
```bash
scp -r /export/servers/hadoop/etc/hadoop hadoop02:/tmp/
```
hadoop02:
```bash
sudo rm -rf /export/servers/hadoop/etc/hadoop
sudo cp -r /tmp/hadoop /export/servers/hadoop/etc/hadoop
rm -r /tmp/hadoop
```
hadoop01:
```bash
scp -r /export/servers/hadoop/etc/hadoop hadoop03:/tmp/
```
hadoop03:
```bash
sudo rm -rf /export/servers/hadoop/etc/hadoop
sudo cp -r /tmp/hadoop /export/servers/hadoop/etc/hadoop
rm -r /tmp/hadoop
```
分发完成后每个节点都需要重启YARN集群
先输入`source /etc/profile`加载配置
进入`/export/servers/spark/sbin`目录

```bash
cd /export/servers/spark/sbin
```
重新启动yarn
```bash
/export/servers/spark/sbin/stop-yarn.sh
/export/servers/spark/sbin/start-yarn.sh
```