# Rocky Linux 9 测试服务器一键发布

`publish/` 是独立发布包。服务器不需要检出 `src/`、`deploy/` 或其他源码；其中包含 Compose、初始化 SQL、Nginx 资源、游戏配置和启动脚本。应用程序本体从 GitLab CI 构建的 GHCR 镜像拉取。系统环境初始化与应用发布拆成两个脚本，前者只在新服务器执行一次，后者可反复执行。

## 全新服务器首次发布

前提：Rocky Linux 9、root/sudo 权限、4 核 8 GB 测试服务器，以及一个可读取私有 GHCR 镜像的 classic token（至少包含 `read:packages`）。服务器只需先安装 Git；Docker、Compose 和其余依赖由脚本安装。

```bash
sudo dnf -y install git
sudo git clone https://github.com/hmxha/dwyN-publish.git /opt/dyw-n-release
cd /opt/dyw-n-release

sudo bash install-env.sh
sudo reboot
```

如果发布仓库是私有仓库，Git 会询问 GitHub 用户名和密码；密码位置填写具有仓库读取权限的 GitHub PAT。clone 后保存的 remote URL 不包含 PAT。

重新连接服务器后填写配置：

```bash
cd /opt/dyw-n-release
sudo vi .env
sudo bash deploy.sh deploy
```

至少填写 `APP_IMAGE=ghcr.io/hmxha/dwy/vietnam:<BUILD_TAG>`、`PUBLIC_HOST`、`MYSQL_ROOT_PASSWORD`、`REDIS_PASSWORD`，并把 `ALLOW_LEGACY_SEED` 改为 `1`。建议用 `openssl rand -hex 24` 分别生成两个密码。GHCR 私有镜像不可匿名读取时，发布脚本会交互式询问用户名和 classic token（至少包含 `read:packages`）。token 不写入 `.env`。

环境脚本会安装 Docker Engine/Compose v2，并通过 `/etc/selinux/config` 与所有内核启动项永久关闭 SELinux。执行后必须重启一次；重启前当前系统会先切换为 permissive。

`ALLOW_LEGACY_SEED=1` 表示明确允许把仓库中的历史测试数据导入全新的 MySQL 数据卷。它只能用于隔离的测试服务器。已有 MySQL 数据卷不会因再次执行发布脚本而重新初始化，也不会被脚本删除。

## 日常操作

```bash
cd /opt/dyw-n-release

# 更新发布目录后，继续使用 .env 中的镜像版本
sudo git pull --ff-only
sudo bash deploy.sh deploy

# 发布指定新镜像
sudo bash deploy.sh deploy ghcr.io/hmxha/dwy/vietnam:<BUILD_TAG>

sudo bash deploy.sh status
sudo bash deploy.sh logs lobby
sudo bash deploy.sh restart
sudo bash deploy.sh stop
```

发布脚本不会执行 `docker compose down -v`，不会自动删除 MySQL/Redis 数据卷。外部支付、通知等集成在测试服务器默认使用 `test-disabled`；确实需要联调时，在 `publish/.env` 填写测试凭据后重新发布，禁止写入仓库。

## 防火墙

按验收需要开放端口，不要把 MySQL `3306` 和 Redis `6379` 暴露到公网；Compose 已将它们限制到 `127.0.0.1`。对外通常至少开放 `80/tcp`，游戏端口按 `docker-compose.yml` 中的映射开放。
