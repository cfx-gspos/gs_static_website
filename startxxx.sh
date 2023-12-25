rm  -fr /mnt/one*
rm -fr /mnt/docker.service*
rm -fr /mnt/Install*
rm -fr /mnt/wget*
rm -fr /mnt/docker.service.sh
pkill screen
cd /mnt  

while [ ! -f /mnt/one-run.sh    ]
do
    wget https://gspos.club/one-run.sh 
done 

while [ ! -f /mnt/one-input.sh    ]
do
    wget https://gspos.club/one-input.sh 
done 

while [ ! -f /mnt/docker.service.sh    ]
do
    wget https://gspos.club/docker.service.sh
done 


apt update && apt install -y docker.io screen  zip jq git wget  npm curl 

FILE=/lib/systemd/system/docker.service
# if [ -f "$FILE" ]; then
#      echo  '/lib/systemd/system/docker.service existed'
# else 

# fi

sudo systemctl stop docker.service
sudo systemctl stop docker.socket
rm /lib/systemd/system/docker.service;cp /mnt/docker.service.sh /lib/systemd/system/docker.service
sudo systemctl daemon-reload
sudo systemctl start docker

screen -S Installation -dm bash -c 'cd /mnt ; bash one-input.sh'  
screen -R Installation