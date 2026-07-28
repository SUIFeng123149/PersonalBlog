---
title: Hive的部署
published: 2025-11-16
description: 'Hive的部署 的详细部署与配置文档。'
image: ''
tags: [BigData, Hive, Deployment]
category: 'BigData'
draft: false 
---

# Hive的部署
## 安装并配置MySQL
MySQL 用于存储 Hive 的元数据（表结构、数据库信息等），需完成安装、权限配置、Hive 专属数据库创建。
### 环境准备与安装
#### 切换到/opt目录，创建mysql文件夹
```bash
cd /opt
sudo mkdir mysql
```
#### 更新Ubuntu软件源
```bash
sudo apt update
```
#### 安装 MySQL 8.0 服务器（自动处理所有依赖）
```bash
sudo apt install -y mysql-server
```
#### 安装完成后，验证服务状态（Active: active (running) 表示启动成功）
```bash
sudo systemctl status mysql
```

![image-20260727214829801](./Hive%E9%83%A8%E7%BD%B2.assets/image-20260727214829801.png)
### 登录 MySQL
#### 以 root 用户登录 MySQL（sudo 确保权限，首次登录按回车跳过密码输入）：
```bash
sudo mysql -u root -p
```
ps:这里的前缀换成mysql>了
若提示密码错误，查看 Debian 临时密码
```bash
cat /etc/mysql/debian.cnf
```
用临时账号登录（输入文件中[client]的 password 字段）
```bash
sudo mysql -u debian-sys-maint -p
```
#### 修改密码添加权限
直接修改 root 初始密码
```bash
alter user 'root'@'localhost' identified by 'root123456';
```
#### 刷新权限生效
```bash
flush privileges;
```
### 创建 Hive 元数据存储数据库
#### 创建 Hive 元数据库（字符集设为 latin1，兼容 Hive 元数据存储格式）
```bash
create database hive character set latin1;
```
#### 创建远程访问用户（% 表示允许所有 IP 连接，认证插件兼容 Hive）
```bash
create user 'hive'@'%' identified with mysql_native_password by 'hive123456'; 
```
#### 授予该用户对 hive 数据库的所有权限（含授权他人权限）
```bash
grant all privileges on hive.* to 'hive'@'%' with grant option;
```
#### 创建 hive 本地访问用户（仅本机访问，提升安全性）
```bash
create user 'hive'@'localhost' identified with mysql_native_password by 'hive123456';
```
#### 授予本地权限
```bash
grant all privileges on hive.* to 'hive'@'localhost' with grant option;
```
#### 刷新权限 
```bash
flush privileges;
```
#### 验证权限 
```bash
show grants for 'hive'@'%';
```
#### 验证用户信息（密码存储在 authentication_string 字段）
```bash
use mysql;
select host, user, authentication_string as password from user where user = 'hive';
```
执行完成后，输入 exit 退出 MySQL 命令行。
## 安装Hive
本文选用 Hive 4.0.1 版本（适配 Hadoop 3.4.0），需完成下载、解压、环境变量配置。
### 下载与解压 Hive 安装包
#### 切换到压缩包存放目录 
```bash
cd /export/software
```
#### 从华为镜像源下载 Hive 4.0.1 压缩包（速度更快，避免官方源超时）
```bash
wget -P /export/software/ https://repo.huaweicloud.com/apache/hive/hive-4.0.1/apache-hive-4.0.1-bin.tar.gz
```
#### 解压压缩包 
```bash
tar -zxvf /export/software/apache-hive-4.0.1-bin.tar.gz -C /export/servers/
```
#### 重命名解压目录（简化后续路径配置，也可以直接为hive但后面都需要更改） 
```bash
mv /export/servers/apache-hive-4.0.1-bin /export/servers/hive-4.0.1
```
若解压失败（提示文件损坏），重新执行 wget 命令下载安装包（可能是下载过程中网络中断导致文件不完整）。
### 配置hive的环境变量
需在系统环境变量中添加 Hive 路径，确保全局可调用 hive 命令：
#### 编辑用户环境变量配置文件
```bash
sudo vi /etc/profile
```
#### 在文件末尾添加以下配置（路径需与实际 Hive 安装目录一致） 
```bash
export HIVE_HOME=/export/servers/hive-4.0.1 
export HIVE_CONF_DIR=$HIVE_HOME/conf 
export HCAT_HOME=$HIVE_HOME/hcatalog 
export PATH=$HIVE_HOME/bin:$PATH 
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$HIVE_HOME/lib/*:$HIVE_CONF_DIR
```
#### 保存并退出
#### 使环境变量配置生效
```bash
source /etc/profile
```
#### 验证配置（执行后显示 Hive 安装目录，说明配置成功） 
```bash
echo $HIVE_HOME
```
## Hive的核心配置
需修改 Hive 配置文件，关联 MySQL 元数据库、Hadoop 集群，配置临时目录等。
先给予权限
```bash
sudo chown -R hadooper:hadooper /export/servers/hive-4.0.1/
```
### 配置 hive-env.sh（关联 Hadoop 路径）
#### 切换到 Hive 配置目录 
```bash
cd /export/servers/hive-4.0.1/conf 
```
#### 复制模板文件为正式配置文件（Hive 默认提供模板，需重命名后修改）
```bash
sudo cp /export/servers/hive-4.0.1/conf/hive-env.sh.template /export/servers/hive-4.0.1/conf /hive-env.sh 
```
#### 编辑配置文件 
```bash
sudo vi /export/servers/hive-4.0.1/conf/hive-env.sh 
```
#### 找到第 48 行（或搜索 HADOOP_HOME），添加 Hadoop 安装路径（需与实际 Hadoop 目录一致） 
```bash
HADOOP_HOME=/export/servers/hadoop 
```

