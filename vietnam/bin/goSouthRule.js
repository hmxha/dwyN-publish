/*
"use strict";
exports.__esModule = true;
exports.GoSouthRule = void 0;
var GoSouthRule;
(function (GoSouthRule) {
*/
var GoSouthRule = {}
//============================================================================================
//测试变量区
//============================================================================================
var loopCount = 0;
//============================================================================================
//牌区
//============================================================================================
//牌组成 0x0F(点数) + 0xF0(花色) 组成
GoSouthRule.CardGroup = [
	//3,4,5,6,7,8,9,10,J,Q,K,A,2
	0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D,
	0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D,
	0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A, 0x4B, 0x4C, 0x4D,
	0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8A, 0x8B, 0x8C, 0x8D, // 红桃
];
//值掩码
var ValueMask = 0xF;
//扑克种类
var CardKind;
(function(CardKind) {
	/**
	 * 单
	 */
	CardKind[CardKind["single"] = 0] = "single";
	/**
	 * 双
	 */
	CardKind[CardKind["pair"] = 1] = "pair";
	/**
	 * 三张
	 */
	CardKind[CardKind["triplet"] = 2] = "triplet";
	/**
	 * 四张
	 */
	CardKind[CardKind["quadruplets"] = 3] = "quadruplets";
	/**
	 * 顺子
	 */
	CardKind[CardKind["seq"] = 4] = "seq";
	/**
	 * 三连对
	 */
	CardKind[CardKind["seq3pair"] = 5] = "seq3pair";
	/**
	 * 四连对
	 */
	CardKind[CardKind["seq4pair"] = 6] = "seq4pair";
	/**
	 * 错误种类
	 */
	CardKind[CardKind["none"] = -1] = "none";
})(CardKind = GoSouthRule.CardKind || (GoSouthRule.CardKind = {}));
//完美牌类型(自动胜)
var PerfectType;
(function(PerfectType) {
	PerfectType[PerfectType["neno"] = 0] = "neno";
	PerfectType[PerfectType["pair6"] = 1] = "pair6";
	PerfectType[PerfectType["oneGroupQuadruplets2"] = 2] = "oneGroupQuadruplets2";
	PerfectType[PerfectType["fiveSeqPair"] = 3] = "fiveSeqPair";
	PerfectType[PerfectType["sameColor12"] = 4] = "sameColor12";
	PerfectType[PerfectType["twoQuadruplets"] = 5] = "twoQuadruplets";
	PerfectType[PerfectType["fourTriplet"] = 6] = "fourTriplet";
	PerfectType[PerfectType["sixSeqPair"] = 7] = "sixSeqPair";
	PerfectType[PerfectType["twelveSeq"] = 8] = "twelveSeq";
})(PerfectType = GoSouthRule.PerfectType || (GoSouthRule.PerfectType = {}));
var PerfectZH_CN = ["没有", "6对", "1组4张2", "5连对", "12张同色", "2组4张", "4组3张", "6连对", "龙顺"];
var Perfect_EN = ["neno", "pair6", "oneGroupQuadruplets2", "fiveSeqPair", "sameColor12", "twoQuadruplets", "fourTriplet", "sixSeqPair", "twelveSeq"];
//============================================================================================
//导出部分
//============================================================================================
//--------------------------------------------------------------------------------------------
//日志部分
//--------------------------------------------------------------------------------------------
function log() {
	// var data = [];
	// for (var _i = 0; _i < arguments.length; _i++) {
	// 	data[_i] = arguments[_i];
	// }
	// console.log.apply(console, data);
}
GoSouthRule.log = log;
function error() {
	var data = [];
	for (var _i = 0; _i < arguments.length; _i++) {
		data[_i] = arguments[_i];
	}
	// console.error(...data)
	console.trace.apply(console, data);
}
//--------------------------------------------------------------------------------------------
//扑克部分
//--------------------------------------------------------------------------------------------
function getValue(card) {
	return card & ValueMask;
}
GoSouthRule.getValue = getValue;
//牌值转索引
function cardValueConvertIndex(cardValue) {
	return cardValue - 1;
}
//获取花色
function getColor(card) {
	return card & 240 /* mask */;
}
GoSouthRule.getColor = getColor;
//牌检查
function checkCard(card) {
	var value = getValue(card);
	if (value < 1 || value > 0xD) {
		return false;
	}
	var color = getColor(card);
	if (color == 0) {
		return false;
	}
	return true;
}
//制造牌组合信息(完整的组合信息)
function makeCardCombineInfo(cards) {
	var cardsCInfo = [];
	for (var i = 0; i < 13; ++i) {
		cardsCInfo.push({ value: i + 1, colorMask: 0, count: 0 });
	}
	for (var i = 0; i < cards.length; ++i) {
		if (checkCard(cards[i])) {
			var index = cardValueConvertIndex(getValue(cards[i]));
			if (index >= 0 && index < cardsCInfo.length) {
				cardsCInfo[index].colorMask |= getColor(cards[i]);
				cardsCInfo[index].count += 1;
			}
			else {
				error("makeCardCombineInfo:[%d]牌值错误", cards[i]);
			}
		}
		else {
			error("makeCardCombineInfo:[%d]牌值错误", cards[i]);
		}
	}
	return cardsCInfo;
}
GoSouthRule.makeCardCombineInfo = makeCardCombineInfo;
//制造牌识别信息(只保留存在的信息)
function makeCardIdentifyInfo(cards) {
	var cardsCInfo = makeCardCombineInfo(cards);
	var cii = [];
	for (var i = 0; i < cardsCInfo.length; ++i) {
		if (cardsCInfo[i].count > 0) {
			cii.push(cardsCInfo[i]);
		}
	}
	return cii;
}
GoSouthRule.makeCardIdentifyInfo = makeCardIdentifyInfo;
//获取单组牌识别信息
function getOneCardIdentifyInfo(cards) {
	var cardIInfos = makeCardIdentifyInfo(cards);
	return cardIInfos[cardIInfos.length - 1];
}
//--------------------------------------------------------------------------------------------
//辅助
//--------------------------------------------------------------------------------------------
/**
 * 取颜色值
 * @param color 颜色值
 */
function fetchColor(color) {
	var oneColorMask = [16 /* spade */, 32 /* club */, 64 /* diamond */, 128 /* heart */];
	for (var i = 0; i < oneColorMask.length; ++i) {
		if (color & oneColorMask[i]) {
			return {
				color: color & ~oneColorMask[i],
				oneColor: oneColorMask[i]
			};
		}
	}
	error("取色错误:%d", color);
	return { color: color, oneColor: -1 };
}
/**
 * 合成牌
 * @param value 点数
 * @param color 颜色
 * @returns 牌
 */
function mergeCard(value, color) {
	return value | color;
}
/**
 * 挑选牌
 * @param cardsCInfo 牌信息
 * @returns 挑选后的牌
 */
function makeKindPick(cardsCInfo) {
	var pickExec = [
		{ kind: CardKind.seq4pair, exec: fetchSeq4pair },
		{ kind: CardKind.seq3pair, exec: fetchSeq3pair },
		{ kind: CardKind.quadruplets, exec: fetchQuadruplets },
		{ kind: CardKind.triplet, exec: fetchTriplet },
		{ kind: CardKind.seq, exec: fetchSeq },
		{ kind: CardKind.pair, exec: fetchPair },
		{ kind: CardKind.single, exec: fetchSingle }
	];
	var ckp = {};
	for (var i = 0; i < pickExec.length; ++i) {
		var _a = pickExec[i], kind = _a.kind, exec = _a.exec;
		ckp[kind] = exec(cardsCInfo);
	}
	return ckp;
}
GoSouthRule.makeKindPick = makeKindPick;
/**
 * 提示牌
 * @param cardsCInfo 牌信息
 * @returns 提示组合
 */
