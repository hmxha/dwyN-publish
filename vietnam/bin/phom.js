/*
"use strict";
exports.__esModule = true;
exports.phomRule = void 0;
/**
 * 转牌规则
 */
var phomRule = {}
//(function (phomRule) {
//牌区
//============================================================================================
/**
 * 0x11~0x1D : A,2,3,4,5,6,7,8,9,10,J,Q,K
 * 牌组成 0x0F(点数) + 0xF0(花色) 组成
 */
phomRule.CardGroup = [
	0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D,
	0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D,
	0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A, 0x4B, 0x4C, 0x4D,
	0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8A, 0x8B, 0x8C, 0x8D, // 红桃
];
/**
 * 牌值掩码
 */
var ValueMask = 0xF;
/**
 * 扑克种类
 */
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
	 * 四张，预留，暂时用不到
	 */
	CardKind[CardKind["quadruplets"] = 3] = "quadruplets";
	/**
	 * 同花顺子(3张同色以上(含3张))
	 */
	CardKind[CardKind["solid_color_seq"] = 4] = "solid_color_seq";
	/**
	 * 错误种类
	 */
	CardKind[CardKind["none"] = -1] = "none";
})(CardKind = phomRule.CardKind || (phomRule.CardKind = {}));
//--------------------------------------------------------------------------------------------
//日志部分
//--------------------------------------------------------------------------------------------
function log() {
	var data = [];
	for (var _i = 0; _i < arguments.length; _i++) {
		data[_i] = arguments[_i];
	}
	console.log.apply(console, data);
}
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
/**
 * 获取牌值
 * @param card 牌
 * @returns 牌值
 */
function getValue(card) {
	return card & ValueMask;
}
phomRule.getValue = getValue;
/**
 * 牌值转索引
 * @param cardValue 牌值
 * @returns 索引
 */
function cardValueConvertIndex(cardValue) {
	return cardValue - 1;
}
/**
 * 获取花色
 * @param card 牌
 * @returns 花色
 */
function getColor(card) {
	return card & 240 /* mask */;
}
phomRule.getColor = getColor;
/**
 * 牌检查是否超出范围
 * @param card 牌
 * @returns 是否符合范围
 */
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
/**
 * 制造牌组合信息(完整的组合信息)
 * @param cards 牌组
 * @returns 组合后的信息
 */
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
phomRule.makeCardCombineInfo = makeCardCombineInfo;
/**
 * 制造牌识别信息(只保留存在的信息)
 * @param cards 牌组
 * @returns 识别信息
 */
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
/**
 * 获取单组牌识别信息
 * @param cards 牌组
 * @returns 最大点数的牌组
 */
function getOneCardIdentifyInfo(cards) {
	var cardIInfos = makeCardIdentifyInfo(cards);
	return cardIInfos[cardIInfos.length - 1];
}
//--------------------------------------------------------------------------------------------
//辅助
//--------------------------------------------------------------------------------------------
/**
 * 取颜色值
 * @param color 颜色值 多个花色或在一起的颜色值
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
 * 取单
 * @param cardsCInfo 牌组合后信息
 * @returns 单张牌组信息
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
phomRule.fetchSingle = fetchSingle;
/**
 * 取对子
 * @param cardsCInfo 牌组合后信息
 * @returns 对子牌组信息
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
phomRule.fetchPair = fetchPair;
function fetchPair_easy(cards) {
	var comb = makeCardCombineInfo(cards);
	var pairs = fetchPair(comb);
	var result = { pair: pairs };
	return JSON.stringify(result);
}
phomRule.fetchPair_easy = fetchPair_easy;
/**
 * 取三张
 * @param cardsCInfo 牌组合后信息
 * @returns 三张牌组信息
 */
function fetchTriplet(cardsCInfo) {
	if (cardsCInfo.length == 0) {
		return [];
	}
	var cards = [];
	for (var i = 0; i < cardsCInfo.length; ++i) {
		if (cardsCInfo[i].count == 3) {
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
phomRule.fetchTriplet = fetchTriplet;
function fetchTriplet_easy(cards) {
	var comb = makeCardCombineInfo(cards);
	var trips = fetchTriplet(comb);
	var result = { trip: trips };
	return JSON.stringify(result);
}
phomRule.fetchTriplet_easy = fetchTriplet_easy;
/**
 * 取四张
 * @param cardsCInfo 牌组合后信息
 * @returns 四张牌组信息
 */
function fetchQuadruplet(cardsCInfo) {
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
				mergeCard(cardsCInfo[i].value, four.oneColor),
			]);
		}
	}
	return cards;
}
phomRule.fetchQuadruplet = fetchQuadruplet;
function fetchQuadruplet_easy(cards) {
	var comb = makeCardCombineInfo(cards);
	var quads = fetchQuadruplet(comb);
	var result = { quad: quads };
	return JSON.stringify(result);
}
phomRule.fetchQuadruplet_easy = fetchQuadruplet_easy;
//包含指定牌的最少張數同花順所需要的牌（3張）
function fetchMinSolidColorSeq(cards, card) {
	var comb = makeCardCombineInfo(cards);
	var fixedIndex = getValue(card) - 1;
	var fixedVal = getValue(card);
	var fixedColor = getColor(card);
	var result = [];
	//指定牌在最右邊
	if (fixedIndex - 2 > 0) {
		if ((comb[fixedIndex - 2].count > 0) && (comb[fixedIndex - 1].count > 0)) {
			result.push([mergeCard(fixedVal - 1, fixedColor), mergeCard(fixedVal - 2, fixedColor)]);
		}
	}
	//指定牌在最左邊
	if (fixedIndex + 2 < 13) {
		if ((comb[fixedIndex + 2].count > 0) && (comb[fixedIndex + 1].count > 0)) {
			result.push([mergeCard(fixedVal + 1, fixedColor), mergeCard(fixedVal + 2, fixedColor)]);
		}
	}
	//指定牌在中間
	if ((fixedIndex + 1 < 13) && (fixedIndex - 1 > 0)) {
		if ((comb[fixedIndex - 1].count > 0) && (comb[fixedIndex + 1].count > 0)) {
			result.push([mergeCard(fixedVal - 1, fixedColor), mergeCard(fixedVal + 1, fixedColor)]);
		}
	}
	var s_result = { scsmust: result };
	return JSON.stringify(s_result);
}
phomRule.fetchMinSolidColorSeq = fetchMinSolidColorSeq;
/**
 * 同花色顺子(3张以上(含3张))
 */