![image-20260727215710880](./Hive%E9%83%A8%E7%BD%B2.assets/image-20260727215710880.png)

#### 保存并退出（按 Esc 输入 :wq 回车）
### 配置 hive-site.xml（核心配置文件）
该文件用于配置 MySQL 连接信息、HDFS 存储路径、临时目录等，需手动创建并添加以下内容：
#### 创建并编辑 hive-site.xml 文件 
```bash
sudo vi /export/servers/hive-4.0.1/conf/hive-site.xml
```
复制下面的配置
```xml
<!-- 配置 Hive 执行引擎为 Spark --> 
<property> 
<name>hive.execution.engine</name> 
<value>spark</value> 
</property> 
<!-- 配置 Spark 运行模式为 YARN（依赖 Hadoop YARN 资源管理） --> 
<property> 
<name>spark.master</name> 
<value>yarn</value> 
</property> 
<!-- 配置 Spark 安装路径（需与实际 Spark 目录一致） --> 
<property> 
<name>spark.home</name> 
<value>/export/servers/spark</value> 
</property> 
<!-- 配置 Spark JAR 包在 HDFS 的存储路径（后续需上传 JAR 包至此路径） --> 
<property> 
<name>spark.yarn.jars</name> 
<value>hdfs://mycluster/spark/jars/*</value> 
</property> 
<!-- 配置 Spark 客户端与服务端连接超时时间（避免大集群环境下连接失败） -->
<property> 
<name>hive.spark.client.server.connect.timeout</name> 
<value>300000</value> 
</property>
```