function tips(outCards, cards) {
	var _a;
	//获取牌类型
	var kind = getCardKind(outCards);
	var cardsIInfo = getOneCardIdentifyInfo(outCards);
	var cardsComb = makeCardCombineInfo(cards);
	if (kind == 4) {
		//如果要压的顺子，则把敌方顺子中最大的牌的花色与我方相同点数的牌的花色对比，去除我方同点数但花色比敌方小的牌
		var maxValCard = cardsComb[cardsIInfo.value - 1];
		if (maxValCard.count > 1) {
			if (maxValCard.colorMask & 16 /* spade */) {
				cardsComb[cardsIInfo.value - 1].colorMask &= ~16 /* spade */;
			}
			if ((maxValCard.colorMask & 32 /* club */) && (cardsIInfo.colorMask > 32 /* club */)) {
				cardsComb[cardsIInfo.value - 1].colorMask &= ~16 /* spade */;
			}
		}
	}
	var getSingleExecs = function(value) {
		if (value == 0xD) {
			return [fetchSeq4pair, fetchQuadruplets, fetchSeq3pair, fetchSingle];
		}
		return [fetchSingle];
	};
	var getPairleExecs = function(value) {
		if (value == 0xD) {
			return [fetchSeq4pair, fetchQuadruplets, fetchPair];
		}
		return [fetchPair];
	};
	var pickExec = (_a = {},
		_a[CardKind.seq4pair] = [fetchSeq4pair],
		_a[CardKind.seq3pair] = [fetchSeq4pair, fetchQuadruplets, fetchSeq3pair],
		_a[CardKind.quadruplets] = [fetchSeq4pair, fetchQuadruplets],
		_a[CardKind.triplet] = [fetchTriplet],
		_a[CardKind.seq] = [fetchSeq],
		_a[CardKind.pair] = getPairleExecs(cardsIInfo.value),
		_a[CardKind.single] = getSingleExecs(cardsIInfo.value),
		_a);
	var execs = pickExec[kind];
	var tipsCards = [];
	//提取
	var cardsCInfo;
	if (kind != 4) {
		cardsCInfo = makeCardCombineInfo(cards);
	}
	else {
		cardsCInfo = cardsComb;
	}
	for (var i = 0; i < execs.length; ++i) {
		//通过克隆产生多种牌型组合，以免被组成别的牌，而导致不能和别的牌组合
		var cloneCardCInfo = JSON.parse(JSON.stringify(cardsCInfo));
		var assembly = execs[i](cloneCardCInfo);
		var testSeq = [];
		for (var j = 0; j < assembly.length; ++j) {
			var testInfo = [];
			for (var t = 0; t < assembly[j].length; ++t) {
				log("assembly is: ", assembly);
				testInfo.push(getCardSymbol(assembly[j][t]));
			}
			//挑选出与上家的顺子的牌张数相等的顺子
			if (kind == 4) {
				var seqCnt = assembly[j].length - outCards.length + 1;
				if (seqCnt >= 1) {
					for (var ii = 0; ii < seqCnt; ii++) {
						var cnt = ii;
						for (var jj = 0; jj < outCards.length; jj++) {
							testSeq.push(assembly[j][cnt++]);
						}
						//判断顺子类型的是否能压
						if (isBetter(outCards, testSeq)) {
							tipsCards.push(testSeq);
						}
						testSeq = [];
					}
				}
			}
			else {
				//判断是否能压
				if (isBetter(outCards, assembly[j])) {
					tipsCards.push(assembly[j]);
				}
			}
		}
	}
	return tipsCards;
}
GoSouthRule.tips = tips;
/**
 * 完美牌(自动胜)
 * @param cardsCInfo 牌信息
 * @returns 类型
 */