function fetchSolidColorSeq(cardsCInfo) {
	if (cardsCInfo.length == 0) {
		return [];
	}
	//牌组
	var cards = [];
	//黑桃 梅花 方块 红桃
	var colors = [[], [], [], []];
	//颜色测试 黑桃 梅花 方块 红桃
	var color_tests = [16 /* spade */, 32 /* club */, 64 /* diamond */, 128 /* heart */];
	//提取
	var fetch = function(cInfo) {
		for (var i = 0; i < color_tests.length; ++i) {
			if (color_tests[i] & cInfo.colorMask) {
				//存在颜色
				colors[i].push(mergeCard(cInfo.value, color_tests[i]));
			}
			else {
				//不存在颜色
				//产生同花色顺子
				if (colors[i].length >= 3) {
					//放入牌组中
					cards.push(colors[i]);
				}
				//重置
				colors[i] = [];
			}
		}
	};
	for (var i = 0; i < cardsCInfo.length; i++) {
		fetch(cardsCInfo[i]);
	}
	for (var n = 0; n < 4; n++) {
		if (colors[n].length >= 3) {
			cards.push(colors[n]);
		}
	}
	for (var i in cards) {
		for (var _i = 0, _a = cards[i]; _i < _a.length; _i++) {
			var val = _a[_i];
			cardsCInfo[getValue(val) - 1].count -= 1;
			cardsCInfo[getValue(val) - 1].colorMask &= ~getColor(val);
		}
	}
	return cards;
}
phomRule.fetchSolidColorSeq = fetchSolidColorSeq;
function fetchSolidColorSeq_easy(cards) {
	var comb = makeCardCombineInfo(cards);
	var scss = fetchSolidColorSeq(comb);
	var result = { scs: scss };
	return JSON.stringify(result);
}
phomRule.fetchSolidColorSeq_easy = fetchSolidColorSeq_easy;
// 获取Ca,要先另外调用取走phom先
function fetchCa(cardsCInfo) {
	var _a, _b;
	fetchQuadruplet(cardsCInfo);
	fetchTriplet(cardsCInfo);
	fetchSolidColorSeq(cardsCInfo);
	var cardsCInfo_copy = JSON.parse(JSON.stringify(cardsCInfo));
	var ca_pair = fetchPair(cardsCInfo_copy);
	//牌组
	var ca_else = [];
	//黑桃 梅花 方块 红桃
	var colors = [[], [], [], []];
	//颜色测试 黑桃 梅花 方块 红桃
	var color_tests = [16 /* spade */, 32 /* club */, 64 /* diamond */, 128 /* heart */];
	//提取
	var fetch = function(cInfo) {
		for (var i = 0; i < color_tests.length; ++i) {
			if (color_tests[i] & cInfo.colorMask) {
				//存在颜色
				colors[i].push(mergeCard(cInfo.value, color_tests[i]));
			}
			else {
				//0代表不存在
				colors[i].push(0);
			}
		}
	};
	for (var i = 0; i < cardsCInfo.length; i++) {
		fetch(cardsCInfo[i]);
	}
	var tmpCa = [];
	var zeroCnt = 0;
	for (var i = 0; i < colors.length; i++) {
		tmpCa = [];
		for (var j = colors[i].length - 1; j >= 0; j--) {
			var tmp = colors[i][j];
			if (tmp != 0) {
				if (zeroCnt > 1) {
					if (tmpCa.length > 1) {
						ca_else.push(tmpCa);
					}
					tmpCa = [];
					zeroCnt = 0;
				}
				tmpCa.push(tmp);
			}
			else {
				if (tmpCa.length >= 1) {
					zeroCnt += 1;
				}
			}
		}
		if (tmpCa.length > 1) {
			ca_else.push(tmpCa);
		}
	}
	var ca_else_copy = JSON.parse(JSON.stringify(ca_else));
	/*
	log("ca_else is: ", ca_else);
	log("ca_pair is: ", ca_pair);
	*/
	var pairMatchCaelseIdxMap = {};
	for (var valIdx in ca_else) {
		for (var idx in ca_else[valIdx]) {
			for (var _i = 0, ca_pair_1 = ca_pair; _i < ca_pair_1.length; _i++) {
				var pair = ca_pair_1[_i];
				if (getValue(pair[0]) == getValue(ca_else[valIdx][idx])) {
					if (pairMatchCaelseIdxMap[getValue(pair[0])] == undefined) {
						//log("map,pair[0] is: ", pairMatchCaelseIdxMap[getValue(pair[0])], " ", getValue(pair[0]));
						for (var tmpIdx in ca_else_copy[valIdx]) {
							if (getValue(ca_else_copy[valIdx][tmpIdx]) == getValue(pair[0])) {
								//log("pairval,valIdx, before ca_else_copy is: ", getValue(pair[0]), valIdx, ca_else_copy);
								ca_else_copy[valIdx].splice(Number(tmpIdx), 1);
								(_a = ca_else_copy[valIdx]).unshift.apply(_a, pair);
								//log("pairval,valIdx, after ca_else_copy is: ", getValue(pair[0]), valIdx, ca_else_copy);
								break;
							}
						}
						pairMatchCaelseIdxMap[getValue(pair[0])] = valIdx;
					}
					else {
						if (valIdx != pairMatchCaelseIdxMap[getValue(pair[0])]) {
							for (var tmpIdx in ca_else_copy[valIdx]) {
								if (getValue(ca_else_copy[valIdx][tmpIdx]) == getValue(pair[0])) {
									ca_else_copy[valIdx].splice(Number(tmpIdx), 1);
									(_b = ca_else_copy[pairMatchCaelseIdxMap[getValue(pair[0])]]).unshift.apply(_b, ca_else_copy[valIdx]);
								}
							}
						}
					}
				}
			}
		}
	}
	for (var _c = 0, ca_pair_2 = ca_pair; _c < ca_pair_2.length; _c++) {
		var pair = ca_pair_2[_c];
		if (pairMatchCaelseIdxMap[getValue(pair[0])] == undefined) {
			ca_else_copy.unshift.apply(ca_else_copy, [pair]);
		}
	}
	for (var idx in ca_else_copy) {
		if (ca_else_copy[idx].length == 0) {
			ca_else_copy.splice(Number(idx), 1);
		}
	}
	var Caes = [];
	for (var _d = 0, ca_else_copy_1 = ca_else_copy; _d < ca_else_copy_1.length; _d++) {
		var cas = ca_else_copy_1[_d];
		var olpMap = {};
		var tmpCaes = [];
		for (var _e = 0, cas_1 = cas; _e < cas_1.length; _e++) {
			var elem = cas_1[_e];
			if (olpMap[elem] == undefined) {
				olpMap[elem] = 1;
				tmpCaes.push(elem);
			}
		}
		Caes.push(tmpCaes);
	}
	var result = [];
	var overLapMap = {};
	//log("caes: ", Caes);
	for (var _f = 0, Caes_1 = Caes; _f < Caes_1.length; _f++) {
		var val = Caes_1[_f];
		var tmpCaa = [];
		//log("val is: ", val);
		var comb = makeCardCombineInfo(val);
		var single = fetchSingle(comb);
		for (var i = single.length - 1; i >= 0; i--) {
			for (var j = single[i].length - 1; j >= 0; j--) {
				if (overLapMap[single[i][j]] == undefined) {
					overLapMap[single[i][j]] = 1;
					tmpCaa.push(single[i][j]);
				}
			}
		}
		result.push(tmpCaa);
	}
	//log("result is: ", result);
	return result;
}
phomRule.fetchCa = fetchCa;
// 检测是否有ca
function existCa(cards) {
	//检测是否有对子
	var pairComb = makeCardCombineInfo(cards);
	var pairs = fetchPair(pairComb);
	if (pairs.length > 0) {
		return true;
	}
	//检测是否有顺子ca
	var comb = makeCardCombineInfo(cards);
	for (var i in comb) {
		if (Number(i) < 11) {
			if ((comb[Number(i) + 1].count > 0) && (comb[Number(i)].count > 0) && ((comb[Number(i) + 1].colorMask & comb[i].colorMask) > 0)) {
				return true;
			}
			if ((comb[Number(i) + 2].count > 0) && (comb[Number(i)].count > 0) && ((comb[Number(i) + 2].colorMask & comb[i].colorMask) > 0)) {
				return true;
			}
		}
		else if (Number(i) == 11) {
			if ((comb[Number(i) + 1].count > 0) && (comb[Number(i)].count > 0) && ((comb[Number(i) + 1].colorMask & comb[i].colorMask) > 0)) {
				return true;
			}
		}
	}
	return false;
}
phomRule.existCa = existCa;
/*
// 牌排序
export function sortCards(cards: number[]): number[] {
    let sorted_cards: number[] = []
    let comb = makeCardCombineInfo(cards)

    let quadruplets = fetchQuadruplet(comb)
    let triplet = fetchTriplet(comb)
    let solidSeq = fetchSolidColorSeq(comb)
    let ca = fetchCa(comb)
    log("ca: ", ca)
    for (let val of ca) {
	for (let vall of val) {
	    comb[getValue(vall) - 1].count -= 1
	    log("vall num is: ", getValue(vall))
	    comb[getValue(vall) - 1].colorMask &= ~getColor(vall)
	}
    }
    let singles = fetchSingle(comb)
    log("quad is: ", quadruplets)

    for (let i = quadruplets.length - 1; i >= 0; i--) {
	for (let j = quadruplets[i].length - 1; j >= 0; j--) {
	    sorted_cards.push(quadruplets[i][j])
	}
    }

    for (let i = triplet.length - 1; i >= 0; i--) {
	for (let j = triplet[i].length - 1; j >= 0; j--) {
	    sorted_cards.push(triplet[i][j])
	}
    }

    for (let i = solidSeq.length - 1; i >= 0; i--) {
	for (let j = solidSeq[i].length - 1; j >= 0; j--) {
	    sorted_cards.push(solidSeq[i][j])
	}
    }

    for (let i = 0; i < ca.length; i++) {
	for (let j = 0; j < ca[i].length; j++) {
	    sorted_cards.push(ca[i][j])
	}
    }

    for (let i = singles.length - 1; i >= 0; i--) {
	for (let j = singles[i].length - 1; j >= 0; j--) {
	    sorted_cards.push(singles[i][j])
	}
    }

    return sorted_cards
}
*/
// 牌排序
function sortCards(cards) {
	var sorted_cards = [];
	var bestPhomStr = getBestPhoms(cards);
	var bestPhom = JSON.parse(bestPhomStr);
	var bp = bestPhom.bestPhoms;
	var leftCards = [];
	var tmpUsedCards = {};
	var result = { sortedCards: [] };
	for (var _i = 0, bp_1 = bp; _i < bp_1.length; _i++) {
		var phom = bp_1[_i];
		for (var _a = 0, phom_1 = phom; _a < phom_1.length; _a++) {
			var elem = phom_1[_a];
			if (tmpUsedCards[elem] == undefined) {
				tmpUsedCards[elem] = 1;
			}
		}
	}
	for (var _b = 0, cards_1 = cards; _b < cards_1.length; _b++) {
		var val = cards_1[_b];
		if (tmpUsedCards[val] == undefined) {
			leftCards.push(val);
		}
	}
	var comb = makeCardCombineInfo(leftCards);
	//有3个phom时
	var extraQuad = fetchQuadruplet(comb);
	var extraTrip = fetchTriplet(comb);
	var extraScs = fetchSolidColorSeq(comb);
	if (extraQuad.length > 0 || extraTrip.length > 0 || extraScs.length > 0) {
		if (extraQuad.length > 0) {
			bp.push(extraQuad[0]);
		}
		else if (extraTrip.length > 0) {
			bp.push(extraTrip[0]);
		}
		else if (extraScs.length > 0) {
			bp.push(extraScs[0]);
		}
		var extraSingle = fetchSingle(comb);
		for (var _c = 0, bp_2 = bp; _c < bp_2.length; _c++) {
			var phom = bp_2[_c];
			for (var _d = 0, phom_2 = phom; _d < phom_2.length; _d++) {
				var elem = phom_2[_d];
				sorted_cards.push(elem);
			}
		}
		for (var _e = 0, extraSingle_1 = extraSingle; _e < extraSingle_1.length; _e++) {
			var s = extraSingle_1[_e];
			for (var _f = 0, s_1 = s; _f < s_1.length; _f++) {
				var ss = s_1[_f];
				sorted_cards.push(ss);
			}
		}
		result.sortedCards = sorted_cards;
		return JSON.stringify(result);
	}
	var ca = fetchCa(comb);
	for (var _g = 0, ca_1 = ca; _g < ca_1.length; _g++) {
		var val = ca_1[_g];
		for (var _h = 0, val_1 = val; _h < val_1.length; _h++) {
			var vall = val_1[_h];
			comb[getValue(vall) - 1].count -= 1;
			//log("vall num is: ", getValue(vall));
			comb[getValue(vall) - 1].colorMask &= ~getColor(vall);
		}
	}
	var singles = fetchSingle(comb);
	var overLapMap = {};
	for (var _j = 0, bp_3 = bp; _j < bp_3.length; _j++) {
		var phom = bp_3[_j];
		for (var _k = 0, phom_3 = phom; _k < phom_3.length; _k++) {
			var elem = phom_3[_k];
			sorted_cards.push(elem);
			overLapMap[elem] = 1;
		}
	}
	for (var i = 0; i < ca.length; i++) {
		for (var j = 0; j < ca[i].length; j++) {
			if (overLapMap[ca[i][j]] == undefined) {
				sorted_cards.push(ca[i][j]);
			}
		}
	}
	for (var i = singles.length - 1; i >= 0; i--) {
		for (var j = singles[i].length - 1; j >= 0; j--) {
			if (overLapMap[singles[i][j]] == undefined) {
				sorted_cards.push(singles[i][j]);
			}
		}
	}
	result.sortedCards = sorted_cards;
	return JSON.stringify(result);
}
phomRule.sortCards = sortCards;
/*
export function SortPoker(pokerArr: Poker[]): Poker[] {
    let cards: number[] = [];
    for (const card of pokerArr) {
	cards.push(card.getPokerID());
    }
    
    let pcount = pokerArr.length;
    let newcards: number[] = sortCards(cards);
    let tmpPoker: Poker[] = [];
    for (let i = 0; i < pcount; i++) {
	for (let j = 0; j < pcount; j++) {
	    if (pokerArr[j].getPokerID() == newcards[i]) {
		tmpPoker.push(pokerArr[j]);
	    }
	}
    }
    return tmpPoker;
}
*/
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
	var count = phomRule.CardGroup.length;
	var cloneCardGroup = JSON.parse(JSON.stringify(phomRule.CardGroup));
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
	var value = getValue(card);
	if (value > 10 || value == 1) {
		var symbol = {
			'1': "A",
			'11': "J",
			'12': "Q",
			'13': "K"
		};
		if (symbol[value]) {
			return symbol[value];
		}
		error("getValueSysmbol:%d", card);
		return "error";
	}
	return String(value);
}
/**
 * 获取牌标识
 * @param card 牌
 * @returns 返回标识
 */
