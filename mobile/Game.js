
function getDateByBlockInterval(minuend = 0, subtrahend = 0) {
    const minuendBn = new BigNumber(minuend);
    const subtrahendBn = new BigNumber(subtrahend);
    const isGreater = minuendBn.isGreaterThan(subtrahendBn);
    const seconds = isGreater
        ? minuendBn.minus(subtrahendBn).dividedBy(2).toNumber()
        : subtrahendBn.minus(minuendBn).dividedBy(2).toNumber();
    const futureDate = new Date(
        new BigNumber(Date.now()).plus(seconds * 1000).toNumber()
    );
    const pastDate = new Date(
        new BigNumber(Date.now()).minus(seconds * 1000).toNumber()
    );
    return isGreater ? futureDate : pastDate;
};


function fixed(num) {
    return Number.parseFloat(num).toFixed(2);
}



var conflux;
// var confluxJS = new window.TreeGraph.Conflux({
//     url: 'https://main.confluxrpc.com',
//     logger: console,
//     networkId: 1029,
// });

const cfx = new window.TreeGraph.Conflux({
    url: 'https://main.confluxrpc.com/',
    networkId: 1029,
    defaultGasPrice: 1000000, // The default gas price of your following transactions
    defaultGas: 1000000, // The default gas of your following transactions
    logger: console,
});

window.confluxJS = cfx
window.confluxJS.provider = window.conflux

var accounts;

var treasureContract;
window.lock = false;

