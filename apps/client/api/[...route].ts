/**
 * Vercel Serverless API — Self-contained fortune-telling calculations.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ---- Heavenly Stems & Earthly Branches ----
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const STEM_ELEM: Record<string,string> = {甲:'wood',乙:'wood',丙:'fire',丁:'fire',戊:'earth',己:'earth',庚:'metal',辛:'metal',壬:'water',癸:'water'};
const BRANCH_ELEM: Record<string,string> = {子:'water',丑:'earth',寅:'wood',卯:'wood',辰:'earth',巳:'fire',午:'fire',未:'earth',申:'metal',酉:'metal',戌:'earth',亥:'water'};
const HIDDEN: Record<string,string[]> = {子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],辰:['戊','乙','癸'],巳:['丙','庚','戊'],午:['丁','己'],未:['己','丁','乙'],申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲']};

// ---- HEXAGRAM DATA ----
const HEX: Record<number,any> = {
1:{n:1,name:'乾为天',pinyin:'Qian Wei Tian',char:'䷀',up:'乾',lo:'乾',j:'元亨利贞。',im:'天行健，君子以自强不息。'},
2:{n:2,name:'坤为地',pinyin:'Kun Wei Di',char:'䷁',up:'坤',lo:'坤',j:'元亨利牝马之贞。',im:'地势坤，君子以厚德载物。'},
3:{n:3,name:'水雷屯',pinyin:'Shui Lei Zhun',char:'䷂',up:'坎',lo:'震',j:'元亨利贞，勿用有攸往。',im:'云雷屯，君子以经纶。'},
4:{n:4,name:'山水蒙',pinyin:'Shan Shui Meng',char:'䷃',up:'艮',lo:'坎',j:'亨，匪我求童蒙。',im:'山下出泉蒙，君子以果行育德。'},
5:{n:5,name:'水天需',pinyin:'Shui Tian Xu',char:'䷄',up:'坎',lo:'乾',j:'有孚，光亨，贞吉。',im:'云上于天需，君子以饮食宴乐。'},
6:{n:6,name:'天水讼',pinyin:'Tian Shui Song',char:'䷅',up:'乾',lo:'坎',j:'有孚窒惕，中吉终凶。',im:'天与水违行讼，君子以作事谋始。'},
7:{n:7,name:'地水师',pinyin:'Di Shui Shi',char:'䷆',up:'坤',lo:'坎',j:'贞，丈人吉，无咎。',im:'地中有水师，君子以容民畜众。'},
8:{n:8,name:'水地比',pinyin:'Shui Di Bi',char:'䷇',up:'坎',lo:'坤',j:'吉，原筮元永贞。',im:'地上有水比，先王以建万国亲诸侯。'},
11:{n:11,name:'地天泰',pinyin:'Di Tian Tai',char:'䷊',up:'坤',lo:'乾',j:'小往大来，吉亨。',im:'天地交泰，后以财成天地之道。'},
12:{n:12,name:'天地否',pinyin:'Tian Di Pi',char:'䷋',up:'乾',lo:'坤',j:'否之匪人，不利君子贞。',im:'天地不交否，君子以俭德辟难。'},
24:{n:24,name:'地雷复',pinyin:'Di Lei Fu',char:'䷗',up:'坤',lo:'震',j:'亨，出入无疾。',im:'雷在地中复，先王以至日闭关。'},
44:{n:44,name:'天风姤',pinyin:'Tian Feng Gou',char:'䷫',up:'乾',lo:'巽',j:'女壮，勿用取女。',im:'天下有风姤，后以施命诰四方。'},
58:{n:58,name:'兑为泽',pinyin:'Dui Wei Ze',char:'䷹',up:'兑',lo:'兑',j:'亨，利贞。',im:'丽泽兑，君子以朋友讲习。'},
63:{n:63,name:'水火既济',pinyin:'Shui Huo Ji Ji',char:'䷾',up:'坎',lo:'离',j:'亨小，利贞，初吉终乱。',im:'水在火上既济，君子以思患而预防之。'},
64:{n:64,name:'火水未济',pinyin:'Huo Shui Wei Ji',char:'䷿',up:'离',lo:'坎',j:'亨，小狐汔济。',im:'火在水上未济，君子以慎辨物居方。'},
};

// Fill remaining hexagrams with defaults
for(let i=1;i<=64;i++){if(!HEX[i]) HEX[i]={n:i,name:`卦${i}`,pinyin:'',char:'?',up:'?',lo:'?',j:'',im:''};}

const TRI_VAL: Record<string,number[]> = {乾:[1,1,1],兑:[0,1,1],离:[1,0,1],震:[0,0,1],巽:[1,1,0],坎:[0,1,0],艮:[1,0,0],坤:[0,0,0]};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = (req.query.route as string[]) || [];
  const route = '/' + path.join('/');
  const method = req.method || 'GET';

  try {
    // ---- Health ----
    if (route === '/health' || route === '/') {
      return res.json({ status: 'ok', time: new Date().toISOString() });
    }

    // ---- BAZI ----
    if (route === '/bazi/calculate' && method === 'POST') {
      return res.json(calcBazi(req.body));
    }

    // ---- BAGUA ----
    if (route === '/bagua/divine' && method === 'POST') {
      return res.json(calcBagua(req.body));
    }

    // ---- QIMEN ----
    if (route === '/qimen/calculate' && method === 'POST') {
      return res.json(calcQimen(req.body));
    }

    // ---- ZODIAC ----
    if (route === '/zodiac/chart' && method === 'POST') {
      return res.json(calcZodiac(req.body));
    }

    // ---- History / Auth (no DB on Vercel) ----
    if (route.startsWith('/history') || route.startsWith('/auth/')) {
      return res.json({ data: [], total: 0, message: '请在完整版后端使用此功能' });
    }

    res.status(404).json({ message: 'Not found' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Internal error' });
  }
}

// ====== BAZI CALCULATION ======
function calcBazi(body: any) {
  const { birthDate, birthTime='12:00', gender='MALE', longitude=120 } = body || {};
  if(!birthDate) throw new Error('请提供出生日期');

  const [y,m,d] = birthDate.split('-').map(Number);
  const [hh,mm] = birthTime.split(':').map(Number);

  // Simplified four pillars based on date arithmetic
  const dayNum = Math.floor((new Date(y,m-1,d).getTime() - new Date(1900,0,1).getTime())/86400000);
  const yearS = STEMS[(y-4)%10], yearB = BRANCHES[(y-4)%12];
  const monthS = STEMS[((y-1900)*12+m+12)%10], monthB = BRANCHES[(m+1)%12];
  const dayS = STEMS[(dayNum+9)%10], dayB = BRANCHES[(dayNum+3)%12];
  const hourIdx = Math.floor(hh/2);
  const hourS = STEMS[((dayNum+9)%10*2+hourIdx)%10], hourB = BRANCHES[hourIdx%12];

  const fourPillars = {
    year: { stem: yearS, branch: yearB, hiddenStems: HIDDEN[yearB]||[] },
    month: { stem: monthS, branch: monthB, hiddenStems: HIDDEN[monthB]||[] },
    day: { stem: dayS, branch: dayB, hiddenStems: HIDDEN[dayB]||[] },
    hour: { stem: hourS, branch: hourB, hiddenStems: HIDDEN[hourB]||[] },
  };
  const dayMaster = dayS;
  const elemCount: Record<string,number> = { wood:0,fire:0,earth:0,metal:0,water:0 };
  for(const p of Object.values(fourPillars) as any[]){ elemCount[STEM_ELEM[p.stem]]++; elemCount[BRANCH_ELEM[p.branch]]++; }

  return {
    readingId: null,
    fourPillars, dayMaster,
    tenGods: { year: '比肩', month: '劫财', day: '日主', hour: '比肩' },
    fiveElements: elemCount,
    daYun: genDaYun(monthS, monthB, gender),
    shenSha: [],
    naYin: {},
    elementBalance: { strongest:'金', weakest:'水', advice:'五行金旺，多补水元素。' },
    readingText: `## 八字排盘\n\n日主 **${dayMaster}**\n\n${fourPillars.year.stem}${fourPillars.year.branch}年 ${fourPillars.month.stem}${fourPillars.month.branch}月 ${fourPillars.day.stem}${fourPillars.day.branch}日 ${fourPillars.hour.stem}${fourPillars.hour.branch}时\n\n> ⚠️ Vercel 版为简化计算，完整精确排盘请使用本地服务器。`,
  };
}

function genDaYun(ms:string, mb:string, gender:string) {
  const sI = STEMS.indexOf(ms), bI = BRANCHES.indexOf(mb);
  const forward = (sI%2===0) === (gender==='MALE');
  return Array.from({length:8},(_,i)=>({
    startAge:5+i*10, endAge:14+i*10,
    stem: STEMS[((sI+(forward?i+1:-(i+1)))%10+10)%10],
    branch: BRANCHES[((bI+(forward?i+1:-(i+1)))%12+12)%12],
    direction: forward?'forward':'reverse',
  }));
}

// ====== BAGUA CALCULATION ======
function calcBagua(body: any) {
  const { question, method='AUTO', manualLines } = body || {};
  if(!question?.trim()) throw new Error('请输入问题');

  let lines: number[];
  if(method==='COINS' && manualLines?.length===6) lines=manualLines;
  else lines=Array.from({length:6},()=>[2,3][Math.floor(Math.random()*2)]+[2,3][Math.floor(Math.random()*2)]+[2,3][Math.floor(Math.random()*2)]);

  const changing = lines.map((v,i)=>v===6||v===9?i+1:0).filter(Boolean);
  const pNum = linesToNum(lines);
  const cNum = changing.length ? linesToNum(lines.map(v=>v===6?7:v===9?8:v)) : null;
  const pri = {...HEX[pNum], lines: Array.from({length:6},(_,i)=>({lineNumber:i+1,text:['潜龙勿用。','见龙在田。','终日乾乾。','或跃在渊。','飞龙在天。','亢龙有悔。'][i]||`第${i+1}爻`,meaning:''}))};

  return {
    readingId: null,
    primaryHexagram: pri,
    changedHexagram: cNum?{...HEX[cNum],lines:pri.lines}:undefined,
    changingLines: changing,
    lines,
    readingText: `## 八卦占卜\n\n**问题**: ${question}\n\n**本卦**: ${pri.char} ${pri.name}\n\n**卦辞**: ${pri.j}\n\n> ⚠️ Vercel简化版，完整解读请用本地服务器。`,
  };
}

function linesToNum(lines: number[]): number {
  const loBits = lines.slice(0,3).map(v=>v===7||v===9?1:0);
  const upBits = lines.slice(3,6).map(v=>v===7||v===9?1:0);
  const loN=bitsToName(loBits), upN=bitsToName(upBits);
  for(const h of Object.values(HEX)) if(h.lo===loN && h.up===upN) return h.n;
  return 1;
}
function bitsToName(bits: number[]): string {
  for(const [k,v] of Object.entries(TRI_VAL)) if(v.join(',')===bits.join(',')) return k;
  return '乾';
}

// ====== QIMEN CALCULATION ======
function calcQimen(body: any) {
  const { queryDateTime, method='CHAIBU' } = body||{};
  if(!queryDateTime) throw new Error('请输入查询时间');
  const d = new Date(queryDateTime);
  const ju = ((d.getMonth()+1)+d.getDate())%9+1;
  const isYang = d.getMonth()<6;
  const dirs = ['坎','坤','震','巽','中','乾','兑','艮','离'];
  const luo = [5,6,7,8,9,1,2,3,4];
  const doors = ['休','生','伤','杜','景','死','惊','开'];
  const stars = ['天蓬','天芮','天冲','天辅','天禽','天心','天柱','天任','天英'];
  const gods = isYang?['值符','螣蛇','太阴','六合','白虎','玄武','九地','九天']:['值符','九天','九地','玄武','白虎','六合','太阴','螣蛇'];

  const palaces = luo.map((n,i)=>({
    number:n, direction:dirs[n-1]||'中',
    earthStem: STEMS[(i-ju+1+9)%9], heavenStem: STEMS[(i+d.getMonth())%10],
    door: doors[(i+(d.getHours())+ju)%8],
    star: stars[(i+ju)%9],
    god: gods[(i+ju-1)%8],
  }));

  return {
    readingId:null, juNumber:ju, yinYangDun:isYang?'阳遁':'阴遁', palaces, zhiFu:stars[ju%9], zhiShi:doors[0],
    eightDoors: doors, nineStars: stars, eightGods: gods,
    readingText: `## 奇门遁甲\n\n${isYang?'阳遁':'阴遁'}${ju}局\n\n> ⚠️ Vercel简化版排盘。`,
  };
}

// ====== ZODIAC CALCULATION ======
function calcZodiac(body: any) {
  const { birthDateTime } = body||{};
  if(!birthDateTime) throw new Error('请输入出生时间');
  const d = new Date(birthDateTime);
  const signs = ['Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius'];
  const signCN: Record<string,string> = {Aries:'白羊座',Taurus:'金牛座',Gemini:'双子座',Cancer:'巨蟹座',Leo:'狮子座',Virgo:'处女座',Libra:'天秤座',Scorpio:'天蝎座',Sagittarius:'射手座',Capricorn:'摩羯座',Aquarius:'水瓶座',Pisces:'双鱼座'};
  const emoji: Record<string,string> = {Aries:'♈',Taurus:'♉',Gemini:'♊',Cancer:'♋',Leo:'♌',Virgo:'♍',Libra:'♎',Scorpio:'♏',Sagittarius:'♐',Capricorn:'♑',Aquarius:'♒',Pisces:'♓'};
  const planets = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
  const planetCN: Record<string,string> = {Sun:'太阳',Moon:'月亮',Mercury:'水星',Venus:'金星',Mars:'火星',Jupiter:'木星',Saturn:'土星'};
  const y=d.getFullYear(), m=d.getMonth(), day=d.getDate();
  const sunSign = signs[Math.floor((m*30+day)/30)%12];
  const moonSign = signs[(Math.floor((m*30+day)/30)+3)%12];

  return {
    readingId:null,
    planets: planets.map((p,i)=>({name:p, sign:signs[(Math.floor((m*30+day)/30)+i*3)%12], degree:Math.random()*30, house:(i+1)%12+1, retrograde:false, signEmoji:emoji[signs[(Math.floor((m*30+day)/30)+i*3)%12]]})),
    houses: Array.from({length:12},(_,i)=>({number:i+1, sign:signs[i], degree:i*30, cuspDegree:i*30})),
    ascendant: `${signs[(Math.floor((d.getHours())/2))%12]} ${d.getMinutes()}°`,
    midheaven: `${signs[(Math.floor((d.getHours())/2)+3)%12]} 0°`,
    aspects: [],
    elements: {fire:3,earth:2,air:3,water:2},
    modalities: {cardinal:3,fixed:4,mutable:3},
    sunSign, moonSign,
    readingText: `## 星座星盘\n\n☀️ 太阳: ${signCN[sunSign]||sunSign} ${emoji[sunSign]}\n🌙 月亮: ${signCN[moonSign]||moonSign}\n\n> ⚠️ Vercel简化版，精确星盘请用完整服务。`,
  };
}
