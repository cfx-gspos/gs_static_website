 


echo $NETWORK > /mnt/PoSOneClickWorkDir/NETWORK



cd /mnt/PoSOneClick

echo "sed  -i -e   's/#Email#/$Email/g'  Config.json" |   bash -
echo "sed  -i -e   's/#Password#/$Password/g'  Config.json" |   bash -
echo "sed  -i -e   's/#PrivateKey#/$PrivateKey/g'  Config.json" |   bash -
# cp Config.json node/ ;cp Config.json node/ ; cp Config.json webpage/ ;  cp Config.json webpage/OneClickPoS/

cp /mnt/SPLIT_SERVER_A_ADMIN /mnt/PoSOneClickWorkDir/
SPLIT_SERVER_A_ADMIN=""
SPLIT_SERVER_A_ADMIN=`cat /mnt/PoSOneClickWorkDir/SPLIT_SERVER_A_ADMIN`

cp /mnt/SPLIT_SERVER_B_STAKE /mnt/PoSOneClickWorkDir/
SPLIT_SERVER_B_STAKE=""
SPLIT_SERVER_B_STAKE=`cat /mnt/PoSOneClickWorkDir/SPLIT_SERVER_B_STAKE`





#***********************Admin***********************

#cd /mnt/PoSOneClick/webpage

#cp /mnt/PoSOneClick/webpage/target/* /mnt/PoSOneClickWorkDir/webpage/ -fr
cp /mnt/PoSOneClick/admin/OneClickPoS /mnt/PoSOneClickWorkDir/ -fr
mv /mnt/PoSOneClickWorkDir/OneClickPoS/Program.cs.release   /mnt/PoSOneClickWorkDir/OneClickPoS/Program.cs
cp /mnt/PoSOneClick/admin/init.sh /mnt/PoSOneClickWorkDir/admin/init.sh