function isPerfectCards(cardsCInfo) {
	var checks = [
		[PerfectType.twelveSeq, isPerfectTwelveSeq],
		[PerfectType.sixSeqPair, isPerfectSixSeqPair],
		[PerfectType.fourTriplet, isPerfectFourTriplet],
		[PerfectType.twoQuadruplets, isPerfectTwoQuadruplets],
		[PerfectType.sameColor12, isPerfectSameColor12],
		[PerfectType.fiveSeqPair, isPerfectFiveSeqPair],
		[PerfectType.oneGroupQuadruplets2, isPerfectOneGroupQuadruplets2],
		[PerfectType.pair6, isPerfectPair6]
	];
	for (var i = 0; i < checks.length; ++i) {
		var type = checks[i][0];
		var is = checks[i][1];
		if (is(cardsCInfo)) {
			return type;
		}
	}
	return PerfectType.neno;
}
GoSouthRule.isPerfectCards = isPerfectCards;
//6对
function isPerfectPair6(cardsCInfo) {
	var pairCount = 0;
	for (var i = 0; i < cardsCInfo.length; ++i) {
		if (cardsCInfo[i].count >= 2) {
			pairCount += parseInt(String(cardsCInfo[i].count / 2));
		}
	}
	return pairCount == 6;
}
//获取6对
function fetchPair6(cardsCInfo) {
	var pair_arr = fetchPair(cardsCInfo);
	var result_arr = [];
	for (var _i = 0, pair_arr_1 = pair_arr; _i < pair_arr_1.length; _i++) {
		var val = pair_arr_1[_i];
		for (var _a = 0, val_1 = val; _a < val_1.length; _a++) {
			var vall = val_1[_a];
			result_arr.push(vall);
		}
	}
	return result_arr;
}
//1组4张2
function isPerfectOneGroupQuadruplets2(cardsCInfo) {
	var card2 = cardsCInfo[cardsCInfo.length - 1];
	if (card2.value != 0xD) {
		error("isPerfectOneGroupQuadruplets2:%s", "传入参数不对");
	}
	return card2.count == 4;
}
GoSouthRule.isPerfectOneGroupQuadruplets2 = isPerfectOneGroupQuadruplets2;
//获取1组4张2
function fetchOneGroupQuadruplets2(cardsCInfo) {
	var quadruplets_arr = fetchQuadruplets(cardsCInfo);
	var result_arr = [];
	for (var _i = 0, quadruplets_arr_1 = quadruplets_arr; _i < quadruplets_arr_1.length; _i++) {
		var val = quadruplets_arr_1[_i];
		for (var _a = 0, val_2 = val; _a < val_2.length; _a++) {
			var vall = val_2[_a];
			if (getValue(vall) == 13) {
				result_arr.push(vall);
			}
		}
	}
	return result_arr;
}
//5连对
function isPerfectFiveSeqPair(cardsCInfo) {
	var fiveSeqPair = [];
	//按正常顺序扫描
	var push = function(card) {
		if (card.count >= 2) {
			fiveSeqPair.push(card);
		}
		else {
			fiveSeqPair = [];
		}
	};
	for (var i = 0; i < cardsCInfo.length - 1; ++i) {
		push(cardsCInfo[i]);
		if (fiveSeqPair.length == 5) {
			return true;
		}
	}
	return false;
	/*
	//从A,2开始扫描,倒数二，倒数一索引
	fiveSeqPair = []
	let scanIndex: number[] = [cardsCInfo.length - 2, cardsCInfo.length - 1]
	for (let i = 0; i < scanIndex.length; ++i) {
	    push(cardsCInfo[scanIndex[i]])
	}
	if (fiveSeqPair.length == 0) {
	    return false
	}
	//扫剩下的
	for (let i = 0; i < 5 - fiveSeqPair.length; ++i) {
	    push(cardsCInfo[i])
	}

	return fiveSeqPair.length == 5
	*/
}
//获取5连对
function fetchFiveSeqPair(cardCInfo) {
	var pairs_arr = fetchPair(cardCInfo);
	var result_arr = [];
	if (pairs_arr.length == 5) {
		for (var _i = 0, pairs_arr_1 = pairs_arr; _i < pairs_arr_1.length; _i++) {
			var val = pairs_arr_1[_i];
			for (var _a = 0, val_3 = val; _a < val_3.length; _a++) {
				var vall = val_3[_a];
				result_arr.push(vall);
			}
		}
	}
	return result_arr;
}
//12张同色
function isPerfectSameColor12(cardsCInfo) {
	var _a;
	var colorCountInfo = (_a = {},
		_a[16 /* spade */] = 0,
		_a[32 /* club */] = 0,
		_a[64 /* diamond */] = 0,
		_a[128 /* heart */] = 0,
		_a);
	var fetch = function(color) {
		var count = 0;
		var cloneColor = color;
		while (cloneColor > 0 && count <= 14) {
			var colorInfo = fetchColor(cloneColor);
			if (colorCountInfo[colorInfo.oneColor] != undefined) {
				colorCountInfo[colorInfo.oneColor] += 1;
			}
			else {
				error("isPerfectSameColor12:%s", "提取了错误的颜色", colorInfo);
			}
			cloneColor = colorInfo.color;
			count += 1;
		}
		if (count >= 14) {
			error("isPerfectSameColor:%s", "超出正常颜色范围", color);
		}
	};
	for (var i = 0; i < cardsCInfo.length; ++i) {
		fetch(cardsCInfo[i].colorMask);
	}
	return colorCountInfo[16 /* spade */] >= 12 ||
		colorCountInfo[32 /* club */] >= 12 ||
		colorCountInfo[64 /* diamond */] >= 12 ||
		colorCountInfo[128 /* heart */] >= 12;
}
//获取12张同色
function fetchSameColor12(cardsCInfo) {
	var theSameColor = 0;
	var result_arr = [];
	for (var i = 0; i < 3; i++) {
		if (cardsCInfo[i].count == 1) {
			theSameColor = cardsCInfo[i].colorMask;
		}
	}
	var singles_arr = fetchSingle(cardsCInfo);
	var cnt = 12;
	for (var _i = 0, singles_arr_1 = singles_arr; _i < singles_arr_1.length; _i++) {
		var val = singles_arr_1[_i];
		for (var _a = 0, val_4 = val; _a < val_4.length; _a++) {
			var vall = val_4[_a];
			if (getColor(vall) == theSameColor) {
				result_arr.push(vall);
				cnt--;
			}
		}
		if (cnt == 0) {
			return result_arr;
		}
	}
}
//2组4张
function isPerfectTwoQuadruplets(cardsCInfo) {
	var quadruplets = [];
	var push = function(card) {
		if (card.count == 4) {
			quadruplets.push(card);
		}
	};
	for (var i = 0; i < cardsCInfo.length; ++i) {
		push(cardsCInfo[i]);
	}
	return quadruplets.length >= 2;
}
//获取2组4张
function fetchTwoQuadruplets(cardsCInfo) {
	var quadruplets_arr = fetchQuadruplets(cardsCInfo);
	var result_arr = [];
	var cnt = 8;
	for (var _i = 0, quadruplets_arr_2 = quadruplets_arr; _i < quadruplets_arr_2.length; _i++) {
		var val = quadruplets_arr_2[_i];
		for (var _a = 0, val_5 = val; _a < val_5.length; _a++) {
			var vall = val_5[_a];
			result_arr.push(vall);
			cnt--;
		}
		if (cnt == 0) {
			return result_arr;
		}
	}
}
//4组3张
function isPerfectFourTriplet(cardsCInfo) {
	var triplet = [];
	var push = function(card) {
		if (card.count >= 3) {
			triplet.push(card);
		}
	};
	for (var i = 0; i < cardsCInfo.length; ++i) {
		push(cardsCInfo[i]);
	}
	return triplet.length >= 4;
}
//获取4组3张
function fetchFourTriplet(cardsCInfo) {
	var triplet_arr = fetchTriplet(cardsCInfo);
	var result_arr = [];
	if (triplet_arr.length == 4) {
		for (var _i = 0, triplet_arr_1 = triplet_arr; _i < triplet_arr_1.length; _i++) {
			var val = triplet_arr_1[_i];
			for (var _a = 0, val_6 = val; _a < val_6.length; _a++) {
				var vall = val_6[_a];
				result_arr.push(vall);
			}
		}
	}
	return result_arr;
}
//6连对
function isPerfectSixSeqPair(cardsCInfo) {
	var sixSeqPair = [];
	//按正常顺序扫描
	var push = function(card) {
		if (card.count >= 2) {
			sixSeqPair.push(card);
		}
		else {
			sixSeqPair = [];
		}
	};
	for (var i = 0; i < cardsCInfo.length - 1; ++i) {
		push(cardsCInfo[i]);
		if (sixSeqPair.length == 6) {
			return true;
		}
	}
	/*
	//从A,2开始扫描,倒数二，倒数一索引
	sixSeqPair = []
	let scanIndex: number[] = [cardsCInfo.length - 2, cardsCInfo.length - 1]
	for (let i = 0; i < scanIndex.length; ++i) {
	    push(cardsCInfo[scanIndex[i]])
	}
	if (sixSeqPair.length == 0) {
	    return false
	}
	//扫剩下的
	let len = 6 - sixSeqPair.length
	for (let i = 0; i < len; ++i) {
	    push(cardsCInfo[i])
	    if (sixSeqPair.length == 6) {
		return true
	    }
	}
	*/
	return false;
}
//获取6连对
function fetchSixSeqPair(cardsCInfo) {
	var pairs_arr = fetchPair(cardsCInfo);
	var result_arr = [];
	if (pairs_arr.length == 6) {
		for (var _i = 0, pairs_arr_2 = pairs_arr; _i < pairs_arr_2.length; _i++) {
			var val = pairs_arr_2[_i];
			for (var _a = 0, val_7 = val; _a < val_7.length; _a++) {
				var vall = val_7[_a];
				result_arr.push(vall);
			}
		}
	}
	return result_arr;
}
//12连张 龙顺
function isPerfectTwelveSeq(cardsCInfo) {
	var seq = [];
	//按正常顺序扫描
	var push = function(card) {
		if (card.count >= 1) {
			seq.push(card);
		}
		else {
			seq = [];
		}
	};
	for (var i = 0; i < cardsCInfo.length - 1; ++i) {
		push(cardsCInfo[i]);
		if (seq.length == 12) {
			return true;
		}
	}
	return false;
}
//获取12连张
function fetchTwelveSeq(cardsCInfo) {
	var single_arr = fetchSingle(cardsCInfo);
	var result_arr = [];
	for (var _i = 0, single_arr_1 = single_arr; _i < single_arr_1.length; _i++) {
		var val = single_arr_1[_i];
		for (var _a = 0, val_8 = val; _a < val_8.length; _a++) {
			var vall = val_8[_a];
			if (result_arr.length != 0) {
				var len = result_arr.length;
				if (Math.abs(getValue(vall) - getValue(result_arr[len - 1])) == 1 && getValue(vall) != 13) {
					result_arr.push(vall);
					if (result_arr.length == 12) {
						return result_arr;
					}
				}
				else {
					result_arr.pop();
					result_arr.push(vall);
				}
			}
			else if (result_arr.length == 0) {
				result_arr.push(vall);
			}
		}
	}
	if (result_arr.length != 12) {
		log("error");
		return result_arr;
	}
}
/**
 * 取单
 */
function fetchSingle(cardsCInfo) {
	if (cardsCInfo.length == 0) {
		return [];
	}
	var cards = [];
	for (var i = 0; i < cardsCInfo.length; ++i) {
		if (cardsCInfo[i].count > 0) {
			var count = cardsCInfo[i].count;
			for (var c = 0; c < count; ++c) {
				var _a = fetchColor(cardsCInfo[i].colorMask), color = _a.color, oneColor = _a.oneColor;
				cardsCInfo[i].colorMask = color;
				cardsCInfo[i].count -= 1;
				cards.push([mergeCard(cardsCInfo[i].value, oneColor)]);
			}
		}
	}
	return cards;
}
GoSouthRule.fetchSingle = fetchSingle;
/**
 * 双
 */
function fetchPair(cardsCInfo) {
	if (cardsCInfo.length == 0) {
		return [];
	}
	var cards = [];
	for (var i = 0; i < cardsCInfo.length; ++i) {
		if (cardsCInfo[i].count >= 2) {
			var count = cardsCInfo[i].count;
			for (var c = 0; c < count; c += 2) {
				var one = fetchColor(cardsCInfo[i].colorMask);
				cardsCInfo[i].colorMask = one.color;
				var two = fetchColor(cardsCInfo[i].colorMask);
				cardsCInfo[i].colorMask = two.color;
				cardsCInfo[i].count -= 2;
				cards.push([mergeCard(cardsCInfo[i].value, one.oneColor), mergeCard(cardsCInfo[i].value, two.oneColor)]);
				//不足2张
				if (cardsCInfo[i].count < 2) {
					break;
				}
			}
		}
	}
	return cards;
}
GoSouthRule.fetchPair = fetchPair;
/**
 * 三张
 */
function fetchTriplet(cardsCInfo) {
	if (cardsCInfo.length == 0) {
		return [];
	}
	var cards = [];
	for (var i = 0; i < cardsCInfo.length; ++i) {
		if (cardsCInfo[i].count >= 3) {
			var one = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = one.color;
			var two = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = two.color;
			var three = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = three.color;
			cardsCInfo[i].count -= 3;
			cards.push([
				mergeCard(cardsCInfo[i].value, one.oneColor),
				mergeCard(cardsCInfo[i].value, two.oneColor),
				mergeCard(cardsCInfo[i].value, three.oneColor)
			]);
		}
	}
	return cards;
}
GoSouthRule.fetchTriplet = fetchTriplet;
/**
 * 四张
 */