![image-20260727215807442](./Hive%E9%83%A8%E7%BD%B2.assets/image-20260727215807442.png)
关键说明：ConnectionURL 中添加 useSSL=false（关闭 SSL 连接，避免警告）、serverTimezone=UTC（统一时区，避免时间戳异常）、allowPublicKeyRetrieval=true（允许获取 MySQL 公钥，解决连接失败问题）
### 配置日志文件（可选，优化日志输出）
Hive 提供日志配置模板，需复制为正式文件：
切换到 Hive 配置目录 
```bash
cd /export/servers/hive-4.0.1/conf 
```
复制日志配置模板为正式文件 
```bash
sudo cp /export/servers/hive-4.0.1/conf/hive-log4j2.properties.template /export/servers/hive-4.0.1/conf/hive-log4j2.properties 
sudo cp /export/servers/hive-4.0.1/conf/hive-exec-log4j2.properties.template /export/servers/hive-4.0.1/conf/hive-exec-log4j2.properties
```
若需修改日志存储路径、日志级别，可编辑上述两个文件（默认日志存储在 /tmp/hive 目录）。
### 确保hive连接到hadoop
#### 将hadoop文件复制到hive
```bash
sudo cp /export/servers/hadoop/etc/hadoop/core-site.xml /export/servers/hive-4.0.1/conf/ 

sudo cp /export/servers/hadoop/etc/hadoop/hdfs-site.xml /export/servers/hive-4.0.1/conf/
```
#### 创建数据库文件
```bash
hdfs dfs -mkdir -p /user/hive
hdfs dfs -mkdir -p /user/hive/warehouse
```
#### /user/hive 及其所有子目录的所有者都修改为 hadooper 
```bash
hdfs dfs -chown -R hadooper:hadooper /user/hive
```
## 集成 Spark 配置
Hive 默认使用 MapReduce 作为执行引擎，为提升计算效率，需配置 Spark 为执行引擎，包含 Hive 配置修改、Spark 配置修改两步。
### 修改 Hive 配置文件
在已配置好的 Hive 核心配置基础上，补充 Spark 执行引擎相关配置：
#### 进入迁移后的 Hive 配置目录（路径已迁移至 /export/servers/hive） 
```bash
cd /export/servers/hive-4.0.1/conf 
```
#### 编辑 hive-site.xml 文件（在原有配置基础上添加以下内容，保持 XML 缩进一致） 
```bash
sudo vi /export/servers/hive-4.0.1/conf/hive-site.xml
```
在 <configuration> 标签内新增以下配置（严格缩进，与原有配置同级）：
```xml
<!-- 配置 Hive 执行引擎为 Spark --> 
<property> 
<name>hive.execution.engine</name> 
<value>spark</value> 
</property> 
<!-- 配置 Spark 运行模式为 YARN（依赖 Hadoop YARN 资源管理） --> 
<property> 
<name>spark.master</name> 
<value>yarn</value> 
</property> 
<!-- 配置 Spark 安装路径（需与实际 Spark 目录一致） --> 
<property> 
<name>spark.home</name> 
<value>/export/servers/spark</value> 
</property> 
<!-- 配置 Spark JAR 包在 HDFS 的存储路径（后续需上传 JAR 包至此路径） --> 
<property> 
<name>spark.yarn.jars</name> 
<value>hdfs://mycluster/spark/jars/*</value> 
</property> 
<!-- 配置 Spark 客户端与服务端连接超时时间（避免大集群环境下连接失败） -->
<property> 
<name>hive.spark.client.server.connect.timeout</name> 
<value>300000</value> 
</property>
```

![image-20260727220140120](./Hive%E9%83%A8%E7%BD%B2.assets/image-20260727220140120.png)
### 修改 Spark 配置文件
需配置 Spark 关联 Hive 元数据、指定编码格式，并添加 Hadoop 类路径依赖，确保 Spark 与 Hive 兼容。
#### 配置 spark-defaults.conf（关联 Hive 元数据）
进入Spark 配置目录
```bash
cd /export/servers/spark/conf 
```
将模板文件重命名为正式配置文件
```bash
sudo cp /export/servers/spark/conf/spark-defaults.conf.template /export/servers/spark/conf/spark-defaults.conf 
```
编辑 spark-defaults.conf 文件，添加 Hive 元数据与编码配置 
```bash
sudo vi /export/servers/spark/conf/spark-defaults.conf
```
在文件末尾添加以下内容（需与 Hive 路径、HDFS 地址匹配）：
```properties
# 配置 Hive 元数据版本
spark.sql.hive.metastore.version 4.0.1
# 配置 Spark 加载 Hive 的 JAR 包路径
spark.sql.hive.metastore.jars = /export/servers/hive-4.0.1/lib/* 
# 配置 Hive Metastore 服务地址（hadoop01 为 metastore 所在主机名，默认端口 9083）
spark.sql.hive.metastore.uris thrift://hadoop01:9083 
# 配置 Spark SQL 数据仓库路径（与 Hive 数据仓库路径一致，避免数据分散）
spark.sql.warehouse.dir 
hdfs://hadoop01:8020/user/hive/warehouse 
# 配置 Spark 驱动与执行器的编码格式（解决中文乱码问题）
spark.driver.extraJavaOptions=-Dfile.encoding=UTF-8
spark.executor.extraJavaOptions=-Dfile.encoding=UTF-8
```
#### 配置 spark-env.sh（添加 Hive 与 Hadoop 依赖）
继续在 Spark 配置目录，编辑 spark-env.sh 文件（若文件不存在，直接创建） 
```bash
sudo vi /export/servers/spark/conf/spark-env.sh 
```
在文件末尾添加以下内容（关联 Hive 路径与 Hadoop 类路径） 
```bash
# 设置Hive配置文件的目录
export HIVE_HOME=/export/servers/hive-4.0.1
export HIVE_CONF_DIR=$HIVE_HOME/conf 
export SPARK_DIST_CLASSPATH=$(hadoop classpath) 
```

