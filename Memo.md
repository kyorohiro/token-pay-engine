
# 動作確認は testnet で 行う

Eth の testnet 
ただ、Polygonを使うかもなぁ

# GW

Cloudflare 
https://developers.cloudflare.com/web3/ethereum-gateway/

Alchemy 
https://www.alchemy.com/rpc/ethereum-sepolia

GCP 
https://docs.cloud.google.com/blockchain-rpc/docs/rpc-api


# DOC

https://github.com/ethereum/execution-apis

https://ethereum.github.io/execution-apis/api-documentation/

https://ethereum.org/ja/developers/docs/apis/json-rpc/


# CURL

```
curl "https://eth-sepolia.g.alchemy.com/v2/{APIKEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"eth_blockNumber",
    "params":[]
  }'  
{"jsonrpc":"2.0","id":1,"result":"0x92d414"}%    
```


### (1) ネットワーク確認：eth_chainId

```
curl "https://eth-sepolia.g.alchemy.com/v2/{APIKEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"eth_chainId",
    "params":[]
  }'

```

### (2) 自分のウォレット残高を見る：eth_getBalance

```
curl "https://eth-sepolia.g.alchemy.com/v2/{APIKEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"eth_getBalance",
    "params":["{"0xウォレットアドレス}","latest"]
  }'

```

### 送金してもらう

https://cloud.google.com/application/web3/faucet/ethereum/sepolia. 
--> mainnetにいくらか入ってなくてもOK

https://www.alchemy.com/faucets/ethereum-sepolia. 
--> mainnetにいくらか入ってないとダメ