function fetchQuadruplets(cardsCInfo) {
	if (cardsCInfo.length == 0) {
		return [];
	}
	var cards = [];
	for (var i = 0; i < cardsCInfo.length; ++i) {
		if (cardsCInfo[i].count == 4) {
			var one = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = one.color;
			var two = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = two.color;
			var three = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = three.color;
			var four = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = four.color;
			cardsCInfo[i].count -= 4;
			cards.push([
				mergeCard(cardsCInfo[i].value, one.oneColor),
				mergeCard(cardsCInfo[i].value, two.oneColor),
				mergeCard(cardsCInfo[i].value, three.oneColor),
				mergeCard(cardsCInfo[i].value, four.oneColor)
			]);
		}
	}
	return cards;
}
GoSouthRule.fetchQuadruplets = fetchQuadruplets;
/**
 * 顺子
 */
function fetchSeq(cardsCInfo) {
	if (cardsCInfo.length == 0) {
		return [];
	}
	var cards = [];
	//顺子
	var seqIndex = [];
	var lastValue = cardsCInfo[0].value - 1;
	var fetchCards = function(indexs) {
		// log('-------------fetchCards---------------')
		// log(indexs)
		// log('--------------------------------------')
		var s = [];
		for (var i = 0; i < indexs.length; ++i) {
			var index = indexs[i];
			if (cardsCInfo[index].count > 0) {
				var _a = fetchColor(cardsCInfo[index].colorMask), color = _a.color, oneColor = _a.oneColor;
				cardsCInfo[index].colorMask = color;
				cardsCInfo[index].count -= 1;
				s.push(mergeCard(cardsCInfo[index].value, oneColor));
			}
		}
		cards.push(s);
	};
	for (var i = 0; i < cardsCInfo.length; ++i) {
		//连续中断
		if (lastValue + 1 != cardsCInfo[i].value || cardsCInfo[i].count == 0 || cardsCInfo[i].value == 13) {
			if (seqIndex.length >= 3) {
				fetchCards(seqIndex);
			}
			seqIndex = [];
		}
		lastValue = cardsCInfo[i].value;
		if (cardsCInfo[i].count > 0 && cardsCInfo[i].value != 13) {
			seqIndex.push(i);
		}
		else {
			seqIndex = [];
		}
	}
	if (seqIndex.length >= 3) {
		fetchCards(seqIndex);
	}
	return cards;
}
GoSouthRule.fetchSeq = fetchSeq;
/**
 * 三连对
 */
function fetchSeq3pair(cardsCInfo) {
	if (cardsCInfo.length == 0) {
		return [];
	}
	var cards = [];
	//三连对
	var seqIndex = [];
	var lastValue = cardsCInfo[0].value - 1;
	var fetchCards = function(indexs) {
		// log('-------------fetchCards---------------')
		// log(indexs)
		// log('--------------------------------------')
		var s = [];
		for (var i = 0; i < indexs.length; ++i) {
			var index = indexs[i];
			if (cardsCInfo[index].count >= 2) {
				var one = fetchColor(cardsCInfo[index].colorMask);
				cardsCInfo[index].colorMask = one.color;
				cardsCInfo[index].count -= 1;
				var two = fetchColor(cardsCInfo[index].colorMask);
				cardsCInfo[index].colorMask = two.color;
				cardsCInfo[index].count -= 1;
				s.push(mergeCard(cardsCInfo[index].value, one.oneColor));
				s.push(mergeCard(cardsCInfo[index].value, two.oneColor));
			}
		}
		cards.push(s);
	};
	for (var i = 0; i < cardsCInfo.length; ++i) {
		//连续中断
		if (lastValue + 1 != cardsCInfo[i].value || cardsCInfo[i].count < 2 || cardsCInfo[i].value == 13) {
			if (seqIndex.length == 3) {
				fetchCards(seqIndex);
			}
			seqIndex = [];
		}
		lastValue = cardsCInfo[i].value;
		if (cardsCInfo[i].count >= 2 && cardsCInfo[i].value != 13) {
			seqIndex.push(i);
		}
		else {
			seqIndex = [];
		}
	}
	return cards;
}
GoSouthRule.fetchSeq3pair = fetchSeq3pair;
/**
 * 四连对
 */
function fetchSeq4pair(cardsCInfo) {
	if (cardsCInfo.length == 0) {
		return [];
	}
	var cards = [];
	//四连对
	var seqIndex = [];
	var lastValue = cardsCInfo[0].value - 1;
	var fetchCards = function(indexs) {
		// log('-------------fetchCards---------------')
		// log(indexs)
		// log('--------------------------------------')
		var s = [];
		for (var i = 0; i < indexs.length; ++i) {
			var index = indexs[i];
			if (cardsCInfo[index].count >= 2) {
				var one = fetchColor(cardsCInfo[index].colorMask);
				cardsCInfo[index].colorMask = one.color;
				cardsCInfo[index].count -= 1;
				var two = fetchColor(cardsCInfo[index].colorMask);
				cardsCInfo[index].colorMask = two.color;
				cardsCInfo[index].count -= 1;
				s.push(mergeCard(cardsCInfo[index].value, one.oneColor));
				s.push(mergeCard(cardsCInfo[index].value, two.oneColor));
			}
		}
		cards.push(s);
	};
	for (var i = 0; i < cardsCInfo.length; ++i) {
		//连续中断
		if (lastValue + 1 != cardsCInfo[i].value || cardsCInfo[i].count < 2 || cardsCInfo[i].value == 13) {
			if (seqIndex.length == 4) {
				fetchCards(seqIndex);
			}
			seqIndex = [];
		}
		lastValue = cardsCInfo[i].value;
		if (cardsCInfo[i].count >= 2 && cardsCInfo[i].value != 13) {
			seqIndex.push(i);
		}
		else {
			seqIndex = [];
		}
	}
	return cards;
}
GoSouthRule.fetchSeq4pair = fetchSeq4pair;
/**
 * 获取牌种类
 * @param cards 牌组
 * @returns 种类
 */
function getCardKind(cards) {
	var ck = CardKind.none;
	var isCardKinds = [
		{ is: isQuadruplets, kind: CardKind.quadruplets },
		{ is: isSeq4pair, kind: CardKind.seq4pair },
		{ is: isSeq3pair, kind: CardKind.seq3pair },
		{ is: isSeq, kind: CardKind.seq },
		{ is: isTriplet, kind: CardKind.triplet },
		{ is: isPair, kind: CardKind.pair },
		{ is: isSingle, kind: CardKind.single }
	];
	var cardsCInfo = makeCardIdentifyInfo(cards);
	for (var i = 0; i < isCardKinds.length; ++i) {
		var _a = isCardKinds[i], is = _a.is, kind = _a.kind;
		if (is(cardsCInfo)) {
			ck = kind;
			break;
		}
	}
	return ck;
}
GoSouthRule.getCardKind = getCardKind;
//============================================================================================
//压牌区
//============================================================================================
/**
 * 是否能压
 * @param aCards A的牌
 * @param bCards B的牌
 * @returns B是能打能A
 */
function isBetter(aCards, bCards) {
	var _a, _b, _c, _d, _e, _f;
	var aKind = getCardKind(aCards);
	var bKind = getCardKind(bCards);
	var betterJudge = (_a = {},
		_a[CardKind.none] = function(a, b) {
			error("isBetter:", a, b);
		},
		_a[CardKind.single] = isBetterSingle,
		_a[CardKind.pair] = isBetterPair,
		_a[CardKind.triplet] = isBetterTriplet,
		_a[CardKind.quadruplets] = isBetterQuadruplets,
		_a[CardKind.seq] = isBetterSeq,
		_a[CardKind.seq3pair] = isBetterSeq3pair,
		_a[CardKind.seq4pair] = isBetterSeq4pair,
		_a);
	var a = makeCardIdentifyInfo(aCards);
	var b = makeCardIdentifyInfo(bCards);
	if (aKind == bKind) {
		//return isBetterSeq4pair(a, b)
		return betterJudge[aKind](a, b);
	}
	//跨牌型处理 单2 和对2 3连对 4张 4连对允许跨牌型
	else if (((aKind == CardKind.single || aKind == CardKind.pair) && a[0].value == 0xD) ||
		aKind == CardKind.seq3pair ||
		aKind == CardKind.quadruplets ||
		aKind == CardKind.seq4pair) {
		var allowCrossKind = (_b = {},
			_b[CardKind.single] = (_c = {},
				_c[CardKind.seq3pair] = true,
				_c[CardKind.quadruplets] = true,
				_c[CardKind.seq4pair] = true,
				_c),
			_b[CardKind.pair] = (_d = {},
				_d[CardKind.quadruplets] = true,
				_d[CardKind.seq4pair] = true,
				_d),
			_b[CardKind.seq3pair] = (_e = {},
				_e[CardKind.quadruplets] = true,
				_e[CardKind.seq4pair] = true,
				_e),
			_b[CardKind.quadruplets] = (_f = {},
				_f[CardKind.seq4pair] = true,
				_f),
			_b);
		if (allowCrossKind[aKind][bKind]) {
			return true;
		}
	}
	return false;
}
GoSouthRule.isBetter = isBetter;
//--------------------------------------------------------------------------------------------
//调用以下接口需先验证类型正确,不再做重复检测
//--------------------------------------------------------------------------------------------
/**
 * 压牌比较
 * @param a 牌识别信息
 * @param b 牌识别信息
 * @returns 是否能压
 */