![image-20260727220401603](./Hive%E9%83%A8%E7%BD%B2.assets/image-20260727220401603.png)
#### 配置 Spark 环境变量
需在系统环境变量中添加 Spark 路径，确保所有用户可调用 Spark 命令：
编辑系统全局环境变量文件（/etc/profile 对所有用户生效，需 sudo 权限）
```bash
sudo vi /etc/profile 
```
在文件末尾添加 Spark 环境变量（与 Hive、Hadoop 环境变量同级） 
```bash
#Spark环境变量
export SPARK_HOME=/export/servers/spark
export PATH=$SPARK_HOME/bin:$SPARK_HOME/sbin:$PATH
```
使环境变量立即生效（当前终端生效，若需所有终端生效需重启或重新登录）
```bash
source /etc/profile 
```
验证 Spark 环境变量（输出 /export/servers/spark 表示配置成功）
```bash
echo $SPARK_HOME
```
## 依赖组件配置（HDFS 目录 + MySQL JDBC 驱动）
### 在HDFS中创建hive目录
Hive 数据仓库存储在 HDFS 中，需手动创建目录并授权：
#### 确保 Hadoop 集群已启动（若未启动，执行以下命令）
```bash
/export/servers/hadoop/sbin/start-all.sh 
```
#### 在HDFS里面创建数据库文件
```bash
hdfs dfs -mkdir -p /user/hive
hdfs dfs -mkdir -p /user/hive/warehouse
```
#### 将/user/hive 及其所有子目录的所有者都修改为 hadooper 
```bash
hdfs dfs -chown -R hadooper:hadooper /user/hive
```
验证目录：执行 hadoop fs -ls /user/hive，显示 warehouse 目录表示创建成功。
### 安装 MySQL JDBC 驱动
Hive 需通过 JDBC 驱动连接 MySQL，需下载并复制到 Hive 依赖库：
#### 切换到 /opt 目录，下载 MySQL JDBC 驱动（8.0.33 版本，兼容 MySQL 8.0+） 
```bash
cd /opt 
sudo wget -P /opt/ https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.0.33/mysql-connector-j-8.0.33.jar 
```
#### 将驱动包复制到 Hive 的 lib 目录（Hive 启动时自动加载该目录下的依赖）
```bash
cp /opt/mysql-connector-j-8.0.33.jar /export/servers/hive-4.0.1/lib/
```
若下载失败，可手动访问链接下载后上传至 /opt 目录，再执行复制命令。
#### 创建驱动软链接
进入 Hive lib 目录 
```bash
cd /export/servers/hive-4.0.1/lib
```
创建兼容的软链接（去掉 -j，匹配 Hive 识别的文件名） 
```bash
ln -s mysql-connector-j-8.0.33.jar mysql-connector-java-8.0.33.jar 
```
验证软链接是否创建成功 
```bash
ls -l | grep mysql-connector 
```
应看到： 
lrwxrwxrwx 1 hadooper hadooper ... mysql-connector-java-8.0.33.jar -> mysql-connector-j-8.0.33.jar 
-rw-r--r-- 1 hadooper hadooper ... mysql-connector-j-8.0.33.jar 

