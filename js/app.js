'use strict';

/*初始化fastclick函数*/
FastClick.attach(document.body);
  	 		//游戏对象
		var Game = function(){
			this.time = 30; //游戏总的时间
			this.state = 0; //游戏的状态，0表示可买状态，1表示不可买状态
			this.curTime = 0; //游戏当前的时间
		}

		var mygame = {};//全局的游戏变量
		var myname = "";
		var myinfo = {};
		var socket = io.connect('http://localhost:8081');
		socket.on('connect',function(){
			socket.emit("connectGame");
			console.log("connect sussccess");
		});
		socket.on("userinfo",function(userdata){
			myinfo = JSON.parse(userdata);;
			console.log(myinfo)
		})
		socket.on('sendmyname',function(data){
			myname = data;
		})
		socket.on('showOthers',function(users){
			
			
			for(let i = 0,j = 0; i < users.length; i++){
				if(users[i] == myname){
					console.log("----" + users[i])
					continue;
				}else{
					$(".party-item").eq(j).find("p").text(users[i]);
					j++;
					if(j==2){ j=3 };
					if(j>5) {break;}
					console.log("显示其他玩家");
				}
			}
			
		});

	    function init(){	
				console.log("game init")
				//totalPointArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //总的投注数组清空
				//mypointArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //我的投注数组清空
				//playGoldBool = false ;//玩家的金币是否足够投注
				//playGoldLimitBool = false ;//玩家的当前点数是否超过可以投注的最大值
			 	//clickTimes = 0 //点击次数归0
			 	//gameBegin = true; //新一轮开始
			 	shuffleTimes = 0; //洗牌次数归0
			 	//wingold = 0 //我赢得的金币数量清0
			 	//myStakeTotal = 0; //我的上期投注总数清0
				socket.emit("connectGame");
		}



		
		socket.on('getinfo',function(startTime, flag, serveTime){
				    console.log(3)
					//客户端连上之后就创建游戏
					mygame =  new Game();
					console.log(serveTime + "/" + startTime + "/" + (serveTime - startTime))
					mygame.curTime = mygame.time - getSec(serveTime,startTime);

					var gametime = getSec(serveTime,startTime);//游戏进行的时间（小于50）；
					if(gametime<30){
						mygame.state = 0;
					}
					else if(gametime <= 40){
						mygame.state = 1;
					}
					else if(gametime <= 50){
						mygame.state = 2;
					}
					else {
						socket.emit("connectGame");
					}



					console.log(mygame.curTime);
					//mygame.curTime = mygame.time - 14;
					console.log(mygame.curTime)
					//mygame.state = flag; //当期游戏的状态
					switch (mygame.state){
						case 0:
							mygame.showTime();
							break;
						case 1:
							onCard(); //上牌
							console.log("oncard");
							break;
						case 2:
							chooseCard(); //抽牌
							break;
						case 3:
							//chooseCard(); //抽牌
							break;				
							
					}
				});


		/*通过时间戳计算秒数*/
		let getSec = (end, start) => {
			let sec = parseInt((end - start)/1000);
			return sec;
		}

		Game.prototype = {
			

			showTime: function(){
				let that = this;
				setTimeout(function(){
			   	 	that.curTime--;
			   	 	//console.log("zzzz " + that.curTime)
			   	 	$(".time span").text(that.curTime);
			   	 	var timeRate = that.curTime/that.time * 100 + "%";
			   	 	$(".progress-bar span").css("width",timeRate);
			   	 	if(that.curTime==0)
			   	 	{
			   	 		//console.log("投注结束");
			   	 		endClip();//投注结束
			   	 		//gameBegin = false ;
			   	 	}else{
			   	 		that.showTime();
			   	 	}
			   	 	
			   	 },1000)
			}	
		}; 


		/*投注结束函数*/
		function endClip(){
			clipEndTsFun() //投注结束准备开奖提示
			setTimeout(function(){
				$(".ts").removeClass("db");
				onCard() //上牌
			},1000)
		}

		var pokerResultTxt = '<div class="pokerResult">'+
				'<div class="pokerResultShow">'+
					'<div class="pokerResultBox">'+
						'<span class="result-item">开</span>'+
						'<span class="result-item">奖</span>'+
						'<span class="result-item">中</span>'+
						'<span class="result-item none">*</span>'+
						'<span class="result-item none"><i class="icon-result-suit"></i></span>'+
						'<span class="result-item none">*</span>'+
					'</div>'+
				'</div>'+
				'<div id="container" class="cardDown">'+
						'<div class="deck">'+
							'<div class="card spade1"><div class="face back"></div></div>'+
							'<div class="card spade2"><div class="face back"></div></div>'+
							'<div class="card spade3"><div class="face back"></div></div>'+
							'<div class="card spade4"><div class="face back"></div></div>'+
							'<div class="card spade5"><div class="face back"></div></div>'+
							'<div class="card spade6"><div class="face back"></div></div>'+
							'<div class="card spade7"><div class="face back"></div></div>'+
							'<div class="card spade8"><div class="face back"></div></div>'+
							'<div class="card spade9"><div class="face back"></div></div>'+
							'<div class="card spade10"><div class="face back"></div></div>'+
							'<div class="card spade11"><div class="face back"></div></div>'+
							'<div class="card spade12"><div class="face back"></div></div>'+
							'<div class="card spade13"><div class="face back"></div></div>'+
							'<div class="card hearts1"><div class="face back"></div></div>'+
							'<div class="card hearts2"><div class="face back"></div></div>'+
							'<div class="card hearts3"><div class="face back"></div></div>'+
							'<div class="card hearts4"><div class="face back"></div></div>'+
							'<div class="card hearts5"><div class="face back"></div></div>'+
							'<div class="card hearts6"><div class="face back"></div></div>'+
							'<div class="card hearts7"><div class="face back"></div></div>'+	
						'</div>'+
				'</div>'+
			'</div>';
	
	/*随机牌的顺序*/
	var cardIndexArr = [
							"z-index: 0; transform: translate3d(0px, 0px, 0px)",
							"z-index: 1; transform: translate3d(-0.25px, -0.25px, 0px)",
							"z-index: 2; transform: translate3d(-0.5px, -0.5px, 0px)",
							"z-index: 3; transform: translate3d(-0.75px, -0.75px, 0px)",
							"z-index: 4; transform: translate3d(-1px, -1px, 0px)",
							"z-index: 5; transform: translate3d(-1.25px, -1.25px, 0px)",
							"z-index: 6; transform: translate3d(-1.5px, -1.5px, 0px)",
							"z-index: 7; transform: translate3d(-1.75px, -1.75px, 0px)",
							"z-index: 8; transform: translate3d(-2px, -2px, 0px)",
							"z-index: 9; transform: translate3d(-2.25px, -2.25px, 0px)",
							"z-index: 10; transform: translate3d(-2.5px, -2.5px, 0px)",
							"z-index: 11; transform: translate3d(-2.75px, -2.75px, 0px)",
							"z-index: 12; transform: translate3d(-3px, -3px, 0px)",
							"z-index: 13; transform: translate3d(-3.25px, -3.25px, 0px)",
							"z-index: 14; transform: translate3d(-3.5px, -3.5px, 0px)",
							"z-index: 15; transform: translate3d(-3.75px, -3.75px, 0px)",
							"z-index: 16; transform: translate3d(-4px, -4px, 0px)",
							"z-index: 17; transform: translate3d(-4.25px, -4.25px, 0px)",
							"z-index: 18; transform: translate3d(-4.5px, -4.5px, 0px)",
							"z-index: 19; transform: translate3d(-4.75px, -4.75px, 0px)",	
					   ];
	 
	/*上牌*/ 
	var initArr = [];
	function onCard(){
			$(document.body).append(pokerResultTxt);
			initArr = cardIndexArr.sort(function(){
				return Math.random()*1-0.5;
			});
			for(var i=0; i<$(".card").length; i++)
			{
				$(".card").eq(i).attr("style",initArr[i])	
			}
			setTimeout(function(){
				shuffle();
			},1000)
	};

	
	/*洗牌*/	
	var shuffleTimes = 0;
	function shuffle(){
		var cardNum = $(".card").length;
		var cardArr = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
		var oldAddr = [];
		cardArr.sort(function(){
			return Math.random()*1-0.5;
		})
		
		/*随机抽取其中10张牌*/
		for(var i=0; i<15; i++)
		{
			var transX = (Math.random()*2 -1)*80+"%" ;
			oldAddr.push($(".card").eq(cardArr[i]).css("transform"));
			 
			$(".card").eq(cardArr[i]).attr("style","transform: translateX("+transX+"); transition: all .15s cubic-bezier(0.645, 0.045, 0.355, 1) 0.024s;");
		}
		/*随机出要插入的位置*/
		for(var i=0;i<20;i++)
		{
			$(".card").eq(i).css("z-index",cardArr[i]);
		}

		/*按照上面的位置插入牌*/
		setTimeout(function(){
			for(var i=0; i<15; i++)
			{
				$(".card").eq(cardArr[i]).attr("style","transform: "+oldAddr[i]+";transition: all .15s cubic-bezier(0.645, 0.045, 0.355, 1) 0.024s;");
			}
			/*洗牌完毕，整理牌*/
			setTimeout(function(){
				for(var i=0; i<$(".card").length; i++)
				{
					$(".card").eq(i).attr("style",initArr[i])	
				}
			},200)

			
		},300);
		
		/*洗牌次数+1*/
		shuffleTimes++;
		
		/*洗牌10次*/
		if(shuffleTimes<8)
		{
			setTimeout(function(){
				shuffle();
			},600); 
		}
		if(shuffleTimes==8)
		{
			setTimeout(function(){
				chooseCard(); //抽出一张牌
			},800)
		}
		
	}
			
	/*抽出一张牌*/
	function chooseCard(){
		var winCard = randomCard();
		$(".card").eq(19).attr("class","card "+winCard+" fz");
		$(".card").eq(19).css("transform","translate3d(-5px,-123%,0px)");
		$(".card").eq(19).append('<div class="face zm"></div>');
		$(".card").eq(19).find(".back").addClass("fm")
		setTimeout(function(){
			$(".card").eq(19).css("transform","translate3d(-5px,-123%,0px) rotateY(180deg)");
		},1000);
		setTimeout(function(){
			$(".card").eq(19).css("transform","translate++++++++++++++++++++++++++++++++++++++3d(-5px,-5px ,0px) rotateY(180deg)");
		},2000);
		setTimeout(function(){
			$(".card").eq(19).css("transform","translate3d(-5px,-5px ,0px) rotateY(180deg) scale(2)");	
			$(".face.zm").css("width","0");
			setTimeout(function(){
				$(".face.zm").css("width","100%");
			},60);
			setTimeout(function(){
				showTableResule() //界面显示中奖情况
			},2200)
		},2400);
		setTimeout(function(){
			showWinInfo()//显示中奖的信息，数字，花色，大小
		},2000)
	}
	
	var wincardNumTxt = 0; //抽中牌的文字
	var wincardNumNum = 0; //抽中牌的对应的点数
	var wincardColorTxt = ""; //抽中牌的颜色
	var wincardColorNum = 0; //抽中牌的颜色对应的index
	var wincardBigorSmallTxt = ""; //抽中牌的对应大小中文字
	var wincardBigorSmallBool = 0; //抽中牌的对应的大小的index
	/*随机抽一张牌函数*/
	function randomCard(){
		var num = [1,2,3,4,5,6,7,8,9,10,11,12,13]; 
		var color = ["spade","hearts","plum","square"];
		var b_or_s = "";
		//排序后取第一个元素为抽到的牌信息
		num.sort(function(){
			return Math.random()*1-0.5;
		})
		
		color.sort(function(){
			return Math.random()*1-0.5;
		});
		
		wincardNumNum = num[0] //抽中牌对应的点数
		switch (wincardNumNum){ //抽中牌对应的文字
			case 1: wincardNumTxt = "A";
					 break;
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 9:
			case 10:		
					wincardNumTxt = wincardNumNum;
					break;
			case 11 : 
					wincardNumTxt = "J";
					break;	
			case 12 : 
					wincardNumTxt = "Q";
					break;	
			case 13 : 
					wincardNumTxt = "K";
					break;			
		}
		
		if(num[0]<7)
		{
			wincardBigorSmallTxt = "小";
			wincardBigorSmallBool = 0; //小
		}
		if(num[0]>7)
		{
			wincardBigorSmallTxt = "大";
			wincardBigorSmallBool = 1; //大
		}
		if(num[0]==7)
		{
			wincardBigorSmallTxt = "中";
			wincardBigorSmallBool = 2; //中
		}
		
		wincardColorTxt = color[0]; //抽中牌对应的花色
		switch (wincardColorTxt){ //抽中牌对应的文字
			case "spade": wincardColorNum = 0;
					     break;
			case "hearts": wincardColorNum = 1;
						break;
			case "plum": wincardColorNum = 2;
						break;
			case "square":	wincardColorNum	= 3;
						break;
		}
		
		var cardInfo = wincardColorTxt + wincardNumNum; //赋值得抽取的牌
		return cardInfo;//获得抽取的牌
	}
		
	/*显示中奖的牌面信息函数：显示中奖的数字，花色，大小*/
	function showWinInfo(){
		$(".result-item:lt(3)").addClass("none");
		$(".result-item:gt(2)").removeClass("none");
		$(".result-item").eq(3).html(wincardNumTxt);
		$(".result-item").eq(4).find("i").addClass("icon-"+wincardColorTxt);
		$(".result-item").eq(5).html(wincardBigorSmallTxt);
	}
	
	/*开奖后界面显示函数*/
	function showTableResule(){
		$(".pokerResult").remove();
		$(".num-item").eq(wincardNumNum-1).addClass("current");
		$(".suit-item").eq(wincardColorNum).addClass("current");
		if(wincardBigorSmallBool!=2)
		{
			$(".size-item").eq(wincardBigorSmallBool).addClass("current");
		}
		//awardFun();//计算玩家赢取的金币
		setTimeout(function(){
			/*消除主界面的中奖区域显示*/
			$(".num-item").eq(wincardNumNum-1).removeClass("current");
			$(".suit-item").eq(wincardColorNum).removeClass("current");
			$(".size-item").eq(wincardBigorSmallBool).removeClass("current");
			// if(wingold>0)
			// {
			// 	downGold();//掉金币
			// }			
			/*消除所有的投注记录*/
			$(".date-item").removeClass("db");
			
			newOneTsFun(); //新一期即将开始的提示
			init();
			
			setTimeout(function(){
				$(".ts").removeClass("db");
				
			},2000)
			
		},2000)
	}
	
	/*判断玩家的金币是否足够*/
	function judgeGold(){
		mymoney = parseFloat($(".bean").text());
		if(myStake > mymoney) //筹码大于玩家所有的金币
		{
			return false;
		}
		if(myStake <= mymoney) //筹码小于等于玩家所有的金币
		{
			return true;
		}
	}
	
	
	
	/*判断玩家该点投注太多就不能投注*/
	function  checkPoint(points,limitPoint){
		if(points > limitPoint)
		{
			return false; //我的当前点数大于最大限制点数，就不能投注
		}
		if(points <= limitPoint)
		{
			return true; //我的当前小于等于最大限制点数，就能投注
		}
	}
	
	/*投注之后更新金币*/
	function refreshGold(mygold,mystake){
		mymoney = (mygold - mystake).toFixed(2); //我的金币等于总金币-本次押注的筹码
		$(".bean").text(mymoney); //更新Dom我的金币数量
		myStakeTotal += mystake //累计计算我本次投注总金币
	}
	
	/*点击+号充值*/
	$(".icon-add").click(function(){
		showCharge()
	})
	
	/*显示充值函数*/
	function  showCharge(){
		$(".hidebg,.get-bean-box").addClass("db");
	}
	
	/*关闭充值函数*/
	function  closeCharge(){
		$(".hidebg,.get-bean-box").removeClass("db");
	}	
	
	/*充值弹窗的关闭按钮*/
	$(".panel-close").click(function(){
		closeCharge();//关闭充值弹窗
	})
  	
  	
  	/*新一期将开始提示*/
	function  newOneTsFun(){
		$(".ts").text("新一期即将开始，请去投注");
		$(".ts").addClass("db");
	}
	
	/*投注结束，准备开奖提示*/
	function clipEndTsFun(){
		$(".ts").text("即将揭晓开奖结果，请耐心等待");
		$(".ts").addClass("db");
	}
	
	/*超出每个模块的最大投注限额*/
	function overLimitTsFun(){
		$(".ts").text("单个模块最大投注不能超过"+limitClipNnum);
		$(".ts").addClass("db");
	}
 
	
	/*计算我自己的中奖情况*/
	
	// function awardFun(){
	// 	/*计算投注的点数中奖情况*/
	// 	wingold += mypointArr[wincardNumNum-1]*9;
		
	// 	/*计算投注的花色中奖情况*/
	// 	wingold += mypointArr[wincardColorNum+13]*3;
		
	// 	/*计算投注的大小中奖情况*/
	// 	wingold += (wincardBigorSmallBool==0 ? mypointArr[17]*1.7:0)+(wincardBigorSmallBool==1 ? mypointArr[18]*1.7:0)		 
		 
	// 	mymoney = (parseFloat(mymoney) + wingold).toFixed(2); //我的金币等于总金币+本次赢取的金币
		
	// 	$(".bean").text(mymoney); //更新Dom我的金币数量
	// }
	
	// /*赢了之后掉金币*/
	// function downGold(){
	// 	var newSmallStakeEl1 = '<span style="position:fixed; top:1rem; opacity:1; margin-left:-0.15rem; left:50%" class="chip-item chip-item-small chip-2"></span>';
	// 	var newSmallStakeEl2 = '<span style="position:fixed; top:1.3rem; opacity:1; margin-left:-0.15rem; left:50%" class="chip-item chip-item-small chip-10"></span>';
	// 	var newSmallStakeEl3 = '<span style="position:fixed; top:1.6rem; opacity:1;  margin-left:-0.15rem; left:50%" class="chip-item chip-item-small chip-50"></span>';
	// 	$(".chip-list").append(newSmallStakeEl1);	
	// 	$(".chip-list").append(newSmallStakeEl2);	
	// 	$(".chip-list").append(newSmallStakeEl3);	
		
	// 	$(".chip-item-small").animate({"top":"6rem"},800,function(){
	// 		$(".chip-item-small").remove();
	// 	});
	// };


angular.module("app", ['ngRoute','ngAnimate'])
.config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider){

//这是因为Angular 1.6 版本更新后
//对路由做的处理，这样才可以和以前版本一样正常使用
$locationProvider.hashPrefix('');

	$routeProvider
	.when("/", {
		templateUrl: "views/index.html",
		controller: "MainCtrl",
	})
	.when("/record", {
		templateUrl: "views/record.html",
		controller: "RecordCtrl",
	})
	.when("/detail", {
		templateUrl: "views/detail.html",
		controller: "DetailCtrl",
	})
	.otherwise({
        redirectTo: '/'
      });
}])