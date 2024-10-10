cd packages/webgal
sh write-img-path.sh
cd ../..
# 安装依赖并构建
yarn
yarn build

# 进入 Terre 目录
cd ../WebGAL_Terre/packages/terre2/assets/templates/IdolTime_Template || exit
# 删除其他文件
rm -r assets
rm -r index.html
rm -f idoltime-serviceworker.js

# 进入 WebGAL 构建目录
cd ../../../../../../WebGAL/packages/webgal || exit
# 复制
cp -r dist/index.html ../../../WebGAL_Terre/packages/terre2/assets/templates/IdolTime_Template
cp -r dist/assets ../../../WebGAL_Terre/packages/terre2/assets/templates/IdolTime_Template
cp -r dist/idoltime-serviceworker.js ../../../WebGAL_Terre/packages/terre2/assets/templates/IdolTime_Template