function betterCompete(a, b) {
	if (b.value != a.value) {
		return b.value > a.value;
	}
	return b.colorMask > a.colorMask;
}
/**
 * 单张压牌 b是否能压a
 * @param aCardsCInfo a识别信息
 * @param bCardsCInfo b识别信息
 * @returns b是否能压a
 */
function isBetterSingle(aCardsCInfo, bCardsCInfo) {
	if (aCardsCInfo.length != 1 || bCardsCInfo.length != 1) {
		return false;
	}
	return betterCompete(aCardsCInfo[0], bCardsCInfo[0]);
}
/**
 * 对子压牌 b是否能压a
 * @param aCardsCInfo a识别信息
 * @param bCardsCInfo b识别信息
 * @returns b是否能压a
 */
function isBetterPair(aCardsCInfo, bCardsCInfo) {
	if (aCardsCInfo.length != 1 || bCardsCInfo.length != 1) {
		return false;
	}
	return betterCompete(aCardsCInfo[0], bCardsCInfo[0]);
}
/**
 * 三张压牌 b是否能压a
 * @param aCardsCInfo a识别信息
 * @param bCardsCInfo b识别信息
 * @returns b是否能压a
 */
function isBetterTriplet(aCardsCInfo, bCardsCInfo) {
	if (aCardsCInfo.length != 1 || bCardsCInfo.length != 1) {
		return false;
	}
	return betterCompete(aCardsCInfo[0], bCardsCInfo[0]);
}
/**
 * 四张压牌 b是否能压a
 * @param aCardsCInfo a识别信息
 * @param bCardsCInfo b识别信息
 * @returns b是否能压a
 */
function isBetterQuadruplets(aCardsCInfo, bCardsCInfo) {
	if (aCardsCInfo.length != 1 || bCardsCInfo.length != 1) {
		return false;
	}
	return betterCompete(aCardsCInfo[0], bCardsCInfo[0]);
}
/**
 * 顺子压牌 b是否能压a
 * @param aCardsCInfo a识别信息
 * @param bCardsCInfo b识别信息
 * @returns b是否能压a
 */
function isBetterSeq(aCardsCInfo, bCardsCInfo) {
	if (aCardsCInfo.length < 3 || bCardsCInfo.length < 3 || aCardsCInfo.length != bCardsCInfo.length) {
		return false;
	}
	for (var _i = 0, bCardsCInfo_1 = bCardsCInfo; _i < bCardsCInfo_1.length; _i++) {
		var val = bCardsCInfo_1[_i];
		if (val.value == 13) {
			return false;
		}
	}
	var index = aCardsCInfo.length - 1;
	return betterCompete(aCardsCInfo[index], bCardsCInfo[index]);
}
/**
 * 三连对压牌 b是否能压a
 * @param aCardsCInfo a识别信息
 * @param bCardsCInfo b识别信息
 * @returns b是否能压a
 */
function isBetterSeq3pair(aCardsCInfo, bCardsCInfo) {
	if (aCardsCInfo.length != 3 || bCardsCInfo.length != 3) {
		return false;
	}
	var index = aCardsCInfo.length - 1;
	return betterCompete(aCardsCInfo[index], bCardsCInfo[index]);
}
/**
 * 四连对压牌 b是否能压a
 * @param aCardsCInfo a识别信息
 * @param bCardsCInfo b识别信息
 * @returns b是否能压a
 */
function isBetterSeq4pair(aCardsCInfo, bCardsCInfo) {
	if (aCardsCInfo.length != 4 || bCardsCInfo.length != 4) {
		return false;
	}
	var index = aCardsCInfo.length - 1;
	return betterCompete(aCardsCInfo[index], bCardsCInfo[index]);
}
//--------------------------------------------------------------------------------------------
//种类严查型
//--------------------------------------------------------------------------------------------
/**
 * 单
 */
function isSingle(cardsCInfo) {
	if (cardsCInfo.length != 1) {
		return false;
	}
	return true;
}
/*
 * 双
 */
function isPair(cardsCInfo) {
	if (cardsCInfo.length != 1) {
		return false;
	}
	if (cardsCInfo[0].count != 2) {
		return false;
	}
	return true;
}
/**
 * 三张
 */
function isTriplet(cardsCInfo) {
	if (cardsCInfo.length != 1) {
		return false;
	}
	if (cardsCInfo[0].count != 3) {
		return false;
	}
	return true;
}
/**
 * 四张
 */
function isQuadruplets(cardsCInfo) {
	if (cardsCInfo.length != 1) {
		return false;
	}
	if (cardsCInfo[0].count != 4) {
		return false;
	}
	return true;
}
/**
 * 顺子
 */
function isSeq(cardsCInfo) {
	if (cardsCInfo.length < 3) {
		return false;
	}
	if (cardsCInfo[0].count != 1) {
		return false;
	}
	var checkValue = cardsCInfo[0].value + 1;
	for (var i = 1; i < cardsCInfo.length; ++i) {
		if (checkValue != cardsCInfo[i].value || cardsCInfo[i].count != 1 || checkValue == 13 || cardsCInfo[0].value == 13) {
			return false;
		}
		checkValue = checkValue + 1;
	}
	return true;
}
/**
 * 三连对
 */
function isSeq3pair(cardsCInfo) {
	if (cardsCInfo.length != 3) {
		return false;
	}
	var checkValue = cardsCInfo[0].value + 1;
	for (var i = 1; i < cardsCInfo.length; ++i) {
		if (checkValue != cardsCInfo[i].value || cardsCInfo[i].count != 2 || checkValue == 13 || cardsCInfo[0].value == 13) {
			return false;
		}
		checkValue = checkValue + 1;
	}
	return true;
}
/**
 * 四连对
 */
function isSeq4pair(cardsCInfo) {
	log(cardsCInfo);
	if (cardsCInfo.length != 4) {
		return false;
	}
	var checkValue = cardsCInfo[0].value + 1;
	for (var i = 1; i < cardsCInfo.length; ++i) {
		if (checkValue != cardsCInfo[i].value || cardsCInfo[i].count != 2 || checkValue == 13 || cardsCInfo[0].value == 13) {
			return false;
		}
		checkValue = checkValue + 1;
	}
	return true;
}
function getVersion() {
	return "beta1.3";
}
//--------------------------------------------------------------------------------------------
//种类查询
//--------------------------------------------------------------------------------------------
//============================================================================================
//内部
//============================================================================================
//============================================================================================
//测试
//============================================================================================
/**
 * 产生一副新牌
 */
function createNewCard() {
	var newCard = [];
	var count = GoSouthRule.CardGroup.length;
	var cloneCardGroup = JSON.parse(JSON.stringify(GoSouthRule.CardGroup));
	for (var i = 0; i < count; ++i) {
		var r = randomNum(0, cloneCardGroup.length - 1);
		newCard.push(cloneCardGroup.splice(r, 1).pop());
	}
	return newCard;
}
function randomNum(minNum, maxNum) {
	switch (arguments.length) {
		case 1:
			return parseInt(String(Math.random() * minNum + 1), 10);
		case 2:
			return parseInt(String(Math.random() * (maxNum - minNum + 1) + minNum), 10);
		default:
			break;
	}
	return 0;
}
/**
 * 获取花色符号
 * @param card 牌
 * @returns 符号
 */
function getColorSymbol(card) {
	var symbol = {};
	symbol[16 /* spade */] = "♠";
	symbol[32 /* club */] = "♣";
	symbol[64 /* diamond */] = "♦";
	symbol[128 /* heart */] = "♥";
	var color = getColor(card);
	if (symbol[color]) {
		return symbol[color];
	}
	error("getColorSymbol:%d", card);
	return "error";
}
/**
 * 获取牌值符号
 * @param card 牌
 * @returns 符号
 */
