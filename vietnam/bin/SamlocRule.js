/*
"use strict";
exports.__esModule = true;
exports.SamlocRule = void 0;
*/
var SamlocRule = {}
//(function (SamlocRule) {
var _a;
//============================================================================================
//测试变量区
//============================================================================================
var loopCount = 0;
//============================================================================================
//牌区
//============================================================================================
//牌组成 0x0F(点数) + 0xF0(花色) 组成
SamlocRule.CardGroup = [
	//3,4,5,6,7,8,9,10,J,Q,K,A,2
	0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D,
	0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D,
	0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A, 0x4B, 0x4C, 0x4D,
	0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8A, 0x8B, 0x8C, 0x8D, // 红桃
];
//值掩码
var ValueMask = 0xF;
//真实牌值映射
var RealCardVal = (_a = {},
	_a[13] = 2,
	_a[12] = 1,
	_a[11] = 13,
	_a[10] = 12,
	_a[9] = 11,
	_a[8] = 10,
	_a[7] = 9,
	_a[6] = 8,
	_a[5] = 7,
	_a[4] = 6,
	_a[3] = 5,
	_a[2] = 4,
	_a[1] = 3,
	_a);
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
	 * 双4同
	 */
	CardKind[CardKind["twoQuadruplets"] = 6] = "twoQuadruplets";
	/**
	 * 错误种类
	 */
	CardKind[CardKind["none"] = -1] = "none";
})(CardKind = SamlocRule.CardKind || (SamlocRule.CardKind = {}));
//完美牌类型(自动胜)
var PerfectType;
(function(PerfectType) {
	PerfectType[PerfectType["neno"] = 0] = "neno";
	PerfectType[PerfectType["fivePair"] = 1] = "fivePair";
	PerfectType[PerfectType["threeTriplet"] = 2] = "threeTriplet";
	PerfectType[PerfectType["tenSameColor"] = 3] = "tenSameColor";
	PerfectType[PerfectType["fourTwo"] = 4] = "fourTwo";
	PerfectType[PerfectType["tenSeq"] = 5] = "tenSeq";
})(PerfectType = SamlocRule.PerfectType || (SamlocRule.PerfectType = {}));
var PerfectZH_CN = ["没有", "5对", "3组3同", "10张同色", "4张2", "10张顺"];
var Perfect_EN = ["neno", "fivePair", "threeTriple", "tenSameColor", "fourTwo", "tenSeq"];
//============================================================================================
//导出部分
//============================================================================================
//--------------------------------------------------------------------------------------------
//日志部分
//--------------------------------------------------------------------------------------------
function log() {
	var data = [];
	for (var _i = 0; _i < arguments.length; _i++) {
		data[_i] = arguments[_i];
	}
	// console.log.apply(console, data);
}
SamlocRule.log = log;
function error() {
	var data = [];
	for (var _i = 0; _i < arguments.length; _i++) {
		data[_i] = arguments[_i];
	}
	console.trace.apply(console, data);
}
//--------------------------------------------------------------------------------------------
//扑克部分
//--------------------------------------------------------------------------------------------
function getValue(card) {
	return card & ValueMask;
}
SamlocRule.getValue = getValue;
//牌值转索引
function cardValueConvertIndex(cardValue) {
	return cardValue - 1;
}
//获取花色
function getColor(card) {
	return card & 240 /* mask */;
}
SamlocRule.getColor = getColor;
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
SamlocRule.makeCardCombineInfo = makeCardCombineInfo;
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
SamlocRule.makeCardIdentifyInfo = makeCardIdentifyInfo;
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
		{ Kind: CardKind.twoQuadruplets, exec: fetchTwoQuadruplets },
		{ kind: CardKind.seq3pair, exec: fetchSeq3pair },
		{ kind: CardKind.quadruplets, exec: fetchQuadruplets },
		{ kind: CardKind.seq, exec: fetchSeq },
		{ kind: CardKind.triplet, exec: fetchTriplet },
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
SamlocRule.makeKindPick = makeKindPick;
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
SamlocRule.fetchQuadruplets = fetchQuadruplets;
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
SamlocRule.fetchSeq3pair = fetchSeq3pair;
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
SamlocRule.fetchSeq = fetchSeq;
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
SamlocRule.fetchTriplet = fetchTriplet;
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
SamlocRule.fetchPair = fetchPair;
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
SamlocRule.fetchSingle = fetchSingle;
//取最多的2
function fetch2s(cardsCInfo) {
	var cnt = cardsCInfo[12].count;
	var tmpCards = [];
	var cards = [];
	for (var i = 0; i < cnt; i++) {
		var tmpColor = fetchColor(cardsCInfo[12].colorMask);
		cardsCInfo[12].colorMask = tmpColor.color;
		cardsCInfo[12].count -= 1;
		tmpCards.push(mergeCard(cardsCInfo[12].value, tmpColor.oneColor));
	}
	cards.push(tmpCards);
	return cards;
}
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
	var getSingleExecs = function(value) {
		if (value == 0xD) {
			return [fetchQuadruplets];
		}
		return [fetchSingle];
	};
	var getPairleExecs = function(value) {
		if (value == 0xD) {
			return [fetchTwoQuadruplets];
		}
		return [fetchPair];
	};
	var pickExec = (_a = {},
		_a[CardKind.twoQuadruplets] = [fetchTwoQuadruplets],
		_a[CardKind.seq3pair] = [fetchSeq3pair, fetchQuadruplets],
		_a[CardKind.quadruplets] = [fetchQuadruplets],
		_a[CardKind.seq] = [fetchSeq],
		_a[CardKind.triplet] = [fetchTriplet],
		_a[CardKind.pair] = getPairleExecs(cardsIInfo.value),
		_a[CardKind.single] = getSingleExecs(cardsIInfo.value),
		_a);
	var execs = pickExec[kind];
	var tipsCards = [];
	//提取
	var cardsCInfo = makeCardCombineInfo(cards);
	for (var i = 0; i < execs.length; ++i) {
		//通过克隆产生多种牌型组合，以免被组成别的牌，而导致不能和别的牌组合
		var cloneCardCInfo = JSON.parse(JSON.stringify(cardsCInfo));
		var assembly = execs[i](cloneCardCInfo);
		log("assembly is: ", assembly);
		var testSeq = [];
		for (var j = 0; j < assembly.length; ++j) {
			var testInfo = [];
			for (var t = 0; t < assembly[j].length; ++t) {
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
SamlocRule.tips = tips;
/**
 * 获取牌种类
 * @param cards 牌组
 * @returns 种类
 */
function getCardKind(cards) {
	var ck = CardKind.none;
	var isCardKinds = [
		{ is: isDoubleQuadruplets, kind: CardKind.twoQuadruplets },
		{ is: isSeq3pair, kind: CardKind.seq3pair },
		{ is: isQuadruplets, kind: CardKind.quadruplets },
		{ is: isSeq, kind: CardKind.seq },
		{ is: isTriplet, kind: CardKind.triplet },
		{ is: isPair, kind: CardKind.pair },
		{ is: isSingle, kind: CardKind.single }
	];
	var cardsCInfo = makeCardIdentifyInfo(cards);
	for (var i = 0; i < isCardKinds.length; ++i) {
		log("i is: ", i);
		log("isCardKinds[i] is: ", isCardKinds[i]);
		var _a = isCardKinds[i], is = _a.is, kind = _a.kind;
		log(isCardKinds[i]);
		if (is(cardsCInfo)) {
			log("is is: ", is);
			log("kind is: ", kind);
			ck = kind;
			break;
		}
	}
	return ck;
}
SamlocRule.getCardKind = getCardKind;
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
SamlocRule.getCardSymbol = getCardSymbol;
/**
 * 是否能压
 * @param aCards A的牌
 * @param bCards B的牌
 * @returns B是否能打能A
 */
function isBetter(aCards, bCards) {
	var _a, _b, _c, _d, _e;
	var aKind = getCardKind(aCards);
	log("aKind is: ", aKind);
	var bKind = getCardKind(bCards);
	log("bKind is: ", bKind);
	var betterJudge = (_a = {},
		_a[CardKind.none] = function(a, b) {
			error("isBetter:", a, b);
		},
		_a[CardKind.single] = isBetterSingle,
		_a[CardKind.pair] = isBetterPair,
		_a[CardKind.triplet] = isBetterTriplet,
		_a[CardKind.seq] = isBetterSeq,
		_a[CardKind.quadruplets] = isBetterQuadruplets,
		_a[CardKind.seq3pair] = isBetterSeq3pair,
		_a[CardKind.twoQuadruplets] = isBetterTwoQuadruplets,
		_a);
	var a = makeCardIdentifyInfo(aCards);
	var b = makeCardIdentifyInfo(bCards);
	if (aKind == bKind) {
		return betterJudge[aKind](a, b);
	}
	//跨牌型处理 单2 和对2 3连对 4张 4连对允许跨牌型
	else if (((aKind == CardKind.single || aKind == CardKind.pair) && a[0].value == 0xD) ||
		aKind == CardKind.seq3pair) {
		log("kinds not same");
		var allowCrossKind = (_b = {},
			_b[CardKind.single] = (_c = {},
				_c[CardKind.quadruplets] = true,
				_c),
			_b[CardKind.pair] = (_d = {},
				_d[CardKind.twoQuadruplets] = true,
				_d),
			_b[CardKind.seq3pair] = (_e = {},
				_e[CardKind.quadruplets] = true,
				_e),
			_b);
		if (allowCrossKind[aKind][bKind]) {
			log("could overcome different type to beat");
			return true;
		}
	}
	return false;
}
SamlocRule.isBetter = isBetter;
//获取1组4张
function fetchOneQuadruplet(cardsCInfo) {
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
			break;
		}
	}
	return cards;
}
//获取2组4张
function fetchTwoQuadruplets(cardsCInfo) {
	if (cardsCInfo.length == 0) {
		return [];
	}
	var tmp = [];
	var cards = [];
	var cnt = 0;
	for (var i = 0; i < cardsCInfo.length; ++i) {
		if (cardsCInfo[i].count == 4) {
			cnt++;
			var one = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = one.color;
			var two = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = two.color;
			var three = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = three.color;
			var four = fetchColor(cardsCInfo[i].colorMask);
			cardsCInfo[i].colorMask = four.color;
			cardsCInfo[i].count -= 4;
			tmp.push(mergeCard(cardsCInfo[i].value, one.oneColor));
			tmp.push(mergeCard(cardsCInfo[i].value, two.oneColor));
			tmp.push(mergeCard(cardsCInfo[i].value, three.oneColor));
			tmp.push(mergeCard(cardsCInfo[i].value, four.oneColor));
			if (cnt == 2) {
				break;
			}
		}
	}
	if (cnt == 2) {
		cards.push(tmp);
		return cards;
	}
	else {
		return [];
	}
}
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
 * 顺子,有2必有3且必无6，7，8，9，10，J，Q，K
 *
 */
function isSeq(cardsCInfo) {
	if (cardsCInfo.length < 3) {
		return false;
	}
	var cardValArr = [];
	for (var _i = 0, cardsCInfo_1 = cardsCInfo; _i < cardsCInfo_1.length; _i++) {
		var val = cardsCInfo_1[_i];
		cardValArr.push(val.value);
	}
	if (!exist2(cardsCInfo)) {
		if (cardsCInfo[0].count != 1) {
			return false;
		}
		var checkValue = cardsCInfo[0].value + 1;
		for (var i = 1; i < cardsCInfo.length; ++i) {
			if (checkValue != cardsCInfo[i].value || cardsCInfo[i].count != 1) {
				return false;
			}
			checkValue = checkValue + 1;
		}
		return true;
	}
	else {
		var result = isLegal2seq(cardsCInfo);
		if (result.truth) {
			return true;
		}
		return false;
	}
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
 * 双四张
 */
function isDoubleQuadruplets(cardsCInfo) {
	if (cardsCInfo.length != 2) {
		return false;
	}
	if ((cardsCInfo[0].count != 4) || (cardsCInfo[1].count != 4)) {
		return false;
	}
	return true;
}
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
	return false;
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
	if (!isSeq(aCardsCInfo) || !isSeq(bCardsCInfo)) {
		return false;
	}
	var a_index = aCardsCInfo.length - 1;
	var b_index = bCardsCInfo.length - 1;
	/*
	//获取用于比较的牌值
	let getCompVal = (val: CardIdentifyInfo[], idx: number): number => {
	    let result = isLegal2seq(val)
	    if (result.truth) {
		log("legal: ", result.lastVal)
		return result.lastVal
	    } else {
		log("illegal: ", RealCardVal[val[idx].value])
		return RealCardVal[val[idx].value]
	    }
	}
	*/
	//return (getCompVal(aCardsCInfo, a_index) < getCompVal(bCardsCInfo, b_index))
	return betterCompete(aCardsCInfo[a_index], bCardsCInfo[b_index]);
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
	if (!isSeq3pair(aCardsCInfo) || !isSeq3pair(bCardsCInfo)) {
		return false;
	}
	var index = aCardsCInfo.length - 1;
	return betterCompete(aCardsCInfo[index], bCardsCInfo[index]);
}
/**
 * 双四同压牌 b是否能压a
 * @param aCardsCInfo a识别信息
 * @param bCardsCInfo b识别信息
 * @returns b是否能压a
 */
function isBetterTwoQuadruplets(aCardsCInfo, bCardsCInfo) {
	if (aCardsCInfo.length != 2 || bCardsCInfo.length != 2) {
		return false;
	}
	if (!isDoubleQuadruplets(aCardsCInfo) || !isDoubleQuadruplets(bCardsCInfo)) {
		return false;
	}
	var index = aCardsCInfo.length - 1;
	return betterCompete(aCardsCInfo[index], bCardsCInfo[index]);
}
/**
 * 完美牌(自动胜)
 * @param cardsCInfo 牌信息
 * @returns 类型
 */
function isPerfectCards(cardsCInfo) {
	var checks = [
		[PerfectType.tenSeq, isPerfectTenSeq],
		[PerfectType.fourTwo, isPerfectOneGroupQuadruplets2],
		[PerfectType.tenSameColor, isPerfectTenSameColor],
		[PerfectType.threeTriplet, isPerfectThreeTriplet],
		[PerfectType.fivePair, isPerfectFivePair]
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
SamlocRule.isPerfectCards = isPerfectCards;
// 10连张
function isPerfectTenSeq(cardsCInfo) {
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
		if (seq.length == 10) {
			return true;
		}
	}
	return false;
}
//获取10连张
function fetchTenSeq(cardsCInfo) {
	var single_arr = fetchSingle(cardsCInfo);
	var result_arr = [];
	for (var _i = 0, single_arr_1 = single_arr; _i < single_arr_1.length; _i++) {
		var val = single_arr_1[_i];
		for (var _a = 0, val_1 = val; _a < val_1.length; _a++) {
			var vall = val_1[_a];
			if (result_arr.length != 0) {
				var len = result_arr.length;
				if (Math.abs(getValue(vall) - getValue(result_arr[len - 1])) == 1 && getValue(vall) != 13) {
					result_arr.push(vall);
					if (result_arr.length == 10) {
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
	if (result_arr.length != 10) {
		log("error");
		return result_arr;
	}
}
SamlocRule.fetchTenSeq = fetchTenSeq;
//1组4张2
function isPerfectOneGroupQuadruplets2(cardsCInfo) {
	var card2 = cardsCInfo[cardsCInfo.length - 1];
	if (card2.value != 0xD) {
		error("isPerfectOneGroupQuadruplets2:%s", "传入参数不对");
	}
	return card2.count == 4;
}
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
SamlocRule.fetchOneGroupQuadruplets2 = fetchOneGroupQuadruplets2;
//5连对
function isPerfectFivePair(cardsCInfo) {
	var fivePair = [];
	//按正常顺序扫描
	var push = function(card) {
		if (card.count >= 2) {
			fivePair.push(card);
			if (card.count == 4) {
				fivePair.push(card);
			}
		}
	};
	for (var i = 0; i < cardsCInfo.length; ++i) {
		push(cardsCInfo[i]);
	}
	if (fivePair.length == 5) {
		return true;
	}
	return false;
}
SamlocRule.isPerfectFivePair = isPerfectFivePair;
//获取5连对
function fetchFivePair(cardCInfo) {
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
SamlocRule.fetchFivePair = fetchFivePair;
//10张同色
function isPerfectTenSameColor(cardsCInfo) {
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
				error("isPerfectSameColor10:%s", "提取了错误的颜色", colorInfo);
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
	return colorCountInfo[16 /* spade */] >= 10 ||
		colorCountInfo[32 /* club */] >= 10 ||
		colorCountInfo[64 /* diamond */] >= 10 ||
		colorCountInfo[128 /* heart */] >= 10;
}
//获取10张同色
function fetchTenSameColor(cardsCInfo) {
	var theSameColor = 0;
	var result_arr = [];
	for (var i = 0; i < 3; i++) {
		if (cardsCInfo[i].count == 1) {
			theSameColor = cardsCInfo[i].colorMask;
		}
	}
	var singles_arr = fetchSingle(cardsCInfo);
	var cnt = 10;
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
SamlocRule.fetchTenSameColor = fetchTenSameColor;
//3组3张
function isPerfectThreeTriplet(cardsCInfo) {
	var triplet = [];
	var push = function(card) {
		if (card.count >= 3) {
			triplet.push(card);
		}
	};
	for (var i = 0; i < cardsCInfo.length; ++i) {
		push(cardsCInfo[i]);
	}
	return triplet.length == 3;
}
//获取3组3张
function fetchThreeTriplet(cardsCInfo) {
	var triplet_arr = fetchTriplet(cardsCInfo);
	var result_arr = [];
	if (triplet_arr.length == 3) {
		for (var _i = 0, triplet_arr_1 = triplet_arr; _i < triplet_arr_1.length; _i++) {
			var val = triplet_arr_1[_i];
			for (var _a = 0, val_5 = val; _a < val_5.length; _a++) {
				var vall = val_5[_a];
				result_arr.push(vall);
			}
		}
	}
	return result_arr;
}
SamlocRule.fetchThreeTriplet = fetchThreeTriplet;
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
SamlocRule.cardGroupSort = cardGroupSort;
/**
  * 卡组排序
* - 牌值 大 > 小 色值大 > 小
* @param cardGroup 卡组（该函数会直接改变该数组）
*/
function cardGroupDescendingSort(cardGroup) {
	var _this = this;
	cardGroup.sort(function(a, b) {
		var va = _this.getValue(a);
		var vb = _this.getValue(b);
		if (va != vb) {
			return vb - va;
		}
		return getColor(b) - _this.getColor(a);
	});
	return cardGroup;
}
SamlocRule.cardGroupDescendingSort = cardGroupDescendingSort;
/**
    * 卡組按照牌型排序
* - 牌組順序 - 順子 三條 三連對 四條 對子 單張
* @param cardGroup 卡组（该函数会直接改变该数组）
*/
function cardGroupCombSort(cardGroup) {
	var newSort = [];
	var cbi = makeCardCombineInfo(cardGroup);
	var tmp_cbi = [];
	var extract = function(value) {
		for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
			var v = value_1[_i];
			for (var _a = 0, v_1 = v; _a < v_1.length; _a++) {
				var vv = v_1[_a];
				newSort.push(vv);
			}
		}
	};
	var locate = function(val) {
		if (seqAfterX(cardGroup) == val) {
			return cbi;
		}
		else {
			return tmp_cbi;
		}
	};
	var combs = {
		vrSeq1: fetchSeq(locate(seqAfterXX.tq)),
		twoQuads: fetchTwoQuadruplets(cbi),
		vrSeq2: fetchSeq(locate(seqAfterXX.tp)),
		seq3pair: fetchSeq3pair(cbi),
		vrSeq3: fetchSeq(locate(seqAfterXX.sq)),
		quad: fetchOneQuadruplet(cbi),
		trip: fetchTriplet(cbi),
		pair: fetchPair(cbi),
		single: fetchSingle(cbi)
	};
	for (var key in combs) {
		extract(combs[key]);
	}
	return newSort;
}
SamlocRule.cardGroupCombSort = cardGroupCombSort;

function cardGroupComb(cardGroup) {
	var cbi = makeCardCombineInfo(cardGroup);
	var combs = {
		seq: fetchSeq(cbi),
		trip: fetchTriplet(cbi),
		seq3pair: fetchSeq3pair(cbi),
		seq4pair: fetchOneQuadruplet(cbi),
		seqtwo4pair: fetchTwoQuadruplets(cbi),
		pair: fetchPair(cbi),
		single: fetchSingle(cbi)
	};
	return combs;
}
SamlocRule.cardGroupComb = cardGroupComb;

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
SamlocRule.existCard2 = existCard2;

// 牌排序顺子长度最长比哪种牌型长
var seqAfterXX;
(function(seqAfterXX) {
	seqAfterXX[seqAfterXX["tq"] = 11] = "tq";
	seqAfterXX[seqAfterXX["tp"] = 12] = "tp";
	seqAfterXX[seqAfterXX["sq"] = 13] = "sq";
})(seqAfterXX || (seqAfterXX = {}));
//判断顺子的张数决定顺子排在哪种牌型之后
function seqAfterX(cardGroup) {
	var _a;
	var cbi = makeCardCombineInfo(cardGroup);
	var seq = fetchSeq(cbi);
	//let len: number = 0
	var lenPick = (_a = {},
		_a[CardKind.twoQuadruplets] = { leng: 8, ret: seqAfterXX.tq },
		_a[CardKind.seq3pair] = { leng: 6, ret: seqAfterXX.tp },
		_a[CardKind.quadruplets] = { leng: 4, ret: seqAfterXX.sq },
		_a);
	for (var key in lenPick) {
		for (var i in seq) {
			if (seq[i].length > lenPick[key].leng) {
				return lenPick[key].ret;
			}
		}
	}
	return CardKind.none;
}
//判断牌组是否存在2
function exist2(cardGroup) {
	for (var _i = 0, cardGroup_1 = cardGroup; _i < cardGroup_1.length; _i++) {
		var val = cardGroup_1[_i];
		if (val.count >= 0 && val.value == 13) {
			return true;
		}
	}
	return false;
}
//判断是否为包含2的合法顺子
function isLegal2seq(cardGroup) {
	var arr = [];
	for (var _i = 0, cardGroup_2 = cardGroup; _i < cardGroup_2.length; _i++) {
		var val = cardGroup_2[_i];
		if (RealCardVal[val.value] < 1 && RealCardVal[val.value] > 5) {
			return { truth: false, lastVal: -1 };
		}
		arr.push(RealCardVal[val.value]);
	}
	if (arr.length == 0) {
		return { truth: false, lastVal: -1 };
	}
	arr.sort(function(a, b) { return a - b; });
	log(arr);
	for (var i = 0; i < arr.length - 1; i++) {
		if ((arr[i] + 1) != arr[i + 1]) {
			return { truth: false, lastVal: -1 };
		}
	}
	return { truth: true, lastVal: arr[arr.length - 1] };
}
function getVersion() {
	log("beta 3.0");
}
/**
 * 产生一副新牌
 */
function createNewCard() {
	var newCard = [];
	var count = SamlocRule.CardGroup.length;
	var cloneCardGroup = JSON.parse(JSON.stringify(SamlocRule.CardGroup));
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
//获取一张最小的牌
function fetchMinSingle(cards) {
	var comb = makeCardCombineInfo(cards);
	var min = fetchSingle(comb)[0][0];
	return min;
}
SamlocRule.fetchMinSingle = fetchMinSingle;
//中途结算
//b是已经打出的能压过上一个玩家出的牌的牌
function midwaySettlement(b) {
	var a_result = isQuadruplets(makeCardIdentifyInfo(b));
	var b_result = isDoubleQuadruplets(makeCardIdentifyInfo(b));
	if (b_result == true || a_result == true) {
		return 15;
	}
	else {
		return 1;
	}
}
SamlocRule.midwaySettlement = midwaySettlement;
//有报Sam的最终结算,返回的倍数是针对一个玩家
function settlementWithSam(stat) {
	var _a;
	var exec = (_a = {},
		_a[1 /* Defeated */] = 20,
		_a[2 /* Suicide */] = 15,
		_a[3 /* Win */] = 20,
		_a);
	return exec[stat];
}
SamlocRule.settlementWithSam = settlementWithSam;
//无报Sam的最终结算,单个输家扣的分
function settlementWithoutSam(cards) {
	if (cards.length == 0) {
		return -1;
	}
	if (notOneOut(cards)) {
		return notOneOutSettlement(cards);
	}
	else {
		return beenOutSettlement(cards);
	}
}
SamlocRule.settlementWithoutSam = settlementWithoutSam;
//所有局，判断某个玩家最后是否出了2或4条，是的话，应该赔付给其每个玩家的倍数
function lastSpecialCards(cards) {
	if (exist2or4q(cards) != 0) {
		return 15;
	}
	return 1;
}
SamlocRule.lastSpecialCards = lastSpecialCards;
//是否一张牌都没出
function notOneOut(cards) {
	if (cards.length == 10) {
		return true;
	}
	return false;
}
//一张牌都没出的结算
function notOneOutSettlement(cards) {
	if (exist2or4q(cards) == 2) {
		return 47;
	}
	else if (exist2or4q(cards) == 1) {
		return 32;
	}
	else if (exist2or4q(cards) == 0) {
		return 17;
	}
}
//出过牌的结算
function beenOutSettlement(cards) {
	if (exist2or4q(cards) == 0) {
		return cards.length;
	}
	else if (exist2or4q(cards) == 1) {
		return (cards.length + 15);
	}
	else if (exist2or4q(cards) == 2) {
		return (cards.length + 30);
	}
}
//检查牌中是否有2或4条
function exist2or4q(cards) {
	var exist4q = function(val) {
		var quads = fetchQuadruplets(makeCardCombineInfo(cards));
		if (quads.length > 0) {
			return true;
		}
		return false;
	};
	var exec = [
		exist2, exist4q
	];
	var cnt = 0;
	for (var _i = 0, exec_1 = exec; _i < exec_1.length; _i++) {
		var func = exec_1[_i];
		if (func(makeCardIdentifyInfo(cards))) {
			cnt++;
		}
	}
	return cnt;
}
SamlocRule.exist2or4q = exist2or4q;
//自动胜的结算,输家要扣的倍数
function autoWinSettlement(cards) {
	return 20;
}
SamlocRule.autoWinSettlement = autoWinSettlement;
//牌局结束摊牌时要调用的排序函数,2s和4同排最前，剩下降序
function endSort(cards) {
	var newSort = [];
	var cbi = makeCardCombineInfo(cards);
	var extract = function(value) {
		//for (let v of value) {
		for (var i = value.length - 1; i >= 0; i--) {
			for (var _i = 0, _a = value[i]; _i < _a.length; _i++) {
				var vv = _a[_i];
				newSort.push(vv);
			}
		}
	};
	var combs = {
		twos: fetch2s(cbi),
		quad: fetchQuadruplets(cbi),
		seq3pair: fetchSeq3pair(cbi),
		seq: fetchSeq(cbi),
		trip: fetchTriplet(cbi),
		pair: fetchPair(cbi),
		single: fetchSingle(cbi)
	};
	for (var key in combs) {
		extract(combs[key]);
	}
	return newSort;
}
SamlocRule.endSort = endSort;
//})(SamlocRule = exports.SamlocRule || (exports.SamlocRule = {}));
