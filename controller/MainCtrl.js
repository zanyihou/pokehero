'use strict';

/**
 * @ngdoc function
 * @name mapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the app
 */


angular.module('app')
  .filter('to_trusted', ['$sce', function ($sce) {
	　　return function (text) {
	    　　return $sce.trustAsHtml(text);
	　　};
	}])

  .controller('MainCtrl', function($scope,$http) {

  	//变量的申明
  	$scope.curTime = 0; //时间数字
  	$scope.timeRate = 0 //时间进度
  	let limitPoint = 5;// 每个模块下注的最大金额限制
  	let rate = 1;  //筹码的倍率，默认是1
	let myStake = 1 * rate; //默认的押注是 1;
	let myStakeLeft = $(".chip-item").eq(0).offset().left//默认筹码的起始位置-x
	let curStake = "chip-2";//选中筹码的类名 
	let myStakeTop = $(".chip-item").eq(0).offset().top //默认筹码的起始位置-y
  	
  	//获取用户头像
  	console.log("xxxxxxxxxx:" + myinfo.name)
  	$scope.selfname = myinfo.name;
  	$scope.selfimg = myinfo.imgUrl;
  	$scope.selfbean = myinfo.bean;
  	// $http({
  	// 	method: "GET",
  	// 	url: "../data/user.json",
  	// }).then(function(response){
  	// 	$scope.selfname = response.data.name;
  	// 	$scope.selfimg = response.data.imgUrl;
  	// 	$scope.selfbean = response.data.bean;
  	// },function(){
  	// 	console.log("获取用户头像和昵称失败");
  	//});

  	//设置当前页面类名
    $scope.pageclass = "index-page";

    //设置下注的类型
    $scope.chipTypeArrOut = ["num-A","num-2","num-3","num-4","num-5","num-6","num-7","num-8","num-9","num-10","num-J","num-Q","num-K"];
    $scope.chipTypeArrMid = ["suit-spade","suit-hearts","suit-plum","suit-square"]
    $scope.chipTypeArrCen = ["suit-small","suit-big"]

    //规则弹窗
    $scope.hideRule = () => {
    	$(".game_rule_box").toggleClass("db");
    }

    //往期开奖
    $scope.pastLottery = () => {
		$(".panel-lottery").toggleClass("db");
		$(".past-lottery i").toggleClass("arrow-up");
	}

	//充值弹窗
	$scope.showCharge = () => {
		$(".hidebg,.get-bean-box").addClass("db");
	};

	//隐藏充值弹窗
	$scope.hideCharge = () => {
		$(".hidebg,.get-bean-box").removeClass("db");
	};

	//修改筹码
	$scope.changeChip = (event) => {
		let _self = event.target;
		$(".chip-item").removeClass("fadeUp");
		$(_self).addClass("fadeUp");
		myStakeLeft = $(_self).offset().left; //重置筹码的起始位置-x
		myStakeTop = $(_self).offset().top; //重置筹码的起始位置-y
		myStake = parseInt($(_self).attr("data-stake")*rate); //重置筹码的点数
	};

	//读取当期的下注数据;
	let totalChip = {};
	$http({
  		method: "GET",
  		url: "../data/totalChip.json",
  	}).then(function(response){
  		totalChip = response.data;
  		$scope.totalPoint = totalChip;
  	},function(){
  		console.log("获取用户下注信息失败");
  	});

	//读取我的下注数据;
	let myChip = {};
	$http({
  		method: "GET",
  		url: "../data/myChip.json",
  	}).then(function(response){
  		myChip = response.data;
  		$scope.selfPoint = myChip;
  	},function(){
  		console.log("获取用户下注信息失败");
  	});

	//下注函数
	let clickTimes = 0;//点击次数，赋值给新产生的移动筹码，方面移动和删除操作

	$scope.ct = 0;

	$scope.myClickChip = function(param,stake){
			console.log(param)
			//alert()
		    chipFun(param);
	     	//console.log(param)
     	  socket.emit("userclip",param,myStake); 
	};

	socket.on("othersClip", function(param,stake){
		console.log(param);
		
		moveChipFun(param, stake);
	})

	var moveChipFun =function(param,stake){
		console.log(stake/rate);
		var newSmallStakeEl = '<span style="position:fixed; top:'+myStakeTop+'px; left:'+myStakeLeft+'px" class="t'+clickTimes+' chip-item-small chip-'+(stake/rate)+'"></span>';
		$(".chip-list").append(newSmallStakeEl);
			
		let targetLeft = $("."+param).offset().left + $("."+param).width()/4;
		let targetTop = $("."+param).offset().top + $("."+param).height()/4;

		$(".t"+clickTimes).animate({"left":targetLeft,"top":targetTop},500,function(){
			setTimeout(function(){
				$(".chip-item-small").eq(0).remove();
			})
		})
	}
	

	var chipFun = function(param){
		let curStake = myChip[param] + myStake;
		let curTotal = totalChip[param] + myStake;
		
		let JudgeGold = judgeGoldFun(); //判断玩家金币是否足够
		let limitPoint = limitPointFun(curStake)//判断当前下注是否超出模块最大限制

		if(!JudgeGold) {
			$scope.showCharge();
			return;
		}

		if(!limitPoint){
			overLimitTsFun();
			return;
		}

		myChip[param] = curStake; //点击一次下注，更新我的下注数组;
		totalChip[param] = curTotal; //点击一次下注，更新当期总的下注数组;

		moveChipFun(param,myStake);
		

		//更新用户筹码
		$scope.selfbean = $scope.selfbean - myStake;
	}

	/*判断玩家的金币是否足够*/
	let judgeGoldFun = () => {
		//mymoney = $scope.selfbean;
		if(myStake > $scope.selfbean) //筹码大于玩家所有的金币
		{
			return false;
		}
		if(myStake <= $scope.selfbean) //筹码小于等于玩家所有的金币
		{
			return true;
		}
	}	

	//判断下注上限,玩家该点投注太多就不能投注
	let limitPointFun = (points) => {
		if(points > limitPoint)
		{
			return false; //我的当前点数大于最大限制点数，就不能投注
		}
		if(points <= limitPoint)
		{
			return true; //我的当前小于等于最大限制点数，就能投注
		}
	}

	/*新一期将开始提示*/
	let newOneTsFun = () => {
		$(".ts").text("新一期即将开始，请去投注");
		$(".ts").addClass("db");
		setTimeout(function(){
			$(".ts").removeClass("db");			
		},1000)
	}
	
	/*投注结束，准备开奖提示*/
	let clipEndTsFun = () => {
		$(".ts").text("即将揭晓开奖结果，请耐心等待");
		$(".ts").addClass("db");
		setTimeout(function(){
			$(".ts").removeClass("db");			
		},1000)
	}

	/*超出每个模块的最大投注限额*/
	let overLimitTsFun = () => {
		$(".ts").text("单个模块最大投注不能超过"+limitPoint);
		$(".ts").addClass("db");
		setTimeout(function(){
			$(".ts").removeClass("db");			
		},2000)
	}

	//读取游戏规则
	$http({
  		method: "GET",
  		url: "../data/rule.txt",
  	}).then(function(response){
  		$scope.rule = response.data
  	},function(){
  		console.log("获取用户头像和昵称失败")
  	});

  	
		
  });
