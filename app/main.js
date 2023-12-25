let coreClient = new TreeGraph.Conflux(CURRENT);
console.log('SDK version: ', coreClient.version);

let hashModal = new bootstrap.Modal(document.getElementById('hashModal'), {});
let withdrawModal = new bootstrap.Modal(document.getElementById('withdrawModal'), {});

const PoSPool = {
  watch: {
    'space.value'(newSpace, old) {
      console.log('Space change: ', newSpace);
      this.contract.setCurrentNetwork(newSpace);
      //
      if (newSpace === 'Core') {
        if (this.coreAccount) {
          this.userInfo.account = this.coreAccount;
          this.userInfo.connected = true;
          this.loadAllUserInfo();
        } else {
          this.userInfo.account = '';
          this.userInfo.connected = false;
          this.resetUserInfo();
        }
      } else if(newSpace === 'eSpace') {
        if (this.eSpaceAccount) {
          this.userInfo.account = this.eSpaceAccount;
          this.userInfo.connected = true;
          this.loadAllUserInfo();
        } else {
          this.userInfo.account = '';
          this.userInfo.connected = false;
          this.resetUserInfo();
        }
      }
      this.loadPoolInfo();
    } 
  },
  data() {
    return {
      space: spaceStore,
      config: configStore,
      chainStatus: {},
      poolInfo: {
        // status: 'Good', // TODO load the real pool status
        status: {},
        name: '',
        totalLocked: 0,
        totalRevenue: 0,
        userShareRatio: 0n,
        apy: 0,
        lastRewardTime: 0,
        stakerNumber: '0',
        posAddress: '',
        inCommittee: false,
      },
      userInfo: {
        balance: 0,
        connected: false,
        votes: 0n,
        available: 0n,
        userInterest: 0,
        account: '',
        locked: 0n,
        unlocked: 0n,
        userInQueue: [],
        userOutOueue: [],
        nftCount: 0,
      },
      stakeCount: 0,  // stake input value
      unstakeCount: 0, // unstake input value
      withdrawCount: 0,
      txhash: '',
      eSpaceBlockNumber: 0,
      eSpaceAccount: '',
      coreAccount: '',
    }
  },

  async created() {
 // Detect current network
try{
    if(conflux!=undefied&&conflux) {
 
      let status = await confluxRequest({method: 'cfx_getStatus'});
      let netId = Number(status.chainId);
      if (netId === MAINNET.networkId) {
        CURRENT = MAINNET;
      } else if (netId === TESTNET.networkId) {
        CURRENT = TESTNET;
      }
    } else if (ethereum) {
 
      if (ethereum.networkVersion == MAINNET.eNetId) {
        CURRENT = MAINNET;
      } else if (ethereum.networkVersion == TESTNET.eNetId) {
        CURRENT = TESTNET;
      }
    }

}catch(ex){

      if (ethereum.networkVersion == MAINNET.eNetId) {
        CURRENT = MAINNET;
      } else if (ethereum.networkVersion == TESTNET.eNetId) {
        CURRENT =  MAINNET;
      }

}
    console.log('Current network: ', CURRENT);
    this.config.value = CURRENT;
    coreClient = new TreeGraph.Conflux(CURRENT);
    
    this.contract = new PoSPoolContract({
      network: this.space.value,
      coreAddress: CURRENT.poolAddress,
      coreRpc: CURRENT.url,
      coreNetId: CURRENT.networkId,
      eSpaceAddress: CURRENT.eSpaceAddress,
      eSpaceRpc: CURRENT.eSpaceRpc,
    });
    
    // load pool info
    this.loadPoolInfo();
    await this.loadPoolMetaInfo();
    this.loadRewardChartData();

    if (CURRENT.networkId === MAINNET.networkId) {
      this.loadLastRewardTime();
      this.loadPosNodeStatus();
    }
  },

  mounted () {
    // toggle visibility of the app element
    const app = document.getElementById('app');
    app.setAttribute('class', 'container');
  },

  computed: {
    perFee() {
      return (10000n - this.poolInfo.userShareRatio) / 100n;
    },

    formatedTotalLocked() {
      return formatUnit(this.poolInfo.totalLocked.toString(), "CFX");
    },

    formatedTotalRevenue() {
      return formatUnit(this.poolInfo.totalRevenue.toString(), "CFX");
    },

    prettyTotalLocked() {
      const totalLocked = this.poolInfo.totalLocked;
      if (totalLocked === 0) return 0;
      return prettyFormat(totalLocked.toString());
    },

    prettyTotalRevenue() {
      const totalRevenue = this.poolInfo.totalRevenue;
      if (totalRevenue == 0) return 0;
      return prettyFormat(totalRevenue.toString());
    },

    userStakedCFX() {
      return this.userInfo.votes * BigInt(ONE_VOTE_CFX);
    },

    unstakeableCFX() {
      return this.userInfo.locked * BigInt(ONE_VOTE_CFX);
    },

    withdrawableCFX() {
      return this.userInfo.unlocked * BigInt(ONE_VOTE_CFX);
    },

    shortenAccount() {
      const account = this.userInfo.account;
      if (account.match(':')) {
        return TreeGraph.address.shortenCfxAddress(account);
      } else {
        return `${account.slice(0, 4)}...${account.slice(-4)}`;
      }
    },

    lastRewardTime() {
      const lastTime = new Date(this.poolInfo.lastRewardTime * 1000);
      return formatDateTime(lastTime);
    },

    shortPosAddress() {
      if (!this.poolInfo.posAddress) {
        return 'Loading...';
      }
      const start = this.poolInfo.posAddress.slice(0, 6);
      return `${start}...`;
    },

    posAddressLink() {
      return `${CURRENT.scanURL}/pos/accounts/${this.poolInfo.posAddress}`;
    },

    shortHash() {
      if (!this.txhash) return '';
      return this.txhash.slice(0, 10) + '...';
    },

    txScanLink() {
      if (!this.txhash) return '#';
      return `${CURRENT.scanURL}/transaction/${this.txHash}`;
    },

    vip() {
      const available = this.userInfo.available;
      if (available >= 1000) { // VIP4(100w) 2%
        return 4;
      } else if (available >= 100) { // VIP3(10w) 3%
        return 3;
      } else if (available >= 50){ // VIP2(5w) 4%
        return 2;
      } else if (available >= 10) { // VIP1(1w) 5%
        return 1;
      } else {
        return 0;
      }
    }
  },

  methods: {

    isCore() {
      return this.space.value === 'Core';
    },

    resetUserInfo() {
      this.userInfo = {
        balance: 0,
        connected: false,
        votes: 0n,
        available: 0n,
        userInterest: 0,
        account: '',
        locked: 0n,
        unlocked: 0n,
        userInQueue: [],
        userOutOueue: [],
        nftCount: 0,
      };
    },

    async loadCoreChainInfo() {
      const status = await coreClient.cfx.getStatus();
      this.chainStatus = status;
      return status;
    },

    async connectWallet() {
      if (this.isCore()) {
        if (!window.conflux) {
          alert('Please install Conflux Wallet');
          return;
        }
        const accounts = await requestCoreAccounts();
        if (accounts.length === 0) {
          alert('Request account failed');
          return;
        }
        const account = accounts[0];
        this.userInfo.account = account;
        this.userInfo.connected = true;
        this.coreAccount = account;
        //
        await this.loadAllUserInfo();
        this.loadUserNFTInfo();

        this.contract.setCoreProvider(window.conflux);

        await this.loadCoreChainInfo();

        if (this.chainStatus.chainId !== CURRENT.networkId) {
          alert('Please switch wallet to ' + CURRENT.networkId);
          return;
        }
      } else {
        if (typeof window.ethereum === 'undefined') {
          alert('Please install Metamask');
          return;
        }
        if (ethereum.networkVersion != CURRENT.eNetId) {
          alert('Please switch wallet to ' + CURRENT.eNetId);
          return;
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length === 0) {
          alert('Request account failed');
          return;
        }
        const account = accounts[0];

        this.userInfo.account = account;
        this.userInfo.connected = true;
        this.eSpaceAccount = account;

        // TODO watch on account change
        
        await this.loadAllUserInfo();

        this.contract.setESpaceProvider(provider);

        let blockNumber = await provider.getBlockNumber()
        this.eSpaceBlockNumber = blockNumber;
      }
    },

    async loadAllUserInfo() {
      this.loadUserInfo();
      this.loadUserLockingList();
      this.loadUserUnlockingList();
    },

    mapQueueItem(item) {
      let now = new Date().getTime();
      let unlockTime;
      if (this.isCore()) {
        let unlockBlockNumber = Number(item.endBlock) - this.chainStatus.blockNumber;
        unlockTime = new Date(now + unlockBlockNumber / 2 * 1000);
      } else {
        let unlockBlockNumber = Number(item.endBlock) - this.eSpaceBlockNumber;
        unlockTime = new Date(now + unlockBlockNumber * 1000*1.2);
      }
      return {
        amount: voteToCFX(item.votePower),
        endTime: formatDateTime(unlockTime),
      }
    },

    async loadUserInfo() {
      const userSummary = await this.contract.userSummary(this.userInfo.account);
      this.userInfo.votes = userSummary.votes;
      this.userInfo.available = userSummary.available;
      this.userInfo.locked = userSummary.locked;
      this.userInfo.unlocked = userSummary.unlocked;

      const userInterest = await this.contract.userInterest(this.userInfo.account);
      this.userInfo.userInterest = trimPoints(TreeGraph.Drip(userInterest.toString()).toCFX());

      const balance = await this.contract.getBalance(this.userInfo.account);
      this.userInfo.balance = trimPoints(TreeGraph.Drip(balance.toString()).toCFX());
    },

    // only need load once
    async loadPoolMetaInfo() {
      this.poolInfo.name = await this.contract.poolName();
      this.poolInfo.userShareRatio = await this.contract.poolUserShareRatio();
      let poolPosAddress = await this.contract.posAddress();
      this.poolInfo.posAddress = TreeGraph.format.hex(poolPosAddress);
    },

    async loadPosNodeStatus() {
      const account = await coreClient.pos.getAccount(this.poolInfo.posAddress);
      this.poolInfo.status = account.status;
    },

    async loadPoolInfo() {
      const poolSummary = await this.contract.poolSummary();
      this.poolInfo.totalLocked = poolSummary.available * BigInt(ONE_VOTE_CFX) * BigInt("1000000000000000000");
      this.poolInfo.totalRevenue = poolSummary.totalInterest;
      this.poolInfo.apy = Number(await this.contract.poolAPY()) / 100;

      const stakerNumber = await this.contract.stakerNumber();
      this.poolInfo.stakerNumber = stakerNumber.toString();
    },

    async loadLastRewardTime() {
      const {epoch} = await coreClient.pos.getStatus();
      let lastReward = await coreClient.pos.getRewardsByEpoch(epoch - 1);
      if (!lastReward) {
        lastReward = await coreClient.pos.getRewardsByEpoch(epoch - 2);
      }
      const block = await coreClient.cfx.getBlockByHash(lastReward.powEpochHash, false);
      this.poolInfo.lastRewardTime = block.timestamp;
    },

    async loadUserLockingList() {
      let list = await this.contract.userInQueue(this.userInfo.account);
      this.userInfo.userInQueue = list.map(this.mapQueueItem);
    },

    async loadUserUnlockingList() {
      let list = await this.contract.userOutQueue(this.userInfo.account);
      this.userInfo.userOutOueue = list.map(this.mapQueueItem);
    },

    async loadUserNFTInfo() {
      if (!CURRENT.nftAddress) return;
      nftContract = coreClient.Contract({
        abi: PoSNFTABI,
        address: CURRENT.nftAddress
      });
      const count = await nftContract.balanceOf(this.userInfo.account);
      this.userInfo.nftCount = Number(count.toString());
    },

    async stake() {
      if (this.stakeCount === 0 || this.stakeCount % ONE_VOTE_CFX != 0 ) {
        alert('Stake count should be multiple of 1000');
        return;
      }
      if (Number(this.userInfo.balance) < Number(this.stakeCount)) {
        alert('Insufficient balance');
        return;
      }

      const hash = await this
        .contract
        .increaseStake(this.stakeCount, this.userInfo.account);
      this.txHash = hash;
      hashModal.show();

      this.contract.waitTx(hash).then(receipt => {
        hashModal.hide();
        if (receipt.status === 0) { // success
          this.loadUserInfo();
          this.loadUserLockingList();
          this.stakeCount = 0;  // clear stake count
        } else {
          alert('Stake failed');
        }
      });
    }, 

    async claim() {
      if (this.userInfo.userInterest == 0 ) {
        alert('No claimable interest');
        return;
      }
      let hash = await this
        .contract
        .claimAllInterest(this.userInfo.account);
      this.txHash = hash;
      hashModal.show();

      this.contract.waitTx(hash).then(receipt => {
        hashModal.hide();
        if (receipt.status === 0) {
          this.loadUserInfo();
        } else {
          alert('Claim failed');
        }
      });
    }, 

    async unstake() {
      if (this.userInfo.locked === BigInt(0)) {
        alert('No unstakeable funds');
        return;
      }
      if (this.unstakeCount === 0 || this.unstakeCount % ONE_VOTE_CFX != 0 ) {
        alert('Unstake count should be multiple of 1000');
        return;
      }
      const unstakeVotePower = this.unstakeCount / ONE_VOTE_CFX;

      let hash = await this
        .contract
        .decreaseStake(unstakeVotePower, this.userInfo.account);

      this.txHash = hash;
      hashModal.show();

      this.contract.waitTx(hash).then(receipt => {
        hashModal.hide();
        if (receipt.status === 0) {
          this.loadUserInfo();
          this.loadUserUnlockingList();
          this.unstakeCount = 0;  // clear unstake count
        } else {
          alert('UnStake failed');
        }
      });
    },

    async withdraw() {
      if (this.userInfo.unlocked === BigInt(0)) {
        alert('No withdrawable funds');
        return;
      }

      if (this.withdrawCount === 0 || this.withdrawCount % ONE_VOTE_CFX != 0 ) {
        alert('Unstake count should be multiple of 1000');
        return;
      }

      const withdrawVotePower = this.withdrawCount / ONE_VOTE_CFX;

      try {
        let hash = await this
          .contract
          .withdrawStake(withdrawVotePower, this.userInfo.account);

        this.txHash = hash;
        hashModal.show();

        this.contract.waitTx(hash).then(receipt => {
          hashModal.hide();
          if (receipt.status === 0) {
            this.loadUserInfo();
          } else {
            alert('Withdraw failed');
          }
        });
      } catch(err) {
        console.log("Please try to withdraw small count or wait for a few hours and try again", err);
        withdrawModal.show();
      }
    },

    loadRewardChartData() {
      let posAddress = this.poolInfo.posAddress;
      const url = `${CURRENT.scanURL}/stat/list-pos-account-reward?identifier=${posAddress}&limit=20&orderBy=createdAt&reverse=true`;
      fetch(url)
        .then(response => response.json())
        .then(initLineChart);
    }
  }
};

Vue.createApp(PoSPool).mount('#app');

function initLineChart(res) {
  const rewards = res.data;
  const { list } = rewards;
  if (list.length === 0) return;
  const labels = list.map(item => formatTime(new Date(item.createdAt)));
  const items = list.map(item => {
    const formated = formatUnit(item.reward, 'CFX');
    const onlyValue = formated.split(' ')[0];
    return Number(onlyValue);
  });

  const data = {
    labels: labels.reverse(),
    datasets: [{
      label: 'Rewards Per Hour (CFX)',
      backgroundColor: 'rgb(66, 184, 131)',
      borderColor: 'cornflowerblue',
      data: items.reverse(),
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {}
  };

  document.getElementById('rewardChartContainer').removeAttribute('style');
  const chartEle = document.getElementById('rewardChart')
  const rewardChart = new Chart(chartEle, config);
  return rewardChart;
}