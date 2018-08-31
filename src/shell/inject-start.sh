repo=$1   # 模板仓库路径
yg_name=$2  # 模板名
proj_path=$3  #项目路径

# 确保node_modules和.bin文件存在
if [ ! -d "${proj_path}/node_modules/.bin" ]; then
  mkdir -p "${proj_path}/node_modules/.bin"
fi

# 确保模板存在
if [ ! -d "${repo}/${yg_name}" ]; then
  echo "不存在${yg_name}模板，请选择其他模板"
  exit 0
fi

# 软连接repo/yg_name/node_modules/* -> proj/node_modules
# ln -s "${repo}/${yg_name}/node_modules/" "${proj_path}/node_modules"

for file in $(ls "${repo}/${yg_name}/node_modules/")
do
  if [ ! -e "${proj_path}/node_modules/${file}" ]; then
    ln -s "${repo}/${yg_name}/node_modules/${file}" "${proj_path}/node_modules"
  fi
done

for file in $(ls "${repo}/${yg_name}/node_modules/.bin")
do
  source="${repo}/${yg_name}/node_modules/.bin/${file}"
  target="${proj_path}/node_modules/.bin/${file}"
  cp -a $source $target
done

echo "链接${yg_name}模板到项目${proj_path##/*/}成功"
