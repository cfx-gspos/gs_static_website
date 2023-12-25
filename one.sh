export IP=`wget -qO- ifconfig.co`
StakePort=3000
echo "To deploy it, it may take a few hours or days, let's go(control+c to quit)!"
echo "1/4. Which network do you want to start? (main/test/net8888) eg:net8888"

read NETWORK
echo "You choosed $NETWORK"


echo "2/4. Please provide email to login admin website eg:admin@pos.com"
read Email
 
echo "3/4. Please provide password to login admin website(Contain Upper letter,lower letter,number) eg:123456Aa!"



export IsValidPassword=0
has_special='[#?!@$ %^&*-]'
while [  "$IsValidPassword" = "0"   ]
do
    read -s -p "Password: " Password
    if  [[ $Password != *[#?!@$\ %^\&*-]*  ]]; then
        echo "Does not contain special character  "
    elif [[ $Password != *[[:digit:]]* ]]; then
    echo "Does not contain a digit"
    elif [[ $Password != *[[:lower:]]* ]]; then
    echo "Does not contain a lower case letter"
    elif [[ $Password != *[[:upper:]]* ]]; then
    echo "Does not contain an upper case letter"
    elif [[  ${#Password} < 8   ]];    then
    echo "Password length should >=8"
    echo  ${#Password}
    else
      
       IsValidPassword=1
        echo "valid password"     
        echo $IsValidPassword
    fi
done 



echo "4/4. Please provide private key 0x**** to create the pool (make sure this address has equal or more than 1100 cfx in Core  and 10 cfx in eSpace ) eg:0x1111111111111111111111111111111111111111111111111111111116421777"
read  -s -p "PrivateKey: "  PrivateKey

echo "Start to install"
echo ""
echo ""
echo ""
echo "******************************************************"
echo "Admin website http://${IP}:5000"
echo "Stake website http://${IP}:${StakePort}"
echo "******************************************************"
echo ""
echo ""
echo ""




docker stop node11 admin11 pospool11
docker rm node11 admin11 pospool11
rm -fr /mnt/PoSOneClick  
rm -fr  /mnt/PoSOneClickWorkDir/

mkdir -p /mnt/PoSOneClickWorkDir
mkdir -p /mnt/PoSOneClickWorkDirHelper
mkdir -p /mnt/PoSOneClickWorkDir/node/
mkdir -p /mnt/PoSOneClickWorkDir/admin/wwwroot
echo $NETWORK > /mnt/PoSOneClickWorkDir/NETWORK
cd /mnt

while [ ! -f /mnt/PoSOneClick/README.md    ]
do
    
    cd /mnt  ; date >> /mnt/PoSOneClickWorkDir/nodelog.txt;echo "pull  PoSOneClick.git" >> /mnt/PoSOneClickWorkDir/nodelog.txt ; git clone https://github.com/cfx-gspos/PoSOneClick.git
    
done 




cd /mnt/PoSOneClick

echo "sed  -i -e   's/#Email#/$Email/g'  Config.json" |   bash -
echo "sed  -i -e   's/#Password#/$Password/g'  Config.json" |   bash -
echo "sed  -i -e   's/#PrivateKey#/$PrivateKey/g'  Config.json" |   bash -
# cp Config.json node/ ;cp Config.json node/ ; cp Config.json webpage/ ;  cp Config.json webpage/OneClickPoS/





#***********************Admin***********************

#cd /mnt/PoSOneClick/webpage

#cp /mnt/PoSOneClick/webpage/target/* /mnt/PoSOneClickWorkDir/webpage/ -fr
cp /mnt/PoSOneClick/admin/OneClickPoS /mnt/PoSOneClickWorkDir/ -fr
mv /mnt/PoSOneClickWorkDir/OneClickPoS/Program.cs.release   /mnt/PoSOneClickWorkDir/OneClickPoS/Program.cs
cp /mnt/PoSOneClick/admin/init.sh /mnt/PoSOneClickWorkDir/admin/init.sh

cp /mnt/PoSOneClick/admin/getAccountInfo /mnt/PoSOneClickWorkDir/admin/ -fr
cd /mnt/PoSOneClickWorkDir/admin/getAccountInfo;unzip node_modules.zip
cp /mnt/PoSOneClick/admin/OneClickPoS/release/* /mnt/PoSOneClickWorkDir/admin/ -fr

cp /mnt/PoSOneClick/Config.json /mnt/PoSOneClickWorkDir/admin/Config.json
#cd  /mnt/PoSOneClickWorkDir/OneClickPoS/


docker run -dit  --privileged=true  --name admin11  -p 5000:5000  -v /mnt/PoSOneClickWorkDir:/app/host -it gspos/admin:0.0.2
docker exec -it  admin11 bash -c  'nohup  sh  /app/host/admin/init.sh  &> output & sleep 1'
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

# docker image build -t local/node:0.0.11 .
docker run -d -it  --privileged=true  --name node11  -v /mnt/PoSOneClickWorkDir:/app/host -it gspos/node:0.0.7
docker exec -it node11 bash /app/host/node/init.sh >  /mnt/PoSOneClickWorkDirHelper/deploy.txt 2 > /mnt/PoSOneClickWorkDirHelper/stderrdeploy.txt


 
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

#cd /mnt/PoSOneClick/pos-pool
# docker image build -t gspos/contract:0.0.11 .
# docker run -d -it  --privileged=true  --name contract11   -p 3001:3000  -v /mnt/PoSOneClickWorkDir:/app/host -it gspos/contract:0.0.11

docker run -d -it  --privileged=true  --name pospool11  -v /mnt/PoSOneClickWorkDir:/app/host -v /mnt/PoSOneClickWorkDirHelper:/app/helper -p ${StakePort}:3000 -it gspos/pospool:0.0.3
docker exec -it pospool11 bash /app/host/pos-pool/init.sh 


echo end
exit 1