$(function () {


    $('#g_link').attr('href', "https://confluxscan.io/address/" + CONTRACT_ADDRESS)
    $('#g_poolname').html(POOL_NAME)
    $('title').html(POOL_NAME)
    // $('#g_notification').html(NOTICE)
    //alert(11)
    //????
    $('#connWallet').click(function () {

        if (checkPortal()) {

            openPortal();

        } else {

        }
    })

    //??
    $('#depositBtn').click(function () {

        sendTx();


    })

    //??
    $('#sponsorBtn').click(function () {

        sendSponsorTX();


    })


    if (checkPortal()) {

        openPortal()

        treasureContract = confluxJS.Contract({
            abi: CONTRACT_ABI,
            address: CONTRACT_ADDRESS,
        });

    }

    //?????????????
    setInterval(function () {
        publicInfo()
        // queryCapitalInfo();
    }, 10000);

    //????????
    setInterval(function () {
        showIntervalTime();
    }, 500);


    var inviteAddress = getQueryVariable("invite");
    $("#referrer").attr('data', inviteAddress);





    ///////////////////////KKKKKKKKKKKKKKKK



    //**************************************************KO */


    // This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
    function Card(id, backgroundId, path, opened, selected) {
        this.id = ko.observable(id);
        this.backgroundId = ko.observable(backgroundId);
        this.path = ko.observable(path);
        this.opened = ko.observable(opened);
        this.selected = ko.observable(selected);
    }
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    var opnedCards = [];
    async function getOpendCard() {


        function AppViewModel() {

            // construct the random card list,whichi should be read from contract.
            var idList = [];
            for (var i = 1; i < 55; i++) {
                idList.push(i);
            }
            idList = _.sample(idList, 54);

            var backgroundIdList = [];
            for (var i = 1; i < 55; i++) {
                backgroundIdList.push(i);
            }
            backgroundIdList = _.sample(backgroundIdList, 54);
            var self = this;

            console.log(114)

            self.DataSource = ko.observableArray([]);
            self.DataSourceStake = ko.observableArray([]);
            console.log(136, window.G_DataSource)
            console.log(137, window.G_DataSourceStake)


            self.Claim = async function () {
                console.log('claim')
                if ($('#g_rewards').val() == '0') {
                    layer.msg('No rewards can be claimed.')
                    return;
                }
                const receipt = await treasureContract.claimAllInterest().sendTransaction({
                    from: (await conflux.request({ method: "cfx_accounts" }))[0]
                }).confirmed();
                layer.msg('Claim successfully!')
                location.href = location.href;
            }

            self.Unstake = async function () {
                console.log('unstake')
                if ($('#unstakeAmount').val() == '0' || $('#unstakeAmount').val() == '') {
                    layer.msg('No staked CFX can be unstaked.')
                    return;
                }
                var vote = $('#unstakeAmount').val();

                const receipt = await treasureContract.decreaseStake((vote / 1000).toString(10)).sendTransaction({
 
storageLimit:896,

                    from: (await conflux.request({ method: "cfx_accounts" }))[0]
                }).confirmed();
                layer.msg('Claim successfully!')
                console.log('receipt', receipt)
                location.href = location.href;


            }

            self.Withdraw = async function () {
                console.log('unstake')

                var vote = (await treasureContract.userSummary((await conflux.request({ method: "cfx_accounts" }))[0]))[3];
                const receipt = await treasureContract.withdrawStake((vote).toString(10)).sendTransaction({
 
storageLimit:896,

                    from: (await conflux.request({ method: "cfx_accounts" }))[0]
                }).confirmed();
                layer.msg('Withdraw successfully!')
                console.log('receipt', receipt)
                location.href = location.href;


            }


            self.Connect = async function () {
                try {
                    layer.msg('?????Conflux Portal??')
                    openPortal()

                } catch (err) {
                    console.log(err)
                }
            }
console.log(19823)
            self.Try = async function () {


                //  console.log(129,reward.toString()/Math.pow(10,18).toString(10) )

                if (conflux && (await conflux.request({ method: "cfx_accounts" }))[0] == null) {
                    try {
                        layer.msg('?????Conflux Portal??')
                        openPortal()

                    } catch (err) {
                        console.log(err)
                    }
                    return;
                }

                window.lock = true;
                console.log('begin', 147)

                var vote = $('#balance').val();

                const receipt = await treasureContract.increaseStake((vote / 1000).toString(10)).sendTransaction({

 
 
                    value: ((vote / 1000).toString(10) * Math.pow(10, 18)).toString(10) + "000",
                    from: (await conflux.request({ method: "cfx_accounts" }))[0]
                }).confirmed();
                console.log('receipt', receipt)
                location.href = location.href;

                return;

                $('#btnTry').prop('disabled', 'disabled')
                var minnerInfo = $('#minnerReward').text();
                var winnerInfo = $('#winnerReward').text();

                var _playerCount = await treasureContract._playerCount();
                var _bid = await treasureContract.BID_LIST(_playerCount[0] == undefined ? 1 : _playerCount[0] + 1);

                var ticketAmountValue = _bid[0] / 1000 * Math.pow(10, 18);

                var url = new URL(location.href);
                var referrer = url.searchParams.get("invite");
                if (!referrer) {
                    referrer = '0x0000000000000000000000000000000000000000'
                }


                try {
                    layer.open({
                        type: 1,
                        skin: 'layui-layer-rim', //????
                        area: ['420px', '240px'], //??
                        content: '<div class="row"><div class="col-12 text-center" ><img src="./layer/theme/default/loading-0.gif" /></div><div class="col-12 text-center" > <h4> ????????????????????????????</h4></div></div>'
                    });
                    referrer = referrer.length > 0 ? referrer : '0x0000000000000000000000000000000000000000';
                    try {

                    } catch (err) {
                        layer.closeAll();

                        layer.msg('???????????????' + err.message, { time: 20000 })
                        $('#btnTry').prop('disabled', '')
                        return;
                    }



                    layer.closeAll();




                    window.lock = false;
                } catch (err) {
                    window.lock = false;
                    layer.alert(err.message);
                    $('#btnTry').prop('disabled', '')

                }



            }



        }

        let VM = new AppViewModel();
        window._VM = VM;
        ko.applyBindings(VM);

    }

    getOpendCard();

    $('#Copy').click(() => {
        copyToClipboard(document.getElementById("inviteLink"));
        layer.msg('???');
    });
    function copyToClipboard(elem) {
        // create hidden text element, if it doesn't already exist
        var targetId = "_hiddenCopyText_";
        var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
        var origSelectionStart, origSelectionEnd;
        if (isInput) {
            // can just use the original source element for the selection and copy
            target = elem;
            origSelectionStart = elem.selectionStart;
            origSelectionEnd = elem.selectionEnd;
        } else {
            // must use a temporary form element for the selection and copy
            target = document.getElementById(targetId);
            if (!target) {
                var target = document.createElement("textarea");
                target.style.position = "absolute";
                target.style.left = "-9999px";
                target.style.top = "0";
                target.id = targetId;
                document.body.appendChild(target);
            }
            target.textContent = elem.textContent;
        }
        // select the content
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);

        // copy the selection
        var succeed;
        try {
            succeed = document.execCommand("copy");
        } catch (e) {
            succeed = false;
        }
        // restore original focus
        if (currentFocus && typeof currentFocus.focus === "function") {
            currentFocus.focus();
        }

        if (isInput) {
            // restore prior selection
            elem.setSelectionRange(origSelectionStart, origSelectionEnd);
        } else {
            // clear temporary content
            target.textContent = "";
        }
        return succeed;
    }










    /////////////////////////OOOOOOOOOOOOOOO


})