function getValueSymbol(card) {
	var value = getValue(card) + 2;
	if (value > 10) {
		var symbol = {
			'11': "J",
			'12': "Q",
			'13': "K",
			'14': "A",
			'15': "2"
		};
		if (symbol[value]) {
			return symbol[value];
		}
		error("getValueSysmbol:%d", card);
		return "error";
	}
	return String(value);
}
function getCardSymbol(card) {
	return getColorSymbol(card) + getValueSymbol(card);
}
GoSouthRule.getCardSymbol = getCardSymbol;
/**
 * 卡组排序
 * - 牌值 小 > 大 色值小 > 大
 * @param cardGroup 卡组（该函数会直接改变该数组）
 */
function cardGroupSort(cardGroup) {
	var _this = this;
	cardGroup.sort(function(a, b) {
		var va = _this.getValue(a);
		var vb = _this.getValue(b);
		if (va != vb) {
			return va - vb;
		}
		return getColor(a) - _this.getColor(b);
	});
	return cardGroup;
}
GoSouthRule.cardGroupSort = cardGroupSort;
/**
 * 卡組按照牌型排序
 * - 牌組順序 - 順子 三條 三連對 四連對 四條 對子 單張
 * @param cardGroup 卡组（该函数会直接改变该数组）
 */
function cardGroupCombSort(cardGroup) {
	var newSort = [];
	var cbi = makeCardCombineInfo(cardGroup);
	var extract = function(value) {
		for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
			var v = value_1[_i];
			for (var _a = 0, v_1 = v; _a < v_1.length; _a++) {
				var vv = v_1[_a];
				newSort.push(vv);
			}
		}
	};
	var combs = {
		seq: fetchSeq(cbi),
		trip: fetchTriplet(cbi),
		seq3pair: fetchSeq3pair(cbi),
		seq4pair: fetchSeq4pair(cbi),
		pair: fetchPair(cbi),
		single: fetchSingle(cbi)
	};
	for (var key in combs) {
		extract(combs[key]);
	}
	return newSort;
}
GoSouthRule.cardGroupCombSort = cardGroupCombSort;

