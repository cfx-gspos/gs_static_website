
class PoSPoolContract {
  constructor(options) {
    this.options = options;
    const {
      network,  // current network: Core/eSpace
      coreAddress, 
      coreRpc, 
      coreNetId,
      eSpaceAddress,
      eSpaceRpc,
    } = options;
    
    this.network = network;
    this.cfxClient = new TreeGraph.Conflux({
      url: coreRpc,
      networkId: coreNetId,
      // logger: console,
    });
    this.coreContract = this.cfxClient.Contract({
      abi: PoSPoolABI,
      address: coreAddress,
    });

    if (eSpaceAddress && eSpaceRpc) {
      const provider = new ethers.providers.JsonRpcProvider(eSpaceRpc);
      const eSpaceContract = new ethers.Contract(eSpaceAddress, PoSPoolABI, provider);
      this.eSpaceContract = eSpaceContract;
      this.ethClient = provider;
    }
  }

  // Core/eSpace
  setCurrentNetwork(network) {
    this.network = network;
  }

  setESpaceProvider(provider) {
    this.ethClient = provider;
    const signer = provider.getSigner();
    this.eSpaceContract = this.eSpaceContract.connect(signer);
  }

  setCoreProvider(provider) {
    this.cfxClient.provider = provider;
  }

  isCore() {
    return this.network === 'Core';
  }

  contract() {
    return this.isCore() ? this.coreContract : this.eSpaceContract;
  }

  async getBalance(addr) {
    let balance;
    if (this.isCore()) {
      balance = await this.cfxClient.cfx.getBalance(addr);
    } else {
      balance = await this.ethClient.getBalance(addr);
    }
    return bnToBigInt(balance);
  }

  async userSummary(addr) {
    let userSummary = await this.contract().userSummary(addr);
    return {
      votes: bnToBigInt(userSummary[0]),
      available: bnToBigInt(userSummary[1]),
      locked: bnToBigInt(userSummary[2]),
      unlocked: bnToBigInt(userSummary[3]),
      claimedInterest: bnToBigInt(userSummary[4]),
      currentInterest: bnToBigInt(userSummary[5]),
    };     
  }

  async poolSummary() {
    let poolSummary = await this.contract().poolSummary();
    return {
      available: bnToBigInt(poolSummary[0]),
      interest: bnToBigInt(poolSummary[1]),
      totalInterest: bnToBigInt(poolSummary[2]),
    };
  }

  async stakerNumber() {
    let stakerNumber = await this.contract().stakerNumber();
    return bnToBigInt(stakerNumber);
  }

  async poolAPY() {
    let poolAPY = await this.contract().poolAPY();
    return bnToBigInt(poolAPY);
  }

  async userInterest(addr) {
    let interest = await this.contract().userInterest(addr);
    return bnToBigInt(interest);
  }

  async poolUserShareRatio() {
    let ratio = await this.contract().poolUserShareRatio();
    return bnToBigInt(ratio);
  }

  async poolName() {
    const poolName = await this.coreContract.poolName();
    return poolName;
  }

  async posAddress() {
    const posAddress = await this.coreContract.posAddress();
    return posAddress;
  }

  async userOutQueue(address) {
    let userOutQueue = await this.contract()['userOutQueue(address)'](address);
    return userOutQueue.map(item => ({
      votePower: bnToBigInt(item[0]),
      endBlock: bnToBigInt(item[1]),
    }));
  }

  async userInQueue(address) {
    let userInQueue = await this.contract()['userInQueue(address)'](address);
    return userInQueue.map(item => ({
      votePower: bnToBigInt(item[0]),
      endBlock: bnToBigInt(item[1]),
    }));
  }

  async increaseStake(stakeAmount, account) {
    const votes = stakeAmount / 1000;
    if (this.isCore()) {
      const txHash = await this.coreContract
        .increaseStake(votes)
        .sendTransaction({
          from: account,
          value: TreeGraph.Drip.fromCFX(stakeAmount),
        });
      return txHash;
    } else {
      let tx = await this.eSpaceContract.increaseStake(votes, {
        value: ethers.utils.parseEther(stakeAmount.toString())
      });
      return tx.hash;
    }
  }

  async decreaseStake(votes, account) {
    if (this.isCore()) {
      const txHash = await this.coreContract
        .decreaseStake(votes)
        .sendTransaction({
          from: account,
        });
      return txHash;
    } else {
      let tx = await this.eSpaceContract.decreaseStake(votes);
      return tx.hash;
    }
  }

  async claimAllInterest(account) {
    if (this.isCore()) {
      const txHash = await this.coreContract
        .claimAllInterest()
        .sendTransaction({
          from: account,
        });
      return txHash;
    } else {
      let tx = await this.eSpaceContract.claimAllInterest();
      return tx.hash;
    }
  }

  async withdrawStake(votes, account) {
    if (this.isCore()) {
      const txHash = await this.coreContract
        .withdrawStake(votes)
        .sendTransaction({
          from: account,
        });
      return txHash;
    } else {
      let tx = await this.eSpaceContract.withdrawStake(votes);
      return tx.hash;
    }
  }

  async waitTx(hash) {
    if (this.isCore()) {
      let count = 0;
      while(count < 20) {
        let receipt = await this.cfxClient.cfx.getTransactionReceipt(hash);
        if (receipt) {
          return {
            receipt,
            status: receipt.outcomeStatus,  // 0: success other: failed
          };
        }
        await sleep(3);  // wait 3s
        count++;
      }
    } else {
      let count = 0;
      while(count < 20) {
        let receipt = await this.ethClient.getTransactionReceipt(hash);
        if (receipt) {
          return {
            receipt,
            status: receipt.status === 1 ? 0 : 1,  // 0: success other: failed
          };
        }
        await sleep(3);  // wait 3s
        count++;
      }
    }
    return null;
  }
}

async function sleep(n = 1) {
  await new Promise(resolve => setTimeout(resolve, 1000 * n));
}