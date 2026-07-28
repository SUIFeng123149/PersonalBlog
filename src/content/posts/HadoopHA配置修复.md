---
title: Hadoop部署补丁
published: 2026-05-12
description: 'Hadoop部署补丁 的详细部署与配置文档。'
image: './HadoopHA配置修复.assets/cover.webp'
tags: [BigData, Hadoop, HA, Deployment]
category: 'BigData'
draft: false 
---

#  Hadoop部署补丁

> 1.本文档中的指令全程在hadoop01中输入（除jps验证）
2.需在hadoop01输入如下指令扩容空间
sudo lvextend -r -l +100%FREE /dev/ubuntu-vg/ubuntu-lv

## 启动hadoop,zookeeper,jobHistory集群

切换用户
```bash
su hadooper
```
加载环境变量
```bash
cd ../..

source etc/profile
```
启动ZooKeeper
```bash
zkServer.sh start

ssh hadoop02 "bash -c 'source /etc/profile && zkServer.sh start'"

ssh hadoop03 "bash -c 'source /etc/profile && zkServer.sh start'"
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
## 清除zookeeper历史残留

进入 ZooKeeper 客户端
```bash
zkCli.sh
```
删除 YARN 的选举锁
```bash
deleteall /yarn-leader-election
```
删除 YARN 的状态存储
```bash
deleteall /rmstore
```
检查并删除 HDFS 的 HA 状态
```bash
deleteall /hadoop-ha
```
退出 ZooKeeper 客户端
```bash
quit
```
## 替换文件

>均为单行指令

将新的`yarn-site.xml`文件通过ssh工具（finalshell\windterm等）上传到`/export/servers/hadoop/etc/hadoop`路径下覆盖旧的`yarn-site.xml`文件
或者通过命令行修改，步骤如下：

```bash
cd /export/servers/hadoop/etc/hadoop

vim yarn-site.xml
```
输入ggdG（严格按照大小写）清除原本的内容
进入Insert模式将新的内容替换到原文件中保存并退出
分发给hadoop02
```bash
scp /export/servers/hadoop/etc/hadoop/yarn-site.xml hadoop02:/tmp/ && \

ssh hadoop02 "sudo cp /tmp/yarn-site.xml /export/servers/hadoop/etc/hadoop && sudo rm /tmp/yarn-site.xml"
```
分发给hadoop03
```bash
scp /export/servers/hadoop/etc/hadoop/yarn-site.xml hadoop03:/tmp/ && \

ssh hadoop03 "sudo cp /tmp/yarn-site.xml /export/servers/hadoop/etc/hadoop && sudo rm /tmp/yarn-site.xml"
```
重启hadoop,zookeeper,jobHistory集群

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
zkServer.sh stop

ssh hadoop02 "bash -c 'source /etc/profile && zkServer.sh stop'"

ssh hadoop03 "bash -c 'source /etc/profile && zkServer.sh stop'"
```
启动ZooKeeper
```bash
zkServer.sh start

ssh hadoop02 "bash -c 'source /etc/profile && zkServer.sh start'"

ssh hadoop03 "bash -c 'source /etc/profile && zkServer.sh start'"
```
启动hadoop
```bash
bash /export/servers/hadoop/sbin/start-all.sh
```
重新初始化ZooKeeper
```bash
hdfs zkfc -formatZK
```
重新启动 HDFS 服务
```bash
stop-dfs.sh

start-dfs.sh
```
启动JobHistory
```bash
mapred --daemon start historyserver

ssh hadoop02 "bash -c 'source /etc/profile && mapred --daemon start historyserver'"

ssh hadoop03 "bash -c 'source /etc/profile && mapred --daemon start historyserver'"
```
三个节点都输入jps后都有ResourceManager如图所示即为修改成功
>ps指令需加载环境变量具体操作在第一部分切换用户也要做

![img](./HadoopHA%E9%85%8D%E7%BD%AE%E4%BF%AE%E5%A4%8D.assets/wps1.jpg) 
分配剩余空间
输入`yarn node -list`后如图所示，可能有不同但是只要显示三个节点即为启动成功
![img](./HadoopHA%E9%85%8D%E7%BD%AE%E4%BF%AE%E5%A4%8D.assets/wps2.jpg) 
输入`yarn node -list`后如图所示，可能有不同但是只要显示两个standby一个active即为启动成功
![img](./HadoopHA%E9%85%8D%E7%BD%AE%E4%BF%AE%E5%A4%8D.assets/wps3.jpg) 