![image-20260727220826945](./Hive%E9%83%A8%E7%BD%B2.assets/image-20260727220826945.png)
## 配置 Hadoop 代理用户权限
Hive 运行时需通过代理用户访问 Hadoop 集群，需在 Hadoop 配置中授权：
### 编辑 Hadoop 的 core-site.xml 配置文件（路径需与实际 Hadoop 目录一致） 
```bash
sudo vi /export/servers/hadoop/etc/hadoop/core-site.xml 
```
### 在 <configuration> 标签内添加以下代理用户配置（授权常用用户）
```xml
<property> 
<name>hadoop.proxyuser.hadooper.hosts</name> 
<value>*</value> <!-- * 表示允许所有主机代理 --> 
</property> 
<property> 
<name>hadoop.proxyuser.hadooper.groups</name> 
<value>*</value> <!-- * 表示允许所有用户组代理 --> 
</property> 
<property> 
<name>hadoop.proxyuser.hadoop01.hosts</name> 
<value>*</value> 
</property> 
<property> 
<name>hadoop.proxyuser.hadoop01.groups</name> 
<value>*</value> 
</property> 
<property> 
<name>hadoop.proxyuser.hadooprunner.hosts</name> 
<value>*</value> 
</property> 
<property> 
<name>hadoop.proxyuser.hadooprunner.groups</name> 
<value>*</value> 
</property> 
<property> 
<name>hadoop.proxyuser.root.hosts</name> 
<value>*</value> 
</property> 
<property> 
<name>hadoop.proxyuser.root.groups</name> 
<value>*</value> 
</property> 
```

![image-20260727220927377](./Hive%E9%83%A8%E7%BD%B2.assets/image-20260727220927377.png)
### 保存并退出
### 重启 Hadoop 集群（使配置生效） 
```bash
/export/servers/hadoop/sbin/stop-all.sh 
/export/servers/hadoop/sbin/start-all.sh 
```
### 验证 Hadoop 状态（确保所有核心进程启动） 
```bash
jps
```
## 处理 JAR 包依赖冲突与 HDFS 分发
Spark 与 Hive、Hadoop 可能存在 JAR 包版本冲突，需通过 “双向拷贝关键 JAR 包” 解决冲突，并将 Spark JAR 包上传至 HDFS，供 YARN 集群共享调用。
### 双向拷贝关键 JAR 包
根据指定的 JAR 包列表，执行双向拷贝操作，确保 Hive 和 Spark 依赖版本兼容：
#### Spark → Hive（复制 Spark 依赖到 Hive lib 目录）
```bash
cd $SPARK_HOME/jars 
cp $SPARK_HOME/jars/spark-core_2.12-3.4.3.jar /export/servers/hive-4.0.1/lib/
cp $SPARK_HOME/jars/spark-network-common_2.12-3.4.3.jar /export/servers/hive-4.0.1/lib/
cp $SPARK_HOME/jars/spark-launcher_2.12-3.4.3.jar /export/servers/hive-4.0.1/lib/
cp $SPARK_HOME/jars/spark-unsafe_2.12-3.4.3.jar /export/servers/hive-4.0.1/lib/
cp $SPARK_HOME/jars/scala-library-2.12.17.jar /export/servers/hive-4.0.1/lib/
```
#### Hive → Spark（复制 Hive 依赖到 Spark jars 目录） 
```bash
cd /export/servers/hive-4.0.1/lib 
cp /export/servers/hive-4.0.1/lib/hive-exec-4.0.1.jar /export/servers/spark/jars/ 
cp /export/servers/hive-4.0.1/lib/hive-metastore-4.0.1.jar /export/servers/spark/jars/ 
cp /export/servers/hive-4.0.1/lib/hive-common-4.0.1.jar /export/servers/spark/jars/ 
cp /export/servers/hive-4.0.1/lib/hive-serde-4.0.1.jar /export/servers/spark/jars/ 
cp /export/servers/hive-4.0.1/lib/hive-cli-4.0.1.jar /export/servers/spark/jars/ 
cp /export/servers/hive-4.0.1/lib/jline-2.14.6.jar /export/servers/spark/jars/ 
```
#### 验证拷贝结果 
```bash
ls /export/servers/hive-4.0.1/lib | grep -E "spark|scala" 
ls /export/servers/spark/jars | grep -E "hive|jline"
```
### 将Spark JAR 包分发至HDFS
确保 Hadoop 集群已启动 
```bash
/export/servers/hadoop/sbin/start-all.sh 
```
创建 HDFS 目录 
```bash
cd /export/servers
hdfs dfs -mkdir -p /spark/jars
```
上传 Spark JAR 包 
```bash
hdfs dfs -put $SPARK_HOME/jars/* /spark/jars 
```
验证上传结果 
```bash
hdfs dfs -ls /spark/jars | wc -l 
ls $SPARK_HOME/jars | wc -l 
```
### 清除冗余JAR包（由实际决定）
进入 Spark jars 目录 
```bash
cd /export/servers/spark/jars 
```
删除 Hive 2.3.9 版本的冗余 JAR 包 
```bash
sudo rm /export/servers/spark/jars/hive-exec-2.3.9-core.jar /export/servers/spark/jars/hive-metastore-2.3.9.jar /export/servers/spark/jars/hive-common-2.3.9.jar /export/servers/spark/jars/hive-serde-2.3.9.jar /export/servers/spark/jars/hive-cli-2.3.9.jar /export/servers/spark/jars/hive-beeline-2.3.9.jar 
```
验证剩余 JAR 包（仅保留 Hive 4.0.1 版本） 
```bash
ls /export/servers/spark/jars/ | grep -E "hive-exec|hive-metastore|hive-common|hive-serde|hive-cli|hive-beeline"
```