//??????
function checkPortal() {

    conflux == undefined ? window.conflux : conflux;
    if (typeof conflux == undefined) {
        return false;
    } else {
        return true;
    }
}
// setInterval(() => {
//     if (conflux && conflux.request({method: "cfx_accounts"})) {
//         var myInviteLink = 'http://endisend.gitee.io/cfxtodamoon/' + '?invite=' + conflux.request({method: "cfx_accounts"});
//         $.post('https://www.bejson.com/Bejson/Api/ShortUrl/getShortUrl', { url: myInviteLink }, function (ret) {
//             if (ret.data != undefined) {
//                 myInviteLink = ret.data.short_url;
//             }

//             $('#inviteLink').val('????' + conflux.request({method: "cfx_accounts"}).substr(conflux.request({method: "cfx_accounts"}).length - 4) + '??????????????1CFX???????615CFX,????????' + myInviteLink);
//         });
//     } else {
//     }
// }, 10000);

async function publicInfo() {
    var treasureContract = confluxJS.Contract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
    });
    var poolSummary = (await treasureContract.poolSummary())

    var totalLocked = parseInt(poolSummary[0].toString() * 1000).toLocaleString();
    var totalRevenue = ((poolSummary[2] - poolSummary[1]).toString() / Math.pow(10, 18)).toFixed(2);
    var g_pool_revenue = ((poolSummary[1]).toString() / Math.pow(10, 18)).toFixed(2);
    var apy = ((await treasureContract.poolAPY()).toString() / 100).toFixed(2) + '%';
    //a
    $('#g_total_locked').html(totalLocked)
    //b
    $('#g_total_revenue').html(totalRevenue)
    //c
    $('#g_apy').html(apy)
    $('#g_pool_revenue').html(g_pool_revenue)
}