function cardGroupComb(cardGroup) {
	var cbi = makeCardCombineInfo(cardGroup);
	var combs = {
		seq: fetchSeq(cbi),
		trip: fetchTriplet(cbi),
		seq3pair: fetchSeq3pair(cbi),
		seq4pair: fetchSeq4pair(cbi),
		pair: fetchPair(cbi),
		single: fetchSingle(cbi)
	};
	return combs;
}
GoSouthRule.cardGroupComb = cardGroupComb;
//================================结算部分开始=============================================
//轮结算
//param cards: 最後一個被打敗的牌
//param baseScore: 底注
function roundFinalEstimate(cards, baseScore) {
	var accumulateMultiple = 0;
	var check = {
		two: function() {
			if (getValue(cards[0]) == 13) {
				for (var _i = 0, cards_1 = cards; _i < cards_1.length; _i++) {
					var val = cards_1[_i];
					if ((val & 240 /* mask */) == 0x10 || (val & 240 /* mask */) == 0x20) {
						accumulateMultiple += 3;
					}
					else if ((val & 240 /* mask */) == 0x40 || (val & 240 /* mask */) == 0x80) {
						accumulateMultiple += 6;
					}
				}
			}
		},
		seq4pair: function() {
			if (isSeq4pair(makeCardIdentifyInfo(cards))) {
				accumulateMultiple = 12;
			}
		},
		seq3pair: function() {
			if (isSeq3pair(makeCardIdentifyInfo(cards))) {
				accumulateMultiple = 6;
			}
		},
		quad: function() {
			if (isQuadruplets(makeCardIdentifyInfo(cards))) {
				accumulateMultiple = 8;
			}
		}
	};
	for (var key in check) {
		check[key]();
	}
	return baseScore * accumulateMultiple;
}
GoSouthRule.roundFinalEstimate = roundFinalEstimate;
/*
function black2Accumulate(cards: number[]): number {
    let cnt = 0

    var Black2 = {
	spade: 0x1D,
	club: 0x2D,
    }

    var multiple_round = {
	black: 3,
	red: 6
    }

    for (let val of cards) {
	if (val == Black2.spade) {
	    cnt++
	}
	else if (val == Black2.club) {
	    cnt++
	}
    }
    return cnt * multiple_round.black
}

function red2Accumulate(cards: number[]): number {
    let cnt = 0

    var Red2 = {
	diamond: 0x4D,
	heart: 0x8D
    }

    var multiple_round = {
	black: 3,
	red: 6
    }

    for (let val of cards) {
	if (val == Red2.diamond) {
	    cnt++
	}
	else if (val == Red2.heart) {
	    cnt++
	}
    }
    return cnt * multiple_round.red
}
*/
//是否有2
function existCard2(cards) {
	for (var _i = 0, cards_2 = cards; _i < cards_2.length; _i++) {
		var val = cards_2[_i];
		if (getValue(val) == 0x0D) {
			return true;
		}
	}
	return false;
}
GoSouthRule.existCard2 = existCard2;
//是否有3
function existCardSpade3(cards) {
	for (var _i = 0, cards_3 = cards; _i < cards_3.length; _i++) {
		var val = cards_3[_i];
		if (getValue(val) == 0x01) {
			if (getColor(val) == 0x10) {
				return true;
			}
		}
	}
	return false;
}
GoSouthRule.existCardSpade3 = existCardSpade3;
//中途退出
function dropOut(baseScore) {
	return 13 * 4 * baseScore;
}
GoSouthRule.dropOut = dropOut;
//游戏结束
function gameOverEstimate(cards, baseScore) {
	if (cards.length == 0) {
		return 0;
	}
	var multiple_gameOver = {
		single: {
			black2: 2,
			red2: 4
		},
		seq3Pair: 6,
		same4: 8,
		seq4pair: 12,
		none: 1
	};
	var accumulateMultiple = 0;
	var restCardCnt = 0;
	var cardsCInfo = makeCardCombineInfo(cards);
	var seqExec = [fetchSeq4pair, fetchQuadruplets, fetchSeq3pair];
	for (var i = 0; i < seqExec.length; ++i) {
		var result = seqExec[i](cardsCInfo);
		if (result.length != 0) {
			if (i == 0) {
				accumulateMultiple += multiple_gameOver.seq4pair * result.length;
				log("seq4pair got!");
			}
			else if (i == 1) {
				accumulateMultiple += multiple_gameOver.same4 * result.length;
				log("quadruplets got!");
			}
			else if (i == 2) {
				accumulateMultiple += multiple_gameOver.seq3Pair * result.length;
				log("seq3pair got");
			}
		}
	}
	var color_2 = [];
	for (var i in cardsCInfo) {
		if (cardsCInfo[i].value == 13) {
			log("got %d card2", cardsCInfo[i].count);
			var card2cnt = cardsCInfo[i].count;
			for (var j = 0; j < card2cnt; ++j) {
				var colorInfo = fetchColor(cardsCInfo[i].colorMask);
				log("colorInfo is: ", colorInfo);
				cardsCInfo[i].colorMask = colorInfo.color;
				cardsCInfo[i].count -= 1;
				color_2.push(colorInfo.oneColor);
			}
			break;
		}
		else if (cardsCInfo[i].value != 13 && cardsCInfo[i].count != 0) {
			restCardCnt += cardsCInfo[i].count;
		}
	}
	log("color22222222222 is: ", color_2);
	for (var _i = 0, color_2_1 = color_2; _i < color_2_1.length; _i++) {
		var val = color_2_1[_i];
		if (val == 128 /* heart */ || val == 64 /* diamond */) {
			accumulateMultiple += multiple_gameOver.single.red2;
		}
		else if (val == 16 /* spade */ || val == 32 /* club */) {
			accumulateMultiple += multiple_gameOver.single.black2;
		}
	}
	accumulateMultiple += restCardCnt;
	if (accumulateMultiple != 0) {
		return accumulateMultiple * baseScore;
	}
	else {
		return restCardCnt * baseScore;
	}
}
GoSouthRule.gameOverEstimate = gameOverEstimate;
//自动胜的倍率
function perfectCardMultiple(typ) {
	var multiple = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	return multiple[typ];
}
GoSouthRule.perfectCardMultiple = perfectCardMultiple;
//获取一张最小的牌
function fetchMinSingle(cards) {
	var comb = makeCardCombineInfo(cards);
	var min = fetchSingle(comb)[0][0];
	return min;
	/*
    let max:CardCombineInfo = comb[1]
    let maxMinus:CardCombineInfo =  comb[0]
    let min:CardCombineInfo = {value:0, colorMask:0, count:0}
    for(let i=2; i<13; i++){
	if(comb[i].count != 0){
	    min = comb[i]
	}
	break
    }

    let colorInfo = {color:0, oneColor:0}
    for(let j=0; j<4; j++){
	colorInfo = fetchColor(min.colorMask)
	if(colorInfo.oneColor != -1){
	    break
	}
    }
    return min.value & colorInfo.oneColor
    */
}
GoSouthRule.fetchMinSingle = fetchMinSingle;
//================================结算部分结束=============================================
//测试
function test() {
	log('------------------------开始测试------------------------');
	var newCard = createNewCard();
	var symbol = [];
	var users = [];
	for (var i = 0; i < 4; ++i) {
		users.push(newCard.splice(0, 13));
		//users[1] = [0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x21, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D]
		var cardSymbol = "";
		for (var _i = 0, _a = users[i]; _i < _a.length; _i++) {
			var card = _a[_i];
			cardSymbol += getCardSymbol(card) + " ";
		}
		symbol.push(cardSymbol);
	}
	// log(newCard)
	// log(symbol)
	// users[1] = [0x11, 0x12, 0x13, 0x21, 0x22, 0x23, 0x41, 0x42, 0x43]
	//users[1] = [0x11, 0x21, 0x12, 0x22, 0x13, 0x23, 0x44, 0x84, 0x25, 0x15, 0x86, 0x46, 0x2A]
	//users[1] = [0x11, 0x22, 0x13, 0x24, 0x15, 0x26, 0x47, 0x88, 0x29, 0x1A, 0x8B, 0x4C, 0x2C]
	//users[1] = [0x81, 0x13, 0x23, 0x83, 0x24, 0x84, 0x17, 0x19, 0x29, 0x2A, 0x4A, 0x1D, 0x2D]
	var userCardInfos = [];
	users[1].forEach(function(value) {
		userCardInfos.push(getCardSymbol(value));
	});
	log("user1:");
	log(userCardInfos);
	var cardCInfo = makeCardCombineInfo(users[1]);
	function numberConverText(cards) {
		var texts = [];
		for (var i in cards) {
			var gorup = [];
			for (var j in cards[i]) {
				gorup.push(getCardSymbol(cards[i][j]));
			}
			texts.push(gorup);
		}
		return texts;
	}
	var testUnits = [
		// index 0
		function() {
			var _a;
			log("---------------------自动胜测试----------------");
			var pType = isPerfectCards(makeCardCombineInfo(users[1]));
			log(Perfect_EN[pType]);
			log("------------------------------------------");
			//return pType != PerfectType.neno
			var fetchFunc = (_a = {},
				_a[PerfectType.pair6] = fetchPair6,
				_a[PerfectType.oneGroupQuadruplets2] = fetchOneGroupQuadruplets2,
				_a[PerfectType.fiveSeqPair] = fetchFiveSeqPair,
				_a[PerfectType.sameColor12] = fetchSameColor12,
				_a[PerfectType.twoQuadruplets] = fetchTwoQuadruplets,
				_a[PerfectType.fourTriplet] = fetchFourTriplet,
				_a[PerfectType.sixSeqPair] = fetchSixSeqPair,
				_a[PerfectType.twelveSeq] = fetchTwelveSeq,
				_a);
			if (pType == PerfectType.sameColor12) {
				var tmp = [];
				for (var _i = 0, _b = fetchFunc[pType](makeCardCombineInfo(users[1])); _i < _b.length; _i++) {
					var val = _b[_i];
					tmp.push(getCardSymbol(val));
				}
				log("the perfect card is: ", tmp);
				return true;
			}
			else {
				return false;
			}
		},
		// index 1 
		function() {
			log("---------------------提示测试----------------");
			var c = users[0][0];
			if ((c & 0xF) > 0x9) {
				c = c & 0xF0 | 0x9;
			}
			var outCards = [c, c + 1, c + 2, c + 3];
			log(numberConverText([outCards]));
			var tipsCards = tips(outCards, users[1]);
			var showInfo = [];
			for (var i = 0; i < tipsCards.length; ++i) {
				var symbolInfo = [];
				for (var j = 0; j < tipsCards[i].length; ++j) {
					symbolInfo.push(getCardSymbol(tipsCards[i][j]));
				}
				showInfo.push(symbolInfo);
			}
			log(showInfo);
			log("-----------------------------------------");
			return showInfo.length > 0;
		},
		// index 2 
		function() {
			log("---------------------单张压牌测试----------------");
			var cloneCardCInfo = JSON.parse(JSON.stringify(cardCInfo));
			var kindPickInfo = makeKindPick(cloneCardCInfo);
			var showInfo = {};
			for (var i in kindPickInfo) {
				showInfo[CardKind[i]] = numberConverText(kindPickInfo[i]);
			}
			log(showInfo);
			log("user0:[%s] < user1:[%s]", getCardSymbol(users[0][0]), getCardSymbol(users[1][0]));
			log(isBetter([users[0][0]], [users[1][0]]));
			log("-------------------------------------------");
			return true;
		},
		// index 3
		function() {
			log("---------------------四连对测试----------------");
			// log(cardCInfo)
			var cloneCardCInfo = JSON.parse(JSON.stringify(cardCInfo));
			var seqArr = fetchSeq4pair(cloneCardCInfo);
			var infos = [];
			var isTestInfo = [];
			var kindInfos = [];
			for (var i = 0; i < seqArr.length; ++i) {
				var sInfo = [];
				for (var j = 0; j < seqArr[i].length; ++j) {
					sInfo.push(getCardSymbol(seqArr[i][j]));
				}
				infos.push(sInfo);
				isTestInfo.push(isSeq4pair(makeCardIdentifyInfo(seqArr[i])));
				kindInfos.push(CardKind[String(getCardKind(seqArr[i]))]);
			}
			log(infos);
			log(isTestInfo);
			log(kindInfos);
			log("-----------------------------------------");
			return seqArr.length > 0;
		},
		//index 4
		function() {
			log("---------------------三连对测试----------------");
			// log(cardCInfo)
			var cloneCardCInfo = JSON.parse(JSON.stringify(cardCInfo));
			var seqArr = fetchSeq3pair(cloneCardCInfo);
			var infos = [];
			var isTestInfo = [];
			var kindInfos = [];
			for (var i = 0; i < seqArr.length; ++i) {
				var sInfo = [];
				for (var j = 0; j < seqArr[i].length; ++j) {
					sInfo.push(getCardSymbol(seqArr[i][j]));
				}
				infos.push(sInfo);
				isTestInfo.push(isSeq3pair(makeCardIdentifyInfo(seqArr[i])));
				kindInfos.push(CardKind[String(getCardKind(seqArr[i]))]);
			}
			log(infos);
			log(isTestInfo);
			log(kindInfos);
			log("-----------------------------------------");
			return seqArr.length > 0;
		},
		//index 5
		function() {
			log("---------------------顺子测试----------------");
			// log(cardCInfo)
			var cloneCardCInfo = JSON.parse(JSON.stringify(cardCInfo));
			var seqArr = fetchSeq(cloneCardCInfo);
			var infos = [];
			var isTestInfo = [];
			var kindInfos = [];
			for (var i = 0; i < seqArr.length; ++i) {
				var sInfo = [];
				for (var j = 0; j < seqArr[i].length; ++j) {
					sInfo.push(getCardSymbol(seqArr[i][j]));
				}
				infos.push(sInfo);
				isTestInfo.push(isSeq(makeCardIdentifyInfo(seqArr[i])));
				kindInfos.push(CardKind[String(getCardKind(seqArr[i]))]);
			}
			log(infos);
			log(isTestInfo);
			log(kindInfos);
			log("-----------------------------------------");
			return seqArr.length > 0;
		},
		//index 6
		function() {
			log("---------------------四张测试----------------");
			// log(cardCInfo)
			var cloneCardCInfo = JSON.parse(JSON.stringify(cardCInfo));
			var four = fetchQuadruplets(cloneCardCInfo);
			var infos = [];
			var isTestInfo = [];
			var kindInfos = [];
			for (var _i = 0, four_1 = four; _i < four_1.length; _i++) {
				var t = four_1[_i];
				infos.push([
					getCardSymbol(t[0]),
					getCardSymbol(t[1]),
					getCardSymbol(t[2]),
					getCardSymbol(t[3]),
				]);
				isTestInfo.push(isQuadruplets(makeCardIdentifyInfo(t)));
				kindInfos.push(CardKind[String(getCardKind(t))]);
			}
			log(infos);
			log(isTestInfo);
			log(kindInfos);
			log("-----------------------------------------");
			return four.length > 0;
		},
		//index 7
		function() {
			log("---------------------三张测试----------------");
			// log(cardCInfo)
			var cloneCardCInfo = JSON.parse(JSON.stringify(cardCInfo));
			var triplet = fetchTriplet(cloneCardCInfo);
			var infos = [];
			var isTestInfo = [];
			var kindInfos = [];
			for (var _i = 0, triplet_1 = triplet; _i < triplet_1.length; _i++) {
				var t = triplet_1[_i];
				infos.push([
					getCardSymbol(t[0]),
					getCardSymbol(t[1]),
					getCardSymbol(t[2]),
				]);
				isTestInfo.push(isTriplet(makeCardIdentifyInfo(t)));
				kindInfos.push(CardKind[String(getCardKind(t))]);
			}
			log(infos);
			log(isTestInfo);
			log(kindInfos);
			// log(cardCInfo)
			log("-----------------------------------------");
			return triplet.length > 0;
		},
		//index 8
		function() {
			log("---------------------对子测试----------------");
			// log(cardCInfo)
			var cloneCardCInfo = JSON.parse(JSON.stringify(cardCInfo));
			var pair = fetchPair(cloneCardCInfo);
			var infos = [];
			var isTestInfo = [];
			var kindInfos = [];
			for (var _i = 0, pair_1 = pair; _i < pair_1.length; _i++) {
				var p = pair_1[_i];
				infos.push([
					getCardSymbol(p[0]),
					getCardSymbol(p[1]),
				]);
				isTestInfo.push(isPair(makeCardIdentifyInfo(p)));
				kindInfos.push(CardKind[String(getCardKind(p))]);
			}
			log(infos);
			log(isTestInfo);
			log(kindInfos);
			// log(cardCInfo)
			log("-----------------------------------------");
			return pair.length > 0;
		},
		//index 9
		function() {
			log("---------------------单张测试----------------");
			var cloneCardCInfo = JSON.parse(JSON.stringify(cardCInfo));
			var single = fetchSingle(cloneCardCInfo);
			var infos = [];
			var isTestInfo = [];
			var kindInfos = [];
			single.forEach(function(value, index) {
				infos.push([getCardSymbol(value[0])]);
				isTestInfo.push(isSingle(makeCardIdentifyInfo(value)));
				kindInfos.push(CardKind[String(getCardKind(value))]);
			});
			log(infos);
			log(isTestInfo);
			log(kindInfos);
			log("-----------------------------------------");
			return single.length > 0;
		},
		//index 10
		function() {
			log("---------------------轮结算测试----------------");
			var userCardInfos = [];
			var testCard = [0x13, 0x43, 0x24, 0x44, 0x15, 0x45, 0x46, 0x86];
			for (var _i = 0, testCard_1 = testCard; _i < testCard_1.length; _i++) {
				var val = testCard_1[_i];
				userCardInfos.push(getCardSymbol(val));
			}
			log(userCardInfos);
			var roundM = roundFinalEstimate([0x13, 0x43, 0x24, 0x44, 0x15, 0x45, 0x46, 0x86], 8);
			log('round final estimate is: %d', roundM);
			log("-----------------------------------------");
			return roundM > 0;
		},
		//index 11
		function() {
			log("---------------------中途退出结算测试----------------");
			var baseScore = dropOut(10);
			log('drop out loss: %d base score', baseScore);
			log("-----------------------------------------");
			return baseScore == 0;
		},
		//index 12
		function() {
			log("---------------------游戏结束结算测试----------------");
			var mul = gameOverEstimate(users[1], 300);
			log('multiple accumulate up to: %d', mul);
			log("-----------------------------------------");
			return mul > 1200;
		},
		//index 13
		function() {
			log("---------------------自动胜倍率返回测试----------------");
			var mul = perfectCardMultiple(PerfectType.twelveSeq);
			log('multiple corresponding to: %d', mul);
			log("-----------------------------------------");
			return mul != 0;
		},
		//index 14
		function() {
			log("--------------------卡組按牌型排序測試-----------------");
			var newSort = cardGroupCombSort(users[1]);
			for (var _i = 0, newSort_1 = newSort; _i < newSort_1.length; _i++) {
				var val = newSort_1[_i];
				log(getCardSymbol(val));
			}
			return true;
		}
	];
	var isDone = false;
	/*
	for (let i = 0; i < testUnits.length; ++i) {
	    testUnits[0]()
	}
	*/
	isDone = testUnits[10]();
	loopCount += 1;
	if (isDone) {
		log('------------------------结束测试: %d ------------------------', loopCount);
	}
	else {
		log('------------------------继续测试: %d ------------------------', loopCount);
	}
	return isDone;
}
GoSouthRule.test = test;
/*
export function testPlay(){
let newCard:number[] = createNewCard()
let symbol:string[] = []
let users:number[][] = []
for(let i=0; i<4; ++i){
    users.push(
    newCard.splice(0, 13)
    )

    let cardSymbol:string = ""
    for(let card of users[i]){
    cardSymbol += getCardSymbol(card) + " "
    }
    symbol.push(cardSymbol)
}

}
*/
//}) (GoSouthRule = exports.GoSouthRule || (exports.GoSouthRule = {}));
/*
function run() {
    while (1) {
	if (GoSouthRule.test()) {
	    break
	}
    }
}


run()

/*
function run() {
    if(GoSouthRule.test()==false){
    //     // setTimeout(run, 3000)
     run()
    }
    // while(true){
    //     GoSouthRule.testPlay()
    // }
}



run()
*/
function numberConverText(cards) {
	var texts = [];
	for (var i in cards) {
		var gorup = [];
		for (var j in cards[i]) {
			gorup.push(GoSouthRule.getCardSymbol(cards[i][j]));
		}
		texts.push(gorup);
	}
	return texts;
}
/*
function run() {
    if (GoSouthRule.isBetter([38, 134, 23, 71, 40, 72], [0x19, 0x29, 0x49, 0x89])) {
	GoSouthRule.log("quads can beat seq3pair")
    }
}
*/

