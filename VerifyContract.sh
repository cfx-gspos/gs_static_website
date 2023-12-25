cd /app/host/pos-pool/contract 
#ContractAddress FileName ContractName
verifyContract() {
export ContractAddress=$1
export FileName=$2
export ContractName=$3
npx hardhat  flatten contracts/${FileName}.sol  >${FileName}_flatten.sol
cpp -undef -P ${FileName}_flatten.sol > ${FileName}_flattentmp.sol
mv  ${FileName}_flattentmp.sol  ${FileName}_flatten.sol
cat   ${FileName}_flatten.sol |perl -pe 's/\/\/(.+)?\n//' | perl -pe 's/\n/ /' | perl -pe 's/\"/\\\"/g'  > ${FileName}_flattenUpdated.sol
src=`cat  ${FileName}_flattenUpdated.sol`
curl -d "{\"address\":\"$ContractAddress\"\
    ,\"compiler\":\"0.8.16\"\
    ,\"license\":\"None\"\
    ,\"name\":\"${ContractName}\"\
    ,\"sourceCode\":\"$src\"}" \
-H "Content-Type: application/json" \
-X POST $URL
}

#*********1.PoolManager
verifyContract `cat pm` 'PoolManager' 'PoolManager'

#*********2.PoSPool
verifyContract `cat p` 'PoSPool' 'PoSPool'
verifyContract `cat p2` 'PoSPoolProxy1967' 'PoSPoolProxy1967'