function getAirdropList() {



    Date.prototype.addDays = function (days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    window.list = [];

    var beginDate = new Date('2022-02-20');

    for (var i = 0; i < 1000; i++) {

        var beginDateStr = Number(beginDate) / 1000;

        var endDate = new Date(beginDate)
        endDate = endDate.addDays(2)

        var endDateStr = Number(endDate) / 1000;
        var url = `https://confluxscan.io/v1/transfer?accountAddress=cfx%3Aaccpx9uxky39pg1hzav757vdej95w1kbcp13d0hvm7&limit=100&maxTimestamp=${endDateStr}&minTimestamp=${beginDateStr}&reverse=true&skip=0&tab=transfers-CFX&to=cfx%3Aaccpx9uxky39pg1hzav757vdej95w1kbcp13d0hvm7&transferType=CFX`
        console.log(beginDateStr, endDateStr)
        $.get(url, (a) => {
            if (a.total != null && a.total > 0) {
                console.log(beginDate, endDate, a, url);

                window.list = _.union(window.list, a.list.map(x => x.from))

            }
        })

        beginDate = endDate
    }

    window.list = _.uniq(window.list)





    // https://confluxscan.io/v1/transaction?accountAddress=cfx:accpx9uxky39pg1hzav757vdej95w1kbcp13d0hvm7&limit=100&skip=0&tab=transaction
    // var CFX_POS_ADDRESS = 'cfx:accpx9uxky39pg1hzav757vdej95w1kbcp13d0hvm7'
    // var total=0;

    // $.get( 'https://confluxscan.io/v1/transaction?accountAddress='+CFX_POS_ADDRESS+'&limit=100&skip=0&tab=transaction' ,
    // (a) => {
    //     total=a.total;
    //     window.list = [];
    //     for (var i = 0; i < parseInt(total/100)+1; i++) {

    //         $.get(`https://confluxscan.io/v1/transaction?accountAddress=${CFX_POS_ADDRESS}&limit=100&skip=${100 * i}&tab=transaction`, (a) => {
    //             window.list = _.union(window.list, (_.filter(a.list, (x) => { return x.method.indexOf('increaseStake') > -1; })).map(x => x.from))
    //         })
    //     }
    //     window.list = _.uniq(window.list)
    //     console.log('list',list)
    // }
    // );

    // $.ajax({
    //     dataType: "jsonp",
    //     async: false,
    //     type: "get",
    //     url: 'https://confluxscan.io/v1/transaction?accountAddress='+CFX_POS_ADDRESS+'&limit=100&skip=0&tab=transaction',
    //     data: {

    //     },
    //     success: (a) => {
    //         total=a.total;
    //         window.list = [];
    //         for (var i = 0; i < parseInt(total/100)+1; i++) {

    //             $.get(`https://confluxscan.io/v1/transaction?accountAddress=${CFX_POS_ADDRESS}&limit=100&skip=${100 * i}&tab=transaction`, (a) => {
    //                 window.list = _.union(window.list, (_.filter(a.list, (x) => { return x.method.indexOf('increaseStake') > -1; })).map(x => x.from))
    //             })
    //         }
    //         window.list = _.uniq(window.list)
    //         console.log('list',list)
    //     }
    // });



}
window.sum = 0;

async function airdrop() {
    if (list.length > 0) {
        var html = '';
        for (let index = 0; index < list.length; index++) {
            const element = list[index];
            var vote = (await treasureContract.userSummary(element))[1].toString()
            html += `${element} , ${parseInt(vote)}\n`
            sum += parseInt(vote);
        }
        $('body').html(`<pre>${html}</pre>${sum}`)
    }
}

async function claimList() {
    if (list.length > 0) {
        var html = '';
        for (let index = 0; index < list.length; index++) {
            const element = list[index];
            var vote = (await treasureContract.userSummary(element))[4].toString()

            html += `${element},${parseInt(vote / Math.pow(10, 18))}\n`;
        }
        $('body').html(`<pre>${html}</pre>`)
    }
}

var url = new URL(location.href);
var action = url.searchParams.get("action");
if (action == 'claim') {
    getAirdropList();
    setTimeout(function () {
        claimList()
    }, 20000)
} else if (action == 'stake') {
    getAirdropList();
    setTimeout(function () {
        airdrop()
    }, 20000)
}
//getAirdropList()


//??????
async function openPortal() {


    publicInfo()
    if (checkPortal()) {
        accounts = accounts != undefined ? accounts : await conflux.request({ method: "cfx_requestAccounts" });
        if ((await conflux.request({ method: "cfx_accounts" }))[0] == null) {
            await conflux.request({ method: "cfx_requestAccounts" });
        }
        var _address = (await conflux.request({ method: "cfx_accounts" }))[0];

        var balance = (await confluxJS.getBalance(_address)).toString() / Math.pow(10, 18);






        $('#spanBalance').html(balance.toFixed(2))
        $('#balance').val(Math.floor(balance / 1000) * 1000)

        var reward = (await treasureContract.userInterest((await conflux.request({ method: "cfx_accounts" }))[0])).toString(10) / Math.pow(10, 18).toString(10);
        var vote = (await treasureContract.userSummary((await conflux.request({ method: "cfx_accounts" }))[0]))[1];
        var locked = (await treasureContract.userSummary((await conflux.request({ method: "cfx_accounts" }))[0]))[2];
        $('#g_staked').html(vote * 1000)
        $('#g_locked').html(locked * 1000 + '  CFX  can be unstaked')
        $('#g_rewards').html(reward.toFixed(2))



        $('#walletAddressText').text(_address.substring(0, 6) + "..." + (_address.substring(36, 50)));

        //active que
        var outQueues = (await treasureContract.userOutQueue((await conflux.request({ method: "cfx_accounts" }))[0]));
        var outQueuesStake = (await treasureContract.userInQueue((await conflux.request({ method: "cfx_accounts" }))[0]));
        window.G_DataSource = [];
        window.G_DataSourceStake = [];
        for (let index = 0; index < outQueues.length; index++) {
            const element = outQueues[index];
            var _queueCFX = element[0].toString(10) * 1000;
            var _queueTime = element[1].toString(10);
            var currentBlockNumber = (await confluxJS.getStatus()).blockNumber;
            //var currentBlockNumber = parseInt((await confluxJS.getBlockByEpochNumber(await confluxJS.getEpochNumber())).blockNumber, 16)
            var _timespan = getDateByBlockInterval(
                _queueTime,
                currentBlockNumber,
            ).toLocaleString()

            G_DataSource.push({ cfx: _queueCFX, time: 'You can withdraw at  ' + _timespan })
            console.log(398, 'que', _queueCFX, _queueTime, _timespan, 'a', _queueTime, 'b', currentBlockNumber)
        }
       
        for (let index = 0; index < outQueuesStake.length; index++) {
            const element = outQueuesStake[index];
           
            var _queueCFX = element[0].toString(10) * 1000;
            var _queueTime = element[1].toString(10);
            
            var currentBlockNumber = (await confluxJS.getStatus()).blockNumber;
            //var currentBlockNumber = parseInt((await confluxJS.getBlockByEpochNumber(await confluxJS.getEpochNumber())).blockNumber, 16)
            var _timespan = getDateByBlockInterval(
                _queueTime,
                currentBlockNumber,
            ).toLocaleString()
            console.log(627,{ cfx: _queueCFX, time: 'You can withdraw at ' + _timespan })
            G_DataSourceStake.push({ cfx: _queueCFX, time: 'End time ' + _timespan })
        }
        _VM.DataSource(G_DataSource)
        _VM.DataSourceStake(G_DataSourceStake)






        var port = window.location.port;

        // var domain = port == '' ? window.location.href.split(':')[0] + '://' + document.domain : window.location.href.split(':')[0] + '://' + document.domain + ':' + port;

        // var referrerAddress = await treasureContract.getReferrer(conflux.request({method: "cfx_accounts"}));
        // $("#referrer").text(getFomatAddressTxt(referrerAddress));

        // var BASE_INVEST_AMOUNT = await treasureContract.BASE_INVEST_AMOUNT();
        // BASE_INVEST_AMOUNT = (parseInt(BASE_INVEST_AMOUNT) / Math.pow(10, 18));
        // $("#BASE_INVEST_AMOUNT").text(BASE_INVEST_AMOUNT + 'FC');

        // var BASE_NUM = await treasureContract.BASE_NUM();
        // $("#BASE_NUM").text(BASE_NUM + '?');

        // var BASE_AMOUNT_STEP = await treasureContract.BASE_AMOUNT_STEP();
        // BASE_AMOUNT_STEP = (parseInt(BASE_AMOUNT_STEP) / Math.pow(10, 18));
        // $("#BASE_AMOUNT_STEP").text(BASE_AMOUNT_STEP + 'FC');


        // var TIME_STEP = await treasureContract.TIME_STEP();
        // $("#TIME_STEP").text(parseInt(TIME_STEP / 60) + '??');


        // var SPONSOR_LIMIT_NUM = await treasureContract.SPONSOR_LIMIT_NUM();
        // $("#SPONSOR_LIMIT_NUM").text(SPONSOR_LIMIT_NUM + '?');


        // var SPONSOR_TICKET_AMOUNT = await treasureContract.SPONSOR_TICKET_AMOUNT();
        // SPONSOR_TICKET_AMOUNT = (parseInt(SPONSOR_TICKET_AMOUNT) / Math.pow(10, 18));
        // $("#SPONSOR_TICKET_AMOUNT").text(SPONSOR_TICKET_AMOUNT + 'FC');


        // var LIMIT_AMOUNT = await treasureContract.LIMIT_AMOUNT();
        // LIMIT_AMOUNT = (parseInt(LIMIT_AMOUNT) / Math.pow(10, 18));
        // $("#LIMIT_AMOUNT").text(LIMIT_AMOUNT + 'FC');


    } else {

        layer.msg('????????');

    }

}
//????
async function showIntervalTime() {

    var intervalTime = $('#intervalTime').attr('data-time');
    var timeStep = $('#intervalTime').attr('time-step');

    if (intervalTime == "0")
        return;

    var NowTime = new Date();
    var t = NowTime.getTime() - parseInt(intervalTime) * 1000;

    t = parseInt(timeStep) * 1000 - t;

    var h = Math.floor(t / 1000 / 60 / 60 % 24);
    h = h < 0 ? '00' : h.toString();
    var m = Math.floor(t / 1000 / 60 % 60).toString();
    m = m < 0 ? '00' : m.toString();
    var s = Math.floor(t / 1000 % 60).toString();
    s = s < 0 ? '00' : s.toString();

    $('#intervalTime').text((h.length == 1 ? '0' + h : h) + ":" + (m.length == 1 ? '0' + m : m) + ":" + (s.length == 1 ? '0' + s : s));

}



//??????
async function queryCapitalInfo() {

    if (checkPortal()) {


        if (window.lock) {
            return;
        }

        //****************** */
        var _playerCount = await treasureContract._playerCount();
        if (_playerCount[0] == undefined) {
            _playerCount[0] = 0;
        }
        var _bid = (await treasureContract.BID_LIST(_playerCount[0] + 1))[0];
        // var _times = (await treasureContract._times(_playerCount[0] +1));
        var winnerReward = 0;
        var minnerReward = 0;

        // if (_times[0].length == 0) {
        //     winnerReward = 3.6;
        //     minnerReward = 0;
        // } else {
        if ((await treasureContract._times(_playerCount[0]))[9][0] == undefined) {

            minnerReward = 0;
        } else {

        }
        var poolFund = (await treasureContract.poolFund())[0] * 100;
        if (isNaN(poolFund)) {
            poolFund = 0;
        }
        minnerReward = ((await treasureContract.BID_SUM_LIST(54))[0] + poolFund) * 0.9 / 2 / 53 / 1000;
        // winnerReward =   ((await treasureContract.BID_SUM_LIST(54))[0]+poolFund) *0.9*0.4  / 1000;

        winnerReward = ((await treasureContract.BID_SUM_LIST(_playerCount[0] + 1))[0] + poolFund) * 0.9 * 0.4 / 1000;
        // minnerReward = (await treasureContract._times(_playerCount[0]  ))[9][0] / 1000;
        // }
        // console.log('playcount',_playerCount[0],'**');

        // console.log('bid',_bid[0],'**');
        // console.log('_times',_times,'**');

        $('#bidNumber').text(fixed(_bid / 1000) + ' CFX');
        $('#probability').text(fixed(1 / (54 - _playerCount[0]) * 100) + '%');
        $('#minnerReward').text(fixed(minnerReward) + ' CFX');
        $('#winnerReward').text(fixed(winnerReward) + ' CFX');

        // currentBalanceAmount = (parseInt(currentBalanceAmount) / Math.pow(10, 18));
        // $('#currentBalanceAmount').text(currentBalanceAmount);


        // //????
        // var intervalTime = await treasureContract.getCurrentTime();
        // $('#intervalTime').attr('data-time', intervalTime);


        // //???
        // var totalAmount = await treasureContract.getTotalAmount();
        // totalAmount = (parseInt(totalAmount) / Math.pow(10, 18));
        // $('#totalAmount').text(totalAmount);


        // //?????
        // var roundsNum = await treasureContract.getRounds();
        // $('#roundsNum').text(roundsNum);

        // //?????
        // var currentAddress = await treasureContract.getCurrentAddress();
        // $('#currentAddress').text(getFomatAddressTxt(currentAddress));

        // //??????
        // var currentTime = await treasureContract.getCurrentTime();
        // $('#currentTime').text(formatDate(currentTime * 1000));

        // //?????
        // var lastwinner = await treasureContract.getLastwinner();
        // $('#lastwinner').text(getFomatAddressTxt(lastwinner));

        // //??????
        // var lastTime = await treasureContract.getLastTime();
        // $('#lastTime').text(formatDate(lastTime * 1000));

        // //??????
        // var lastAmount = await treasureContract.getLastAmount();
        // lastAmount = (parseInt(lastAmount) / Math.pow(10, 18));
        // $('#lastAmount').text(lastAmount);

        // //?????????
        // var lastSponsorAmount = await treasureContract.getLastSponsorAmount();
        // lastSponsorAmount = (parseInt(lastSponsorAmount) / Math.pow(10, 18));
        // $('#lastSponsorAmount').text(lastSponsorAmount);

        // //????
        // var accountAmount = await treasureContract.getAccountAmount(conflux.request({method: "cfx_accounts"}));
        // accountAmount = (parseInt(accountAmount) / Math.pow(10, 18));
        // $('#accountAmount').text(accountAmount);

        // //??
        // var bonus = await treasureContract.getBonus(conflux.request({method: "cfx_accounts"}));
        // bonus = (parseInt(bonus) / Math.pow(10, 18));
        // $('#bonus').text(bonus);

        // //?????
        // var sponsorAddress = await treasureContract.getSponsorAddress();

        // $('#sponsorAddressCount').text(sponsorAddress.length);

        // //??????????????
        // var ticketAmountValue = await treasureContract.getTicketAmount();
        // ticketAmountValue = (parseInt(ticketAmountValue) / Math.pow(10, 18));
        // $('#depositBtn').text('?? ' + ticketAmountValue + 'FC');

        // var sponsorTicketAmountValue = await treasureContract.SPONSOR_TICKET_AMOUNT();
        // sponsorTicketAmountValue = (parseInt(sponsorTicketAmountValue) / Math.pow(10, 18));
        // $('#sponsorBtn').text('?? ' + sponsorTicketAmountValue + 'FC');

        // var TIME_STEP = await treasureContract.TIME_STEP();
        // $('#intervalTime').attr('time-step', TIME_STEP);




    } else
        return;

}
//?????????
function getFomatAddressTxt(_address) {

    return _address.substring(0, 9) + "..." + (_address.substring(34, 42));
}

//???????
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return ('');
}

