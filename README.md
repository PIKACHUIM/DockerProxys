# Docker Hub Serverless 镜像源代理工具

## 简要介绍
1. 用于代理DockerHub镜像源，支持pull、push
2. 支持自动替换返回的auth链接，改为本站URL
3. 支持Cloudflare、EdgeOne Pages等平台部署

示例站点：根据相关部门规定，不提供示例站点

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

```shell
# 测试Cloudflare
npm i && npm run dev

# 测试EdgeOne Pages
npm i && npm run dev-eo
```

## 部署方法
```shell
# 部署Cloudflare
npm i && npm run deploy

# 部署到EdgeOne Pages
npm i &&  npm run deploy-eo
```
