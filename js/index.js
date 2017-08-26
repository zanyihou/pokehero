$(function(){
	/*初始化fastclick函数*/
	FastClick.attach(document.body);	
	
	/*创建玩家构造函数*/
	function Player(name,money,face,addr){
		this.name = name; // 用户名
		this.face = face; // 头像
		this.money = money;	 //金豆
		this.addr = addr //位置
	}
	
	/*屏幕滚动*/
	$(window).scroll(function(){
		screenScrollTop = $(window).scrollTop();
	})
	
	var screenScrollTop = 0;
	var myname = '我自己'; //玩家自己的名字-全局
	var mymoney = 10000; //我的金豆
	var myface = 'img/myself.jpg'; //我的头像
	var time = 30 //游戏时间
	var timeTotal = 30 //游戏时间
	var totalPointArr = []; //总的投注数组
	var mypointArr = []; //我的投注数组
	var gameBegin = false ; //游戏是否开始
	var playGoldBool = false ;//玩家的金币是否足够投注
	var playGoldLimitBool = false ;//玩家的当前点数是否超过可以投注的最大值
	var limitClipNnum = 1000 ;//玩家每个模块下注的最大金额
	var wingold = 0 //我赢得的金币数量
	var myStakeTotal = 0 //我的投注总金币

	/*初始化函数*/
	function init(){
		time = timeTotal; //重置游戏时间	
		totalPointArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //总的投注数组清空
		mypointArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //我的投注数组清空
		playGoldBool = false ;//玩家的金币是否足够投注
		playGoldLimitBool = false ;//玩家的当前点数是否超过可以投注的最大值
	 	showtime();
	 	clickTimes = 0 //点击次数归0
	 	gameBegin = true; //新一轮开始
	 	shuffleTimes = 0; //洗牌次数归0
	 	wingold = 0 //我赢得的金币数量清0
	 	myStakeTotal = 0; //我的上期投注总数清0
	}

	/*创建游戏函数*/
	function Game(time){
		 this.time = time;
		 this.gameBegin = function(){
		 	showtime();
		 }
	}
	
	/*创建当前玩家*/
	// var myself = new Player (myname,mymoney,myface,$(".party-item").eq(2)); //创建当前玩家
	// myself.addr.find("img").attr("src",myself.face); //给DOM设置当前玩家的头像
	// myself.addr.find(".name").text(myself.name); //给Dom设置当前玩家的昵称
	// $(".bean").text(myself.money.toFixed(2)); //给Dom设置当前玩家的金币
	
	/*修改筹码*/
 //  	var rate = 1;  //筹码的倍率，默认是1
	// var myStake = 1 * rate; //默认的押注是 1;
	// var myStakeLeft = $(".chip-item").eq(0).offset().left//默认筹码的起始位置-x
	// var curStake = "chip-2";//选中筹码的类名 
	// var myStakeTop = $(".chip-item").eq(0).offset().top //默认筹码的起始位置-y


	// /*修改筹码函数*/
	// $(".chip-list").addClass("chip-list"+myStake);
	// $(".chip-item").click(function(){
	// 	$(".chip-item").removeClass("fadeUp");
	// 	$(this).addClass("fadeUp");
	// 	myStakeLeft = $(this).offset().left; //重置筹码的起始位置-x
	// 	myStakeTop = $(this).offset().top; //重置筹码的起始位置-y
	// 	myStake = parseInt($(this).attr("data-stake")*rate); //重置筹码的点数
		
	// })
	
	/*下注*/
	var clickTimes = 0; //我的点击次数
	var pointArrnum = null;//点击的那个数字
	//totalPointArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //总的投注数组
	//mypointArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];//我的投注数组
	$(".num-item,.suit-item,.size-item").click(function(){
		 
		playGoldBool = judgeGold();//玩家是否金币足够投注
		if(gameBegin && playGoldBool)
		{
		 
			clickTimes++;
			if($(this).hasClass("suit-item"))
			{
				pointArrnum = $(this).index()+13//当前点击的花色元素
			}else if($(this).hasClass("size-item"))
			{
				pointArrnum = $(this).index()+17//当前点击的大小元素
			}
			else {
				pointArrnum = $(this).index()//当前点击的数字元素
			}
			
			playGoldLimitBool = checkPoint(mypointArr[pointArrnum]+myStake,limitClipNnum) //当前投注的点数是否超过限制
			//alert(mypointArr[pointArrnum]);
			if(playGoldLimitBool)
			{				
				mypointArr[pointArrnum] += myStake;
				totalPointArr[pointArrnum] += myStake;
				 
				var clipLeft = $(this).offset().left + $(this).width()/4; //获取下注所在点的位置-x
				var clipTop = -screenScrollTop + $(this).offset().top + $(this).height()/4; // 获取下注所在点的位置-y
				move(clipLeft,clipTop,pointArrnum,myStakeTop,myStakeLeft,myStake,mypointArr,1);
						
				refreshGold(mymoney,myStake); //更新我的金币
			}else{
				overLimitTsFun();//超出单个模块的最大投注限制-弹窗
				setTimeout(function(){
					$(".ts").removeClass("db");
					
				},2000)
			}
		}
		
		else if(!gameBegin)
		{
			
		}
		else if(!playGoldBool){
			showCharge();//玩家金币不足，显示充值弹窗
		}
	})

	
		
	/*注码移动函数*/
	function move(l,t,i,ot,ol,stake,myself){		
			var newSmallStakeEl = '<span style="position:fixed; top:'+ot+'px; left:'+ol+'px" class="t'+clickTimes+' chip-item-small chip-'+(stake/rate)+'"></span>';
			$(".chip-list").append(newSmallStakeEl);
			
			$(".t"+clickTimes).animate({"left":l,"top":t},500,function(){
				setTimeout(function(){
					_$(".chip-item-small").eq(0).remove();
					
					if(i<13)
					{
						$(".num-item").eq(i).find(".date-item").eq(0).text(totalPointArr[i]);//当前点击的全部点数
						if(myself)
						{
							$(".num-item").eq(i).find(".date-item").eq(1).text(mypointArr[i]);
							$(".num-item").eq(i).find(".date-item").eq(1).addClass("db");
						}//当前点击的我的点数
						$(".num-item").eq(i).find(".date-item").eq(0).addClass("db");
					}
					else if (i<17)
					{
						$(".suit-item").eq(i-13).find(".date-item").eq(0).text(totalPointArr[i]);//当前点击的全部点数
						if(myself)
						{
							$(".suit-item").eq(i-13).find(".date-item").eq(1).text(mypointArr[i]);
							$(".suit-item").eq(i-13).find(".date-item").eq(1).addClass("db");
						}//当前点击的我的点数
						$(".suit-item").eq(i-13).find(".date-item").eq(0).addClass("db");
					}
					else{
						$(".size-item").eq(i-17).find(".date-item").eq(0).text(totalPointArr[i]);//当前点击的全部点数
						if(myself)
						{
							$(".size-item").eq(i-17).find(".date-item").eq(1).text(mypointArr[i]);
							$(".size-item").eq(i-17).find(".date-item").eq(1).addClass("db");
						}//当前点击的我的点数
						$(".size-item").eq(i-17).find(".date-item").eq(0).addClass("db");
					}
				},300);
			});
		}
	
	/*创建其他玩家*/
	var player1_name = "玩家1";
	var player2_name = "玩家2";
	var player3_name = "玩家3";
	var player4_name = "玩家4";
	var player1_face = "img/player1.jpg";
	var player2_face = "img/player2.jpg";
	var player3_face = "img/player3.jpg";
	var player4_face = "img/player4.jpg";
  
	var player1 = new Player (player1_name,0,player1_face,$(".party-item").eq(0)); //创建当前玩家
	player1.addr.find("img").attr("src",player1.face); //给DOM设置当前玩家的头像
	player1.addr.find(".name").text(player1.name); //给Dom设置当前玩家的昵称
	
	var player2 = new Player (player2_name,0,player2_face,$(".party-item").eq(1)); //创建当前玩家
	player2.addr.find("img").attr("src",player2.face); //给DOM设置当前玩家的头像
	player2.addr.find(".name").text(player2.name); //给Dom设置当前玩家的昵称
	
	var player3 = new Player (player3_name,0,player3_face,$(".party-item").eq(3)); //创建当前玩家
	player3.addr.find("img").attr("src",player3.face); //给DOM设置当前玩家的头像
	player3.addr.find(".name").text(player3.name); //给Dom设置当前玩家的昵称
	
	var player4 = new Player (player4_name,0,player4_face,$(".party-item").eq(4)); //创建当前玩家
	player4.addr.find("img").attr("src",player4.face); //给DOM设置当前玩家的头像
	player4.addr.find(".name").text(player4.name); //给Dom设置当前玩家的昵称  
  
  	/*其他四个玩家的投注函数*/
  	function playerShow()
  	{
  		/*从数据库取出其他四个玩家投注的记录*/
	  	var p1_record_arr = [[0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,100,0,200,0,0,100,200,0,0,0,0,0,0,0,0,0,0]];//玩家的投注记录
	  	var p2_record_arr = [[0,0,0,0,0,100,0,0,500,0,0,0,0,0,0,0,0,0],[0,0,500,0,0,100,200,100,0,0,500,0,0,0,0,0,0,0,0]];//玩家的投注记录
	  	var p3_record_arr = [[0,0,0,0,0,0,0,200,0,0,0,0,100,0,0,0,0,0,0],[0,0,0,0,100,0,0,200,0,0,500,0,0,0,0,0,0,0,0]];//玩家的投注记录
	  	var p4_record_arr = [[0,0,0,0,0,200,0,0,0,100,0,0,0,0,0,200,0,0,0],[0,0,100,0,100,100,0,100,0,0,500,0,0,0,100,0,0,0,0]];//玩家的投注记录
	  	var p1_clickTimes = 0;
	  	playerShowFun(p1_record_arr,0);
	  	playerShowFun(p2_record_arr,1);
	  	playerShowFun(p3_record_arr,3);
	  	playerShowFun(p4_record_arr,4);
  	}
  	
  	/*玩家投注函数*/
  	function playerShowFun(recordArr,p_index){
  			for( var j=0; j<recordArr.length; j++)
			  	{
			  		for(var i=0; i<17; i++)
			  		{
			  			totalPointArr[i]  += recordArr[j][i] ;//统计总的点数
			  			if(recordArr[j][i]==0)
			  			continue;
			  			else{
			  				clickTimes++;
			  				var p_stake = recordArr[j][i];
			  				
							if(i<13)
							{
								var target = $(".num-item").eq(i)
							}
							else if (i<17)
							{
								var target = $(".suit-item").eq(i-13)
							}
							else{
								var target = $(".size-item").eq(i-17)
							}
			
			  				var p_clip_left =  target.offset().left + target.width()/4; //获取下注目标所在点的位置-x
							var p_clip_top = target.offset().top + target.height()/4; // 获取下注目标所在点的位置-y
							var p_ot = $(".party-item").eq(p_index).offset().top; //获取下注玩家所在点的位置-x
							var p_ol = $(".party-item").eq(p_index).offset().left; //获取下注玩家所在点的位置-x
							move(p_clip_left,p_clip_top,i,p_ot,p_ol,p_stake)  				
			  			}
			  		}
			    }
  	};
  	 	
    
    /*开始游戏*/
   var game = new Game(timeTotal);
   game.gameBegin();
   timeTotal = game.time;
   
   /*时间函数*/
   function showtime(){
		   	setTimeout(function(){
		   	 	time--;
		   	 	gameBegin = true;
		   	 	$(".time span").text(time);
		   	 	var rate = time/timeTotal * 100 + "%";
		   	 	$(".progress-bar span").css("width",rate);
		   	 	if(time==0)
		   	 	{
		   	 		endClip();//投注结束
		   	 		gameBegin = false ;
		   	 	}
		   	 	else
		   	 	{
		   	 		showtime();
		   	 		if(time==22 || time==16 || time==10 || time==4){
		   	 			playerShow(); //在22,16,10,4秒这四个时间点统计玩家的数据
		   	 		}
		   	 	}
		   	 	
		   	 },1000)
	}   
	
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
		awardFun();//计算玩家赢取的金币
		setTimeout(function(){
			/*消除主界面的中奖区域显示*/
			$(".num-item").eq(wincardNumNum-1).removeClass("current");
			$(".suit-item").eq(wincardColorNum).removeClass("current");
			$(".size-item").eq(wincardBigorSmallBool).removeClass("current");
			if(wingold>0)
			{
				downGold();//掉金币
			}			
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
	
	function awardFun(){
		/*计算投注的点数中奖情况*/
		wingold += mypointArr[wincardNumNum-1]*9;
		
		/*计算投注的花色中奖情况*/
		wingold += mypointArr[wincardColorNum+13]*3;
		
		/*计算投注的大小中奖情况*/
		wingold += (wincardBigorSmallBool==0 ? mypointArr[17]*1.7:0)+(wincardBigorSmallBool==1 ? mypointArr[18]*1.7:0)		 
		 
		mymoney = (parseFloat(mymoney) + wingold).toFixed(2); //我的金币等于总金币+本次赢取的金币
		
		$(".bean").text(mymoney); //更新Dom我的金币数量
	}
	
	/*赢了之后掉金币*/
	function downGold(){
		var newSmallStakeEl1 = '<span style="position:fixed; top:1rem; opacity:1; margin-left:-0.15rem; left:50%" class="chip-item chip-item-small chip-2"></span>';
		var newSmallStakeEl2 = '<span style="position:fixed; top:1.3rem; opacity:1; margin-left:-0.15rem; left:50%" class="chip-item chip-item-small chip-10"></span>';
		var newSmallStakeEl3 = '<span style="position:fixed; top:1.6rem; opacity:1;  margin-left:-0.15rem; left:50%" class="chip-item chip-item-small chip-50"></span>';
		$(".chip-list").append(newSmallStakeEl1);	
		$(".chip-list").append(newSmallStakeEl2);	
		$(".chip-list").append(newSmallStakeEl3);	
		
		$(".chip-item-small").animate({"top":"6rem"},800,function(){
			$(".chip-item-small").remove();
		});
	};
	
	/*撤销投注弹窗*/
	$(".revoke").click(function(){
		$(".revokets").addClass("db");
	});
	
	/*确认撤销按钮*/
	$(".sureBtn").click(function(){
		revoke();
		$(".revokets").removeClass("db");
		mymoney = (parseFloat(mymoney) + parseFloat(myStakeTotal)).toFixed(2); //我的金币等于总金币+本次赢取的金币
		myStakeTotal = 0;
		$(".bean").text(mymoney); //更新Dom我的金币数量
	})
	
	/*取消撤销按钮*/
	$(".cancelBtn").click(function(){
		$(".revokets").removeClass("db");
	})
	
	
	/*撤销函数*/
	function  revoke(){		
		for(var i=0; i<19; i++)
		{
			totalPointArr[i] = totalPointArr[i] - mypointArr[i];//更新总的投注数组
		}
		
		mypointArr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //清空我的投注数组清空
		
		for(var i=0; i<13; i++)
		{
			$(".num-item").eq(i).find(".date-item").eq(0).text(totalPointArr[i]);//更新当前全部点数的显示
			$(".num-item").eq(i).find(".date-item").eq(1).text(mypointArr[i]); // 更新我的投注数据显示
		}
		for(var i=13; i<17; i++)
		{
			$(".suit-item").eq(i-13).find(".date-item").eq(0).text(totalPointArr[i]);//更新当前全部点数的显示
			$(".suit-item").eq(i-13).find(".date-item").eq(1).text(mypointArr[i]); // 更新我的投注数据显示
		}		
		for(var i=17; i<19; i++)
		{
			$(".size-item").eq(i-17).find(".date-item").eq(0).text(totalPointArr[i]);//更新当前全部点数的显示
			$(".size-item").eq(i-17).find(".date-item").eq(1).text(mypointArr[i]); // 更新我的投注数据显示
		}			
	}
	
	
 
	
 
})
 