//???????    date:?????
function formatDate(date) {
    var date = new Date(date);
    var YY = date.getFullYear() + '-';
    var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
    var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return YY + MM + DD + " " + hh + mm + ss;
}
//??fc
async function sendTx() {

    var _playerCount = await treasureContract._playerCount();
    var _bid = await treasureContract.BID_LIST(_playerCount[0]);

    var ticketAmountValue = _bid[0] / 1000 * Math.pow(10, 18);

    // var referrer = $("#referrer").attr('data');
    var referrer = '0x0000000000000000000000000000000000000000'


    try {
        referrer = referrer.length > 0 ? referrer : '0x0000000000000000000000000000000000000000';
        const receipt = await treasureContract.play(referrer).sendTransaction({
            value: ticketAmountValue,
            from: (await conflux.request({ method: "cfx_accounts" }))[0],
            gas: 1500000,
            storageLimit: 3000,
            gasPrice: 1500000

        }).confirmed();
    } catch (err) {

        alert(err.message);

    }



}



//??fc
async function sendSponsorTX(callback) {

    var sponsorTicketAmountValue = await treasureContract.SPONSOR_TICKET_AMOUNT();

    var fcContract = confluxJS.Contract({
        abi: FC_ABI,
        address: FC_ADDRESS,
    });


    try {

        const receipt = await fcContract.transfer(CONTRACT_ADDRESS, sponsorTicketAmountValue).sendTransaction({
            from: (await conflux.request({ method: "cfx_accounts" }))[0],
            gas: 600000,
            gasPrice: 20000000
            //storageLimit: estimate.storageCollateralized
        }).confirmed();

    } catch (err) {

        alert(err.toString());

    }


}