cp /mnt/PoSOneClick/admin/getAccountInfo /mnt/PoSOneClickWorkDir/admin/ -fr
# cd /mnt/PoSOneClickWorkDir/admin/getAccountInfo;unzip node_modules.zip
cp /mnt/PoSOneClick/admin/OneClickPoS/release/* /mnt/PoSOneClickWorkDir/admin/ -fr

cp /mnt/PoSOneClick/Config.json /mnt/PoSOneClickWorkDir/admin/Config.json
#cd  /mnt/PoSOneClickWorkDir/OneClickPoS/
 
echo '{"registry-mirrors":["https://hub-mirror.c.163.com", "https://mirror.baidubce.com"]}' >  /etc/docker/daemon.json
systemctl daemon-reload
systemctl restart docker

downloadedAllImages="0"
while [  "$downloadedAllImages" = "0"   ]
do
docker pull gspos/admin:0.0.2
docker pull gspos/node:0.0.7
docker pull gspos/pospool:0.0.3     
existedAdmin=`docker images  |grep admin`
existedNode=`docker images  |grep node`
existedPospool=`docker images  |grep pospool`

if [[ "$existedAdmin" != "" && "$existedNode" != "" && "$existedPospool" != ""  ]]; then
downloadedAllImages="1"
    echo "All images were downloaded"
else
   echo "Not all images were downloaded, try again"
fi
done 



if [ "$RESTORE_MODE" = "true" ]; then
    cp /mnt/PoSOneClickWorkDir/PoSPoolBackup/node/Config.json /mnt/PoSOneClickWorkDir/admin/
    mkdir -p /mnt/PoSOneClickWorkDir/node/
    cp /mnt/PoSOneClickWorkDir/PoSPoolBackup/node/admin_email /mnt/PoSOneClickWorkDir/node/
    cp /mnt/PoSOneClickWorkDir/PoSPoolBackup/node/system_email /mnt/PoSOneClickWorkDir/node/
    cp /mnt/PoSOneClickWorkDir/PoSPoolBackup/node/system_pass /mnt/PoSOneClickWorkDir/node/
    cp /mnt/PoSOneClickWorkDir/PoSPoolBackup/admin/getAccountInfo/index.js /mnt/PoSOneClickWorkDir/admin/getAccountInfo/index.js
    cp /mnt/PoSOneClickWorkDir/PoSPoolBackup/NETWORK /mnt/PoSOneClickWorkDir/
fi
if [ "$SPLIT_SERVER_B_STAKE" != "true" ]; then
   docker run -dit  --privileged=true  --restart=always   --name admin11  -p 5000:5000  -v /mnt/PoSOneClickWorkDir:/app/host -it gspos/admin:0.0.2
   docker exec -it  admin11 bash -c  'nohup  sh  /app/host/admin/init.sh  &> output & sleep 1'
fi

existed=`crontab -l | grep \#admin`
if [ "$existed" = "" ]; then
    (crontab -l ; echo "* * * * * docker exec admin11 /bin/sh -c '  dotnet /app/host/admin/OneClickPoS.dll &'#admin") | crontab
fi
rm /var/run/crond.pid
cron
echo "Restart crontab"
/etc/init.d/cron reload 
service cron restart 
#  docker attach  admin11  


# dotnet OneClickPoS.dll 
# under folder OneClickPos run  dotnet publish -o ../webpage
# cp /mnt/PoSOneClick/webpage/target/* /mnt/PoSOneClickWorkDir/webpage/ -fr
#***********************Node***********************
cp /mnt/PoSOneClick/Config.json /mnt/PoSOneClickWorkDir/node/Config.json


cp /mnt/PoSOneClick/node/node.json /mnt/PoSOneClickWorkDir/node/node.json
cp /mnt/PoSOneClick/node/init.sh /mnt/PoSOneClickWorkDir/node/init.sh
cp /mnt/PoSOneClick/node/SwitchKey.sh /mnt/PoSOneClickWorkDir/node/SwitchKey.sh
cp /mnt/PoSOneClick/node/UpgradeNode.sh /mnt/PoSOneClickWorkDir/node/UpgradeNode.sh
cp /mnt/PoSOneClick/node/adjustnode.sh /mnt/PoSOneClickWorkDir/node/adjustnode.sh

cp /mnt/PoSOneClick/node/main /mnt/PoSOneClickWorkDir/node/ -fr
cp /mnt/PoSOneClick/node/test /mnt/PoSOneClickWorkDir/node/ -fr
cp /mnt/PoSOneClick/node/8888 /mnt/PoSOneClickWorkDir/node/ -fr
# cp /mnt/PoSOneClickWorkDir/shared/run/ /mnt/PoSOneClick/node -fr 
# cd /mnt/PoSOneClick/node 
#Add monitor pool status service
cp /mnt/PoSOneClick/node/monitor_poolstatus /mnt/PoSOneClickWorkDir/node/ -fr

# docker image build -t local/node:0.0.11 .
if [ "$SPLIT_SERVER_B_STAKE" != "true" ]; then
    docker run -d -it  --privileged=true  --restart=always   --name node11  -v /mnt/PoSOneClickWorkDir:/app/host -it gspos/node:0.0.7
    docker exec -it node11 bash /app/host/node/init.sh >  /mnt/PoSOneClickWorkDirHelper/deploy.txt 2 > /mnt/PoSOneClickWorkDirHelper/stderrdeploy.txt
fi
    
     
 

existed=`crontab -l | grep \#node`
if [ "$existed" = "" ]; then
    (crontab -l ; echo "@reboot   docker exec node11 /bin/sh -c 'service cron restart ；screen -wipe;pkill screen;  screen -S \"node\" -d -m;screen -S node    -p 0 -X stuff \" bash /app/host/node/start.sh >  /app/host/node/node.log\n\"     &'  #node") | crontab
fi

#    docker exec -it  node11 bash cat registerdata
#    docker attach node11  

# remove container(docker rm xxx), remove image(docker image rm xxx), remove folder()  

 #***********************Contract***********************
 mkdir -p /mnt/PoSOneClickWorkDir/pos-pool
cp /mnt/PoSOneClick/pos-pool/init.sh /mnt/PoSOneClickWorkDir/pos-pool/init.sh
cp /mnt/PoSOneClick/pos-pool/.env_cfx /mnt/PoSOneClickWorkDir/pos-pool/.env_cfx
cp /mnt/PoSOneClick/pos-pool/.env_cfxtest /mnt/PoSOneClickWorkDir/pos-pool/.env_cfxtest
cp /mnt/PoSOneClick/pos-pool/.env_NET8888 /mnt/PoSOneClickWorkDir/pos-pool/.env_NET8888
cp /mnt/PoSOneClick/pos-pool/pool.config.sample.js /mnt/PoSOneClickWorkDir/pos-pool/pool.config.sample.js
cp /mnt/PoSOneClick/pos-pool/UpgradeContract.sh /mnt/PoSOneClickWorkDir/pos-pool/UpgradeContract.sh
cp /mnt/PoSOneClick/pos-pool/VerifyContract.sh /mnt/PoSOneClickWorkDir/pos-pool/VerifyContract.sh

mkdir -p /mnt/PoSOneClickWorkDir/pos-pool/github
cp /mnt/PoSOneClick/pos-pool/pos-pool.zip /mnt/PoSOneClickWorkDir/pos-pool/github

cp /mnt/PoSOneClick/pos-pool/StartPoolWebsite.sh /mnt/PoSOneClickWorkDir/pos-pool/

echo  false > /mnt/PoSOneClickWorkDir/pos-pool/IS_HTTPS
cp /mnt/IS_HTTPS /mnt/PoSOneClickWorkDir/pos-pool/
cp /mnt/cert.crt /mnt/PoSOneClickWorkDir/pos-pool/
cp /mnt/cert.key /mnt/PoSOneClickWorkDir/pos-pool/
#cd /mnt/PoSOneClick/pos-pool
# docker image build -t gspos/contract:0.0.11 .
# docker run -d -it  --privileged=true  --name contract11   -p 3001:3000  -v /mnt/PoSOneClickWorkDir:/app/host -it gspos/contract:0.0.11

docker run -d -it  --privileged=true  --restart=always   --name pospool11  -v /mnt/PoSOneClickWorkDir:/app/host -v /mnt/PoSOneClickWorkDirHelper:/app/helper -p ${StakePort}:3000 -it gspos/pospool:0.0.3
docker exec -it pospool11 bash /app/host/pos-pool/init.sh 

existed=`crontab -l | grep \#poolwebsite`
 
if [ "$existed" = "" ]; then
    if [ "$SPLIT_SERVER_A_ADMIN" != "true" ]; then
         (crontab -l ; echo "* * * * *  docker exec -it pospool11 sh -c 'sleep 10;screen -wipe;service cron restart ; sleep 10; sh /app/host/pos-pool/StartPoolWebsite.sh #poolwebsite'") | crontab
    fi
fi

existed=`crontab -l | grep \#synccore2espace`
if [ "$existed" = "" ]; then
   (crontab -l ; echo "@reboot   docker exec pospool11 /bin/sh -c 'sleep 10;screen -wipe;service cron restart ; screen -S \"synccore2espace\" -d -m;screen -S synccore2espace    -p 0 -X stuff \" cd /app/host/pos-pool/contract;DEBUG=espacePoolStatusSyncer node service/eSpacePoolStatusSyncer.js  >  /app/host/admin/wwwroot/synccore2espaceraw.txt  2>&1 \n\"'  #synccore2espace") | crontab
fi

existed=`crontab -l | grep \#backup`
if [ "$existed" = "" ]; then
       if [ "$SPLIT_SERVER_B_STAKE" != "true" ]; then
           (crontab -l ; echo "* * * * *  bash /mnt/PoSOneClick/admin/backup.sh  #backup") | crontab
       fi
    
fi

if [ "$SPLIT_SERVER_B_STAKE"  = "true" ]; then
       rm /mnt/PoSOneClickWorkDir/admin -fr
        rm /mnt/PoSOneClickWorkDir/node -fr
        rm /mnt/PoSOneClickWorkDir/PoSPoolBackup -fr
        rm /mnt/PoSPoolBackup.zip
        rm /mnt/mnt -fr
        cd   /mnt/PoSOneClickWorkDir/pos-pool
        ls -a | grep -xv "interface" | grep -xv "contract" | grep -xv "IS_HTTPS" | grep -xv "StartPoolWebsite.sh" | xargs rm -fr
        rm /mnt/PoSOneClickWorkDir/pos-pool/contract/.env*
fi

echo end
exit 1