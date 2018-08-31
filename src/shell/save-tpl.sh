
repo=$1
yg_name=$2
proj_path=$3
solid_path="${repo}/${yg_name}"

isforce=0

# 如果强制替换，则删除原内容
if [[ ! $isforce = 0 ]]; then
  rm -rf $solid_path
else
  if [ -d $solid_path ]; then
    echo \'$yg_name\' have exsit.
    exit 1
  fi
fi

mkdir -p "${solid_path}/node_modules/.bin"

# 不存在node_modules目录则不用保存
if [ ! -d $proj_path/node_modules ]; then
  echo nothing can be saved as part of template.
  exit 0
fi

# 复制原本
for file in $( ls $proj_path/node_modules )
do
  source=$proj_path/node_modules/$file
  target=$solid_path/node_modules/$file
  if [[ -h $source ]]; then
    source=`ls -l $source | awk '{print $(NF)}'`
  fi
  cp -rf $source $target
done

# 复制.bin
for file in $( ls $proj_path/node_modules/.bin )
do
  source=$proj_path/node_modules/.bin/$file
  target=$solid_path/node_modules/.bin/$file
  cp -a $source $target
done
