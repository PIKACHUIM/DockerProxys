# Docker Hub Serverless 镜像源代理工具

## 简要介绍
1. 用于代理DockerHub镜像源，支持pull、push
2. 支持自动替换返回的auth链接，改为本站URL
3. 支持Cloudflare、EdgeOne Pages等平台部署

示例站点：根据相关部门规定 不提供示例站点

项目地址：[PIKACHUIM/DockerProxys](https://github.com/PIKACHUIM/DockerProxys)

## 快速部署

### 一键部署
|                   Cloudflare Worker 全球站                   |                                                                                                                                 EdgeOsne Functions 国际站                                                                                                                                 |                   EdgeOne Functions 中国站                   |
| :----------------------------------------------------------: |:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:| :----------------------------------------------------------: |
| [<img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers" style="width:400px;heigh:200px" />](https://deploy.workers.cloudflare.com/?url=https://github.com/PIKACHUIM/DockerProxys) | [<img src="https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg" alt="使用 EdgeOne Pages 部署" style="width:400px;heigh:200px" />](https://edgeone.ai/pages/new?project-name=oplist-api&repository-url=https://github.com/PIKACHUIM/DockerProxys&build-command=npm%20run%20build-eo&install-command=npm%20install&output-directory=public&root-directory=./) | [<img src="https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg" alt="使用 EdgeOne Pages 部署" style="width:400px;heigh:200px" />](https://console.cloud.tencent.com/edgeone/pages/new?project-name=oplist-api&repository-url=https://github.com/PIKACHUIM/DockerProxys&build-command=npm%20run%20build-eo&install-command=npm%20install&output-directory=public&root-directory=./) |

### 修改变量

部署完成后，请登录后台，按一下表格新增/修改变量

| 变量名称 | 类型   | 示例                | 说明                                                      |
| -------- | ------ | ------------------- | --------------------------------------------------------- |
| `DOMAIN` | `TEXT` | `proxy.example.com` | 代理网站的域名，不包含协议(`https://`)，因为必须是`https` |




## 使用方法
### 临时拉取镜像
在您需要拉取的镜像前，添加<代理地址>，例如您需要拉取`debian`镜像
```shell
# 原有命令
docker pull debian

# 新的命令
docker pull <代理地址>/debian

# 举例说明
docker pull proxy.example.com/debian
```

### 长期修改地址
1. 修改源配置：`nano /etc/docker/daemon.json`
```shell
{
  "registry-mirrors":["<代理地址>"]      
}
```

2. 修改完成后重新启动
```shell
systemctl daemon-reload
systemctl restart docker
```

## 测试方法

### 拉取仓库

```shell
git clone https://github.com/PIKACHUIM/DockerProxys.git
cd DockerProxys
```

### 测试代码

```shell
# 测试Cloudflare
npm i && npm run dev

# 测试EdgeOne Pages
npm i && npm run dev-eo
```

## 部署方法
### 拉取仓库

```shell
git clone https://github.com/PIKACHUIM/DockerProxys.git
cd DockerProxys
```

### 部署代码
```shell
# 部署Cloudflare
npm i && npm run deploy

# 部署到EdgeOne Pages
npm i && npm run deploy-eo
```
