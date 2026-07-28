---
title: 服务器基础配置与基础设施搭建
published: 2025-11-11
description: '服务器基础配置与基础设施搭建 的详细部署与配置文档。'
image: './hadoop部署基础环境.assets/cover.webp'
tags: [BigData, Hadoop, Environment, Deployment]
category: 'BigData'
draft: false 
series: Big Data Deployment
seriesOrder: 6
status: maintenance
testedOn: See article prerequisites
lastVerified: 2026-07-28
---

# 服务器基础配置与基础设施搭建
## 分别配置3个服务器的ip

查看网关方法
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps59.jpg) 
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps60.jpg) 
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps61.jpg) 
```bash
sudo vim /etc/netplan/50-cloud-init.yaml
```
只需更改addresses中的ip以及via后面的网关即可(后面的`/24`不需要更改,网关如何查看见上文，原文中的`dhcp: true`需要删除！)
>图中ip地址与网关地址根据实际情况进行配置，图中`ens160`倘若与原先不一致，则保留原先的ens数字！
>下文是范例配置：
```properties
network:
  version: 2
  ethernets:
    ens33:
      addresses:
      - "10.1.100.20/24"
      nameservers:
        addresses:
        - 8.8.8.8
        - 114.114.114.114
        search: []
      routes:
      - to: "default"
        via: "10.1.100.254"
```
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps62.jpg) 
然后重新载入配置
```bash
sudo netplan apply
```
## 分别为3个服务器添加用户并赋予权限

### 添加用户

```bash
sudo adduser hadooper
```
然后输入两次相同的密码(此密码务必记住！)
按照指示继续执行即可

### 赋予权限

```bash
sudo usermod -aG sudo hadooper

sudo vim /etc/sudoers
```
配置如下图所示
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps63.jpg) 
## 分别更改3个服务器的hosts及主机名

### 编辑hosts配置

```bash
sudo vim /etc/hosts
```
在文件中加上如下配置，删除第二行的127.0.1.1 ubuntubase
>ip地址需要更改为对应的服务器ip地址

即节点的IP地址 + 节点名称
```txt
10.1.100.20 hadoop01
10.1.100.21 hadoop02
10.1.100.22 hadoop03
```
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps64.jpg) 

### 分别更改三台服务器的主机名

hadoop01:
```bash
sudo hostnamectl set-hostname hadoop01
```
hadoop02:
```bash
sudo hostnamectl set-hostname hadoop02
```
hadoop03:
```bash
sudo hostnamectl set-hostname hadoop03
```
>此步骤进行完后将三台服务器全部重启

## 配置测试

分别于三台服务器中执行ping另外两台服务器的指令示例如下
于hadoop01中：
```bash
ping hadoop02

ping hadoop03
```
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps65.jpg) 
其他服务器同理，此处不做过多赘述

## 配置免密登录

>从此步开始默认执行用户为hadooper，如若使用的用户非hadooper，使用su hadooper然后输入hadooper用户的密码来切换到hadooper用户

### 换源

备份原配置
```bash
sudo cp /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources.bak

sudo vim /etc/apt/sources.list.d/ubuntu.sources
```
然后输入ggdG(删除全部内容，大小写严格遵守，此为vim基础操作)，输入以下配置
```properties
Types: deb

URIs: https://mirrors.aliyun.com/ubuntu/

Suites: noble noble-updates noble-backports

Components: main restricted universe multiverse

Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg

 

Types: deb

URIs: https://mirrors.aliyun.com/ubuntu/

Suites: noble-security

Components: main restricted universe multiverse

Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg
```
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps66.jpg) 

### 更新升级软件包

```bash
sudo apt update

sudo apt upgrade -y
```
### 安装配置SSH服务

在3个服务器上分别安装SSH服务
```bash
sudo apt install openssh-server
```
在3个服务器上分别设置开机自启
```bash
sudo systemctl enable ssh
```
在3个服务器上分别生成密钥(该指令需要输入的地方默认为空即可,即连按回车即可)
```bash
ssh-keygen -t rsa
```
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps67.jpg) 
在3个服务器上分别拷贝公钥到该服务器上(即每个服务器都需要执行下面的三条指令)
```bash
ssh-copy-id hadoop01

ssh-copy-id hadoop02

ssh-copy-id hadoop03
```
## 建立存储目录

### 创建目录

分别在3个服务器上创建3个目录，data用于存放数据文件，servers为软件的安装目录，software用于放置软件包
```bash
sudo mkdir -p /export/data

sudo mkdir -p /export/servers

sudo mkdir -p /export/software
```
### 为文件夹赋权
分别于3个服务器上为文件夹赋权
```bash
sudo chown -R hadooper /export/

sudo chmod -R 755 /export/
```
## 更换java

>注：3个服务器均需要更换，故先进行服务器01的java配置，然后再进行分发\****

### 卸载原有java

检索安装了哪些版本的java
```bash
dpkg -l | grep -i jdk
```
卸载已安装的java
```bash
sudo apt purge java版本(此处版本为上一步检索出的java版本)

#copy-jdk-configs可不进行删除
```
### 安装java

切换到software目录
```bash
cd /export/software
```
下载jdk文件
```bash
wget -P /export/software/ https://repo.huaweicloud.com/java/jdk/8u181-b13/jdk-8u181-linux-x64.tar.gz
```
解压
```bash
tar -zxvf /export/software/jdk-8u181-linux-x64.tar.gz -C /export/servers/

cd /export/servers/

mv /export/servers/jdk1.8.0_181 /export/servers/jdk
```
### 配置环境变量

编辑环境变量配置文件
```bash
sudo vim /etc/profile
```
文件末尾加上以下配置
```bash
export JAVA_HOME=/export/servers/jdk
export PATH=$PATH:$JAVA_HOME/bin
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
```
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps68.jpg) 
重新加载环境变量
```bash
source /etc/profile
```
验证java是否成功安装
```bash
java -version
```
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps69.jpg) 

### 分发java配置

分发配置到hadoop02
```bash
scp /etc/profile hadoop02:/tmp/profile

ssh hadoop02 "sudo cp /tmp/profile /etc/profile && sudo rm /tmp/profile"

scp -r /export/servers/jdk hadoop02:/tmp/

ssh hadoop02 "sudo cp -r /tmp/jdk/ /export/servers/ && sudo rm -rf /tmp/jdk"
```
分发配置到hadoop03
```bash
scp /etc/profile hadoop03:/tmp/profile

ssh hadoop03 "sudo cp /tmp/profile /etc/profile && sudo rm /tmp/profile"

scp -r /export/servers/jdk hadoop03:/tmp/

ssh hadoop03 "sudo cp -r /tmp/jdk/ /export/servers/ && sudo rm -rf /tmp/jdk"
```
### 确认分发是否正确

分发后在服务器01中输入以下指令来判断是否分发成功
```bash
ssh hadoop02 "bash -c 'source /etc/profile && java -version'"

ssh hadoop03 "bash -c 'source /etc/profile && java -version'"
```
![img](./hadoop%E9%83%A8%E7%BD%B2%E5%9F%BA%E7%A1%80%E7%8E%AF%E5%A2%83.assets/wps70.jpg) 

## 安装工具

### net-tools的安装

分别在3个服务器中安装net-tools
```bash
sudo apt install net-tools
```