function getCardSymbol(card) {
	return getColorSymbol(card) + getValueSymbol(card);
}
// 判断是否能吃上家打出的垃圾牌（和垃圾牌是否能组成phom）
// @param selfCards 代表除了因吃牌组成的固定phom之外的手牌
// pending 
function whetherCouldEatJunk(outCard, selfCards) {
	var result = [];
	var comb1 = makeCardCombineInfo(selfCards);
	//log("comb1 is: ", comb1);
	var self_trips = fetchTriplet(comb1);
	if (self_trips.length > 0) {
		//log("self_trips is: ", self_trips);
		for (var _i = 0, self_trips_1 = self_trips; _i < self_trips_1.length; _i++) {
			var arr = self_trips_1[_i];
			if (getValue(arr[0]) == getValue(outCard)) {
				result.push(arr);
				break;
			}
		}
	}
	if (result.length == 0) {
		var comb2 = makeCardCombineInfo(selfCards);
		//log("comb2 is: ", comb2);
		var self_pairs = fetchPair(comb2);
		//log("selfCards is: ", selfCards);
		//log("self_pairs is: ", self_pairs);
		if (self_pairs.length > 0) {
			for (var _a = 0, self_pairs_1 = self_pairs; _a < self_pairs_1.length; _a++) {
				var arr = self_pairs_1[_a];
				if (getValue(arr[0]) == getValue(outCard)) {
					result.push(arr);
					break;
				}
			}
		}
	}
	var selfCards_clone = JSON.parse(JSON.stringify(selfCards));
	var selfOutMergeCards = selfCards_clone;
	selfOutMergeCards.push(outCard);
	var selfOutMergeCards_comb = makeCardCombineInfo(selfOutMergeCards);
	var selfOutMergeCards_comb_SolidColorSeq = fetchSolidColorSeq(selfOutMergeCards_comb);
	//log("solidcolorseq is: ", selfOutMergeCards_comb_SolidColorSeq);
	if (selfOutMergeCards_comb_SolidColorSeq.length > 0) {
		for (var _b = 0, selfOutMergeCards_comb_SolidColorSeq_1 = selfOutMergeCards_comb_SolidColorSeq; _b < selfOutMergeCards_comb_SolidColorSeq_1.length; _b++) {
			var elem = selfOutMergeCards_comb_SolidColorSeq_1[_b];
			for (var i in elem) {
				if (elem[i] == outCard) {
					var tmp = [];
					for (var j in elem) {
						if (j != i) {
							tmp.push(elem[j]);
						}
					}
					result.push(tmp);
				}
			}
		}
	}
	var rresult = { eat_tips: result };
	var tmppp = JSON.stringify(rresult);
	//log("rresult is: ", tmppp);
	return tmppp;
}
phomRule.whetherCouldEatJunk = whetherCouldEatJunk;
// 找出包含某一张牌的所有可能的phom
function findOneCardAllPhom(singleCard, selfCards) {
	/*
	let text: string[] = []
	for (let val of selfCards) {
	    text.push(getCardSymbol(val))
	}
	log("text ", text)
	log("singleCard ", getCardSymbol(singleCard))
	*/
	var comb = makeCardCombineInfo(selfCards);
	var phoms = [];
	if (comb[getValue(singleCard) - 1].count >= 3) {
		var tmp = [];
		if (comb[getValue(singleCard) - 1].colorMask & 16 /* spade */) {
			tmp.push(mergeCard(getValue(singleCard), 16 /* spade */));
		}
		if (comb[getValue(singleCard) - 1].colorMask & 32 /* club */) {
			tmp.push(mergeCard(getValue(singleCard), 32 /* club */));
		}
		if (comb[getValue(singleCard) - 1].colorMask & 64 /* diamond */) {
			tmp.push(mergeCard(getValue(singleCard), 64 /* diamond */));
		}
		if (comb[getValue(singleCard) - 1].colorMask & 128 /* heart */) {
			tmp.push(mergeCard(getValue(singleCard), 128 /* heart */));
		}
		phoms.push(tmp);
	}
	var leftSeqMinIndex = 0;
	var rightSeqMaxIndex = 0;
	for (var i = getValue(singleCard) - 2; i >= 0; i--) {
		if (comb[i].count == 0) {
			leftSeqMinIndex = i + 1;
			break;
		}
		if (i == 0) {
			leftSeqMinIndex = 0;
		}
	}
	for (var j = getValue(singleCard) - 1; j < comb.length; j++) {
		if (comb[j].count == 0) {
			rightSeqMaxIndex = j - 1;
			break;
		}
		if (j == comb.length - 1) {
			rightSeqMaxIndex = j;
		}
	}
	/*
	log("leftSeqMinIndex ", leftSeqMinIndex)
	log("rightSeqMaxIndex ", rightSeqMaxIndex)
	*/
	if (rightSeqMaxIndex - leftSeqMinIndex < 2) {
		return phoms;
	}
	var solidSeqStartIndex = 0;
	var solidSeqEndIndex = 0;
	if (getValue(singleCard) - 1 >= leftSeqMinIndex) {
		for (var i = getValue(singleCard) - 1; i >= leftSeqMinIndex; i--) {
			if (!(comb[i].colorMask & getColor(singleCard))) {
				solidSeqStartIndex = i + 1;
				break;
			}
			else if (i == leftSeqMinIndex) {
				solidSeqStartIndex = leftSeqMinIndex;
			}
		}
	}
	else {
		solidSeqStartIndex = leftSeqMinIndex;
	}
	if (getValue(singleCard) - 1 <= rightSeqMaxIndex) {
		for (var j = getValue(singleCard) - 1; j <= rightSeqMaxIndex; j++) {
			if (!(comb[j].colorMask & getColor(singleCard))) {
				solidSeqEndIndex = j - 1;
				break;
			}
			else if (j == rightSeqMaxIndex) {
				solidSeqEndIndex = rightSeqMaxIndex;
			}
		}
	}
	else {
		solidSeqEndIndex = rightSeqMaxIndex;
	}
	/*
	log("solidSeqStartIndex ", solidSeqStartIndex)
	log("solidSeqEndIndex ", solidSeqEndIndex)
	*/
	if (solidSeqEndIndex - solidSeqStartIndex < 2) {
		return phoms;
	}
	//选定的牌在三张顺子的最右边
	if (getValue(singleCard) - solidSeqStartIndex >= 3) {
		phoms.push([mergeCard(getValue(singleCard) - 2, getColor(singleCard)), mergeCard(getValue(singleCard) - 1, getColor(singleCard)), singleCard]);
	}
	//选定的牌在三张顺子的最左边
	if (solidSeqEndIndex - getValue(singleCard) >= 1) {
		phoms.push([singleCard, mergeCard(getValue(singleCard) + 1, getColor(singleCard)), mergeCard(getValue(singleCard) + 2, getColor(singleCard))]);
	}
	//选定的牌在三张顺子中间
	if (getValue(singleCard) - 1 > solidSeqStartIndex && getValue(singleCard) - 1 < solidSeqEndIndex) {
		phoms.push([mergeCard(getValue(singleCard) - 1, getColor(singleCard)), singleCard, mergeCard(getValue(singleCard) + 1, getColor(singleCard))]);
	}
	return phoms;
}
// 判断牌是否能作为垃圾牌打出（该牌如果能组成两个phom,且该牌
// existAteJunk 代表玩家已经吃掉且仍存在的别人的垃圾牌
function whetherCouldOutJunk(outCard, selfCards, existAteJunk) {
	/*
	log("outCard is: ", getCardSymbol(outCard))
	log("existAteJunk ", getCardSymbol(existAteJunk[0]))
	let text: string[] = []
	for (let val of selfCards) {
	    text.push(getCardSymbol(val))
	}
	log("text ", text)
	*/
	// 吃掉的垃圾牌不能被打出
	for (var i = 0; i < existAteJunk.length; i++) {
		if (outCard == existAteJunk[i]) {
			//log("the ate junk not allow to abandon!");
			return false;
		}
	}
	// 不是所有包含已吃牌的phom都包含待出的牌，则该牌就可以打出
	var comb1 = makeCardCombineInfo(selfCards);
	var comb2 = makeCardCombineInfo(selfCards);
	var comb3 = makeCardCombineInfo(selfCards);
	var quadruplet = fetchQuadruplet(comb1);
	var triplet = fetchTriplet(comb2);
	var solidSeq = fetchSolidColorSeq(comb3);
	var allPhoms = quadruplet;
	for (var _i = 0, triplet_1 = triplet; _i < triplet_1.length; _i++) {
		var val = triplet_1[_i];
		allPhoms.push(val);
	}
	for (var _a = 0, solidSeq_1 = solidSeq; _a < solidSeq_1.length; _a++) {
		var val = solidSeq_1[_a];
		allPhoms.push(val);
	}
	var fjudge = { gotAteJunk: 0, existJunk: false, existOutCard: false };
	for (var _b = 0, allPhoms_1 = allPhoms; _b < allPhoms_1.length; _b++) {
		var val = allPhoms_1[_b];
		for (var _c = 0, val_2 = val; _c < val_2.length; _c++) {
			var vall = val_2[_c];
			if (outCard == vall) {
				return false;
			}
		}
	}
	return true;
	/*
	let outCardInPhom_cnt = 0
	let searchCard = 0
	let outCardInPhomBeenCheck = false
	for (let val of allPhoms) {
	    for (let vall of val) {
		for (let junk of existAteJunk) {
		    if (vall == junk) {
			fjudge.gotAteJunk++
			fjudge.existJunk = true
		    }
		    if (fjudge.existJunk && outCardInPhomBeenCheck == false) {
			for (let dd of val) {
			    if (dd == outCard && dd != junk) {
				outCardInPhom_cnt++
				fjudge.existOutCard = true
				searchCard = junk
				outCardInPhomBeenCheck = true
				break
			    }
			}
		    }
		}
	    }
	    if (fjudge.existJunk && fjudge.existOutCard) {
		if (fjudge.gotAteJunk >= 2 || outCardInPhom_cnt >= 2) {
		    log("got too many necessary phoms contain the outCard!")
		    return false
		}
	    }
	    fjudge = { gotAteJunk: 0, existJunk: false, existOutCard: false }
	}
	/*
	for (let val of allPhoms) {
	    for (let vall of val) {
		log(getCardSymbol(vall))
	    }
	    log("----------")
	}
	*/
	/*
	 if (outCardInPhom_cnt == 1) {
	     let tmp = findOneCardAllPhom(searchCard, selfCards)
	     let matchCnt = 0
	     for (let val of tmp) {
		 for (let vall of val) {
		     if (vall == outCard) {
			 matchCnt++
			 break
		     }
		 }
	     }
	     if (matchCnt == tmp.length) {
		 return false
	     }
	 }
     
	 return true
	 */
}
phomRule.whetherCouldOutJunk = whetherCouldOutJunk;
//是否能寄牌
//outCards 代表自己要出的要寄的牌
//anotherShowdownPure 代表别的玩家的摊牌
function parasitic(handpokers, anotherShowdown) {
	if (!existPhom(handpokers)) {
		return false;
	}
	var mergedCards = anotherShowdown;
	for (var _i = 0, handpokers_1 = handpokers; _i < handpokers_1.length; _i++) {
		var val = handpokers_1[_i];
		mergedCards.push(val);
		if (existPhom(mergedCards))
			return true;
	}
	/*
	let comb1: CardCombineInfo[] = makeCardCombineInfo(mergedCards)
	let comb2: CardCombineInfo[] = makeCardCombineInfo(mergedCards)
	let comb3: CardCombineInfo[] = makeCardCombineInfo(mergedCards)
	let solidSeq: number[][] = fetchSolidColorSeq(comb1)
	let triplet: number[][] = fetchTriplet(comb2)
	let quadruplets: number[][] = fetchQuadruplet(comb3)
        
        
	if (solidSeq.length == 0 && triplet.length == 0 && quadruplets.length == 0) {
	    return false
	} else {
	    return true
	}
	*/
	/*
	let matchCnt: number = 0
	for (let i in solidSeq) {
	    for (let val of solidSeq[i]) {
		for (let vall of outCards) {
		    if (val == vall) {
			matchCnt += 1
			break
		    }
		}
	    }
	}
        
	if (matchCnt == outCards.length) {
	    return true
	}
        
	if (triplet != []) {
	    matchCnt = 0
	    for (let i in triplet) {
		for (let val of triplet[i]) {
		    for (let vall of outCards) {
			if (val == vall) {
			    matchCnt += 1
			    break
			}
		    }
		}
	    }
	    if (matchCnt == outCards.length) {
		return true
	    }
	}
        
	return false
	*/
}
phomRule.parasitic = parasitic;
//寄牌
function parasitize(handpokers, anotherOneShowdown) {
	var anotherOneShowdown_cpy = JSON.parse(JSON.stringify(anotherOneShowdown));
	var handPokers_cpy = JSON.parse(JSON.stringify(handpokers));
	var newPhoms = []; //怎么初始化一个空的二维数组
	var parasiticCards = [];
	//pc与pcPhoms的相同下标的元素值，是对应的要寄的牌和要被寄的phom
	var pc = []; //要寄的牌
	var pcPhoms = []; //要被寄的牌
	for (var _i = 0, anotherOneShowdown_cpy_1 = anotherOneShowdown_cpy; _i < anotherOneShowdown_cpy_1.length; _i++) {
		var p = anotherOneShowdown_cpy_1[_i];
		if (p.length == 3 && getValue(p[0]) == getValue(p[1])) {
			//是3张相同
			for (var i in handPokers_cpy) {
				if (getValue(handPokers_cpy[i]) == getValue(p[0])) {
					var pCopy = JSON.parse(JSON.stringify(p));
					pc.push([handPokers_cpy[i]]);
					pcPhoms.push(pCopy);
					p.push(handPokers_cpy[i]);
					parasiticCards.push(handPokers_cpy[i]);
					newPhoms.push(p);
					handPokers_cpy.splice(parseInt(i), 1);
					break;
				}
			}
		}
		else if (getValue(p[0]) != getValue(p[1])) {
			//是同花顺
			var mergedCards = JSON.parse(JSON.stringify(p));
			var overLapMap = {};
			var parasiticCardsMap = {};
			for (var _a = 0, handPokers_cpy_1 = handPokers_cpy; _a < handPokers_cpy_1.length; _a++) {
				var val = handPokers_cpy_1[_a];
				mergedCards.push(val);
			}
			var comb = makeCardCombineInfo(mergedCards);
			var newScs = fetchSolidColorSeq(comb);
			var tmpPc = [];
			newPhoms.push(newScs[0]);
			for (var _b = 0, p_1 = p; _b < p_1.length; _b++) {
				var val = p_1[_b];
				if (overLapMap[val] == undefined) {
					overLapMap[val] = 1;
				}
			}
			for (var _c = 0, _d = newScs[0]; _c < _d.length; _c++) {
				var val = _d[_c];
				if (overLapMap[val] == undefined) {
					parasiticCardsMap[val] = 1;
					parasiticCards.push(val);
					tmpPc.push(val);
				}
			}
			if (tmpPc.length > 0) {
				pc.push(tmpPc);
				pcPhoms.push(p);
			}
			var restHandPokers = [];
			for (var _e = 0, handPokers_cpy_2 = handPokers_cpy; _e < handPokers_cpy_2.length; _e++) {
				var val = handPokers_cpy_2[_e];
				if (parasiticCardsMap[val] == undefined) {
					restHandPokers.push(val);
				}
			}
			handPokers_cpy = restHandPokers;
		}
	}
	//let result = { parasiticCards: parasiticCards, newPhoms: newPhoms }
	var result = { parasiticCards: pc, parasiteePhoms: pcPhoms, newPhoms: newPhoms };
	return JSON.stringify(result);
}
phomRule.parasitize = parasitize;
// 去掉Phom剩下的牌
// @param selfCards 代表已经吃掉的垃圾牌且摊在自己展示区的牌和自己的手牌
function showdownRemovePhom(selfCards) {
	var comb = makeCardCombineInfo(selfCards);
	fetchTriplet(comb);
	fetchSolidColorSeq(comb);
	var showdownPure = [];
	for (var _i = 0, comb_1 = comb; _i < comb_1.length; _i++) {
		var val = comb_1[_i];
		if (val.count != 0) {
			showdownPure.push(val.value);
		}
	}
	return showdownPure;
}
// 判断玩家是否存在Phom
// @param selfCards 代表已经吃掉的垃圾牌且摊在自己展示区的牌和自己的手牌
function existPhom(selfCards) {
	var selfCards_comb1 = makeCardCombineInfo(selfCards);
	if (fetchTriplet(selfCards_comb1) != []) {
		return true;
	}
	var selfCards_comb2 = makeCardCombineInfo(selfCards);
	if (fetchSolidColorSeq(selfCards_comb2) != []) {
		return true;
	}
	var selfCards_comb3 = makeCardCombineInfo(selfCards);
	if (fetchQuadruplet(selfCards_comb3) != []) {
		return true;
	}
	return false;
}
phomRule.existPhom = existPhom;
//检测自动胜利(Map版)
/*
export function checkAutoWin(selfCards: number[], firstRound: boolean): string {
    let comb1: CardCombineInfo[] = makeCardCombineInfo(selfCards)
    let comb2: CardCombineInfo[] = makeCardCombineInfo(selfCards)
    let comb3: CardCombineInfo[] = makeCardCombineInfo(selfCards)
 
    let quads: number[][] = fetchQuadruplet(comb1)
    log("quads is：", quads)
    let trips: number[][] = fetchTriplet(comb2)
    log("trips is: ", trips)
    let scs: number[][] = fetchSolidColorSeq(comb3)
    log("scs is: ", scs)
 
    let allPhoms: number[][] = []
    let selfMap = new Map()
    let result = { awt: autoWinType.U, allPhoms: allPhoms }
 
    for (let v of quads) {
	allPhoms.push(v)
	for (let vv of v) {
	    if (selfMap.has(vv)) {
		let tmp: oneCardInfo = selfMap.get(vv)
		tmp.cnt += 1
		log("quads tttttttttttttmp is: ", tmp)
		tmp.phom.push(v)
		selfMap.set(vv, tmp)
	    } else {
		let tda: number[][] = []
		tda.push(v)
		selfMap.set(vv, { cnt: 1, phom: tda })
	    }
	}
    }
    for (let v of trips) {
	allPhoms.push(v)
	for (let vv of v) {
	    if (selfMap.has(vv)) {
		let tmp: oneCardInfo = selfMap.get(vv)
		tmp.cnt += 1
		log("trips tttttttttttttmp is: ", tmp)
		tmp.phom.push(v)
		selfMap.set(vv, tmp)
	    } else {
		let tda: number[][] = []
		tda.push(v)
		selfMap.set(vv, { cnt: 1, phom: tda })
	    }
	}
    }
    for (let v of scs) {
	allPhoms.push(v)
	for (let vv of v) {
	    if (selfMap.has(vv)) {
		let tmp: oneCardInfo = selfMap.get(vv)
		tmp.cnt += 1
		log("scs tttttttttttttmp is: ", tmp)
		tmp.phom.push(v)
		log("after scs tttttttttttttmp is: ", tmp)
		selfMap.set(vv, tmp)
	    } else {
		let tda: number[][] = []
		tda.push(v)
		selfMap.set(vv, { cnt: 1, phom: tda })
		//log("tda is: ", tda)
	    }
	}
    }
    log("selfmap is: ", selfMap)
    log("allllllllllllllphoms is: ", allPhoms)
 
    let allPhomsLen: number = 0
    let noOverlap: boolean = true
    let removedSame3: number[][] = []
    for (let key of selfMap.keys()) {
	log("key is: ", key)
	let tmpOci: oneCardInfo = selfMap.get(key)
	log("selfmap is: ", tmpOci)
	if (tmpOci.cnt > 1) {
	    for (let v of tmpOci.phom) {
		if (getValue(v[0]) != getValue(v[1])) {
		    noOverlap = false
		    log("the overLap card point is: ", key)
		    break
		}
	    }
	    if (noOverlap == false) {
		break
	    } else {
		for (let v of tmpOci.phom) {
		    log("tmpOci.phom is: ", tmpOci.phom)
		    for (let p in allPhoms) {
			log("gggggggggggggggggg")
			if (v[0] == allPhoms[p][0] && allPhoms[p].length == 3) {
			    removedSame3.push(allPhoms[p])
			    allPhoms.splice(Number(p), 1)
			    log("removedSame3 is: ", removedSame3)
			    break
			}
		    }
		    if (noOverlap) {
			break
		    }
		}
	    }
	}
    }
    log("all phoms is: ", allPhoms)
    allPhomsLen = 0
    for (let v of allPhoms) {
	allPhomsLen += v.length
    }
    if (allPhomsLen == selfCards.length && noOverlap == true && selfCards.length == 9) {
	result.awt = autoWinType.U
	return JSON.stringify(result)
    } else if (allPhomsLen == selfCards.length && noOverlap == true && selfCards.length == 10) {
	result.awt = autoWinType.UT
	return JSON.stringify(result)
    }
 
    let onePhomOk: boolean = false
    //var len1: number, len2: number = 0
    for (let key of selfMap.keys()) {
	let gotScs: boolean = false
	let oci: oneCardInfo = selfMap.get(key)
	if (oci.cnt > 1 && oci.phom.length > 1) {
	    log("oci is: ", oci)
	    if (oci.phom.length == 3) {
		onePhomOk = true
		//len1 = 4
		let comb: CardCombineInfo[] = makeCardCombineInfo(selfCards)
		let s: number[][] = fetchSolidColorSeq(comb)
		let t: number[][] = fetchTriplet(comb)
		allPhoms = []
		for (let val of s) {
		    allPhoms.push(val)
		}
		for (let val of t) {
		    allPhoms.push(val)
		}
		break
	    } else if (oci.phom.length == 2) {
		for (let v of oci.phom) {
		    if (getValue(v[0]) != getValue(v[1])) {
			gotScs = true
			break
		    }
		}
	    }
	    if (gotScs) {
		for (let v of oci.phom) {
		    if (getValue(v[0]) != getValue(v[1])) {
			log("kkkkkkkkkkkkkkkkkkkkkkkkkkk")
			//同花順
			//log("scs phom is: ", v)
			for (let i in v) {
			    if (v[i] == Number(key) && (Number(i) >= 3 && Number(i) != 0 && Number(i) != (v.length - 1)) && v.length >= 7) {
				//重复牌在同花顺非最靠边的的位置
				onePhomOk = true
				//len1 = v.length
				for (let k in allPhoms) {
				    if (getValue(v[0]) == getValue(allPhoms[k][0])) {
					allPhoms.splice(Number(k), 1)
					log("fffffffffffffffffffff")
					let tmp1: number[] = []
					let tmp2: number[] = []
					for (let vv of v) {
					    log("uuuuuuuuuuuuuuuuuuuuuuu")
					    if (vv != key && getValue(vv) < getValue(key)) {
						tmp1.push(vv)
					    } else if (vv != key && getValue(vv) > getValue(key)) {
						tmp2.push(vv)
					    }
					}
					allPhoms.push(tmp1)
					allPhoms.push(tmp2)
				    }
				}
				break
			    } else if (v[i] == Number(key) && (Number(i) == 0 || Number(i) == (v.length - 1)) && v.length >= 4) {
				//重复牌在同花顺最靠边的的位置
				onePhomOk = true
				//len1 = v.length
				for (let k in allPhoms) {
				    if (getValue(v[0]) == getValue(allPhoms[k][0])) {
					allPhoms.splice(Number(k), 1)
					log("fffffffffffffffffffff")
					let tmp1: number[] = []
					let tmp2: number[] = []
					for (let vv of v) {
					    log("uuuuuuuuuuuuuuuuuuuuuuu")
					    if (vv != key && getValue(vv) < getValue(key)) {
						tmp1.push(vv)
					    } else if (vv != key && getValue(vv) > getValue(key)) {
						tmp2.push(vv)
					    }
					}
					if (tmp1.length == 0) {
					    allPhoms.push(tmp2)
					} else {
					    allPhoms.push(tmp1)
					}
				    }
				}
				break
			    }
			}
		    } else {
			if (v.length == 4) {
			    //log("mmmmmmmmmmmmmmmmmmmm")
			    //同點數
			    //log("same point phom is: ", v)
			    onePhomOk = true
			    //len2 = 4
			    for (let i in allPhoms) {
				if (getValue(v[0]) == getValue(allPhoms[i][0]) && allPhoms[i].length == 4) {
				    allPhoms.splice(Number(i), 1)
				}
			    }
			    allPhoms.push(removedSame3[0])
			}
		    }
		}
		if (onePhomOk == true) {
		    break
		}
	    }
	}
 
    }
    log("onePhomOk is: ", onePhomOk)
 
    allPhomsLen = 0
    for (let v of allPhoms) {
	allPhomsLen += v.length
    }
    log("all phoms is: ", allPhoms)
 
    if (allPhomsLen == selfCards.length) {
	if (selfCards.length == 9) {
	    result.awt = autoWinType.U
	    return JSON.stringify(result)
	} else if (selfCards.length == 10) {
	    result.awt = autoWinType.UT
	    return JSON.stringify(result)
	}
    }
 
 
    // 第一輪没有任何ca和phom
    if (firstRound) {
	//如果上面的都沒有返回，則這裏再fetchCa，沒有ca，就是自動勝利UK,pending
	result.awt = autoWinType.None
	result.allPhoms = []
	return JSON.stringify(result)
    }
 
    result.awt = autoWinType.None
    result.allPhoms = []
    return JSON.stringify(result)
}
*/
//检查自动胜利（对象版）
function checkAutoWin(selfCards, firstRound) {
	var comb1 = makeCardCombineInfo(selfCards);
	var comb2 = makeCardCombineInfo(selfCards);
	var comb3 = makeCardCombineInfo(selfCards);
	var quads = fetchQuadruplet(comb1);
	//如果是4张同点数获取3张同点数，最后一张即红桃，不会获取到3张同点数
	var trips = fetchTriplet(comb2);
	var scs = fetchSolidColorSeq(comb3);
	var allPhoms = [];
	var selfMap = {}; //phom中的每張牌的計數和該牌對應的phom
	var result = { awt: 1 /* U */, allPhoms: allPhoms };
	for (var _i = 0, quads_1 = quads; _i < quads_1.length; _i++) {
		var v = quads_1[_i];
		allPhoms.push(v);
		for (var _a = 0, v_1 = v; _a < v_1.length; _a++) {
			var vv = v_1[_a];
			if (selfMap[vv] != undefined) {
				var tmp = selfMap[vv];
				tmp.cnt += 1;
				tmp.phom.push(v);
				//log("quads tttttttttttttmp is: ", tmp)
				selfMap[vv] = tmp;
			}
			else {
				var tmp = { cnt: 1, phom: [] };
				tmp.phom.push(v);
				//log("quads tttttttttttttmp is: ", tmp)
				selfMap[vv] = tmp;
			}
		}
	}
	for (var _b = 0, trips_1 = trips; _b < trips_1.length; _b++) {
		var v = trips_1[_b];
		allPhoms.push(v);
		for (var _c = 0, v_2 = v; _c < v_2.length; _c++) {
			var vv = v_2[_c];
			if (selfMap[vv] != undefined) {
				var tmp = selfMap[vv];
				tmp.cnt += 1;
				tmp.phom.push(v);
				//log("trips tttttttttttttmp is: ", tmp)
				selfMap[vv] = tmp;
			}
			else {
				var tmp = { cnt: 1, phom: [] };
				tmp.phom.push(v);
				//log("trips tttttttttttttmp is: ", tmp)
				selfMap[vv] = tmp;
			}
		}
	}
	for (var _d = 0, scs_1 = scs; _d < scs_1.length; _d++) {
		var v = scs_1[_d];
		allPhoms.push(v);
		for (var _e = 0, v_3 = v; _e < v_3.length; _e++) {
			var vv = v_3[_e];
			if (selfMap[vv] != undefined) {
				var tmp = selfMap[vv];
				tmp.cnt += 1;
				tmp.phom.push(v);
				//log("quads tttttttttttttmp is: ", tmp)
				selfMap[vv] = tmp;
				if ((v.length > 3) && (selfMap[vv].phom[0].length == 4)) {
					//如果一张牌同时有4张同点数和长度超过3张的同花顺,则只此牌的phom进行分解
					for (var key in selfMap) {
						if (Number(key) != vv) {
							selfMap[key].cnt = 1;
						}
					}
				}
			}
			else {
				var tmp = { cnt: 1, phom: [] };
				tmp.phom.push(v);
				//log("trips tttttttttttttmp is: ", tmp)
				selfMap[vv] = tmp;
			}
		}
	}
	//log("selfmap is: ", selfMap)
	//log("allllllllllllllphoms is: ", allPhoms)
	var allPhomsLen = 0;
	var noOverlap = true;
	var removedSame3 = [];
	for (var key in selfMap) {
		//log("key is: ", key)
		var tmpOci = selfMap[key];
		//log("selfmap is: ", tmpOci)
		if (tmpOci.cnt > 1) {
			for (var _f = 0, _g = tmpOci.phom; _f < _g.length; _f++) {
				var v = _g[_f];
				if (getValue(v[0]) != getValue(v[1])) {
					noOverlap = false;
					//log("the overLap card point is: ", key)
					break;
				}
			}
			if (noOverlap == false) {
				break;
			}
			else {
				for (var _h = 0, _j = tmpOci.phom; _h < _j.length; _h++) {
					var v = _j[_h];
					//log("tmpOci.phom is: ", tmpOci.phom)
					for (var p in allPhoms) {
						//log("gggggggggggggggggg")
						if (v[0] == allPhoms[p][0] && allPhoms[p].length == 3) {
							//某张牌有多两个phom且没有同花顺的情况下，allPhoms中去掉相同点数的3张同点数即5555和555，去掉555,有同花顺则保留5555，555和同花顺
							removedSame3.push(allPhoms[p]);
							allPhoms.splice(Number(p), 1);
							//log("removedSame3 is: ", removedSame3)
							break;
						}
					}
					if (noOverlap) {
						break;
					}
				}
			}
		}
	}
	//log("all phoms is: ", allPhoms)
	allPhomsLen = 0;
	for (var _k = 0, allPhoms_2 = allPhoms; _k < allPhoms_2.length; _k++) {
		var v = allPhoms_2[_k];
		allPhomsLen += v.length;
	}
	if (allPhomsLen == selfCards.length && noOverlap == true) {
		if (selfCards.length == 10) {
			result.awt = 3 /* UT */;
		}
		else {
			result.awt = 1 /* U */;
		}
		result.allPhoms = allPhoms;
		//log("xxxxxxxxxxxxxxxxxx")
		//log("result is: ", result)
		return JSON.stringify(result);
	}
	var onePhomOk = false;
	//var len1: number, len2: number = 0
	for (var key in selfMap) {
		var gotScs = false;
		var gotQuad = false;
		//let gotPureTrip: boolean = false
		var oci = selfMap[key];
		//log("oci.phom len is: ", oci.phom.length, "key is: ", key)
		//log("oci.phom is: ", oci.phom)
		if (oci.cnt > 1 && oci.phom.length > 1) {
			//log("oci is: ", oci)
			if (oci.phom.length == 3) {
				//有3张同点数，4张同点数，还有同花顺，取出最长的同花顺和3张同点数，即去掉了4张同点数中重叠的那张牌
				onePhomOk = true;
				//len1 = 4
				var comb = makeCardCombineInfo(selfCards);
				var s = fetchSolidColorSeq(comb);
				var q = fetchQuadruplet(comb);
				var t = fetchTriplet(comb);
				var p = fetchPair(comb);
				if (p.length > 0) {
					//如果是4張同點數，3張同點數和同花順，其中3張同點數中的一張與同花順有重叠
					for (var sval in s) {
						if (s[sval].length > 3 && ((getValue(s[sval][0]) == getValue(p[0][0])) || (getValue(s[sval][s[sval].length - 1]) == getValue(p[0][0])))) {
							var tmpTrip;
							if (getValue(s[sval][0]) == getValue(p[0][0])) {
								s[sval].splice(0, 1);
								tmpTrip.push(s[sval][0]);
							}
							else if (getValue(s[sval][s[sval].length - 1]) == getValue(p[0][0])) {
								tmpTrip.push(s[sval].pop());
							}
							t.push(tmpTrip);
						}
					}
				}
				allPhoms = [];
				for (var _l = 0, s_2 = s; _l < s_2.length; _l++) {
					var val = s_2[_l];
					//log("solidSeq is: ", val)
					allPhoms.push(val);
				}
				for (var _m = 0, q_1 = q; _m < q_1.length; _m++) {
					var val = q_1[_m];
					//log("quads is: ", val)
					allPhoms.push(val);
				}
				for (var _o = 0, t_1 = t; _o < t_1.length; _o++) {
					var val = t_1[_o];
					//log("trips is: ", val)
					allPhoms.push(val);
				}
				break;
			}
			else if (oci.phom.length == 2) {
				for (var _p = 0, _q = oci.phom; _p < _q.length; _p++) {
					var v = _q[_p];
					if (getValue(v[0]) != getValue(v[1])) {
						gotScs = true;
					}
					if (getValue(v[0]) == getValue(v[1]) && (v.length == 4)) {
						gotQuad = true;
					}
					/*
					if (getValue(v[0]) == getValue(v[1]) && (v.length == 3)) {
					    gotPureTrip = true
					}
					*/
				}
				//log("beginning all phoms is: ", allPhoms)
			}
			if (gotScs && gotQuad) {
				//有4张同点数，还有同花顺，取出最长的同花顺和3张同点数，即去掉了4张同点数中重叠的那张牌
				//log("in hereeeeeeeeeeeeeeeeee")
				onePhomOk = true;
				var comb = makeCardCombineInfo(selfCards);
				var s = fetchSolidColorSeq(comb);
				//log("scs is: ", s)
				var q = fetchQuadruplet(comb);
				//log("quad is: ", q)
				var t = fetchTriplet(comb);
				//log("trip is: ", t)
				var p = fetchPair(comb);
				//log("pair is: ", p)
				if (p.length > 0) {
					//如果3張同點數和同花順，其中3張同點數中的一張與同花順有重叠
					for (var sval in s) {
						if (s[sval].length > 3 && ((getValue(s[sval][0]) == getValue(p[0][0])) || (getValue(s[sval][s[sval].length - 1]) == getValue(p[0][0])))) {
							var tmpTrip_1 = p[0];
							if (getValue(s[sval][0]) == getValue(p[0][0])) {
								tmpTrip_1.push(s[sval][0]);
								s[sval].splice(0, 1);
							}
							else if (getValue(s[sval][s[sval].length - 1]) == getValue(p[0][0])) {
								tmpTrip_1.push(s[sval].pop());
							}
							t.push(tmpTrip_1);
							//log("tmpTrip is: ", tmpTrip)
						}
					}
				}
				allPhoms = [];
				for (var _r = 0, s_3 = s; _r < s_3.length; _r++) {
					var val = s_3[_r];
					//log("solidSeq is: ", val)
					allPhoms.push(val);
				}
				for (var _s = 0, q_2 = q; _s < q_2.length; _s++) {
					var val = q_2[_s];
					//log("quads is: ", val)
					allPhoms.push(val);
				}
				for (var _t = 0, t_2 = t; _t < t_2.length; _t++) {
					var val = t_2[_t];
					//log("trips is: ", val)
					allPhoms.push(val);
				}
				break;
			}
			else if (gotScs && !gotQuad) {
				for (var _u = 0, _v = oci.phom; _u < _v.length; _u++) {
					var v = _v[_u];
					if (getValue(v[0]) != getValue(v[1])) {
						//log("kkkkkkkkkkkkkkkkkkkkkkkkkkk")
						//同花順
						//log("scs phom is: ", v)
						for (var i in v) {
							if (v[i] == Number(key) && (Number(i) >= 3 && Number(i) != 0 && Number(i) != (v.length - 1)) && v.length >= 7) {
								//重复牌在同花顺非最靠边的的位置
								onePhomOk = true;
								//len1 = v.length
								for (var k in allPhoms) {
									if (getValue(v[0]) == getValue(allPhoms[k][0])) {
										allPhoms.splice(Number(k), 1);
										//log("fffffffffffffffffffff")
										var tmp1 = [];
										var tmp2 = [];
										for (var _w = 0, v_4 = v; _w < v_4.length; _w++) {
											var vv = v_4[_w];
											//log("uuuuuuuuuuuuuuuuuuuuuuu")
											if (vv != Number(key) && getValue(vv) < getValue(Number(key))) {
												tmp1.push(vv);
											}
											else if (vv != Number(key) && getValue(vv) > getValue(Number(key))) {
												tmp2.push(vv);
											}
										}
										//log("xxxxval is:", tmp1)
										//log("xxxxval2 is:", tmp2)
										allPhoms.push(tmp1);
										allPhoms.push(tmp2);
										//log("非靠邊all phoms is: ", allPhoms)
									}
								}
								break;
							}
							else if ((v[i] == Number(key) && (Number(i) == 0) || (Number(i) == (v.length - 1)) && v.length >= 4)) {
								//重复牌在同花顺最靠边的的位置
								//log("最初最靠邊all phoms is: ", allPhoms)
								onePhomOk = true;
								//len1 = v.length
								//log("all phoms is: ", allPhoms)
								for (var k in allPhoms) {
									if (getValue(v[0]) == getValue(allPhoms[k][0]) && allPhoms[k].length > 3) {
										allPhoms.splice(Number(k), 1);
										//log("fffffffffffffffffffff")
										var tmp1 = [];
										var tmp2 = [];
										for (var _x = 0, v_5 = v; _x < v_5.length; _x++) {
											var vv = v_5[_x];
											//log("uuuuuuuuuuuuuuuuuuuuuuu")
											if (vv != Number(key) && getValue(vv) < getValue(Number(key))) {
												tmp1.push(vv);
											}
											else if (vv != Number(key) && getValue(vv) > getValue(Number(key))) {
												tmp2.push(vv);
											}
										}
										if (tmp1.length == 0) {
											//log("sssssssstmp2 is: ", tmp2)
											allPhoms.push(tmp2);
										}
										else {
											//log("kkkkkkkktmp1 is: ", tmp1)
											allPhoms.push(tmp1);
										}
										//log("最靠邊all phoms is: ", allPhoms)
									}
								}
								break;
							}
							else if ((v[i] == Number(key)) && (v.length == 3)) {
								for (var k in allPhoms) {
									for (var _y = 0, _z = allPhoms[k]; _y < _z.length; _y++) {
										var kval = _z[_y];
										if ((kval == Number(key)) && allPhoms[k].length == 3 && getValue(allPhoms[k][0]) != getValue(allPhoms[k][1])) {
											allPhoms.splice(Number(k), 1);
											break;
										}
									}
								}
							}
						}
					}
				}
				/*
				if (onePhomOk == true) {
				    break
				}
				*/
			}
		}
	}
	//最終檢查是否有重複牌
	//log("final allPhoms is: ", allPhoms)
	var allPhomsEveryCnt = {};
	for (var _0 = 0, allPhoms_3 = allPhoms; _0 < allPhoms_3.length; _0++) {
		var av = allPhoms_3[_0];
		for (var _1 = 0, av_1 = av; _1 < av_1.length; _1++) {
			var avv = av_1[_1];
			if (allPhomsEveryCnt[avv] == undefined) {
				allPhomsEveryCnt[avv] = 1;
			}
			else {
				result.awt = 0 /* None */;
				result.allPhoms = [];
				//log("result is: ", result);
				return JSON.stringify(result);
			}
		}
	}
	allPhomsLen = 0;
	for (var _2 = 0, allPhoms_4 = allPhoms; _2 < allPhoms_4.length; _2++) {
		var v = allPhoms_4[_2];
		allPhomsLen += v.length;
	}
	//log("all phoms is: ", allPhoms)
	if (allPhomsLen == selfCards.length) {
		if (selfCards.length == 10) {
			//log("autowin length is : 10");
			result.awt = 3 /* UT */;
		}
		else {
			//log("autowin length is : 9");
			result.awt = 1 /* U */;
		}
		result.allPhoms = allPhoms;
		//log("result is: ", result);
		return JSON.stringify(result);
	}
	// 第一輪没有任何ca和phom
	if (firstRound) {
		//如果上面的都沒有返回，則這裏再fetchCa，沒有ca，就是自動勝利UK,pending
		result.awt = 0 /* None */;
		result.allPhoms = [];
		//log("result is: ", result);
		return JSON.stringify(result);
	}
	result.awt = 0 /* None */;
	result.allPhoms = [];
	//log("result is: ", result);
	return JSON.stringify(result);
}
phomRule.checkAutoWin = checkAutoWin;
// 自动胜利的结算
function autoWinSettlement(typWin, baseScore) {
	var lostScore = [0, 5, 5, 10];
	return lostScore[typWin] * baseScore;
}
phomRule.autoWinSettlement = autoWinSettlement;
//余牌点数总和计算
function restCardsTotalPoints(selfCards) {
	var restCardPure = showdownRemovePhom(selfCards);
	var sum = 0;
	for (var _i = 0, restCardPure_1 = restCardPure; _i < restCardPure_1.length; _i++) {
		var val = restCardPure_1[_i];
		sum += val;
	}
	return sum;
}
phomRule.restCardsTotalPoints = restCardsTotalPoints;
//牌点数加和
function totalPoints(cards) {
	var sum = 0;
	for (var _i = 0, cards_2 = cards; _i < cards_2.length; _i++) {
		var val = cards_2[_i];
		sum += getValue(val);
	}
	return sum;
}
//中途结算
function midWaySettlement(baseScore, ahead3, cardsLen) {
	if (ahead3 == false) {
		return baseScore * 4;
	}
	else {
		return baseScore * cardsLen;
	}
}
phomRule.midWaySettlement = midWaySettlement;
function finalSettlement(info) {
	//log("ooooooooooooooooriginal info is: ", info)
	var tmp = JSON.parse(info);
	/*
	log("iiiiiiiiiiiiiiiiiiiiiiiiiiinfo is: ", tmp)
	log("baseScore is: ", tmp.baseScore)
	log("players is: ", tmp.players)
	*/
	var pointsSeq = [];
	for (var i in tmp.players) {
		var mmp = totalPoints(tmp.players[i].handPokers);
		pointsSeq.push(mmp);
		tmp.players[i].points = mmp;
	}
	//還需要判斷是否每個玩家的點數總和相等
	pointsSeq.sort(function(a, b) { return a - b; });
	var overlapCnt = {};
	var sumWinScore = 0;
	for (var i in pointsSeq) {
		if (overlapCnt[pointsSeq[i]] == undefined) {
			overlapCnt[pointsSeq[i]] = [parseInt(i)];
		}
		else {
			overlapCnt[pointsSeq[i]].push(parseInt(i));
		}
		for (var j in tmp.players) {
			if (tmp.players[j].points == pointsSeq[i]) {
				tmp.players[j].rank = parseInt(i) + 1;
			}
		}
	}
	//当有相等的分数时
	for (var key in overlapCnt) {
		if (overlapCnt[key].length > 1) {
			var samePointsPlayerRank = [];
			//log("数组长度计算有效");
			for (var i in tmp.players) {
				if (tmp.players[i].points == parseInt(key)) {
					for (var j in tmp.showdownSeq) {
						if (tmp.showdownSeq[j] == tmp.players[i].chairId) {
							samePointsPlayerRank.push(parseInt(j));
						}
					}
				}
			}
			//利用摊牌先后决定已有排名中的排名
			samePointsPlayerRank.sort(function(a, b) { return a - b; });
			for (var rk in samePointsPlayerRank) {
				for (var p in tmp.players) {
					if (tmp.players[p].chairId == tmp.showdownSeq[samePointsPlayerRank[rk]]) {
						//同一相同分数在摊牌先后顺序的数组中的数量跟同一相同分数的名次数量一定相等
						tmp.players[p].rank = overlapCnt[key][rk] + 1;
					}
				}
			}
		}
	}
	for (var i in tmp.players) {
		if (tmp.players[i].rank != 1) {
			//sumWinScore += tmp.players[i].rank
			tmp.players[i].score = 0 - ((tmp.players[i].rank - 1) * tmp.baseScore);
			sumWinScore -= tmp.players[i].score;
		}
	}
	for (var k in tmp.players) {
		if (tmp.players[k].rank == 1) {
			tmp.players[k].score = sumWinScore;
		}
	}
	return JSON.stringify(tmp);
}
phomRule.finalSettlement = finalSettlement;
// 4人全部摊牌
/*
export function finalSettlment(baseScore: number, allPlayersPokers: number[][]): number[] {
    let resultScore: number[] = []
    let playerNum: number = allPlayersPokers.length
    for (let i: number = 0; i < playerNum; i++) {
	resultScore.push(-1)
    }
    let settlement = { chairId: -1, rank: -1, lostScore: -1 }
    let points: number[] = []
    for (let i in allPlayersPokers) {
	if (!existPhom(allPlayersPokers[i])) {
	    rank.push({ index: i, pointsSum: totalPoints(allPlayersPokers[i]), existPhom: 0, rankkk: -1, })
	} else {
	    rank.push({ index: i, pointsSum: totalPoints(allPlayersPokers[i]), existPhom: 1, rankkk: -1, })
	}
	points.push(totalPoints(allPlayersPokers[i]))
    }
    
    let num = 0
    let sorted_points = points.sort() //升序
    for (let i in sorted_points) {
	for (let r of rank) {
	    if (sorted_points[i] == r.pointsSum && r.existPhom == 1) {
		num += 1
		r.rankkk = num
	    }
	}
    }
    
    for (let val of rank) {
	if (val.rankkk == -1) {
	    resultScore[val.index] = baseScore * 4
	} else if (val.rankkk != -1 && val.rankkk != 1) {
	    resultScore[val.index] = baseScore * val.rankkk
    
	} else if (val.rankkk == 1) {
	    resultScore[val.index] = 0
	}
    }
    return resultScore
}
*/
// 最优phom组合，同一张牌既能组成三张又能组成同花顺时，优先组成点数总和较大的
function overlapPhomCheck(cards) {
	var comb3 = makeCardCombineInfo(cards);
	var allPhomCombs = [];
	var quadruplets_comb3 = fetchQuadruplet(comb3);
	var triplet_comb3 = fetchTriplet(comb3);
	var rest_comb3 = fetchSingle(comb3);
	var quadruplets_comb3_merge_triplet_comb3 = [];
	var quadruplets_comb3_merge_rest_comb3 = [];
	var triplet_comb3_merge_rest_com3 = [];
	// 4张和3张的组成一副牌，不重复
	for (var _i = 0, quadruplets_comb3_1 = quadruplets_comb3; _i < quadruplets_comb3_1.length; _i++) {
		var val = quadruplets_comb3_1[_i];
		for (var _a = 0, val_3 = val; _a < val_3.length; _a++) {
			var vall = val_3[_a];
			quadruplets_comb3_merge_triplet_comb3.push(vall);
		}
	}
	for (var _b = 0, triplet_comb3_1 = triplet_comb3; _b < triplet_comb3_1.length; _b++) {
		var val = triplet_comb3_1[_b];
		for (var _c = 0, val_4 = val; _c < val_4.length; _c++) {
			var vall = val_4[_c];
			quadruplets_comb3_merge_triplet_comb3.push(vall);
		}
	}
	var qmt = makeCardCombineInfo(quadruplets_comb3_merge_triplet_comb3);
	// 4张和余牌组成一副牌，不重复
	for (var _d = 0, quadruplets_comb3_2 = quadruplets_comb3; _d < quadruplets_comb3_2.length; _d++) {
		var val = quadruplets_comb3_2[_d];
		for (var _e = 0, val_5 = val; _e < val_5.length; _e++) {
			var vall = val_5[_e];
			quadruplets_comb3_merge_rest_comb3.push(vall);
		}
	}
	for (var _f = 0, rest_comb3_1 = rest_comb3; _f < rest_comb3_1.length; _f++) {
		var val = rest_comb3_1[_f];
		for (var _g = 0, val_6 = val; _g < val_6.length; _g++) {
			var vall = val_6[_g];
			quadruplets_comb3_merge_rest_comb3.push(vall);
		}
	}
	var qmr = makeCardCombineInfo(quadruplets_comb3_merge_rest_comb3);
	// 3张和余牌组成一副牌，不重复
	for (var _h = 0, triplet_comb3_2 = triplet_comb3; _h < triplet_comb3_2.length; _h++) {
		var val = triplet_comb3_2[_h];
		for (var _j = 0, val_7 = val; _j < val_7.length; _j++) {
			var vall = val_7[_j];
			triplet_comb3_merge_rest_com3.push(vall);
		}
	}
	for (var _k = 0, rest_comb3_2 = rest_comb3; _k < rest_comb3_2.length; _k++) {
		var val = rest_comb3_2[_k];
		for (var _l = 0, val_8 = val; _l < val_8.length; _l++) {
			var vall = val_8[_l];
			triplet_comb3_merge_rest_com3.push(vall);
		}
	}
	var tmr = makeCardCombineInfo(triplet_comb3_merge_rest_com3);
	var solidSeq1 = fetchSolidColorSeq(qmt);
	var solidSeq2 = fetchSolidColorSeq(qmr);
	var solidSeq3 = fetchSolidColorSeq(tmr);
	// 收集所有phom组合，有重叠的牌
	for (var _m = 0, quadruplets_comb3_3 = quadruplets_comb3; _m < quadruplets_comb3_3.length; _m++) {
		var val = quadruplets_comb3_3[_m];
		allPhomCombs.push(val);
	}
	for (var _o = 0, triplet_comb3_3 = triplet_comb3; _o < triplet_comb3_3.length; _o++) {
		var val = triplet_comb3_3[_o];
		allPhomCombs.push(val);
	}
	for (var _p = 0, solidSeq1_1 = solidSeq1; _p < solidSeq1_1.length; _p++) {
		var val = solidSeq1_1[_p];
		allPhomCombs.push(val);
	}
	for (var _q = 0, solidSeq2_1 = solidSeq2; _q < solidSeq2_1.length; _q++) {
		var val = solidSeq2_1[_q];
		allPhomCombs.push(val);
	}
	for (var _r = 0, solidSeq3_1 = solidSeq3; _r < solidSeq3_1.length; _r++) {
		var val = solidSeq3_1[_r];
		allPhomCombs.push(val);
	}
	// 筛选去重，留下点数总和最大的phom
	var finalPhoms = [];
	var compare = [];
	for (var _s = 0, cards_3 = cards; _s < cards_3.length; _s++) {
		var val = cards_3[_s];
		for (var _t = 0, allPhomCombs_1 = allPhomCombs; _t < allPhomCombs_1.length; _t++) {
			var elem = allPhomCombs_1[_t];
			for (var _u = 0, elem_1 = elem; _u < elem_1.length; _u++) {
				var elemm = elem_1[_u];
				if (val == elemm) {
					compare.push(elem);
					break;
				}
			}
		}
		if (compare.length > 1) {
			var sums = [];
			for (var _v = 0, compare_1 = compare; _v < compare_1.length; _v++) {
				var compSeq = compare_1[_v];
				sums.push(totalPoints(compSeq));
			}
			//如果是4张则去掉与其他同花顺重复的那张，剩下的三张存入最优解phom组
			for (var n = 0; n < sums.length; n++) {
				if (sums[n] == getValue(val) * 4 && compare[n].length == 4) {
					for (var i = 0; i < 4; i++) {
						if (compare[n][i] = val) {
							compare[n].splice(i);
							finalPhoms.push(compare[n]);
							break;
						}
					}
					sums.splice(n);
					compare.splice(n);
				}
			}
			var index = 0;
			var sum = 0;
			for (var p = 0; p < sums.length; p++) {
				if (sums[p] > sum) {
					index = p;
					sum = sums[p];
				}
			}
			finalPhoms.push(compare[index]);
		}
		compare = [];
	}
	return finalPhoms;
}
//获取传进的所有牌中的总和点数最大的一个phom或最多两个无重叠的phom，不需要检测三个共存phom，因为三个phom就自动胜利了 
function getBestPhoms(selfCards) {
	var selfCardsCopy = JSON.parse(JSON.stringify(selfCards));
	var comb1 = makeCardCombineInfo(selfCardsCopy);
	var quads = fetchQuadruplet(comb1);
	var comb2 = makeCardCombineInfo(selfCardsCopy);
	var trips = fetchTriplet(comb2);
	var comb3 = makeCardCombineInfo(selfCardsCopy);
	var scs = fetchSolidColorSeq(comb3);
	var result = { bestPhoms: [] };
	//把所有phom都放进allPhoms和phomsArr
	var allPhoms = [];
	var phomsArr = [];
	for (var _i = 0, quads_2 = quads; _i < quads_2.length; _i++) {
		var val = quads_2[_i];
		var tmpSinglePhomInfo = { singlePhom: [], overLapPhom: [], overLapCard: [], survivedPhoms: {}, noOverlapPhomsAtBeg: [] };
		tmpSinglePhomInfo.singlePhom = val;
		phomsArr.push(tmpSinglePhomInfo);
		allPhoms.push(val);
	}
	for (var _a = 0, trips_2 = trips; _a < trips_2.length; _a++) {
		var val = trips_2[_a];
		var tmpSinglePhomInfo = { singlePhom: [], overLapPhom: [], overLapCard: [], survivedPhoms: {}, noOverlapPhomsAtBeg: [] };
		tmpSinglePhomInfo.singlePhom = val;
		phomsArr.push(tmpSinglePhomInfo);
		allPhoms.push(val);
	}
	for (var _b = 0, scs_2 = scs; _b < scs_2.length; _b++) {
		var val = scs_2[_b];
		var tmpSinglePhomInfo = { singlePhom: [], overLapPhom: [], overLapCard: [], survivedPhoms: {}, noOverlapPhomsAtBeg: [] };
		tmpSinglePhomInfo.singlePhom = val;
		phomsArr.push(tmpSinglePhomInfo);
		allPhoms.push(val);
	}
	//获取每个phom对应的重叠的phom，重叠的牌
	for (var _c = 0, phomsArr_1 = phomsArr; _c < phomsArr_1.length; _c++) {
		var val = phomsArr_1[_c];
		for (var _d = 0, _e = val.singlePhom; _d < _e.length; _d++) {
			var card = _e[_d];
			for (var _f = 0, allPhoms_5 = allPhoms; _f < allPhoms_5.length; _f++) {
				var phom = allPhoms_5[_f];
				for (var _g = 0, phom_4 = phom; _g < phom_4.length; _g++) {
					var pc = phom_4[_g];
					if ((pc == card) && ((val.singlePhom[0] != phom[0]) || (val.singlePhom[1] != phom[1]))) {
						//不同phom不可能有两张牌相同
						val.overLapCard.push(pc);
						val.overLapPhom.push(phom);
					}
				}
			}
		}
	}
	//获取每个phhom对应的非重叠phom
	for (var _h = 0, phomsArr_2 = phomsArr; _h < phomsArr_2.length; _h++) {
		var val = phomsArr_2[_h];
		for (var _j = 0, allPhoms_6 = allPhoms; _j < allPhoms_6.length; _j++) {
			var phom = allPhoms_6[_j];
			var noOverLap = true;
			for (var _k = 0, phom_5 = phom; _k < phom_5.length; _k++) {
				var pc = phom_5[_k];
				if (val.overLapCard.length == 0) {
					for (var _l = 0, _m = val.singlePhom; _l < _m.length; _l++) {
						var valpc = _m[_l];
						if (valpc == pc) {
							noOverLap = false;
						}
					}
				}
				for (var _o = 0, _p = val.overLapCard; _o < _p.length; _o++) {
					var valOverLapCard = _p[_o];
					if (pc == valOverLapCard) {
						noOverLap = false;
						break;
					}
				}
				if (!noOverLap) {
					break;
				}
			}
			if (noOverLap) {
				if (val.noOverlapPhomsAtBeg.length == 1) {
					if (restCardsTotalPoints(phom) > restCardsTotalPoints(val.noOverlapPhomsAtBeg[0])) {
						val.noOverlapPhomsAtBeg[0] = phom;
					}
				}
				else {
					val.noOverlapPhomsAtBeg.push(phom);
				}
			}
		}
	}
	//log("phomsArr is: ", phomsArr);
	//获取每个phom与对应重叠phom的最优解phom组合
	for (var _q = 0, phomsArr_3 = phomsArr; _q < phomsArr_3.length; _q++) {
		var val = phomsArr_3[_q];
		for (var i in val.overLapPhom) {
			var tmpSurvivedPhoms = solveOverlapPhoms(val.singlePhom, val.overLapPhom[i], val.overLapCard[i]);
			val.survivedPhoms[i] = tmpSurvivedPhoms;
		}
	}
	//获取所有phom中的最优解组合
	var max = {
		maxPoints: 0,
		maxPointsPhoms: []
	};
	for (var _r = 0, phomsArr_4 = phomsArr; _r < phomsArr_4.length; _r++) {
		var val = phomsArr_4[_r];
		for (var key in val.survivedPhoms) {
			var oneSurviviedCombPoints = 0;
			for (var _s = 0, _t = val.survivedPhoms[key]; _s < _t.length; _s++) {
				var phom = _t[_s];
				oneSurviviedCombPoints += totalPoints(phom);
			}
			if (oneSurviviedCombPoints > max.maxPoints) {
				max.maxPoints = oneSurviviedCombPoints;
				max.maxPointsPhoms = val.survivedPhoms[key];
			}
		}
		var noOverlapPhomsAtBegPoints = 0;
		val.noOverlapPhomsAtBeg.push(val.singlePhom);
		for (var _u = 0, _v = val.noOverlapPhomsAtBeg; _u < _v.length; _u++) {
			var phom = _v[_u];
			noOverlapPhomsAtBegPoints += totalPoints(phom);
		}
		if (noOverlapPhomsAtBegPoints > max.maxPoints) {
			max.maxPoints = noOverlapPhomsAtBegPoints;
			max.maxPointsPhoms = val.noOverlapPhomsAtBeg;
		}
	}
	result.bestPhoms = max.maxPointsPhoms;
	return JSON.stringify(result);
}
phomRule.getBestPhoms = getBestPhoms;
//尝试把两个有重叠的phom去重并返回去重后的两个phom或者不可共存时总点数最大的单个phom
function solveOverlapPhoms(phom1, phom2, overLapCard) {
	var trip = [];
	var quad = [];
	var scs = [];
	var result = [];
	if (isTrip(phom1)) {
		trip = phom1;
	}
	else if (isTrip(phom2)) {
		trip = phom2;
	}
	if (isQuad(phom1)) {
		quad = phom1;
	}
	else if (isQuad(phom2)) {
		quad = phom2;
	}
	if (isScs(phom1)) {
		scs = phom1;
	}
	else if (isScs(phom2)) {
		scs = phom2;
	}
	//其中一个phom是四张同点数时
	if (quad.length == 4) {
		for (var i in quad) {
			if (quad[i] == overLapCard) {
				quad.splice(Number(i), 1);
				break;
			}
		}
		result.push(quad);
		result.push(scs);
		return result;
	}
	//其中一个phom是大于三张的同花顺时，另一个phom是3张同点数
	if (scs.length > 3) {
		var scsCopy = JSON.parse(JSON.stringify(scs));
		for (var i in scsCopy) {
			if (scsCopy[i] == overLapCard) {
				scsCopy.splice(Number(i), 1);
				break;
			}
		}
		var combTmp = makeCardCombineInfo(scsCopy);
		var newScs = fetchSolidColorSeq(combTmp);
		if (newScs.length == 1) {
			result.push(newScs[0]);
			result.push(trip);
			return result;
		}
		else {
			if (totalPoints(scs) > totalPoints(trip)) {
				result.push(scs);
				return result;
			}
			else {
				result.push(trip);
				return result;
			}
		}
	}
	else {
		//三张同点数和3张同花顺,不可能共存
		if (totalPoints(scs) > totalPoints(trip)) {
			result.push(scs);
			return result;
		}
		else {
			result.push(trip);
			return result;
		}
	}
}
phomRule.solveOverlapPhoms = solveOverlapPhoms;
//以下传进的参数必须是phom
function isTrip(phom) {
	if (getValue(phom[0]) != getValue(phom[1])) {
		return false;
	}
	else {
		if (phom.length == 3) {
			return true;
		}
	}
}
phomRule.isTrip = isTrip;
function isQuad(phom) {
	if (getValue(phom[0]) != getValue(phom[1])) {
		return false;
	}
	else {
		if (phom.length == 4) {
			return true;
		}
	}
}
phomRule.isQuad = isQuad;
function isScs(phom) {
	if (getValue(phom[0]) != getValue(phom[1])) {
		return true;
	}
	return false;
}
phomRule.isScs = isScs;
//以上传进的参数必须是phom
//把传入的牌组按值从小到大(不是对子)排序并返回
function sortCardsFromMinToMax(cards) {
	var comb = makeCardCombineInfo(cards);
	var result = [];
	var colorVal = [16 /* spade */, 32 /* club */, 64 /* diamond */, 128 /* heart */];
	for (var _i = 0, comb_2 = comb; _i < comb_2.length; _i++) {
		var val = comb_2[_i];
		for (var _a = 0, colorVal_1 = colorVal; _a < colorVal_1.length; _a++) {
			var color = colorVal_1[_a];
			if ((val.colorMask & color) > 0) {
				result.push(mergeCard(val.value, color));
			}
		}
	}
	var tmp = { result: result };
	return JSON.stringify(tmp);
}
phomRule.sortCardsFromMinToMax = sortCardsFromMinToMax;
function getVersion() {
	return 3.5;
}
phomRule.getVersion = getVersion;
/**
 * 测试
 */
