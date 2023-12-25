    cd /app/host/pos-pool/interface 

    existedScreen=`screen -ls  |grep poolwebsite`

    while [  "$existedScreen" = ""   ]
    do
        
        screen -S "poolwebsite" -d -m
        IS_HTTPS=`cat /app/host/pos-pool/IS_HTTPS`
        if [ "$IS_HTTPS" = "true" ]; then
            screen -r "poolwebsite" -X stuff $'cd /app/host/pos-pool/interface;yarn  cross-env TAILWIND_MODE=watch REACT_APP_TestNet=$(cat /app/host/pos-pool/REACT_APP_TestNet)  HTTPS=true SSL_CRT_FILE=/app/host/pos-pool/cert.crt SSL_KEY_FILE=/app/host/pos-pool/cert.key  craco start \n'
        else
            screen -r "poolwebsite" -X stuff $'cd /app/host/pos-pool/interface;yarn  cross-env TAILWIND_MODE=watch REACT_APP_TestNet=$(cat /app/host/pos-pool/REACT_APP_TestNet) craco start \n'
        fi
    existedScreen=`screen -ls  |grep poolwebsite`
    done 