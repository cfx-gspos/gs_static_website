PoS one click is a web application target general user without code experience to run his/her PoS pool in an easy way.
# **Introduce**
PoS one click use docker technology to build it, which contains 3 parts.

1. Node part, this part use bash script to run a Conflux PoS node
1. PosPool website and contract, in this part, it provide a stake website which allow user to stake their CFX token, and an automatically script to deploy the website, contract and verify the contract.

![descript](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.001.png)

3. Admin website, a .net core web application, which only allow admin to login,  admin can login to monitor the pool status, adjust pool name/performance fee, withdraw profit, it also allow admin to upgrade node and contract by just click a few buttons.

![descript](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.002.png)
# **Prerequisite**
1. You need to buy a cloud server such as Azure/Aliyun/AWS, we recommend you to buy Aliyun because we have run it for more than half years and it works quite well. here is the conguration


|CPU|4 Core|
| :- | :- |
|Memory|16 G |
|Disk(System)|20 G |
|Disk(Data)|1000 G mount to directory /mnt|
|OS|Ubuntu 20|

1. Prepare a Conflux account to manage the PoS pool, this addressshould keep at least 1100 CFX in Core space , 10CFX in eSPace

# **Setup**
Here is the Video <https://www.bilibili.com/video/BV1wG4y1H76n/>

Generallly speaking, we need to get following server, following step 1&2 is the practice from aliyun ECS,  you can also build your own server in other platform such as Aure,AWS,Goolge cloud.

## **1. Buy server**
Open link [https://ecs-buy.aliyun.com/wizard#/prepay/cn-zhangjiakou](https://ecs-buy.aliyun.com/wizard%23/prepay/cn-zhangjiakou)

Under tab page: Basic Configurations.

Choose  Launch Billing Method 

Choose Play-as-you-go 

![](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.003.png)



Choose Region Zhangjiakou

For instance type, choose a 16G Ram

![](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.004.png)

Image choose Ubuntu 20

System disk choose 20GB

![](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.005.png)


In tab Networking, use default value, click Next 

![](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.006.png)

In tab System Configuration, click Password and type the Logon Password.

![](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.007.png)

In tab page Grouping(Optional), use the default value, click Next

In tab page Preview, click Create Instance 

You will be redirected to Instance page 

![](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.008.png)



## **2. Add data disk, partion and format it**
In aliyun console,  click Disk,then Create Disk

![](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.009.png)

Attach to ECS instance, and create a 1000G disk.

![](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.010.png)

After disk was created, choose Partition and Format.

![](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.011.png)

Type size 999GB and mount to Point /mnt then click OK

![](images/Aspose.Words.7d6ad31b-dd65-4abd-9b53-a9ac8851a6b1.012.png)

## **3. Login server and Install Conflux PoS System**
Step 1. Run cmd $ 
```bash
/bin/bash -c "$(curl -s https://gspos.club/start.sh)" >> /mnt/InstallPoSOneClickLog.txt  2>&1
``` 

Step 2. After about 1 minute, you are required to input 4 parameters as requested.

**How to Access Service**

You can access the stake website by using url http://{ip}, access the admin website by using url http://{ip}:5000.

In admin website, you can view the node running staus such as syncing,normal , stopped.
# **Exception**

|**Exception**|**Solution**|
| :- | :- |
|<p>The node is stopped</p><p></p>|<p>You can click start button to start the node</p><p></p>|

# **FAQ**
1. Q: I dont know Linux command, can I run a PoS pool?

A: Yes, if you follow the 10 miniutes video step by step, you can create your own PoS pool smoothly.

2. Q: Can I build a PoS pool use my own PC?

A: We strongly recommend you to use cloud server, you physical device is easy to be broken by network or hardware issue.

3. Q: How to transfer CFX to eSpace?

A: Please use this website to transfer your CFX from Core to eSpace. https://confluxhub.io/espace-bridge/cross-space