function test() {
	log('------------------------开始测试------------------------');
	var newCard = createNewCard();
	var symbol = [];
	var users = [];
	for (var i = 0; i < 4; ++i) {
		users.push(newCard.splice(0, 9));
		var cardSymbol = "";
		for (var _i = 0, _a = users[i]; _i < _a.length; _i++) {
			var card = _a[_i];
			cardSymbol += getCardSymbol(card) + " ";
		}
		symbol.push(cardSymbol);
	}
	var userCardInfos = [];
	//users[1] = [0x11, 0x21, 0x81, 0x82, 0x83, 0x1D, 0x4D, 0x8D, 0x41]
	//users[1] = [0x11, 0x21, 0x81, 0x8D, 0x4D, 0x1D, 0x47, 0x48, 0x49]
	//users[1] = [0x11, 0x12, 0x13, 0x25, 0x26, 0x27, 0x8A, 0x8B, 0x8C]
	//users[1] = [0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x28, 0x18, 0x48]
	//users[1] = [0x11, 0x12, 0x13, 0x14, 0x15, 0x25, 0x47, 0x85, 0x48, 0x49]
	//users[1] = [0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x47, 0x17, 0x27, 0x87]
	//users[1] = [0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A]
	//users[1] = [0x2C, 0x12, 0x1D, 0x25, 0x21, 0x16, 0x19, 0x8A, 0x18]
	//users[1] = [0x85, 0x26, 0x45, 0x15, 0x2B, 0x88, 0x49, 0x1B, 0x89]
	//users[1] = [0x85, 0x26, 0x45, 0x15, 0x2B, 0x88, 0x49, 0x1B, 0x25]
	//users[1] = [23, 138, 33, 19, 29, 70, 22, 140, 17]
	//users[1] = [0x89, 0x49, 0x29, 0x19, 0x88, 0x48, 0x18, 0x8A, 0x4A, 0x86]
	//users[1] = [73, 41, 137, 136, 72, 24, 134, 74, 130]
	//users[1] = [0x84,0x44,0x24,0x14,0x43,0x13,0x2B,0x1A,0x45,0x15]
	//users[1] = [0x89, 0x49, 0x29, 0x19, 0x88, 0x48, 0x28, 0x18, 0x8A, 0x8B]
	//users[1] = [0x89, 0x49, 0x29, 0x19, 0x88, 0x48, 0x28, 0x18, 0x86, 0x87]
	//users[1] = [0x89, 0x49, 0x29, 0x88, 0x48, 0x28, 0x18, 0x86, 0x87]
	//users[1] = [0x14,0x24,0x44,0x84,0x43,0x45,0x1D,0x4D,0x8D]
	//users[1] = [0x86, 0x87, 0x88, 0x89, 0x16, 0x17, 0x18, 0x19, 0x29]
	//users[1] = [0x86, 0x16, 0x8A, 0x29, 0x49, 0x89, 0x18, 0x48, 0x88]
	//users[1] = [0x18, 0x19, 0x1A, 0x48, 0x49, 0x4A, 0x88, 0x89, 0x8A]
	//users[1] = [0x42, 0x17, 0x21, 0x16, 0x85, 0x49, 0x81, 0x82, 0x86]
	//users[1] = [0x4D, 0x1A, 0x2C, 0x25, 0x11, 0x8B, 0x83, 0x29, 0x42, 0x14]
	//users[1] = [0x85, 0x45, 0x25, 0x15, 0x84, 0x24, 0x14, 0x17, 0x16]
	//users[1] = [0x45, 0x25, 0x15, 0x24, 0x23, 0x22, 0x13, 0x14, 0x11]
	//users[1] = [0x26, 0x24, 0x23, 0x22, 0x13, 0x14, 0x27, 0x28, 0x45]
	//users[1] = [0x19, 0x49, 0x89, 0x86, 0x26, 0x16, 0x27, 0x83, 0x23]
	//users[1] = [0x12, 0x22, 0x42, 0x18, 0x48, 0x88, 0x14, 0x23, 0x21]
	//users[1] = [0x84, 0x24, 0x14, 0x19, 0x18, 0x17, 0x25, 0x26, 0x13]
	//users[1] = [0x85, 0x25, 0x15, 0x89, 0x19, 0x2A, 0x17, 0x14, 0x83, 0x12]
	//users[1] = [27, 34, 130, 132, 36, 138, 76, 73, 21, 66]
	//users[1] = [0x8A, 0x4A, 0x4C, 0x88, 0x47, 0x85, 0x13, 0x81, 0x41]
	//users[1] = [0x89, 0x49, 0x29, 0x86, 0x17, 0x87, 0x16, 0x23, 0x8B]
	//users[1] = [0x8A, 0x2A, 0x1A, 0x45, 0x25, 0x84, 0x14, 0x13, 0x42, 0x87]
	//users[1] = [0x29, 0x19, 0x88, 0x18, 0x42, 0x41, 0x21, 0x8A, 0x8D]
	//users[1] = [0x1B, 0x2B, 0x4B, 0x8B, 0x14, 0x13, 0x29, 0x2A, 0x88]
	//users[1] = [0x11, 0x21, 0x41, 0x42, 0x43, 0x2A, 0x47, 0x17, 0x12]
	//users[1] = [0x22, 0x42, 0x82, 0x19, 0x29, 0x49, 0x27, 0x47, 0x87, 0x2B]
	users[1] = [0x89, 0x28, 0x43, 0x12, 0x13, 0x83, 0x25, 0x23, 0x44];
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
	var testUnits = {
		/**
		 * 提取同花顺测试
		 * @returns 返回是否提取到
		 */
		fetchSolidColorSeq: function() {
			var result = fetchSolidColorSeq(cardCInfo);
			log(numberConverText(result));
			return result.length > 0;
		},
		/**
		 * 提取4张
		 * @returns 返回是否提取到
		 */
		fetchQuadruplets: function() {
			var result = fetchQuadruplet(cardCInfo);
			log(numberConverText(result), result.length);
			return result.length > 0;
		},
		/**
		 * 提取3张
		 * @returns 返回是否提取到
		 */
		fetchTriplet: function() {
			var result = fetchTriplet(cardCInfo);
			log(numberConverText(result), result.length);
			return result.length > 0;
		},
		/*
		// 牌排序
		sortCards: () => {
		    let result: number[] = sortCards(users[1])
		    let testUserCardInfos: string[] = []
		    result.forEach((value: number) => {
			testUserCardInfos.push(getCardSymbol(value))
		    })
		    log(testUserCardInfos)
		    return result.length > 0
		},
		*/
		// 判断自动胜利
		checkAutoWin: function() {
			//let winTyp: autoWinType = checkAutoWin(users[1], false)
			checkAutoWin(users[1], false);
			var autoWinTypStr = ['None', 'U', 'UK', 'UT'];
			//log("auto win type is: %s", autoWinTypStr[winTyp])
			/*
			if (winTyp != autoWinType.None) {
			    return true
			}
			*/
			return true;
		},
		// 判断是否能吃上家打出的垃圾牌
		whetherCouldEatJunk: function() {
			//let junk = 0x26
			var junk = 0x19;
			//let junk = newCard.pop()
			log("junk is: ", getCardSymbol(junk));
			//let judge = whetherCouldEatJunk(junk, [135, 39, 23, 137, 41, 133, 69, 129, 33])
			//let judge = whetherCouldEatJunk(junk, users[1])
			var phomWithJunk = [];
			var tripletSeq = [];
			var solidSeq = [];
			var tmp = JSON.parse(JSON.stringify(users[1]));
			return true;
		},
		findOneCardAllPhom: function() {
			var tmp = findOneCardAllPhom(37, [39, 19, 38, 76, 69, 22, 137, 44, 74, 37]);
			log("phoms is: ", numberConverText(tmp));
			return true;
		},
		fetchCa: function() {
			var tmpp = [0x86, 0x17, 0x87, 0x16, 0x23, 0x8B];
			var text = [];
			for (var _i = 0, tmpp_1 = tmpp; _i < tmpp_1.length; _i++) {
				var val = tmpp_1[_i];
				text.push(getCardSymbol(val));
			}
			log("cards is: ", text);
			var comb = makeCardCombineInfo([0x86, 0x17, 0x87, 0x16, 0x23, 0x8B]);
			//let comb = makeCardCombineInfo(users[1])
			var tmp = fetchCa(comb);
			log("all ca is: ", numberConverText(tmp));
			return true;
		},
		fetchMinSolidColorSeq: function() {
			var tmp = fetchMinSolidColorSeq([74, 75, 76, 77], 76);
			log("min necessary is: ", tmp);
			return true;
		},
		parasitize: function() {
			var str = parasitize([0x48, 0x4B, 0x43, 0x49, 0x1D], [[0x1B, 0x2B, 0x8B], [0x44, 0x45, 0x46, 0x47]]);
			log(str);
			return true;
		},
		finalSettlement: function() {
			var player1 = { chairId: 0, handPokers: [10, 11, 12], points: -1, rank: -1, score: -1 };
			var player2 = { chairId: 1, handPokers: [10, 11, 12], points: -1, rank: -1, score: -1 };
			var player3 = { chairId: 2, handPokers: [10, 11, 19], points: -1, rank: -1, score: -1 };
			var player4 = { chairId: 3, handPokers: [10, 11, 19], points: -1, rank: -1, score: -1 };
			var test = { players: [player1, player2, player3, player4], baseScore: 10, showdownSeq: [1, 0, 3, 2] };
			log(finalSettlement(JSON.stringify(test)));
			return true;
		},
		existCa: function() {
			if (existCa(users[1])) {
				log("有ca");
				return false;
			}
			else {
				log("没ca");
				return true;
			}
		},
		getVersion: function() {
			log("version is: ", getVersion());
			return true;
		},
		getBestPhoms: function() {
			var bestPhoms = getBestPhoms(users[1]);
			log("the best phoms is: ", bestPhoms);
			return true;
		},
		sortCardsFromMinToMax: function() {
			var result = sortCardsFromMinToMax(users[1]);
			log("cards from min to max is: ", result);
			return true;
		}
	};
	//return testUnits.checkAutoWin()
	//return testUnits.parasitize()
	//return testUnits.existCa()
	//return testUnits.getVersion()
	//return testUnits.getBestPhoms()
	//return testUnits.sortCardsFromMinToMax()
	return testUnits.fetchCa();
	//return testUnits.sortCards()
}
/*
phomRule.test = test;
}) (phomRule = exports.phomRule || (exports.phomRule = {}));
var loop = 0;
function run() {
	//while (phomRule.test() != true) {
	while (phomRule.test() == false) {
		console.log("--------------run loop:" + loop + "-----------------------");
		loop += 1;
		//run()
	}
}
run();
*/