![image-20260727221308716](./Hive%E9%83%A8%E7%BD%B2.assets/image-20260727221308716.png)

## 初始化 Hive 元数据库
首次部署需初始化元数据库（创建 Hive 所需的表结构）：
### 确保 Hadoop 集群已启动（否则初始化失败） 
```bash
jps 
```
验证 NameNode、DataNode、ResourceManager、NodeManager 进程是否存在
### 执行 Hive 元数据库初始化命令（指定数据库类型为 MySQL）
```bash
schematool -dbType mysql -initSchema
```
执行结果：终端输出大量日志（含表创建语句），无报错提示（如 schemaTool completed）表示初始化成功；
异常处理：若提示 “无法连接 MySQL”，检查 MySQL 服务是否启动、hive-site.xml 中连接信息是否正确、JDBC 驱动是否复制成功。
## 启动并验证 Hive
### Hive 初始化
#### 启动 HiveServer2（JDBC/ODBC 服务）
```bash
nohup hive --service hiveserver2 > /tmp/hiveserver2.log 2>&1 &
```
#### 启动 Metastore（元数据服务）
```bash
nohup hive --service metastore -p 9084 > /tmp/metastore.log 2>&1 &
```
#### 等待一段时间后(15s左右)验证 Metastore 服务（输出 9084 端口监听表示成功） 
```bash
netstat -tuln | grep 9084
```
### 连接Hive
#### 执行 hive或beeline 命令，进入 Beeline 交互模式（提示符变为 beeline>）
```bash
hive
```
或
```bash
beeline 
```
如果不行，可以调换spark和hive的环境顺序，即spark在前，使用which beeline来查看是否返回的是hive的beeline
#### 连接 HiveServer2（本地连接，无需 SASL 认证） 
```bash
!connect jdbc:hive2://localhost:10000/default;auth=noSASL 
```
#### 输入用户名和密码（用户名输入 root，密码直接按回车，本地连接无需密码）
输入root后直接回车
```txt
root
```
#### 验证连接（提示符变为 0: jdbc:hive2://localhost:10000/default>，执行以下命令）
查看数据库
```bash
show databases;
```
查看 Hive 系统配置
```bash
set -v;
```
成功输出 default 数据库表示 Hive 部署完成，可正常使用。

![image-20260727221646334](./Hive%E9%83%A8%E7%BD%B2.assets/image-20260727221646334.png)