/*
function run() {
	var ret = [];
	//ret = GoSouthRule.tips([0x13, 0x24, 0x15, 0x16, 0x17], [0x21, 0x41, 0x12, 0x22, 0x23, 0x43, 0x14, 0x25, 0x86, 0x87, 0x28])
	//ret = GoSouthRule.tips([35, 132, 21, 38, 23], [20, 136, 68, 77, 134, 34, 37, 70, 27, 140, 129, 24, 135])
	//ret = GoSouthRule.tips([0x11, 0x21, 0x12, 0x22, 0x13, 0x23, 0x14, 0x24], [0x42, 0x82, 0x43, 0x83, 0x44, 0x84, 0x45, 0x85, 0x46, 0x4C, 0x4D])
	//ret = GoSouthRule.tips([0x11, 0x21, 0x12, 0x22, 0x13, 0x23, 0x14, 0x24], [0x18, 0x28, 0x19, 0x29, 0x1A, 0x2A, 0x1B, 0x2B, 0x2C, 0x2D])
	//ret = GoSouthRule.tips([17, 33, 18, 34, 19, 35, 20, 36], [24, 40, 25, 41, 26, 42, 27, 43])
	var testCard = [65, 18, 68, 132, 136, 25, 41, 73, 137, 74, 141];
	//let testCard: number[] = [38, 134, 23, 71, 40, 72]
	var userCardInfos = [];
	for (var _i = 0, testCard_2 = testCard; _i < testCard_2.length; _i++) {
		var val = testCard_2[_i];
		userCardInfos.push(GoSouthRule.getCardSymbol(val));
	}
	GoSouthRule.log(userCardInfos);
	//ret = GoSouthRule.tips([137], [33, 65, 130, 35, 67, 131, 41, 26, 42, 138, 27, 75, 139])
	ret = GoSouthRule.tips([38, 134, 23, 71, 40, 72], [65, 18, 68, 132, 136, 25, 41, 73, 137, 74, 141]);
	GoSouthRule.log(numberConverText(ret));
}
/*
function run(){
    GoSouthRule.log(GoSouthRule.gameOverEstimate([65,67,26,75,35,71,43,138,19,131,39], 10.00))
}
*/
/*
function run(){
    GoSouthRule.log(GoSouthRule.fetchMinSingle([137,65,75,42,29,130,20,138,45,136,69,140,77]))
}
*/
/*
function numberConverText(cards: number[][]): string[][] {
    let texts: string[][] = []
    for (let i in cards) {
	let gorup: string[] = []
	for (let j in cards[i]) {
	    gorup.push(GoSouthRule.getCardSymbol(cards[i][j]))
	}
	texts.push(gorup)
    }
    return texts
}
*/
//run();
