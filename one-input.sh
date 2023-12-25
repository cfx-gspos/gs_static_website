

docker stop node11 admin11 pospool11 > null 2> null
docker rm node11 admin11 pospool11  > null  2> null
rm -fr /mnt/PoSOneClick  
rm -fr  /mnt/PoSOneClickWorkDir
rm -fr  /mnt/PoSOneClickWorkDirHelper

mkdir -p /mnt/PoSOneClickWorkDir
mkdir -p /mnt/PoSOneClickWorkDirHelper
mkdir -p /mnt/PoSOneClickWorkDir/node/
mkdir -p /mnt/PoSOneClickWorkDir/admin/wwwroot

cd /mnt
while [ ! -f /mnt/PoSOneClick/README.md    ]
do
    cd /mnt  ; date >> /mnt/PoSOneClickWorkDir/nodelog.txt;echo "pull  PoSOneClick.git" >> /mnt/PoSOneClickWorkDir/nodelog.txt ;   git clone https://abc-cfxpool@bitbucket.org/abc-cfxpool/posoneclick.git
    mv posoneclick PoSOneClick
done 
RESTORE_FILE=/mnt/PoSPoolBackup.zip
mkdir -p /mnt/PoSOneClickWorkDir/
echo '' > /mnt/PoSOneClickWorkDir/RESTORE_MODE
if [ -f /mnt/NOT_USE_SNAPSHOT ]; then
 cp /mnt/NOT_USE_SNAPSHOT /mnt/PoSOneClickWorkDir/
fi

RESTORE_MODE="false"
if [ -f "$RESTORE_FILE" ]; then
     RESTORE_MODE="true"
     echo "Will restore pool from backup file,it may take a few hours or days, please wait"
     cd /mnt
     rm mnt -fr
     unzip PoSPoolBackup.zip
     
     echo true > /mnt/PoSOneClickWorkDir/RESTORE_MODE
     mkdir -p /mnt/PoSOneClickWorkDir/PoSPoolBackup
    cp /mnt/mnt/PoSOneClickWorkDir/admin/PoSPoolBackup/* /mnt/PoSOneClickWorkDir/PoSPoolBackup/ -fr
fi 



cd /mnt/PoSOneClick/admin/getAccountInfo
rm node_modules -fr;unzip node_modules.zip > null

export IP=`wget -qO- ifconfig.co`

StakePort=80
STAKE_PORT=`cat /mnt/STAKE_PORT`
if [ "$STAKE_PORT" != "" ]; then
   StakePort=$STAKE_PORT
fi
echo $StakePort



export IP=$IP
export StakePort=$StakePort

export RESTORE_MODE=$RESTORE_MODE
if [ "$RESTORE_MODE" = "true" ]; then
    echo " Restore mode"
else
    echo "To deploy it, it may take a few hours or days, let's go(control+c to quit)!"
    echo "1/4. Which network do you want to start? (main/test/net8888) eg:net8888"

    export IsValidNetwork="0"
    while [  "$IsValidNetwork" = "0"   ]
    do
    read NETWORK
    if [[ "$NETWORK" == "main" || "$NETWORK" == "test"  || "$NETWORK" == "net8888"  ]]; then
    IsValidNetwork="1"
    else
    echo "Please type correct network(main/test/net8888)"
    fi
    done 


    echo "You choosed $NETWORK"

    export NETWORK=$NETWORK

    echo "2/4. Please provide email to login admin website eg:admin@pos.com"

    regex="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$"

    export IsValidEmail="0"
    while [  "$IsValidEmail" = "0"   ]
    do
    read Email
    if [[ $Email =~ $regex ]] ; then
        echo "Email is valid"
        IsValidEmail="1"
    else
        echo "Email is invalid"
    fi
    done 

    export Email=$Email



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

    export Password=$Password

    echo "4/4. Please provide private key 0x**** to create the pool (make sure this address has equal or more than 1100 cfx in Core  and 10 cfx in eSpace ) eg:0x1111111111111111111111111111111111111111111111111111111116421777"

    export IsValidPrivateKey="0"
    while [  "$IsValidPrivateKey" = "0"   ]
    do
    read  -s -p "PrivateKey: "  PrivateKey
    if [[ ${#PrivateKey} == 66 ]] ; then
        echo "PrivateKey is valid"
        IsValidPrivateKey="1"
    else
        echo "PrivateKey is invalid"
    fi
    done 



    export balance=0


    export PrivateKey=$PrivateKey
    node ./getbalance.js $NETWORK $PrivateKey | tail -1 > balance
    node ./getbalance.js $NETWORK $PrivateKey 'getAddress'
    balance=$(cat balance)
    echo $balance
    while [   $balance  -le 1099   ]
    do
    read  -s -p "Only $balance CFX, please make sure the wallet has more than 1100 cfx and press enter to continue"   
    node ./getbalance.js $NETWORK $PrivateKey | tail -1 > balance
    balance=$(cat balance)
    echo ""
    done 

    echo "There are $balance CFX(Core) in this wallet."




    #judge the espace balance
    node ./getbalanceeSpace.js $NETWORK $PrivateKey | tail -1 > balanceeSpace
    node ./getbalanceeSpace.js $NETWORK $PrivateKey 'getAddress'
    balance=$(cat balanceeSpace)
    echo $balance
    while [   $balance  -le 49   ]
    do
    read  -s -p "Only $balance CFX in eSpace, please make sure the wallet has more than 50 cfx and press enter to continue"   
    node ./getbalanceeSpace.js $NETWORK $PrivateKey | tail -1 > balanceeSpace
    balance=$(cat balanceeSpace)
    echo ""
    done 

    echo "There are $balance CFX(eSpace) in this wallet."

fi




cd /mnt

echo "Start to install, it may take a few hours to download the images and snapshot, you can leave away and go back in 12 hours later by access following websites."
echo ""
echo ""
echo ""
echo "******************************************************"
echo "Admin website http://Server IP Adress:5000"
echo "Stake website http://Server IP Adress:${StakePort}"
echo "******************************************************"
echo ""
echo ""
echo ""


bash ./one-run.sh  >> /mnt/InstallPoSOneClickOneRunLog.txt  2>&1