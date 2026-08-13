---
title: Mahout集群部署
published: 2025-11-21
description: 'Mahout集群部署 的详细部署与配置文档。'
image: https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Mahout%E9%83%A8%E7%BD%B2.assets/cover.webp
tags: [BigData, Mahout, Deployment]
category: 'BigData'
draft: false 
series: Big Data Deployment
seriesOrder: 10
status: verified
testedOn: See article prerequisites
lastVerified: 2026-07-28
---

# Mahout集群部署
## 安装并解压Mahout
下载压缩包
```bash
cd /export/software
wget -P /export/software/ https://downloads.apache.org/mahout/14.1/apache-mahout-distribution-14.1.tar.gz
mkdir /export/servers/mahout
```
解压并安装
```bash
tar -zxvf /export/software/apache-mahout-distribution-14.1.tar.gz -C /export/servers/mahout
cd /export/servers
sudo chown -R hadooper:hadooper /export/servers/mahout/
```
## 配置环境变量
```bash
sudo vi /etc/profile
```
在该文件夹下添加如下内容:
```bash
#Mahout环境变量
export HADOOP_CONF_DIR=/export/servers/hadoop/etc/hadoop
export MAHOUT_HOME=/export/servers/mahout
export MAHOUT_CONF_DIR=$MAHOUT_HOME/conf
export PATH=$PATH:$MAHOUT_HOME/bin
```
应用配置
```bash
source /etc/profile
```
## 启动测试
```bash
cd /export/servers/mahout
/export/servers/mahout/bin/mahout spark-shell
```
出现如下图所示状态则代表启动成功

![image-20260727224525281](https://suifeng-personal-blog.oss-cn-beijing.aliyuncs.com/post-assets/Mahout%E9%83%A8%E7%BD%B2.assets/image-20260727224525281.png)
